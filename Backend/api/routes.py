from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import Response
from typing import Optional, List
from sqlmodel import Session, select
from core.exif_reader import extract_metadata
from core.exif_modifier import modify_metadata
from db.models import User, ImageRecord
from db.connection import get_session

router = APIRouter()

@router.post("/upload")
async def process_upload(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image.")
    image_bytes = await file.read()
    metadata = extract_metadata(image_bytes)
    return {"filename": file.filename, "metadata": metadata}

@router.post("/modify")
async def modify_image(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    timestamp: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    # --- NEW DB FIELDS ---
    user_id: Optional[str] = Form(None),
    user_email: Optional[str] = Form(None),
    original_lat: Optional[float] = Form(None),
    original_lon: Optional[float] = Form(None),
    session: Session = Depends(get_session)
):
    image_bytes = await file.read()
    modified_bytes = modify_metadata(
        image_bytes=image_bytes, new_lat=latitude, new_lon=longitude, 
        new_timestamp=timestamp, new_description=description
    )
    
    if not modified_bytes:
        raise HTTPException(status_code=500, detail="Failed to modify image metadata.")

    # --- NEW DB LOGIC ---
    if user_id and user_email:
        # 1. Sync the user to our local User table if they don't exist yet
        db_user = session.get(User, user_id)
        if not db_user:
            db_user = User(id=user_id, email=user_email)
            session.add(db_user)
            session.commit()
            
        # 2. Log this specific image edit
        record = ImageRecord(
            user_id=user_id,
            filename=file.filename,
            original_lat=original_lat,
            original_lon=original_lon,
            modified_lat=latitude,
            modified_lon=longitude
        )
        session.add(record)
        session.commit()

    return Response(
        content=modified_bytes, 
        media_type=file.content_type,
        headers={"Content-Disposition": f'attachment; filename="modified_{file.filename}"'}
    )

@router.delete("/history/{record_id}")
def delete_history_record(record_id: int, session: Session = Depends(get_session)):
    """Deletes a specific image record from the database."""
    record = session.get(ImageRecord, record_id)
    
    if not record:
        raise HTTPException(status_code=404, detail="Record not found.")
        
    session.delete(record)
    session.commit()
    
    return {"message": "Record deleted successfully."}

# --- NEW HISTORY ENDPOINT ---
@router.get("/history/{user_id}")
def get_user_history(user_id: str, session: Session = Depends(get_session)):
    """Fetches all past edits for a specific user, newest first."""
    statement = select(ImageRecord).where(ImageRecord.user_id == user_id).order_by(ImageRecord.created_at.desc())
    records = session.exec(statement).all()
    return records