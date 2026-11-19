"""
app/models/curriculum.py
Course, Chapters/Units, CLO, PLO, and Curriculum Alignment Models.
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(50), primary_key=True, index=True)
    code = Column(String(20), nullable=False, unique=True, index=True) # e.g. Stat4092, DS302
    title = Column(String(200), nullable=False)
    department_id = Column(String(50), ForeignKey("departments.id"), nullable=False)
    academic_year = Column(String(50), default="Year 3")                # Year 1, Year 2, Year 3, Year 4
    semester = Column(String(50), default="Semester I")                 # Semester I, Semester II
    credit_hours = Column(Integer, default=4)
    lecture_hours = Column(Integer, default=3)
    lab_hours = Column(Integer, default=2)
    tutorial_hours = Column(Integer, default=0)
    prerequisites = Column(Text, default="")
    description = Column(Text, default="")
    course_aims = Column(Text, default="")
    instructor_name = Column(String(100), default="Unassigned")
    assigned_instructor_id = Column(String(50), ForeignKey("instructors.id"), nullable=True)
    status = Column(String(30), default="Published")
    stream = Column(String(50), default="Common")                      # Natural Science, Social Science, or Common
    direct_weight_pct = Column(Float, default=80.0)
    indirect_weight_pct = Column(Float, default=20.0)
    program_name = Column(String(200), default="B.Sc in Data Science")
    course_category = Column(String(50), default="Core")
    independent_hours = Column(Integer, default=30)
    assessment_hours = Column(Integer, default=15)
    total_notional_hours = Column(Integer, default=120)
    corequisites = Column(Text, default="None")
    textbooks = Column(Text, default="")
    reference_books = Column(Text, default="")
    teaching_strategy = Column(Text, default="")

    department = relationship("Department", back_populates="courses")
    clos = relationship("CLO", back_populates="course", cascade="all, delete-orphan", order_by="CLO.code")
    chapters = relationship("CourseChapter", back_populates="course", cascade="all, delete-orphan", order_by="CourseChapter.chapter_number")
    assessments = relationship("AssessmentInstrument", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("CourseEnrollment", back_populates="course", cascade="all, delete-orphan")
    assigned_instructor = relationship("Instructor", back_populates="courses")


class CourseChapter(Base):
    """
    Course Chapter entity mapping content to CLOs and Teaching Methods (Table 4 in SQC).
    """
    __tablename__ = "course_chapters"

    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    chapter_number = Column(Integer, default=1)
    title = Column(String(200), nullable=False)                         # e.g. "Chapter 1: Introduction"
    content = Column(Text, default="")                                 # Detailed course content
    mapped_clos = Column(String(100), default="CLO1")                  # e.g. "CLO1, CLO2"
    teaching_methods = Column(String(200), default="Lecture, Tutorial") # e.g. "Lecture, Tutorial, Lab, PBL"

    course = relationship("Course", back_populates="chapters")


class CLO(Base):
    """Course Learning Outcome entity with Bloom's Taxonomy and targets."""
    __tablename__ = "clos"

    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    code = Column(String(20), nullable=False)                          # e.g. CLO1, CLO2
    description = Column(Text, nullable=False)
    blooms_level = Column(String(50), default="Applying")              # Remembering, Understanding, Applying, Analyzing, Evaluating, Creating
    passing_score_pct = Column(Float, default=60.0)                    # Minimum passing score (60%)
    target_attainment_pct = Column(Float, default=70.0)                # Target percentage of cohort (70%)
    teaching_method = Column(String(100), default="Lecture & Lab")
    assessment_methods = Column(Text, default="")                      # Specific assessment instruments for this CLO (SQC Table 4)

    course = relationship("Course", back_populates="clos")
    plo_mappings = relationship("CLOPLOMapping", back_populates="clo", cascade="all, delete-orphan")
    allocations = relationship("AssessmentCLOAllocation", back_populates="clo", cascade="all, delete-orphan")


class PLO(Base):
    """Program Learning Outcome entity (ABET / Graduate Attributes)."""
    __tablename__ = "plos"

    id = Column(String(50), primary_key=True, index=True)
    program_id = Column(String(50), ForeignKey("programs.id"), nullable=False)
    code = Column(String(20), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), default="Technical Core")

    program = relationship("Program", back_populates="plos")
    clo_mappings = relationship("CLOPLOMapping", back_populates="plo", cascade="all, delete-orphan")


class CLOPLOMapping(Base):
    """Curriculum Alignment junction mapping a CLO to a PLO with correlation weight."""
    __tablename__ = "clo_plo_mappings"

    id = Column(String(50), primary_key=True, index=True)
    clo_id = Column(String(50), ForeignKey("clos.id"), nullable=False)
    plo_id = Column(String(50), ForeignKey("plos.id"), nullable=False)
    correlation_weight = Column(Integer, default=2)                    # 1 = Low, 2 = Medium, 3 = High

    clo = relationship("CLO", back_populates="plo_mappings")
    plo = relationship("PLO", back_populates="clo_mappings")
