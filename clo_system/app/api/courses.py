"""
app/api/courses.py
FastAPI Router for Course & CLO Management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.services.course_service import CourseService
from app.services.docx_exporter import generate_course_docx
from app.schemas.curriculum import CourseCreateSchema, CourseUpdateSchema
from app.models.curriculum import Course

router = APIRouter(prefix="/courses", tags=["Courses & CLOs"])

@router.get("", response_model=List[Dict[str, Any]])
def list_courses(
    department_id: Optional[str] = None,
    academic_year: Optional[str] = None,
    semester: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return CourseService.list_courses(
        db,
        department_id=department_id,
        academic_year=academic_year,
        semester=semester
    )

@router.get("/{course_id}", response_model=Dict[str, Any])
def get_course(course_id: str, db: Session = Depends(get_db)):
    course = CourseService.get_course_by_id(db, course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@router.post("", status_code=status.HTTP_201_CREATED)
def create_course(payload: CourseCreateSchema, db: Session = Depends(get_db)):
    try:
        new_course = CourseService.create_course(db, payload)
        return {"message": "Course created successfully", "course": new_course}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.put("/{course_id}")
def update_course(course_id: str, payload: CourseUpdateSchema, db: Session = Depends(get_db)):
    try:
        updated = CourseService.update_course(db, course_id, payload)
        return {"message": "Course updated successfully", "course": updated}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.delete("/{course_id}")
def delete_course(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"message": f"Course {course.code} deleted successfully"}

@router.get("/{course_id}/export/docx")
def export_course_docx(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    college = course.department.college if course.department and hasattr(course.department, 'college') else None
    stream = generate_course_docx(course, course.department, college, db=db)
    filename = f"{course.code}_Official_Syllabus.docx"
    
    return StreamingResponse(
        stream,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
