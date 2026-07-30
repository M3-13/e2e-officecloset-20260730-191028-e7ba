import html
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app import auth as auth_module
from app.database import Base, get_db
from app.main import app
from app.models import ClothingItem, Outfit, OutfitItem, User

TEST_DB_URL = "sqlite:///./data/test_outfits.db"


@pytest.fixture
def test_engine():
    db_path = TEST_DB_URL.removeprefix("sqlite:///")
    os.makedirs(os.path.dirname(db_path) or ".", exist_ok=True)
    e = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=e)
    yield e
    Base.metadata.drop_all(bind=e)


@pytest.fixture
def TestSession(test_engine):
    return sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture
def db_session(TestSession):
    db = TestSession()
    try:
        yield db
    finally:
        db.rollback()
        db.close()


@pytest.fixture
def test_user(db_session):
    user = User(username="outfit_test_user", password_hash="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_user2(db_session):
    user = User(username="other_user", password_hash="hashed")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def test_item(db_session, test_user):
    item = ClothingItem(
        user_id=test_user.id,
        name="Rotes Hemd",
        category="oberteile",
        image_path="/uploads/red_shirt.jpg",
    )
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)
    return item


@pytest.fixture
def test_item2(db_session, test_user):
    item = ClothingItem(
        user_id=test_user.id,
        name="Blaue Jeans",
        category="hosen",
        image_path="/uploads/blue_jeans.jpg",
    )
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)
    return item


@pytest.fixture
def test_item_other(db_session, test_user2):
    item = ClothingItem(
        user_id=test_user2.id,
        name="Fremdes Item",
        category="jacken",
        image_path="/uploads/foreign.jpg",
    )
    db_session.add(item)
    db_session.commit()
    db_session.refresh(item)
    return item


@pytest.fixture
def client(TestSession, test_user):
    user_id = test_user.id

    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()

    def override_get_current_user():
        db = TestSession()
        try:
            return db.query(User).filter(User.id == user_id).first()
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[auth_module.get_current_user] = override_get_current_user

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()


class TestCreateOutfit:
    def test_create_outfit_success(self, client, test_item, test_item2):
        response = client.post(
            "/api/outfits",
            json={"name": "Mein Outfit", "item_ids": [test_item.id, test_item2.id]},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Mein Outfit"
        assert data["id"] is not None

    def test_create_outfit_name_too_short(self, client, test_item):
        response = client.post(
            "/api/outfits",
            json={"name": "", "item_ids": [test_item.id]},
        )
        assert response.status_code == 422

    def test_create_outfit_name_too_long(self, client, test_item):
        response = client.post(
            "/api/outfits",
            json={"name": "A" * 101, "item_ids": [test_item.id]},
        )
        assert response.status_code == 422

    def test_create_outfit_no_items(self, client):
        response = client.post(
            "/api/outfits",
            json={"name": "Leeres Outfit", "item_ids": []},
        )
        assert response.status_code == 422

    def test_create_outfit_foreign_item(self, client, test_item_other):
        response = client.post(
            "/api/outfits",
            json={"name": "Fremdes Outfit", "item_ids": [test_item_other.id]},
        )
        assert response.status_code == 403

    def test_create_outfit_mixed_items(self, client, test_item, test_item_other):
        response = client.post(
            "/api/outfits",
            json={"name": "Gemischt", "item_ids": [test_item.id, test_item_other.id]},
        )
        assert response.status_code == 403

    def test_create_outfit_html_encoding(self, client, test_item):
        response = client.post(
            "/api/outfits",
            json={"name": "<script>alert(1)</script>", "item_ids": [test_item.id]},
        )
        assert response.status_code == 201
        data = response.json()
        expected = html.escape("<script>alert(1)</script>")
        assert data["name"] == expected

    def test_create_outfit_content_type_json(self, client, test_item):
        response = client.post(
            "/api/outfits",
            json={"name": "Test", "item_ids": [test_item.id]},
        )
        assert response.status_code == 201
        assert "application/json" in response.headers["content-type"]


class TestListOutfits:
    def test_list_outfits_empty(self, client):
        response = client.get("/api/outfits")
        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_list_outfits_with_items(self, client, test_item, test_item2):
        client.post(
            "/api/outfits",
            json={"name": "Outfit 1", "item_ids": [test_item.id]},
        )
        client.post(
            "/api/outfits",
            json={"name": "Outfit 2", "item_ids": [test_item2.id]},
        )

        response = client.get("/api/outfits")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["name"] == "Outfit 1"
        assert len(data[0]["items"]) == 1
        assert data[0]["items"][0]["name"] == "Rotes Hemd"
        assert data[0]["items"][0]["image_path"] == "/uploads/red_shirt.jpg"

    def test_list_outfits_user_isolation(self, client, test_user2, db_session):
        other_outfit = Outfit(user_id=test_user2.id, name="Anderes Outfit")
        db_session.add(other_outfit)
        db_session.flush()
        db_session.add(OutfitItem(outfit_id=other_outfit.id, clothing_item_id=1, position=0))
        db_session.commit()

        response = client.get("/api/outfits")
        assert response.status_code == 200
        other_names = [o["name"] for o in response.json()]
        assert "Anderes Outfit" not in other_names


class TestGetOutfit:
    def test_get_outfit_success(self, client, test_item):
        create_resp = client.post(
            "/api/outfits",
            json={"name": "Mein Outfit", "item_ids": [test_item.id]},
        )
        outfit_id = create_resp.json()["id"]

        response = client.get(f"/api/outfits/{outfit_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Mein Outfit"
        assert len(data["items"]) == 1
        assert data["items"][0]["id"] == test_item.id

    def test_get_outfit_not_found(self, client):
        response = client.get("/api/outfits/99999")
        assert response.status_code == 404

    def test_get_outfit_wrong_owner(self, client, test_user2, db_session):
        outfit = Outfit(user_id=test_user2.id, name="Fremdes")
        db_session.add(outfit)
        db_session.flush()
        db_session.commit()
        db_session.refresh(outfit)

        response = client.get(f"/api/outfits/{outfit.id}")
        assert response.status_code == 403


class TestDeleteOutfit:
    def test_delete_outfit_success(self, client, test_item):
        create_resp = client.post(
            "/api/outfits",
            json={"name": "Zu löschen", "item_ids": [test_item.id]},
        )
        outfit_id = create_resp.json()["id"]

        response = client.delete(f"/api/outfits/{outfit_id}")
        assert response.status_code == 204

        get_resp = client.get(f"/api/outfits/{outfit_id}")
        assert get_resp.status_code == 404

    def test_delete_outfit_not_found(self, client):
        response = client.delete("/api/outfits/99999")
        assert response.status_code == 404

    def test_delete_outfit_wrong_owner(self, client, test_user2, db_session):
        outfit = Outfit(user_id=test_user2.id, name="Fremdes")
        db_session.add(outfit)
        db_session.flush()
        db_session.commit()
        db_session.refresh(outfit)

        response = client.delete(f"/api/outfits/{outfit.id}")
        assert response.status_code == 403

    def test_delete_does_not_delete_items(self, client, test_item, test_item2, db_session):
        create_resp = client.post(
            "/api/outfits",
            json={"name": "Outfit", "item_ids": [test_item.id, test_item2.id]},
        )
        outfit_id = create_resp.json()["id"]

        client.delete(f"/api/outfits/{outfit_id}")

        item = db_session.query(ClothingItem).filter(ClothingItem.id == test_item.id).first()
        assert item is not None
        item2 = db_session.query(ClothingItem).filter(ClothingItem.id == test_item2.id).first()
        assert item2 is not None
