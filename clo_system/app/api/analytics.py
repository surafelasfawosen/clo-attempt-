"""
app/api/analytics.py
FastAPI Router for Attainment Analytics & Accreditation Reporting.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["OBE Analytics"])

@router.get("/courses/{course_id}")
def get_course_analytics(course_id: str, db: Session = Depends(get_db)):
    result = AnalyticsService.calculate_course_attainment(db, course_id)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

