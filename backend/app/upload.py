from fastapi import UploadFile


async def save_upload(image: UploadFile) -> str:
    raise NotImplementedError


async def create_thumbnail(path: str) -> str:
    raise NotImplementedError
