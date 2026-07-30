import html

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.auth import get_current_user
from app.database import get_db
from app.models import ClothingItem, Outfit, OutfitItem, User
from app.schemas import OutfitCreate, OutfitDetail, OutfitResponse

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


def _html_encode_name(name: str) -> str:
    return html.escape(name)


@router.post("", status_code=201, response_model=OutfitResponse)
def create_outfit(
    body: OutfitCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item_ids = body.item_ids

    owned_items = (
        db.query(ClothingItem)
        .filter(ClothingItem.id.in_(item_ids), ClothingItem.user_id == current_user.id)
        .all()
    )
    if len(owned_items) != len(set(item_ids)):
        raise HTTPException(
            status_code=403, detail="Ein oder mehrere Kleidungsstücke gehören nicht dir."
        )

    outfit = Outfit(user_id=current_user.id, name=_html_encode_name(body.name))
    db.add(outfit)
    db.flush()

    for position, cid in enumerate(item_ids):
        db.add(OutfitItem(outfit_id=outfit.id, clothing_item_id=cid, position=position))

    db.commit()
    db.refresh(outfit)
    return outfit


@router.get("", response_model=list[OutfitDetail])
def list_outfits(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfits = db.query(Outfit).filter(Outfit.user_id == current_user.id).all()
    result = []
    for outfit in outfits:
        items = [oi.clothing_item for oi in outfit.outfit_items]
        result.append(
            OutfitDetail(
                id=outfit.id,
                name=outfit.name,
                created_at=outfit.created_at,
                items=items,
            )
        )
    return result


@router.get("/{outfit_id}", response_model=OutfitDetail)
def get_outfit(
    outfit_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit is None:
        raise HTTPException(status_code=404, detail="Outfit nicht gefunden.")
    if outfit.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Outfit gehört nicht dir.")

    items = [oi.clothing_item for oi in outfit.outfit_items]
    return OutfitDetail(
        id=outfit.id,
        name=outfit.name,
        created_at=outfit.created_at,
        items=items,
    )


@router.delete("/{outfit_id}", status_code=204)
def delete_outfit(
    outfit_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    outfit = db.query(Outfit).filter(Outfit.id == outfit_id).first()
    if outfit is None:
        raise HTTPException(status_code=404, detail="Outfit nicht gefunden.")
    if outfit.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Outfit gehört nicht dir.")

    db.delete(outfit)
    db.commit()
