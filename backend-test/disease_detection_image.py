from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from io import BytesIO
import asyncio

from PIL import (
    Image,
    UnidentifiedImageError
)

from ml_image_model import predict_image

router = APIRouter()

# ==========================================
# IMAGE DISEASE DETECTION ROUTE
# ==========================================
@router.post("/detect-disease-image")
async def detect_disease_image(
    file: UploadFile = File(...)
):

    try:

        # ==================================
        # VALIDATE FILE TYPE
        # ==================================
        if not file.content_type.startswith("image/"):

            raise HTTPException(
                status_code=400,
                detail="Only image files allowed"
            )

        # ==================================
        # READ FILE
        # ==================================
        image_bytes = await file.read()

        if not image_bytes:

            raise HTTPException(
                status_code=400,
                detail="Empty image file"
            )

        img_file = BytesIO(image_bytes)

        # ==================================
        # VERIFY IMAGE
        # ==================================
        try:

            Image.open(img_file).verify()

        except UnidentifiedImageError:

            raise HTTPException(
                status_code=400,
                detail="Invalid image"
            )

        # Reset stream
        img_file.seek(0)

        # ==================================
        # RUN MODEL
        # ==================================
        result = await asyncio.to_thread(
            predict_image,
            img_file
        )

        return result

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )