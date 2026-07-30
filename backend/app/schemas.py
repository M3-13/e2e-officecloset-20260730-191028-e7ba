from datetime import datetime
from enum import StrEnum

from pydantic import BaseModel, Field


class CategoryEnum(StrEnum):
    oberteile = "oberteile"
    hosen = "hosen"
    roecke = "röcke"
    kleider = "kleider"
    jacken = "jacken"
    schuhe = "schuhe"
    accessoires = "accessoires"


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    username: str = Field(min_length=1, max_length=50)
    password: str = Field(min_length=1, max_length=128)


class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ClothingItemCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    category: CategoryEnum


class ClothingItemResponse(BaseModel):
    id: int
    name: str
    category: str
    image_path: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    item_ids: list[int] = Field(min_length=1, max_length=20)


class OutfitResponse(BaseModel):
    id: int
    name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class OutfitDetail(BaseModel):
    id: int
    name: str
    created_at: datetime
    items: list[ClothingItemResponse]

    model_config = {"from_attributes": True}
