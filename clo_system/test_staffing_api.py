import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models.instructor import Instructor
from app.models.student import Student, CourseEnrollment
from app.models.curriculum import Course

db = SessionLocal()
print("✓ Instructors in DB:", db.query(Instructor).count())
print("✓ Students in DB:", db.query(Student).count())
course = db.query(Course).first()
if course:
    print(f"✓ Sample Course: {course.code} - {course.title}")
    enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course.id).count()
    print(f"✓ Course Enrollments count: {enrollments}")
db.close()
print("Staffing database models verified successfully.")
