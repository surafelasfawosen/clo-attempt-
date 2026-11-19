"""
app/services/course_service.py
Business Logic Service for Course, Chapters, CLO, and Assessment Blueprint Management.
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
import uuid

from app.models.curriculum import Course, CourseChapter, CLO, PLO, CLOPLOMapping
from app.models.assessment import AssessmentInstrument, AssessmentCLOAllocation
from app.models.institution import Department
from app.schemas.curriculum import CourseCreateSchema, CourseUpdateSchema

class CourseService:

    @staticmethod
    def get_course_by_id(db: Session, course_id: str) -> Optional[Dict[str, Any]]:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return None
        return CourseService.serialize_course(course)

    @staticmethod
    def list_courses(
        db: Session,
        department_id: Optional[str] = None,
        academic_year: Optional[str] = None,
        semester: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        query = db.query(Course)
        if department_id:
            query = query.filter(Course.department_id == department_id)
        if academic_year and academic_year != 'ALL':
            query = query.filter(Course.academic_year == academic_year)
        if semester and semester != 'ALL':
            query = query.filter(Course.semester == semester)
        courses = query.order_by(Course.academic_year, Course.semester, Course.code).all()
        return [CourseService.serialize_course(c) for c in courses]

    @staticmethod
    def create_course(db: Session, data: CourseCreateSchema) -> Dict[str, Any]:
        c_id = data.id or f"course_{data.code.lower().replace(' ', '_')}"
        
        existing = db.query(Course).filter((Course.id == c_id) | (Course.code == data.code)).first()
        if existing:
            raise ValueError(f"Course with code {data.code} already exists.")

        course = Course(
            id=c_id,
            code=data.code,
            title=data.title,
            department_id=data.department_id,
            academic_year=data.academic_year,
            semester=data.semester,
            credit_hours=data.credit_hours,
            lecture_hours=data.lecture_hours,
            lab_hours=data.lab_hours,
            tutorial_hours=data.tutorial_hours,
            prerequisites=data.prerequisites or "",
            description=data.description or "",
            course_aims=data.course_aims or "",
            instructor_name=data.instructor_name or "Unassigned",
            direct_weight_pct=data.direct_weight_pct,
            indirect_weight_pct=data.indirect_weight_pct,
            program_name=data.program_name or "B.Sc in Data Science",
            course_category=data.course_category or "Core",
            independent_hours=data.independent_hours if data.independent_hours is not None else 30,
            assessment_hours=data.assessment_hours if data.assessment_hours is not None else 15,
            total_notional_hours=data.total_notional_hours if data.total_notional_hours is not None else 120,
            corequisites=data.corequisites or "None",
            textbooks=data.textbooks or "",
            reference_books=data.reference_books or "",
            teaching_strategy=data.teaching_strategy or "",
            status="Published"
        )
        db.add(course)
        db.flush()

        # Add CLOs
        if data.clos:
            for i, clo_in in enumerate(data.clos):
                clo_id = clo_in.id or f"{c_id}_clo_{i+1}"
                clo = CLO(
                    id=clo_id,
                    course_id=c_id,
                    code=clo_in.code,
                    description=clo_in.description,
                    blooms_level=clo_in.blooms_level,
                    passing_score_pct=clo_in.passing_score_pct,
                    target_attainment_pct=clo_in.target_attainment_pct,
                    teaching_method=clo_in.teaching_method or "Lecture & Lab",
                    assessment_methods=clo_in.assessment_methods or ""
                )
                db.add(clo)
                db.flush()

                for mapping in clo_in.plo_mappings or []:
                    p_id = mapping.plo_id if hasattr(mapping, "plo_id") else (mapping.get("plo_id") if isinstance(mapping, dict) else str(mapping))
                    m = CLOPLOMapping(
                        id=f"map_{uuid.uuid4().hex[:8]}",
                        clo_id=clo_id,
                        plo_id=p_id,
                        correlation_weight=getattr(mapping, "correlation_weight", 2) if not isinstance(mapping, dict) else mapping.get("correlation_weight", 2)
                    )
                    db.add(m)

        # Add Chapters
        if data.chapters:
            for ch_in in data.chapters:
                ch_id = ch_in.id or f"{c_id}_ch_{uuid.uuid4().hex[:6]}"
                ch = CourseChapter(
                    id=ch_id,
                    course_id=c_id,
                    chapter_number=ch_in.chapter_number,
                    title=ch_in.title,
                    content=ch_in.content or "",
                    mapped_clos=ch_in.mapped_clos or "CLO1",
                    teaching_methods=ch_in.teaching_methods or "Lecture, Tutorial"
                )
                db.add(ch)

        # Add Assessments
        if data.assessments:
            for asm_in in data.assessments:
                asm_id = asm_in.id or f"{c_id}_asm_{uuid.uuid4().hex[:6]}"
                asm = AssessmentInstrument(
                    id=asm_id,
                    course_id=c_id,
                    name=asm_in.name,
                    assessment_type=asm_in.assessment_type,
                    total_marks=asm_in.total_marks,
                    course_weight_pct=asm_in.course_weight_pct
                )
                db.add(asm)
                db.flush()

                for alloc in asm_in.clo_allocations or []:
                    al = AssessmentCLOAllocation(
                        id=f"alloc_{uuid.uuid4().hex[:8]}",
                        assessment_id=asm_id,
                        clo_id=alloc.clo_id,
                        allocated_marks=alloc.allocated_marks
                    )
                    db.add(al)

        db.commit()
        db.refresh(course)
        return CourseService.serialize_course(course)

    @staticmethod
    def update_course(db: Session, course_id: str, data: CourseUpdateSchema) -> Dict[str, Any]:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            raise ValueError(f"Course {course_id} not found.")

        update_fields = [
            "title", "academic_year", "semester", "credit_hours",
            "lecture_hours", "lab_hours", "tutorial_hours", "prerequisites",
            "description", "course_aims", "instructor_name",
            "direct_weight_pct", "indirect_weight_pct",
            "program_name", "course_category", "independent_hours",
            "assessment_hours", "total_notional_hours", "corequisites",
            "textbooks", "reference_books", "teaching_strategy"
        ]
        for field in update_fields:
            val = getattr(data, field)
            if val is not None:
                setattr(course, field, val)

        # Update CLOs if provided
        if data.clos is not None:
            for clo in course.clos:
                db.query(CLOPLOMapping).filter(CLOPLOMapping.clo_id == clo.id).delete()
                db.query(AssessmentCLOAllocation).filter(AssessmentCLOAllocation.clo_id == clo.id).delete()
            db.query(CLO).filter(CLO.course_id == course_id).delete()
            db.flush()

            for i, clo_in in enumerate(data.clos):
                clo_id = clo_in.id or f"{course_id}_clo_{i+1}"
                clo = CLO(
                    id=clo_id,
                    course_id=course_id,
                    code=clo_in.code,
                    description=clo_in.description,
                    blooms_level=clo_in.blooms_level,
                    passing_score_pct=clo_in.passing_score_pct,
                    target_attainment_pct=clo_in.target_attainment_pct,
                    teaching_method=clo_in.teaching_method or "Lecture & Lab",
                    assessment_methods=clo_in.assessment_methods or ""
                )
                db.add(clo)
                db.flush()

                for mapping in clo_in.plo_mappings or []:
                    p_id = mapping.plo_id if hasattr(mapping, "plo_id") else (mapping.get("plo_id") if isinstance(mapping, dict) else str(mapping))
                    m = CLOPLOMapping(
                        id=f"map_{uuid.uuid4().hex[:8]}",
                        clo_id=clo_id,
                        plo_id=p_id,
                        correlation_weight=getattr(mapping, "correlation_weight", 2) if not isinstance(mapping, dict) else mapping.get("correlation_weight", 2)
                    )
                    db.add(m)

        # Update Chapters if provided
        if data.chapters is not None:
            db.query(CourseChapter).filter(CourseChapter.course_id == course_id).delete()
            db.flush()

            for i, ch_in in enumerate(data.chapters):
                ch_id = ch_in.id or f"{course_id}_ch_{i+1}_{uuid.uuid4().hex[:4]}"
                ch = CourseChapter(
                    id=ch_id,
                    course_id=course_id,
                    chapter_number=ch_in.chapter_number or (i + 1),
                    title=ch_in.title,
                    content=ch_in.content or "",
                    mapped_clos=ch_in.mapped_clos or "CLO1",
                    teaching_methods=ch_in.teaching_methods or "Lecture, Tutorial"
                )
                db.add(ch)

        # Update Assessments if provided
        if data.assessments is not None:
            for asm in course.assessments:
                db.query(AssessmentCLOAllocation).filter(AssessmentCLOAllocation.assessment_id == asm.id).delete()
            db.query(AssessmentInstrument).filter(AssessmentInstrument.course_id == course_id).delete()
            db.flush()

            for asm_in in data.assessments:
                asm_id = asm_in.id or f"{course_id}_asm_{uuid.uuid4().hex[:6]}"
                asm = AssessmentInstrument(
                    id=asm_id,
                    course_id=course_id,
                    name=asm_in.name,
                    assessment_type=asm_in.assessment_type,
                    total_marks=asm_in.total_marks,
                    course_weight_pct=asm_in.course_weight_pct
                )
                db.add(asm)
                db.flush()

                for alloc in asm_in.clo_allocations or []:
                    al = AssessmentCLOAllocation(
                        id=f"alloc_{uuid.uuid4().hex[:8]}",
                        assessment_id=asm_id,
                        clo_id=alloc.clo_id,
                        allocated_marks=alloc.allocated_marks
                    )
                    db.add(al)

        db.commit()
        db.refresh(course)
        return CourseService.serialize_course(course)

    @staticmethod
    def serialize_course(course: Course) -> Dict[str, Any]:
        clos_data = []
        for clo in course.clos:
            mappings = [
                {
                    "plo_id": m.plo_id,
                    "correlation_weight": m.correlation_weight
                }
                for m in clo.plo_mappings
            ]
            clos_data.append({
                "id": clo.id,
                "code": clo.code,
                "description": clo.description,
                "blooms_level": clo.blooms_level,
                "passing_score_pct": clo.passing_score_pct,
                "target_attainment_pct": clo.target_attainment_pct,
                "teaching_method": clo.teaching_method,
                "assessment_methods": clo.assessment_methods or "",
                "plo_mappings": mappings
            })

        chapters_data = []
        for ch in course.chapters:
            chapters_data.append({
                "id": ch.id,
                "chapter_number": ch.chapter_number,
                "title": ch.title,
                "content": ch.content,
                "mapped_clos": ch.mapped_clos,
                "teaching_methods": ch.teaching_methods
            })

        assessments_data = []
        for asm in course.assessments:
            allocs = [
                {
                    "clo_id": al.clo_id,
                    "allocated_marks": al.allocated_marks
                }
                for al in asm.clo_allocations
            ]
            assessments_data.append({
                "id": asm.id,
                "name": asm.name,
                "assessment_type": asm.assessment_type,
                "total_marks": asm.total_marks,
                "course_weight_pct": asm.course_weight_pct,
                "clo_allocations": allocs
            })

        return {
            "id": course.id,
            "code": course.code,
            "title": course.title,
            "department_id": course.department_id,
            "academic_year": course.academic_year,
            "semester": course.semester,
            "stream": getattr(course, "stream", None) or "Common",
            "credit_hours": course.credit_hours,
            "lecture_hours": course.lecture_hours,
            "lab_hours": course.lab_hours,
            "tutorial_hours": course.tutorial_hours,
            "prerequisites": course.prerequisites,
            "description": course.description,
            "course_aims": course.course_aims,
            "instructor_name": course.instructor_name,
            "status": course.status,
            "direct_weight_pct": course.direct_weight_pct,
            "indirect_weight_pct": course.indirect_weight_pct,
            "program_name": course.program_name or "B.Sc in Data Science",
            "course_category": course.course_category or "Core",
            "independent_hours": course.independent_hours if course.independent_hours is not None else 30,
            "assessment_hours": course.assessment_hours if course.assessment_hours is not None else 15,
            "total_notional_hours": course.total_notional_hours if course.total_notional_hours is not None else 120,
            "corequisites": course.corequisites or "None",
            "textbooks": course.textbooks or "",
            "reference_books": course.reference_books or "",
            "teaching_strategy": course.teaching_strategy or "",
            "clos": clos_data,
            "chapters": chapters_data,
            "assessments": assessments_data
        }
