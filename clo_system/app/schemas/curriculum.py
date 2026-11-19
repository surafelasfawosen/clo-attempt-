"""
app/schemas/curriculum.py
Pydantic Request and Response Schemas for Curriculum, Chapters, CLOs, and Blueprint.
"""

from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class CLOPLOMapSchema(BaseModel):
    plo_id: str
    correlation_weight: int = 2

class CLOCreateSchema(BaseModel):
    id: Optional[str] = None
    code: str
    description: str
    blooms_level: str = "Applying"
    passing_score_pct: float = 60.0
    target_attainment_pct: float = 70.0
    teaching_method: Optional[str] = "Lecture & Lab"
    assessment_methods: Optional[str] = ""
    plo_mappings: Optional[List[CLOPLOMapSchema]] = []

class ChapterCreateSchema(BaseModel):
    id: Optional[str] = None
    chapter_number: int = 1
    title: str
    content: Optional[str] = ""
    mapped_clos: Optional[str] = "CLO1"
    teaching_methods: Optional[str] = "Lecture, Tutorial"

class AssessmentAllocationSchema(BaseModel):
    clo_id: str
    allocated_marks: float

class AssessmentCreateSchema(BaseModel):
    id: Optional[str] = None
    name: str
    assessment_type: str = "Assignment"
    total_marks: float = 100.0
    course_weight_pct: float = 20.0
    clo_allocations: Optional[List[AssessmentAllocationSchema]] = []

class CourseCreateSchema(BaseModel):
    id: Optional[str] = None
    code: str
    title: str
    department_id: str
    academic_year: str = "Year 4"
    semester: str = "Semester II"
    credit_hours: int = 3
    lecture_hours: int = 40
    lab_hours: int = 20
    tutorial_hours: int = 15
    prerequisites: Optional[str] = ""
    description: Optional[str] = ""
    course_aims: Optional[str] = ""
    instructor_name: Optional[str] = "Unassigned"
    direct_weight_pct: float = 80.0
    indirect_weight_pct: float = 20.0
    program_name: Optional[str] = "B.Sc in Data Science"
    course_category: Optional[str] = "Core"
    independent_hours: Optional[int] = 30
    assessment_hours: Optional[int] = 15
    total_notional_hours: Optional[int] = 120
    corequisites: Optional[str] = "None"
    textbooks: Optional[str] = ""
    reference_books: Optional[str] = ""
    teaching_strategy: Optional[str] = ""
    clos: Optional[List[CLOCreateSchema]] = []
    chapters: Optional[List[ChapterCreateSchema]] = []
    assessments: Optional[List[AssessmentCreateSchema]] = []

class CourseUpdateSchema(BaseModel):
    title: Optional[str] = None
    academic_year: Optional[str] = None
    semester: Optional[str] = None
    credit_hours: Optional[int] = None
    lecture_hours: Optional[int] = None
    lab_hours: Optional[int] = None
    tutorial_hours: Optional[int] = None
    prerequisites: Optional[str] = None
    description: Optional[str] = None
    course_aims: Optional[str] = None
    instructor_name: Optional[str] = None
    direct_weight_pct: Optional[float] = None
    indirect_weight_pct: Optional[float] = None
    program_name: Optional[str] = None
    course_category: Optional[str] = None
    independent_hours: Optional[int] = None
    assessment_hours: Optional[int] = None
    total_notional_hours: Optional[int] = None
    corequisites: Optional[str] = None
    textbooks: Optional[str] = None
    reference_books: Optional[str] = None
    teaching_strategy: Optional[str] = None
    clos: Optional[List[CLOCreateSchema]] = None
    chapters: Optional[List[ChapterCreateSchema]] = None
    assessments: Optional[List[AssessmentCreateSchema]] = None
