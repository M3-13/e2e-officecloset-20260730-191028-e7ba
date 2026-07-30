from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import ClothingItemResponse

router = APIRouter(prefix="/api/items", tags=["items"])


@router.post("", status_code=201, response_model=ClothingItemResponse)
async def create_item(
    name: str = Form(...),
    category: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.get("", response_model=list[ClothingItemResponse])
async def list_items(
    category: str | None = None,
    db: Session = Depends(get_db),
):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.get("/{item_id}", response_model=ClothingItemResponse)
async def get_item(item_id: int, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.delete("/{item_id}", status_code=204)
async def delete_item(item_id: int, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")
