import os
import time
from collections import defaultdict
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import TokenResponse, UserCreate, UserLogin

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
MIN_SECRET_BYTES = 32

_rate_limit_store: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = 60

AUTH_ERROR_MSG = "Ungültige Anmeldedaten"


def _get_jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET")
    if not secret:
        raise HTTPException(status_code=503, detail="Service unavailable")
    if len(secret.encode("utf-8")) < MIN_SECRET_BYTES:
        raise HTTPException(status_code=503, detail="Service unavailable")
    return secret


def _create_token(user_id: int) -> str:
    secret = _get_jwt_secret()
    expire = datetime.now(UTC) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {"user_id": user_id, "exp": expire}
    return jwt.encode(payload, secret, algorithm=JWT_ALGORITHM)


def _check_rate_limit(ip: str) -> None:
    now = time.time()
    attempts = [t for t in _rate_limit_store[ip] if now - t < RATE_LIMIT_WINDOW]
    _rate_limit_store[ip] = attempts
    if len(attempts) >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too Many Requests")
    attempts.append(now)


async def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AUTH_ERROR_MSG,
        )
    token = auth_header.removeprefix("Bearer ")
    secret = _get_jwt_secret()
    try:
        payload = jwt.decode(token, secret, algorithms=[JWT_ALGORITHM])
        user_id: int | None = payload.get("user_id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=AUTH_ERROR_MSG,
            )
    except JWTError as err:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AUTH_ERROR_MSG,
        ) from err
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AUTH_ERROR_MSG,
        )
    return user


@router.post("/register", status_code=201, response_model=TokenResponse)
async def register(body: UserCreate, db: Session = Depends(get_db)):
    _get_jwt_secret()
    existing = db.query(User).filter(User.username == body.username).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=AUTH_ERROR_MSG,
        )
    hashed = pwd_context.hash(body.password)
    user = User(username=body.username, password_hash=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    token = _create_token(user.id)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(request: Request, body: UserLogin, db: Session = Depends(get_db)):
    _get_jwt_secret()
    client_ip = request.client.host if request.client else "unknown"
    _check_rate_limit(client_ip)
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not pwd_context.verify(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=AUTH_ERROR_MSG,
        )
    token = _create_token(user.id)
    return TokenResponse(access_token=token)
