"""
app/api/staffing.py
Faculty Assignment, AI Competence Matching Engine, and Student Batch Enrollment API.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
import uuid
import re

from app.database import get_db
from app.models.institution import Department
from app.models.curriculum import Course, CourseChapter
from app.models.instructor import Instructor
from app.models.student import Student, CourseEnrollment

router = APIRouter(tags=["Staffing & Student Assignments"])

# -------------------------------------------------------------
# Schemas
# -------------------------------------------------------------
class AssignInstructorSchema(BaseModel):
    instructor_id: str

class EnrollBatchSchema(BaseModel):
    batch: str                       # e.g. "2015"
    section: Optional[str] = "ALL"   # "Section A", "Section B", or "ALL"
    academic_period: Optional[str] = "2026/2027-S2"

class EnrollStudentSchema(BaseModel):
    student_id: str
    section: Optional[str] = "Section A"
    academic_period: Optional[str] = "2026/2027-S2"


# -------------------------------------------------------------
# AI Competence & Legitimacy Matching Algorithm
# -------------------------------------------------------------
def calculate_ai_competence_match(course: Course, instructor: Instructor) -> dict:
    """
    Evaluates an instructor's competence and legitimacy to teach a specific course.
    Returns score (0-100), legitimacy status, and transparent AI reasoning.
    """
    # 1. Topic & Keyword Extraction
    course_text = f"{course.title} {course.description or ''} {course.course_aims or ''}".lower()
    for ch in course.chapters or []:
        course_text += f" {ch.title} {ch.content}".lower()

    inst_specialties = [s.strip().lower() for s in (instructor.specializations or "").split(",") if s.strip()]
    inst_degree = (instructor.highest_degree or "").lower()
    inst_rank = (instructor.academic_rank or "").lower()

    # Keyword Matching Score (up to 55 points)
    matched_specialties = []
    for spec in inst_specialties:
        # Check if spec or its words appear in course text
        spec_words = [w for w in re.findall(r'\b[a-z]{3,}\b', spec) if w not in ('and', 'the', 'for', 'with', 'methods')]
        matches = [w for w in spec_words if w in course_text]
        if matches:
            matched_specialties.append(spec.title())

    ratio = len(matched_specialties) / max(len(inst_specialties), 1)
    if "operations research" in course.title.lower() and any("operations research" in s for s in inst_specialties):
        topic_score = 52
    elif "machine learning" in course.title.lower() and any("machine learning" in s for s in inst_specialties):
        topic_score = 52
    else:
        topic_score = min(int(ratio * 50) + (len(matched_specialties) * 4), 52)

    # 2. Seniority & Academic Rank Fit (up to 25 points)
    year_num = 4 if "4" in (course.academic_year or "") else (3 if "3" in (course.academic_year or "") else 2)
    if "professor" in inst_rank:
        rank_score = 25
    elif "associate" in inst_rank:
        rank_score = 24
    elif "assistant" in inst_rank:
        rank_score = 21 if year_num >= 4 else 24
    elif "senior lecturer" in inst_rank:
        rank_score = 18 if year_num >= 4 else 22
    else: # Lecturer
        rank_score = 12 if year_num >= 4 else 20

    # Ph.D. boost for senior 4th year courses
    if "ph.d" in inst_degree or "phd" in inst_degree:
        rank_score = min(rank_score + 3, 25)

    # 3. Workload & Capacity Fit (up to 20 points)
    credit_load = course.credit_hours or 3
    remaining_capacity = (instructor.max_teaching_load or 12) - (instructor.current_teaching_load or 0)
    if remaining_capacity >= credit_load:
        workload_score = 20
        workload_status = "Available Capacity"
    elif remaining_capacity >= 0:
        workload_score = 14
        workload_status = "Near Max Load"
    else:
        workload_score = 5
        workload_status = "Overloaded Warning"

    total_score = min(max(topic_score + rank_score + workload_score, 35), 98)

    # 4. Legitimacy Status & Rationale
    if total_score >= 88:
        status_label = "Highly Qualified & Legitimate"
        color = "emerald"
        if matched_specialties:
            rationale = f"Primary Competence Verified: Research specializations in {', '.join(matched_specialties[:3])} directly align with course syllabus chapters."
        else:
            rationale = "High qualifications and senior academic rank align with course requirements."
    elif total_score >= 72:
        status_label = "Qualified / Secondary Match"
        color = "blue"
        rationale = f"Adequate competence fit. Holds required academic standing with related foundational knowledge in {', '.join(matched_specialties[:2]) or 'computing discipline'}."
    else:
        status_label = "Specialization Mismatch / Overload Alert"
        color = "rose"
        rationale = f"Competence warning: Instructor background focuses on {instructor.specializations.split(',')[0] if instructor.specializations else 'different areas'}, which does not directly match the core syllabus requirements."

    return {
        "instructor_id": instructor.id,
        "full_name": instructor.full_name,
        "academic_rank": instructor.academic_rank,
        "highest_degree": instructor.highest_degree,
        "specializations": instructor.specializations,
        "avatar_initials": instructor.avatar_initials or "IN",
        "current_teaching_load": instructor.current_teaching_load,
        "max_teaching_load": instructor.max_teaching_load,
        "score": total_score,
        "status_label": status_label,
        "color": color,
        "rationale": rationale,
        "workload_status": workload_status,
        "matched_specialties": matched_specialties
    }


# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@router.get("/instructors")
def list_instructors(department_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Instructor)
    if department_id:
        query = query.filter(Instructor.department_id == department_id)
    instructors = query.all()
    return [
        {
            "id": i.id,
            "full_name": i.full_name,
            "email": i.email,
            "phone": i.phone,
            "department_id": i.department_id,
            "academic_rank": i.academic_rank,
            "highest_degree": i.highest_degree,
            "alma_mater": i.alma_mater,
            "specializations": i.specializations,
            "avatar_initials": i.avatar_initials or "IN",
            "max_teaching_load": i.max_teaching_load,
            "current_teaching_load": i.current_teaching_load,
            "bio": i.bio,
            "office_location": i.office_location,
            "courses_count": len(i.courses)
        }
        for i in instructors
    ]

@router.get("/courses/{course_id}/match-instructors")
def match_course_instructors(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    instructors = db.query(Instructor).filter(Instructor.department_id == course.department_id).all()
    if not instructors:
        instructors = db.query(Instructor).all()

    matches = [calculate_ai_competence_match(course, inst) for inst in instructors]
    # Sort descending by match score
    matches.sort(key=lambda x: x["score"], reverse=True)

    assigned_id = course.assigned_instructor_id
    assigned_inst = None
    if assigned_id:
        assigned_inst = next((m for m in matches if m["instructor_id"] == assigned_id), None)

    return {
        "course_id": course.id,
        "course_code": course.code,
        "course_title": course.title,
        "academic_year": course.academic_year,
        "semester": course.semester,
        "credit_hours": course.credit_hours,
        "assigned_instructor": assigned_inst,
        "ranked_candidates": matches
    }

@router.post("/courses/{course_id}/assign-instructor")
def assign_course_instructor(course_id: str, payload: AssignInstructorSchema, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    instructor = db.query(Instructor).filter(Instructor.id == payload.instructor_id).first()
    if not instructor:
        raise HTTPException(status_code=404, detail="Instructor not found")

    course.assigned_instructor_id = instructor.id
    course.instructor_name = instructor.full_name
    db.commit()

    match_result = calculate_ai_competence_match(course, instructor)

    return {
        "message": f"Assigned {instructor.full_name} to {course.code}",
        "course_id": course.id,
        "instructor_id": instructor.id,
        "instructor_name": instructor.full_name,
        "ai_match": match_result
    }

@router.get("/courses/{course_id}/roster")
def get_course_roster(course_id: str, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).all()

    students = []
    for enr in enrollments:
        std = enr.student
        if std:
            students.append({
                "enrollment_id": enr.id,
                "student_id": std.id,
                "student_number": std.student_number,
                "full_name": std.full_name,
                "email": std.email,
                "batch": std.batch or "2015",
                "section": enr.section or std.section or "Section A",
                "year_level": std.year_level or "Year 4",
                "status": enr.status or "Enrolled"
            })

    # Sort by student_number
    students.sort(key=lambda s: s["student_number"])

    # Determine recommended batch from course academic_year
    year_str = course.academic_year or "Year 4"
    if "4" in year_str:
        recommended_batch = "2015"
        cohort_standing = "Year 4, Semester I (Senior / Graduating Class)"
    elif "3" in year_str:
        recommended_batch = "2016"
        cohort_standing = "Year 3, Semester I (Junior Class)"
    elif "2" in year_str:
        recommended_batch = "2017"
        cohort_standing = "Year 2, Semester I (Sophomore Class)"
    else:
        recommended_batch = "2018"
        cohort_standing = "Year 1, Semester I (Freshman Class)"

    return {
        "course_id": course.id,
        "course_code": course.code,
        "course_title": course.title,
        "academic_year": course.academic_year,
        "semester": course.semester,
        "recommended_batch": recommended_batch,
        "cohort_standing": cohort_standing,
        "total_enrolled": len(students),
        "students": students
    }

@router.get("/students")
def list_students(
    batch: Optional[str] = None,
    section: Optional[str] = None,
    department_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if department_id:
        query = query.filter(Student.department_id == department_id)
    if batch and batch != "ALL":
        query = query.filter(Student.batch == batch)
    if section and section != "ALL":
        query = query.filter(Student.section == section)

    students = query.order_by(Student.student_number).all()
    return [
        {
            "id": s.id,
            "student_number": s.student_number,
            "full_name": s.full_name,
            "email": s.email,
            "batch": s.batch or "2015",
            "section": s.section or "Section A",
            "year_level": s.year_level or "Year 4",
            "status": s.status or "Active"
        }
        for s in students
    ]

@router.post("/courses/{course_id}/enroll-batch")
def enroll_batch_to_course(course_id: str, payload: EnrollBatchSchema, db: Session = Depends(get_db)):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    query = db.query(Student).filter(Student.department_id == course.department_id, Student.batch == payload.batch)
    if payload.section and payload.section != "ALL":
        query = query.filter(Student.section == payload.section)

    batch_students = query.all()
    if not batch_students:
        # Fallback to any students in that batch
        batch_students = db.query(Student).filter(Student.batch == payload.batch).all()

    enrolled_count = 0
    for std in batch_students:
        existing = db.query(CourseEnrollment).filter(
            CourseEnrollment.course_id == course.id,
            CourseEnrollment.student_id == std.id
        ).first()
        if not existing:
            enr = CourseEnrollment(
                id=f"enr_{course.code.lower()}_{std.student_number.replace('/', '_')}_{uuid.uuid4().hex[:4]}",
                student_id=std.id,
                course_id=course.id,
                academic_period=payload.academic_period or "2026/2027-S2",
                section=std.section or "Section A",
                status="Enrolled"
            )
            db.add(enr)
            enrolled_count += 1

    db.commit()
    return {
        "message": f"Successfully enrolled {enrolled_count} students from Batch {payload.batch} into {course.code}",
        "enrolled_count": enrolled_count,
        "total_batch_students": len(batch_students)
    }

@router.delete("/courses/{course_id}/enrollments/{enrollment_id}")
def remove_enrollment(course_id: str, enrollment_id: str, db: Session = Depends(get_db)):
    enr = db.query(CourseEnrollment).filter(CourseEnrollment.id == enrollment_id).first()
    if not enr:
        raise HTTPException(status_code=404, detail="Enrollment record not found")
    db.delete(enr)
    db.commit()
    return {"message": "Student successfully removed from course roster"}

