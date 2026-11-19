"""
app/models/student.py
Student, Cohort Enrollment, and Assessment Marksheet Models.
Includes permanent admission batch year (e.g. Batch 2015).
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(String(50), primary_key=True, index=True)
    student_number = Column(String(50), nullable=False, unique=True)  # e.g. UGR/4001/15
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    department_id = Column(String(50), ForeignKey("departments.id"), nullable=False)
    batch = Column(String(20), default="2015")                       # Permanent Entry Batch (e.g. 2015, 2016)
    section = Column(String(20), default="Section A")
    year_level = Column(String(20), default="Year 4")
    status = Column(String(20), default="Active")
    sex = Column(String(10), default="M")                             # M / F (Male / Female)

    # Freshman & Placement Progression
    stream = Column(String(50), default="Natural Science")           # Natural Science / Social Science
    national_exam_score = Column(Float, default=75.0)                # Out of 100
    freshman_sem1_gpa = Column(Float, default=3.20)                  # 0.00 - 4.00
    freshman_sem2_gpa = Column(Float, default=3.25)                  # 0.00 - 4.00
    college_id = Column(String(50), ForeignKey("colleges.id"), nullable=True)
    placement_status = Column(String(50), default="Freshman Sem I")  # Freshman Sem I, Placed to College, Placed to Department
    choice_1 = Column(String(100), nullable=True)
    choice_2 = Column(String(100), nullable=True)
    choice_3 = Column(String(100), nullable=True)

    enrollments = relationship("CourseEnrollment", back_populates="student", cascade="all, delete-orphan")


class PlacementQuota(Base):
    """Institutional intake quota and threshold for College & Department placement."""
    __tablename__ = "placement_quotas"

    id = Column(String(50), primary_key=True, index=True)
    target_type = Column(String(20), nullable=False)                 # 'college' or 'department'
    target_id = Column(String(50), nullable=False)
    target_name = Column(String(200), nullable=False)
    quota = Column(Integer, default=50)
    min_threshold = Column(Float, default=2.50)


class CourseEnrollment(Base):
    """Enrollment record connecting a student to a course offering."""
    __tablename__ = "course_enrollments"

    id = Column(String(50), primary_key=True, index=True)
    student_id = Column(String(50), ForeignKey("students.id"), nullable=False)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    academic_period = Column(String(50), default="2026/2027-S2")
    section = Column(String(20), default="Section A")
    status = Column(String(20), default="Enrolled")

    student = relationship("Student", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")
    scores = relationship("StudentAssessmentScore", back_populates="enrollment", cascade="all, delete-orphan")


class StudentAssessmentScore(Base):
    """Score obtained by an enrolled student in a specific assessment instrument."""
    __tablename__ = "student_assessment_scores"

    id = Column(String(50), primary_key=True, index=True)
    enrollment_id = Column(String(50), ForeignKey("course_enrollments.id"), nullable=False)
    assessment_id = Column(String(50), ForeignKey("assessment_instruments.id"), nullable=False)
    score_obtained = Column(Float, nullable=False, default=0.0)

    enrollment = relationship("CourseEnrollment", back_populates="scores")
    assessment = relationship("AssessmentInstrument", back_populates="student_scores")
