from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import OutfitCreate, OutfitDetail, OutfitResponse

router = APIRouter(prefix="/api/outfits", tags=["outfits"])


@router.post("", status_code=201, response_model=OutfitResponse)
async def create_outfit(body: OutfitCreate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.get("", response_model=list[OutfitResponse])
async def list_outfits(db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.get("/{outfit_id}", response_model=OutfitDetail)
async def get_outfit(outfit_id: int, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.delete("/{outfit_id}", status_code=204)
async def delete_outfit(outfit_id: int, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")
