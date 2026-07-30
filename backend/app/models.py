from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), server_default=func.now()
    )

    clothing_items: Mapped[list["ClothingItem"]] = relationship(
        "ClothingItem", back_populates="owner", cascade="all, delete-orphan"
    )
    outfits: Mapped[list["Outfit"]] = relationship(
        "Outfit", back_populates="owner", cascade="all, delete-orphan"
    )


class ClothingItem(Base):
    __tablename__ = "clothing_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    image_path: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), server_default=func.now()
    )

    owner: Mapped["User"] = relationship("User", back_populates="clothing_items")
    outfit_items: Mapped[list["OutfitItem"]] = relationship(
        "OutfitItem", back_populates="clothing_item", cascade="all, delete-orphan"
    )


class Outfit(Base):
    __tablename__ = "outfits"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(UTC), server_default=func.now()
    )

    owner: Mapped["User"] = relationship("User", back_populates="outfits")
    outfit_items: Mapped[list["OutfitItem"]] = relationship(
        "OutfitItem", back_populates="outfit", cascade="all, delete-orphan"
    )


class OutfitItem(Base):
    __tablename__ = "outfit_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    outfit_id: Mapped[int] = mapped_column(ForeignKey("outfits.id"), nullable=False)
    clothing_item_id: Mapped[int] = mapped_column(ForeignKey("clothing_items.id"), nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    outfit: Mapped["Outfit"] = relationship("Outfit", back_populates="outfit_items")
    clothing_item: Mapped["ClothingItem"] = relationship(
        "ClothingItem", back_populates="outfit_items"
    )
