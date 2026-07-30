from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.database import get_db

router = APIRouter(tags=["user"])


@router.delete("/api/user/account", status_code=204)
async def delete_account(db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.get("/api/privacy")
async def privacy():
    return JSONResponse(
        content={"message": "Datenschutzerklärung folgt in einem späteren Sprint."},
        status_code=200,
    )
