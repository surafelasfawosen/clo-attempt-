"""
app/models/survey.py
Indirect Assessment Models for 5 Key Academic Stakeholders:
1. Enrolled Students (Course Exit Survey)
2. Teachers (Faculty Reflection)
3. Alumni (Graduates in Industry)
4. Employers (Industry Supervisors)
5. Industry Partners (Advisory Board Members)
"""

from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class SurveySession(Base):
    """Survey administration instance for a course."""
    __tablename__ = "survey_sessions"

    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(String(50), ForeignKey("courses.id"), nullable=False)
    stakeholder_type = Column(String(50), nullable=False) # student_exit, teacher_reflection, alumni, employer, industry_partner
    respondent_name = Column(String(150), nullable=True)
    respondent_role = Column(String(100), nullable=True)
    organization = Column(String(150), nullable=True)
    comments = Column(Text, nullable=True)

    ratings = relationship("SurveyCLORating", back_populates="survey_session", cascade="all, delete-orphan")


class SurveyCLORating(Base):
    """Likert rating (1 to 5) given by a respondent for a specific CLO."""
    __tablename__ = "survey_clo_ratings"

    id = Column(String(50), primary_key=True, index=True)
    survey_session_id = Column(String(50), ForeignKey("survey_sessions.id"), nullable=False)
    clo_id = Column(String(50), ForeignKey("clos.id"), nullable=False)
    rating_score = Column(Integer, nullable=False, default=4) # 1 = Strongly Disagree/Poor, 5 = Strongly Agree/Excellent

    survey_session = relationship("SurveySession", back_populates="ratings")

