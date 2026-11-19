"""
core/db.py
Local Document Database Engine and Seed Data Generator.
Provides file-based JSON document storage mimicking MongoDB/DocumentDB operations.
Seeds realistic academic hierarchy: College, Department, ML Course, CLOs, PLOs,
30 Year-3 Students, Marksheet records, and 5-Stakeholder Survey records.
"""

import json
import os
from typing import Dict, Any, List, Optional
from core.models import (
    College, Department, PLO, Course, CLO, CLOPLOMapping,
    AssessmentItem, Student, StudentScoreRecord, SurveyResponseItem, User
)

DB_FILE_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "local_db.json")


class DocumentDB:
    """Simple, zero-dependency document store backed by local JSON file."""
    
    def __init__(self, file_path: str = DB_FILE_PATH):
        self.file_path = file_path
        self._ensure_dir()
        self.data: Dict[str, Any] = {}
        if os.path.exists(self.file_path):
            self.load()
        else:
            self.seed_initial_data()

    def _ensure_dir(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)

    def load(self):
        try:
            with open(self.file_path, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except Exception:
            self.seed_initial_data()

    def save(self):
        self._ensure_dir()
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(self.data, f, indent=2, ensure_ascii=False)

    # ---------------------------------------------------------
    # Generic CRUD operations
    # ---------------------------------------------------------
    def get_collection(self, collection_name: str) -> List[Dict[str, Any]]:
        return self.data.setdefault(collection_name, [])

    def find_one(self, collection_name: str, key: str, value: Any) -> Optional[Dict[str, Any]]:
        coll = self.get_collection(collection_name)
        for item in coll:
            if item.get(key) == value:
                return item
        return None

    def find_many(self, collection_name: str, key: str, value: Any) -> List[Dict[str, Any]]:
        coll = self.get_collection(collection_name)
        return [item for item in coll if item.get(key) == value]

    def insert_one(self, collection_name: str, item: Dict[str, Any]) -> Dict[str, Any]:
        coll = self.get_collection(collection_name)
        coll.append(item)
        self.save()
        return item

    def update_one(self, collection_name: str, key: str, value: Any, update_dict: Dict[str, Any]) -> bool:
        coll = self.get_collection(collection_name)
        for i, item in enumerate(coll):
            if item.get(key) == value:
                coll[i].update(update_dict)
                self.save()
                return True
        return False

    def delete_one(self, collection_name: str, key: str, value: Any) -> bool:
        coll = self.get_collection(collection_name)
        for i, item in enumerate(coll):
            if item.get(key) == value:
                coll.pop(i)
                self.save()
                return True
        return False

    # ---------------------------------------------------------
    # Realistic Seed Data for Data Science & ML Course
    # ---------------------------------------------------------
    def seed_initial_data(self):
        # 1. College & Department
        college = {
            "id": "col_informatics",
            "name": "College of Computing and Informatics",
            "dean_name": "Dr. Mengistu Haile (College Dean)",
            "university_name": "Higher University of Science and Technology"
        }

        department = {
            "id": "dept_ds_ai",
            "name": "Department of Data Science & Artificial Intelligence",
            "code": "DS-AI",
            "college_id": "col_informatics",
            "head_name": "Dr. Surafel Asfawosen (Department Head)"
        }

        # 2. Roles / Users
        users = [
            {
                "id": "usr_curriculum",
                "name": "Dr. Sarah Bekele",
                "email": "sarah.b@university.edu",
                "role": "curriculum_editor",
                "department_id": "dept_ds_ai",
                "college_id": "col_informatics"
            },
            {
                "id": "usr_teacher",
                "name": "Prof. Abebe Kebede",
                "email": "abebe.k@university.edu",
                "role": "teacher",
                "department_id": "dept_ds_ai",
                "college_id": "col_informatics"
            },
            {
                "id": "usr_dept_head",
                "name": "Dr. Surafel Asfawosen",
                "email": "surafel.a@university.edu",
                "role": "department_head",
                "department_id": "dept_ds_ai",
                "college_id": "col_informatics"
            },
            {
                "id": "usr_dean",
                "name": "Dr. Mengistu Haile",
                "email": "dean.mengistu@university.edu",
                "role": "dean",
                "department_id": "dept_ds_ai",
                "college_id": "col_informatics"
            }
        ]

        # 3. Program Learning Outcomes (PLOs)
        plos = [
            {
                "id": "plo1",
                "code": "PLO1",
                "title": "Mathematical & Algorithmic Foundations",
                "description": "Apply foundations of linear algebra, probability, statistics, and algorithms to computational modeling.",
                "department_id": "dept_ds_ai"
            },
            {
                "id": "plo2",
                "code": "PLO2",
                "title": "Machine Learning & AI Engineering",
                "description": "Design, implement, evaluate and fine-tune supervised, unsupervised, and deep learning algorithms.",
                "department_id": "dept_ds_ai"
            },
            {
                "id": "plo3",
                "code": "PLO3",
                "title": "Data Pipeline & Engineering",
                "description": "Construct scalable data preprocessing, transformation, and feature engineering workflows.",
                "department_id": "dept_ds_ai"
            },
            {
                "id": "plo4",
                "code": "PLO4",
                "title": "Model Evaluation & Verification",
                "description": "Rigorously benchmark models against baseline metrics, cross-validation, and error diagnostics.",
                "department_id": "dept_ds_ai"
            },
            {
                "id": "plo5",
                "code": "PLO5",
                "title": "Ethics, Society & Professional Practice",
                "description": "Assess bias, fairness, transparency, and data governance in AI systems deployed in society.",
                "department_id": "dept_ds_ai"
            }
        ]

        # 4. Course: Machine Learning for Data Science (DS302)
        ml_clos = [
            {
                "id": "clo1",
                "code": "CLO1",
                "description": "Demonstrate theoretical understanding of core ML paradigms (supervised, unsupervised, and reinforcement learning).",
                "blooms_level": "Understanding",
                "target_attainment_pct": 70.0,
                "passing_score_pct": 60.0,
                "plo_mappings": [
                    {"plo_id": "plo1", "weight": "High", "numeric_weight": 3},
                    {"plo_id": "plo2", "weight": "Medium", "numeric_weight": 2}
                ]
            },
            {
                "id": "clo2",
                "code": "CLO2",
                "description": "Implement, configure, and train supervised learning models (Regression, SVM, Decision Trees, Ensemble methods) using Python.",
                "blooms_level": "Applying",
                "target_attainment_pct": 70.0,
                "passing_score_pct": 60.0,
                "plo_mappings": [
                    {"plo_id": "plo2", "weight": "High", "numeric_weight": 3},
                    {"plo_id": "plo3", "weight": "Medium", "numeric_weight": 2}
                ]
            },
            {
                "id": "clo3",
                "code": "CLO3",
                "description": "Analyze datasets using unsupervised algorithms (K-Means clustering, DBSCAN, and PCA dimensionality reduction).",
                "blooms_level": "Analyzing",
                "target_attainment_pct": 70.0,
                "passing_score_pct": 60.0,
                "plo_mappings": [
                    {"plo_id": "plo2", "weight": "High", "numeric_weight": 3},
                    {"plo_id": "plo3", "weight": "High", "numeric_weight": 3}
                ]
            },
            {
                "id": "clo4",
                "code": "CLO4",
                "description": "Critically evaluate ML model performance, diagnose overfitting/underfitting, and tune hyperparameters via cross-validation.",
                "blooms_level": "Evaluating",
                "target_attainment_pct": 70.0,
                "passing_score_pct": 60.0,
                "plo_mappings": [
                    {"plo_id": "plo4", "weight": "High", "numeric_weight": 3}
                ]
            },
            {
                "id": "clo5",
                "code": "CLO5",
                "description": "Architect an end-to-end Machine Learning pipeline solving a real-world problem, addressing fairness, bias, and deployment constraints.",
                "blooms_level": "Creating",
                "target_attainment_pct": 70.0,
                "passing_score_pct": 60.0,
                "plo_mappings": [
                    {"plo_id": "plo2", "weight": "High", "numeric_weight": 3},
                    {"plo_id": "plo5", "weight": "High", "numeric_weight": 3}
                ]
            }
        ]

        ml_assessments = [
            {
                "id": "asm_quiz1",
                "name": "Quiz 1: ML Foundations & Supervised Concepts",
                "assessment_type": "Quiz",
                "total_marks": 10.0,
                "course_weight_pct": 10.0,
                "clo_marks_distribution": {"clo1": 6.0, "clo2": 4.0}
            },
            {
                "id": "asm_assign1",
                "name": "Assignment 1: Regression & Decision Trees Implementation",
                "assessment_type": "Assignment",
                "total_marks": 10.0,
                "course_weight_pct": 10.0,
                "clo_marks_distribution": {"clo2": 5.0, "clo3": 5.0}
            },
            {
                "id": "asm_midterm",
                "name": "Midterm Examination",
                "assessment_type": "Midterm_Exam",
                "total_marks": 25.0,
                "course_weight_pct": 25.0,
                "clo_marks_distribution": {"clo1": 6.0, "clo2": 11.0, "clo3": 8.0}
            },
            {
                "id": "asm_project",
                "name": "Lab Practical & Capstone ML Project",
                "assessment_type": "Lab_Project",
                "total_marks": 20.0,
                "course_weight_pct": 20.0,
                "clo_marks_distribution": {"clo2": 3.0, "clo3": 4.0, "clo4": 6.0, "clo5": 7.0}
            },
            {
                "id": "asm_final",
                "name": "Comprehensive Final Examination",
                "assessment_type": "Final_Exam",
                "total_marks": 35.0,
                "course_weight_pct": 35.0,
                "clo_marks_distribution": {"clo1": 5.0, "clo2": 8.0, "clo3": 7.0, "clo4": 8.0, "clo5": 7.0}
            }
        ]

        ml_course = {
            "id": "course_ds302",
            "code": "DS302",
            "title": "Machine Learning for Data Science",
            "department_id": "dept_ds_ai",
            "academic_year": "Year 3",
            "semester": "Semester 1 (Academic Year 2026/2027)",
            "credit_hours": 4,
            "lecture_hours": 3,
            "lab_hours": 2,
            "prerequisites": ["MATH201 (Linear Algebra)", "DS201 (Probability & Statistics)", "CS202 (Python Programming)"],
            "description": "Comprehensive study of core machine learning algorithms, model evaluation, unsupervised learning, and practical production pipelines for real-world data science challenges.",
            "instructor_id": "usr_teacher",
            "instructor_name": "Prof. Abebe Kebede",
            "status": "Published",
            "direct_weight_pct": 80.0,
            "indirect_weight_pct": 20.0,
            "clos": ml_clos,
            "assessments": ml_assessments
        }

        # 5. Cohort of 30 Students (Year 3 Data Science)
        student_names = [
            ("UGR/4001/16", "Aaron Tadesse", "M"),
            ("UGR/4002/16", "Bethelhem Alemu", "F"),
            ("UGR/4003/16", "Chala Demissie", "M"),
            ("UGR/4004/16", "Dagmawi Girma", "M"),
            ("UGR/4005/16", "Eden Solomon", "F"),
            ("UGR/4006/16", "Fikadu Negash", "M"),
            ("UGR/4007/16", "Gelila Tefera", "F"),
            ("UGR/4008/16", "Henok Wondimu", "M"),
            ("UGR/4009/16", "Iman Mohammed", "F"),
            ("UGR/4010/16", "Jemal Kassim", "M"),
            ("UGR/4011/16", "Kalkidan Yonas", "F"),
            ("UGR/4012/16", "Leul Mesfin", "M"),
            ("UGR/4013/16", "Meron Assefa", "F"),
            ("UGR/4014/16", "Natnael Berhanu", "M"),
            ("UGR/4015/16", "Olivia Yohannes", "F"),
            ("UGR/4016/16", "Paulos Teshome", "M"),
            ("UGR/4017/16", "Ruth Getachew", "F"),
            ("UGR/4018/16", "Samuel Bekele", "M"),
            ("UGR/4019/16", "Tigist Hailu", "F"),
            ("UGR/4020/16", "Utuk Okello", "M"),
            ("UGR/4021/16", "Veronica Zeleke", "F"),
            ("UGR/4022/16", "Wondwosen Kassa", "M"),
            ("UGR/4023/16", "Yared Fisseha", "M"),
            ("UGR/4024/16", "Zinash Worku", "F"),
            ("UGR/4025/16", "Abinet Sisay", "M"),
            ("UGR/4026/16", "Bilen Melaku", "F"),
            ("UGR/4027/16", "Dawit Hailemariam", "M"),
            ("UGR/4028/16", "Emnet Daniel", "F"),
            ("UGR/4029/16", "Fasil Bogale", "M"),
            ("UGR/4030/16", "Genet Ayalew", "F")
        ]

        students = [
            {
                "id": s_id,
                "full_name": name,
                "email": f"{name.lower().replace(' ', '.')}@student.university.edu",
                "department_id": "dept_ds_ai",
                "year_level": "Year 3",
                "gender": gender
            }
            for s_id, name, gender in student_names
        ]

        # 6. Realistic Student Scores (Exam & Assignment Marks)
        # We craft realistic academic variations:
        # Top tier (~25%), Good tier (~50%), Borderline tier (~15%), Underperforming (~10%)
        scores = []
        import random
        random.seed(42)  # Deterministic seed for reproducible testing

        for i, s in enumerate(students):
            # Performance factor: 0.5 to 0.98
            if i in [0, 4, 10, 14, 18, 23, 27]: # Outstanding performers
                perf = random.uniform(0.85, 0.97)
            elif i in [2, 7, 13, 20]:            # Struggling students (need intervention)
                perf = random.uniform(0.48, 0.58)
            else:                                # Solid passing students
                perf = random.uniform(0.64, 0.84)

            # Generate marks per assessment
            quiz1 = round(10.0 * min(1.0, perf + random.uniform(-0.06, 0.06)), 1)
            assign1 = round(10.0 * min(1.0, perf + random.uniform(-0.04, 0.08)), 1)
            midterm = round(25.0 * min(1.0, perf + random.uniform(-0.05, 0.05)), 1)
            project = round(20.0 * min(1.0, perf + random.uniform(-0.04, 0.07)), 1)
            final = round(35.0 * min(1.0, perf + random.uniform(-0.07, 0.04)), 1)

            scores.append({
                "student_id": s["id"],
                "student_name": s["full_name"],
                "course_id": "course_ds302",
                "assessment_scores": {
                    "asm_quiz1": max(0.0, min(10.0, quiz1)),
                    "asm_assign1": max(0.0, min(10.0, assign1)),
                    "asm_midterm": max(0.0, min(25.0, midterm)),
                    "asm_project": max(0.0, min(20.0, project)),
                    "asm_final": max(0.0, min(35.0, final))
                }
            })

        # 7. Indirect Assessment: 5 Stakeholder Survey Responses
        surveys = [
            # 1. Student Exit Survey (Cohort of 25 respondents)
            {
                "id": "srv_student_1",
                "course_id": "course_ds302",
                "stakeholder_type": "student_exit",
                "respondent_id": "cohort_exit_aggregated",
                "respondent_role": "Enrolled Year 3 Students (N=25)",
                "organization": "Department of Data Science",
                # Average Likert ratings 1 to 5
                "clo_ratings": {"clo1": 5, "clo2": 4, "clo3": 4, "clo4": 4, "clo5": 3},
                "comments": "Great hands-on coding for CLO2; CLO5 project had tight deadlines for ethical and deployment analysis."
            },
            # 2. Teacher Self-Assessment
            {
                "id": "srv_teacher_1",
                "course_id": "course_ds302",
                "stakeholder_type": "teacher_reflection",
                "respondent_id": "usr_teacher",
                "respondent_role": "Course Instructor (Prof. Abebe Kebede)",
                "organization": "Department of Data Science",
                "clo_ratings": {"clo1": 5, "clo2": 4, "clo3": 4, "clo4": 3, "clo5": 4},
                "comments": "Students mastered supervised modeling well. Model diagnosis and hyperparameter tuning (CLO4) required extra lab hours."
            },
            # 3. Alumni Survey
            {
                "id": "srv_alumni_1",
                "course_id": "course_ds302",
                "stakeholder_type": "alumni",
                "respondent_id": "alumni_panel_2025",
                "respondent_role": "Alumni Graduates in Industry (N=8)",
                "organization": "Tech Companies / Fintech / Research Labs",
                "clo_ratings": {"clo1": 4, "clo2": 5, "clo3": 4, "clo4": 4, "clo5": 4},
                "comments": "Practical skills learned in CLO2 and CLO3 were directly applicable in our current job roles."
            },
            # 4. Employer Survey
            {
                "id": "srv_employer_1",
                "course_id": "course_ds302",
                "stakeholder_type": "employer",
                "respondent_id": "employer_council",
                "respondent_role": "Lead Data Scientists & Engineering Managers (N=5)",
                "organization": "Industry Employers Panel",
                "clo_ratings": {"clo1": 4, "clo2": 4, "clo3": 4, "clo4": 4, "clo5": 3},
                "comments": "Graduates possess strong algorithmic foundations. Recommend adding more CI/CD and ML model monitoring in production (CLO5)."
            },
            # 5. Industry Partner Survey
            {
                "id": "srv_industry_1",
                "course_id": "course_ds302",
                "stakeholder_type": "industry_partner",
                "respondent_id": "industry_advisory_board",
                "respondent_role": "Advisory Board & Internship Mentors (N=4)",
                "organization": "National AI Center & Partner Incubators",
                "clo_ratings": {"clo1": 5, "clo2": 4, "clo3": 4, "clo4": 4, "clo5": 4},
                "comments": "Course syllabus is well-aligned with contemporary AI trends and national strategic priorities."
            }
        ]

        self.data = {
            "college": [college],
            "departments": [department],
            "users": users,
            "plos": plos,
            "courses": [ml_course],
            "students": students,
            "scores": scores,
            "surveys": surveys,
            "reports": []
        }
        self.save()


# Global DB instance
db = DocumentDB()

