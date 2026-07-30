import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.auth import router as auth_router
from app.database import Base, engine
from app.routers.items import router as items_router
from app.routers.outfits import router as outfits_router
from app.routers.user import router as user_router

auth_enabled: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global auth_enabled
    Base.metadata.create_all(bind=engine)
    jwt_secret = os.environ.get("JWT_SECRET")
    if jwt_secret:
        auth_enabled = True
    yield


FRONTEND_ORIGIN = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")

app = FastAPI(title="Hollywood Closet", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(items_router)
app.include_router(outfits_router)
app.include_router(user_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
