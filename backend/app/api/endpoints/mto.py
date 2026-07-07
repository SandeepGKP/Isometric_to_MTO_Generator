import io
import csv
import openpyxl
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from app.schemas.mto import MTOResponse
from app.services.ai_pipeline import extract_mto_from_image
from app.core.store import jobs

router = APIRouter()

@router.get("/mto/{job_id}", response_model=MTOResponse)
def get_mto(job_id: str):
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
        
    job = jobs[job_id]
    
    if job["status"] == "completed" and job["mto_data"]:
        return job["mto_data"]
        
    file_path = job["file_path"]
    
    try:
        # Call the AI pipeline
        mto_response = extract_mto_from_image(file_path)
        
        # Verify it is actually an isometric drawing
        if hasattr(mto_response, "is_isometric_drawing") and not mto_response.is_isometric_drawing:
            job["status"] = "failed"
            job["error"] = "Only Isometric Drawings of pipelines are allowed (PDF, JPG, PNG. Max 20MB)."
            raise HTTPException(status_code=400, detail="Only Isometric Drawings of pipelines are allowed (PDF, JPG, PNG. Max 20MB).")
            
        # Update job with success
        job["status"] = "completed"
        job["mto_data"] = mto_response
        return mto_response
    except Exception as e:
        job["status"] = "failed"
        raise HTTPException(status_code=500, detail=f"Failed to process drawing: {str(e)}")

@router.get("/mto/{job_id}/csv")
def get_mto_csv(job_id: str):
    if job_id not in jobs or jobs[job_id]["status"] != "completed" or not jobs[job_id]["mto_data"]:
        raise HTTPException(status_code=400, detail="MTO data not ready or job not found")
        
    mto_data: MTOResponse = jobs[job_id]["mto_data"]
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Item No", "Category", "Description", "Size (NPS)", "Schedule/Rating", "Material Spec", "End Type", "Quantity", "Unit", "Length (m)", "Remarks"])
    
    for item in mto_data.items:
        writer.writerow([
            item.item_no, item.category, item.description, item.size_nps,
            item.schedule_rating, item.material_spec, item.end_type,
            item.quantity if item.quantity is not None else "", item.unit,
            item.length_m if item.length_m is not None else "", item.remarks
        ])
        
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="text/csv", 
        headers={"Content-Disposition": f"attachment; filename=mto_{job_id}.csv"}
    )

@router.get("/mto/{job_id}/excel")
def get_mto_excel(job_id: str):
    if job_id not in jobs or jobs[job_id]["status"] != "completed" or not jobs[job_id]["mto_data"]:
        raise HTTPException(status_code=400, detail="MTO data not ready or job not found")
        
    mto_data: MTOResponse = jobs[job_id]["mto_data"]
    
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "MTO"
    
    headers = ["Item No", "Category", "Description", "Size (NPS)", "Schedule/Rating", "Material Spec", "End Type", "Quantity", "Unit", "Length (m)", "Remarks"]
    ws.append(headers)
    
    for item in mto_data.items:
        ws.append([
            item.item_no, item.category, item.description, item.size_nps,
            item.schedule_rating, item.material_spec, item.end_type,
            item.quantity if item.quantity is not None else "", item.unit,
            item.length_m if item.length_m is not None else "", item.remarks
        ])
        
    output = io.BytesIO()
    wb.save(output)
    output.seek(0)
    
    return StreamingResponse(
        iter([output.getvalue()]), 
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
        headers={"Content-Disposition": f"attachment; filename=mto_{job_id}.xlsx"}
    )
