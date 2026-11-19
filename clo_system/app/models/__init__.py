"""
app/models/__init__.py
Exports all SQLAlchemy models for Base.metadata registration.
"""

from app.models.institution import College, Department, Program
from app.models.instructor import Instructor
from app.models.curriculum import Course, CourseChapter, CLO, PLO, CLOPLOMapping
from app.models.assessment import AssessmentInstrument, AssessmentCLOAllocation
from app.models.student import Student, CourseEnrollment, StudentAssessmentScore, PlacementQuota
from app.models.survey import SurveySession, SurveyCLORating

__all__ = [
    "College",
    "Department",
    "Program",
    "Instructor",
    "Course",
    "CourseChapter",
    "CLO",
    "PLO",
    "CLOPLOMapping",
    "AssessmentInstrument",
    "AssessmentCLOAllocation",
    "Student",
    "CourseEnrollment",
    "StudentAssessmentScore",
    "PlacementQuota",
    "SurveySession",
    "SurveyCLORating",
]
