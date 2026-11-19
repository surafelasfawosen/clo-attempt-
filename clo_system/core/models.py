"""
core/models.py
Pydantic data models for Higher Education CLO (Course Learning Outcome) Attainment System.
Defines Course, CLO, PLO, Assessment Blueprint, Student Marksheet, and 5-Stakeholder Surveys.
"""

from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


# -------------------------------------------------------------
# 1. Academic Hierarchy & Roles
# -------------------------------------------------------------

UserRole = Literal[
    "curriculum_editor",   # Designs/edits course, defines CLOs, maps to PLOs, sets assessment blueprint
    "teacher",             # Enters grades, conducts assessments, reviews class CLO attainment
    "department_head",     # Reviews all department courses, monitors PLO alignment, approves reports
    "dean",                # College-level executive oversight, accreditation audit reports
    "student"              # Views individual learning outcome mastery
]

class User(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    department_id: str
    college_id: str


class Department(BaseModel):
    id: str
    name: str
    code: str
    college_id: str
    head_name: str


class College(BaseModel):
    id: str
    name: str
    dean_name: str
    university_name: str


# -------------------------------------------------------------
# 2. Program Learning Outcomes (PLO) & Bloom's Taxonomy
# -------------------------------------------------------------

BloomsTaxonomy = Literal[
    "Remembering",
    "Understanding",
    "Applying",
    "Analyzing",
    "Evaluating",
    "Creating"
]

class PLO(BaseModel):
    id: str
    code: str               # e.g., PLO1, PLO2
    title: str              # e.g., Mathematical & Statistical Foundations
    description: str
    department_id: str


# -------------------------------------------------------------
# 3. Course Learning Outcomes (CLO) & Curriculum Alignment
# -------------------------------------------------------------

class CLOPLOMapping(BaseModel):
    plo_id: str
    weight: Literal["Low", "Medium", "High"]  # Low=1, Medium=2, High=3
    numeric_weight: int = 2


class CLO(BaseModel):
    id: str
    code: str               # e.g., CLO1, CLO2
    description: str        # e.g., "Formulate and apply supervised learning models..."
    blooms_level: BloomsTaxonomy
    target_attainment_pct: float = 70.0    # Target % of students achieving threshold (default: 70%)
    passing_score_pct: float = 60.0       # Minimum passing score on this CLO (default: 60%)
    plo_mappings: List[CLOPLOMapping] = Field(default_factory=list)


# -------------------------------------------------------------
# 4. Assessment Strategy & Question-to-CLO Mapping
# -------------------------------------------------------------

AssessmentType = Literal[
    "Quiz",
    "Assignment",
    "Midterm_Exam",
    "Lab_Project",
    "Final_Exam"
]

class AssessmentItem(BaseModel):
    id: str
    name: str               # e.g., "Midterm Exam - Section A"
    assessment_type: AssessmentType
    total_marks: float      # e.g., 25 marks
    course_weight_pct: float # e.g., 25% of total course grade
    # Distribution of marks across CLOs: e.g. {"CLO1": 10.0, "CLO2": 15.0}
    clo_marks_distribution: Dict[str, float]


class Course(BaseModel):
    id: str
    code: str               # e.g., "DS302"
    title: str              # e.g., "Machine Learning for Data Science"
    department_id: str
    academic_year: str      # e.g., "Year 3"
    semester: str           # e.g., "Semester 1 (Fall 2026)"
    credit_hours: int       # e.g., 4
    lecture_hours: int = 3
    lab_hours: int = 2
    prerequisites: List[str] = Field(default_factory=list)
    description: str
    instructor_id: str
    instructor_name: str
    status: Literal["Draft", "Under_Review", "Approved", "Published"] = "Published"
    clos: List[CLO] = Field(default_factory=list)
    assessments: List[AssessmentItem] = Field(default_factory=list)
    direct_weight_pct: float = 80.0       # Direct assessment weight (default 80%)
    indirect_weight_pct: float = 20.0     # Indirect assessment weight (default 20%)


# -------------------------------------------------------------
# 5. Student Enrollment & Grade Matrix
# -------------------------------------------------------------

class Student(BaseModel):
    id: str                 # e.g., "UGR/4021/16"
    full_name: str
    email: str
    department_id: str
    year_level: str         # "Year 3"
    gender: Optional[str] = "N/A"


class StudentScoreRecord(BaseModel):
    student_id: str
    student_name: str
    # Assessment ID -> Raw marks obtained (e.g. {"midterm_1": 21.5, "final_1": 29.0})
    assessment_scores: Dict[str, float]


# -------------------------------------------------------------
# 6. Indirect Assessment (5 Stakeholder Surveys)
# -------------------------------------------------------------

StakeholderType = Literal[
    "student_exit",         # Enrolled students completing course exit survey
    "teacher_reflection",   # Instructor self-reflection on outcome achievement
    "alumni",               # Alumni working in field 1-3 years after graduation
    "employer",             # Employers evaluating graduates' applied competency
    "industry_partner"      # Industry advisory board / internship mentors
]

class SurveyResponseItem(BaseModel):
    respondent_id: str
    stakeholder_type: StakeholderType
    respondent_role: str
    organization: Optional[str] = None
    # CLO ID -> Likert rating 1 (Poor) to 5 (Excellent)
    clo_ratings: Dict[str, int]
    comments: Optional[str] = ""


# -------------------------------------------------------------
# 7. Attainment Analytics Summary Models
# -------------------------------------------------------------

class CLOAttainmentResult(BaseModel):
    clo_id: str
    clo_code: str
    description: str
    blooms_level: str
    target_pct: float                     # e.g., 70%
    threshold_score_pct: float            # e.g., 60%
    students_evaluated_count: int
    students_meeting_threshold: int
    direct_attainment_pct: float          # Direct % from exam marks
    indirect_attainment_pct: float        # Indirect % from 5 surveys
    combined_attainment_pct: float        # 80% Direct + 20% Indirect
    is_attained: bool                     # True if combined >= target_pct
    gap_pct: float                        # combined_attainment_pct - target_pct
    survey_breakdown: Dict[StakeholderType, float]  # % rating by stakeholder
    corrective_action: Optional[str] = None

