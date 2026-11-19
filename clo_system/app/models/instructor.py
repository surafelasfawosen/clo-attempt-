"""
app/models/instructor.py
Faculty & Academic Staff Models for Teacher Assignment and AI Competence Matching.
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    department_id = Column(String(50), ForeignKey("departments.id"), nullable=False)
    academic_rank = Column(String(100), default="Associate Professor")
    highest_degree = Column(String(150), default="Ph.D. in Operations Research")
    alma_mater = Column(String(150), default="Addis Ababa University")
    specializations = Column(Text, default="Operations Research, Optimization, Linear Programming")
    avatar_initials = Column(String(10), default="AW")
    max_teaching_load = Column(Integer, default=12)
    current_teaching_load = Column(Integer, default=4)
    bio = Column(Text, nullable=True)
    office_location = Column(String(100), default="Block 4, Academic Building, Office 302")

    department = relationship("Department", back_populates="instructors")
    courses = relationship("Course", back_populates="assigned_instructor")

