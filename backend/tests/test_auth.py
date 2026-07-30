import time
from unittest.mock import patch

import pytest
from fastapi import Depends
from fastapi.testclient import TestClient

from app.auth import _rate_limit_store, get_current_user
from app.database import SessionLocal
from app.main import app
from app.models import User


@pytest.fixture
def client(monkeypatch):
    monkeypatch.setenv("JWT_SECRET", "a" * 32)
    with TestClient(app) as c:
        yield c


@pytest.fixture(autouse=True)
def _cleanup():
    yield
    db = SessionLocal()
    db.query(User).filter(User.username.in_(["testuser", "testuser2", "existing_user"])).delete(
        synchronize_session=False
    )
    db.commit()
    db.close()
    _rate_limit_store.clear()


class TestRegister:
    def test_register_creates_user_and_returns_token(self, client):
        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        assert response.status_code == 201
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert len(data["access_token"]) > 0

    def test_register_returns_content_type_json(self, client):
        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        assert response.headers["content-type"].startswith("application/json")

    def test_register_duplicate_username_returns_generic_error(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "different123"},
        )
        assert response.status_code == 400
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_register_short_password_rejected(self, client):
        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "short"},
        )
        assert response.status_code == 422

    def test_register_short_username_rejected(self, client):
        response = client.post(
            "/api/auth/register",
            json={"username": "ab", "password": "secret123"},
        )
        assert response.status_code == 422

    def test_register_long_username_rejected(self, client):
        response = client.post(
            "/api/auth/register",
            json={"username": "a" * 51, "password": "secret123"},
        )
        assert response.status_code == 422

    def test_register_response_excludes_password(self, client):
        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_stores_bcrypt_hash_not_plaintext(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        db = SessionLocal()
        user = db.query(User).filter(User.username == "testuser").first()
        db.close()
        assert user is not None
        assert user.password_hash != "secret123"
        assert user.password_hash.startswith("$2")

    def test_register_jwt_payload_contains_only_user_id(self, client):
        from jose import jwt

        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        token = response.json()["access_token"]
        payload = jwt.decode(token, "a" * 32, algorithms=["HS256"])
        assert set(payload.keys()) == {"user_id", "exp"}
        assert isinstance(payload["user_id"], int)

    def test_register_jwt_expires_in_24_hours(self, client):
        from datetime import UTC, datetime

        from jose import jwt

        response = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        token = response.json()["access_token"]
        payload = jwt.decode(token, "a" * 32, algorithms=["HS256"])
        now = datetime.now(UTC).timestamp()
        expected_exp = now + 24 * 3600
        assert abs(payload["exp"] - expected_exp) < 5


class TestLogin:
    def test_login_with_valid_credentials_returns_token(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "secret123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_returns_content_type_json(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "secret123"},
        )
        assert response.headers["content-type"].startswith("application/json")

    def test_login_error_returns_content_type_json(self, client):
        response = client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "secret123"},
        )
        assert response.status_code == 401
        assert response.headers["content-type"].startswith("application/json")

    def test_login_wrong_password_returns_401_generic(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_login_nonexistent_user_returns_401_generic(self, client):
        response = client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "secret123"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_login_wrong_password_same_message_as_nonexistent_user(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        wrong_pw = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "wrongpassword"},
        )
        no_user = client.post(
            "/api/auth/login",
            json={"username": "nonexistent", "password": "secret123"},
        )
        assert wrong_pw.status_code == no_user.status_code
        assert wrong_pw.json()["detail"] == no_user.json()["detail"]

    def test_login_rate_limit_blocks_after_10_attempts(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        _rate_limit_store.clear()
        for i in range(10):
            response = client.post(
                "/api/auth/login",
                json={"username": "testuser", "password": f"wrong{i}"},
            )
            assert response.status_code == 401
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "secret123"},
        )
        assert response.status_code == 429

    def test_login_rate_limit_resets_after_window(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        import app.auth as auth_module

        _rate_limit_store.clear()
        with (
            patch.object(auth_module, "RATE_LIMIT_MAX", 3),
            patch.object(auth_module, "RATE_LIMIT_WINDOW", 1),
        ):
            for i in range(3):
                response = client.post(
                    "/api/auth/login",
                    json={"username": "testuser", "password": f"wrong{i}"},
                )
                assert response.status_code == 401
            response = client.post(
                "/api/auth/login",
                json={"username": "testuser", "password": "secret123"},
            )
            assert response.status_code == 429
            time.sleep(1.1)
            response = client.post(
                "/api/auth/login",
                json={"username": "testuser", "password": "secret123"},
            )
            assert response.status_code == 200

    def test_login_response_excludes_password(self, client):
        client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        response = client.post(
            "/api/auth/login",
            json={"username": "testuser", "password": "secret123"},
        )
        data = response.json()
        assert "password" not in data
        assert "password_hash" not in data


class TestGetCurrentUser:
    def test_valid_token_returns_user(self, client):
        register_resp = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        token = register_resp.json()["access_token"]

        @app.get("/api/_test_me_valid")
        async def _test_me_valid(user: User = Depends(get_current_user)):
            return {"user_id": user.id, "username": user.username}

        response = client.get(
            "/api/_test_me_valid",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 200
        assert response.json()["user_id"] >= 1
        assert response.json()["username"] == "testuser"

    def test_missing_token_returns_401(self, client):
        @app.get("/api/_test_me_missing")
        async def _test_me_missing(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

        response = client.get("/api/_test_me_missing")
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_invalid_token_returns_401(self, client):
        @app.get("/api/_test_me_invalid")
        async def _test_me_invalid(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

        response = client.get(
            "/api/_test_me_invalid",
            headers={"Authorization": "Bearer invalid.token.here"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_expired_token_returns_401(self, client):
        import os
        from datetime import UTC, datetime, timedelta

        from jose import jwt

        secret = os.environ.get("JWT_SECRET", "a" * 32)
        expired_payload = {
            "user_id": 1,
            "exp": datetime.now(UTC) - timedelta(hours=1),
        }
        expired_token = jwt.encode(expired_payload, secret, algorithm="HS256")

        @app.get("/api/_test_me_expired")
        async def _test_me_expired(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

        response = client.get(
            "/api/_test_me_expired",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_token_with_nonexistent_user_returns_401(self, client):
        import os

        from jose import jwt

        secret = os.environ.get("JWT_SECRET", "a" * 32)
        payload = {
            "user_id": 99999,
            "exp": int(time.time()) + 3600,
        }
        token = jwt.encode(payload, secret, algorithm="HS256")

        @app.get("/api/_test_me_ghost")
        async def _test_me_ghost(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

        response = client.get(
            "/api/_test_me_ghost",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"

    def test_bearer_prefix_required(self, client):
        register_resp = client.post(
            "/api/auth/register",
            json={"username": "testuser", "password": "secret123"},
        )
        token = register_resp.json()["access_token"]

        @app.get("/api/_test_me_prefix")
        async def _test_me_prefix(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

        response = client.get(
            "/api/_test_me_prefix",
            headers={"Authorization": token},
        )
        assert response.status_code == 401

    def test_auth_header_missing_entirely_returns_401(self, client):
        @app.get("/api/_test_me_noheader")
        async def _test_me_noheader(user: User = Depends(get_current_user)):
            return {"user_id": user.id}

        response = client.get("/api/_test_me_noheader")
        assert response.status_code == 401
        assert response.json()["detail"] == "Ungültige Anmeldedaten"


class TestAuthWithoutSecret:
    def test_register_returns_503_when_no_jwt_secret(self):
        with TestClient(app) as c:
            response = c.post(
                "/api/auth/register",
                json={"username": "testuser", "password": "secret123"},
            )
            assert response.status_code == 503

    def test_login_returns_503_when_no_jwt_secret(self):
        with TestClient(app) as c:
            response = c.post(
                "/api/auth/login",
                json={"username": "testuser", "password": "secret123"},
            )
            assert response.status_code == 503
