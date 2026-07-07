import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.core.store import jobs

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/") and file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only images or PDF files are allowed")
    
    # Read file content
    content = await file.read()
    
    # Simple size validation (e.g. 20MB max)
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds 20MB limit")
        
    job_id = str(uuid.uuid4())
    
    # Save temporarily to disk for processing (simpler for PIL/Gemini)
    os.makedirs("temp_uploads", exist_ok=True)
    temp_path = f"temp_uploads/{job_id}_{file.filename}"
    with open(temp_path, "wb") as f:
        f.write(content)
        
    jobs[job_id] = {
        "status": "uploaded",
        "file_path": temp_path,
        "filename": file.filename,
        "mto_data": None
    }
    
    return {"job_id": job_id}
