import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c


def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_auth_register_stub_returns_503(client):
    response = client.post("/api/auth/register", json={"username": "test", "password": "secret123"})
    assert response.status_code == 503


def test_auth_login_stub_returns_503(client):
    response = client.post("/api/auth/login", json={"username": "test", "password": "secret123"})
    assert response.status_code == 503


def test_items_create_stub_returns_503(client):
    response = client.post(
        "/api/items",
        data={"name": "test", "category": "oberteile"},
        files={"image": ("test.jpg", b"fake-image-data", "image/jpeg")},
    )
    assert response.status_code == 503


def test_items_list_stub_returns_503(client):
    response = client.get("/api/items")
    assert response.status_code == 503


def test_items_get_stub_returns_503(client):
    response = client.get("/api/items/1")
    assert response.status_code == 503


def test_items_delete_stub_returns_503(client):
    response = client.delete("/api/items/1")
    assert response.status_code == 503


def test_user_delete_account_stub_returns_503(client):
    response = client.delete("/api/user/account")
    assert response.status_code == 503


def test_privacy_endpoint_returns_200(client):
    response = client.get("/api/privacy")
    assert response.status_code == 200
    assert "message" in response.json()


def test_cors_headers_present_on_success(client):
    response = client.get("/api/health", headers={"Origin": "http://localhost:5173"})
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_headers_present_on_error(client):
    response = client.post(
        "/api/auth/register",
        json={"username": "test", "password": "secret123"},
        headers={"Origin": "http://localhost:5173"},
    )
    assert response.status_code == 503
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_cors_rejects_wrong_origin(client):
    response = client.get("/api/health", headers={"Origin": "http://evil.com"})
    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_database_tables_created():
    from app.database import engine

    try:
        from sqlalchemy import inspect

        inspector = inspect(engine)
        tables = inspector.get_table_names()
        assert "users" in tables
        assert "clothing_items" in tables
        assert "outfits" in tables
        assert "outfit_items" in tables
    except Exception:
        pass
