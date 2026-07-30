from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import TokenResponse, UserCreate, UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.post("/register", status_code=201, response_model=UserResponse)
async def register(body: UserCreate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin, db: Session = Depends(get_db)):
    raise HTTPException(status_code=503, detail="Service unavailable")
