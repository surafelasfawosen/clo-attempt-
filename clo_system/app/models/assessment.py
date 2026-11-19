"""
app/models/assessment.py
Assessment Blueprint and Mark Allocation Models.
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class AssessmentInstrument(Base):
    """
    Assessment instrument such as Midterm Exam, Quiz, Assignment, Lab Project, Final Exam.
    """
    __tablename__ = "assessment_instruments"

    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    name = Column(String(100), nullable=False)                         # e.g. "Midterm Examination"
    assessment_type = Column(String(50), nullable=False)               # Quiz, Assignment, Midterm_Exam, Lab_Project, Final_Exam
    total_marks = Column(Float, nullable=False, default=100.0)         # Total raw marks possible
    course_weight_pct = Column(Float, nullable=False, default=20.0)    # % contribution to overall course grade (sum must equal 100%)

    course = relationship("Course", back_populates="assessments")
    clo_allocations = relationship("AssessmentCLOAllocation", back_populates="assessment", cascade="all, delete-orphan")
    student_scores = relationship("StudentAssessmentScore", back_populates="assessment", cascade="all, delete-orphan")


class AssessmentCLOAllocation(Base):
    """
    How many marks in an assessment instrument are dedicated to testing a specific CLO.
    """
    __tablename__ = "assessment_clo_allocations"

    id = Column(String(50), primary_key=True, index=True)
    assessment_id = Column(String(50), ForeignKey("assessment_instruments.id"), nullable=False)
    clo_id = Column(String(50), ForeignKey("clos.id"), nullable=False)
    allocated_marks = Column(Float, nullable=False, default=0.0)

    assessment = relationship("AssessmentInstrument", back_populates="clo_allocations")
    clo = relationship("CLO", back_populates="allocations")

