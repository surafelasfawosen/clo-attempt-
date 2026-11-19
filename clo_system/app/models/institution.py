"""
app/models/institution.py
Institutional hierarchy: College -> Department -> Program.
"""

from sqlalchemy import Column, String, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class College(Base):
    __tablename__ = "colleges"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    dean_name = Column(String(100), nullable=True)
    university_name = Column(String(200), default="Debre Berhan University")
    is_freshman_college = Column(Integer, default=0) # 1 for College of Freshman Studies

    departments = relationship("Department", back_populates="college", cascade="all, delete-orphan")


class Department(Base):
    __tablename__ = "departments"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(20), nullable=False, unique=True)
    head_name = Column(String(100), nullable=True)
    college_id = Column(String(50), ForeignKey("colleges.id"), nullable=False)

    college = relationship("College", back_populates="departments")
    programs = relationship("Program", back_populates="department", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="department", cascade="all, delete-orphan")
    instructors = relationship("Instructor", back_populates="department", cascade="all, delete-orphan")


class Program(Base):
    __tablename__ = "programs"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    code = Column(String(20), nullable=False)
    degree_type = Column(String(50), default="Bachelor of Science (B.Sc.)")
    department_id = Column(String(50), ForeignKey("departments.id"), nullable=False)

    department = relationship("Department", back_populates="programs")
    plos = relationship("PLO", back_populates="program", cascade="all, delete-orphan")

