"""
migrate_freshman_schema.py
Applies schema upgrades for the College of Freshman Studies and Placement Engine,
seeds DBU colleges, departments, freshman courses, and initial quotas.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "obe_platform.db")

def migrate():
    print(f"Connecting to database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Upgrade colleges table
    cursor.execute("PRAGMA table_info(colleges)")
    col_cols = [row[1] for row in cursor.fetchall()]
    if "is_freshman_college" not in col_cols:
        cursor.execute("ALTER TABLE colleges ADD COLUMN is_freshman_college INTEGER DEFAULT 0")
        print("✓ Added is_freshman_college to colleges table.")

    # 2. Upgrade students table
    cursor.execute("PRAGMA table_info(students)")
    std_cols = [row[1] for row in cursor.fetchall()]
    new_std_cols = [
        ("stream", "TEXT DEFAULT 'Natural Science'"),
        ("national_exam_score", "REAL DEFAULT 75.0"),
        ("freshman_sem1_gpa", "REAL DEFAULT 3.20"),
        ("freshman_sem2_gpa", "REAL DEFAULT 3.25"),
        ("college_id", "TEXT"),
        ("placement_status", "TEXT DEFAULT 'Freshman Sem I'"),
        ("choice_1", "TEXT"),
        ("choice_2", "TEXT"),
        ("choice_3", "TEXT")
    ]
    for col_name, col_def in new_std_cols:
        if col_name not in std_cols:
            cursor.execute(f"ALTER TABLE students ADD COLUMN {col_name} {col_def}")
            print(f"✓ Added {col_name} to students table.")

    # 3. Create placement_quotas table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS placement_quotas (
            id TEXT PRIMARY KEY,
            target_type TEXT NOT NULL,
            target_id TEXT NOT NULL,
            target_name TEXT NOT NULL,
            quota INTEGER DEFAULT 50,
            min_threshold REAL DEFAULT 2.50
        )
    """)
    print("✓ placement_quotas table verified.")

    # 4. Seed Debre Berhan University Colleges
    colleges = [
        ("col_freshman_dbu", "College of Freshman Studies", "Dr. Girma Abebe", "Debre Berhan University", 1),
        ("col_computing_dbu", "College of Computing & Technology", "Dr. Tamirat Desta", "Debre Berhan University", 0),
        ("col_natural_dbu", "College of Natural & Computational Sciences", "Dr. Bekele Tadesse", "Debre Berhan University", 0),
        ("col_health_dbu", "College of Health Sciences", "Dr. Hiwot Teshome", "Debre Berhan University", 0),
        ("col_business_dbu", "College of Business & Economics", "Dr. Solomon Kassa", "Debre Berhan University", 0)
    ]
    for col_id, name, dean, univ, is_fresh in colleges:
        cursor.execute("""
            INSERT INTO colleges (id, name, dean_name, university_name, is_freshman_college)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                dean_name=excluded.dean_name,
                university_name=excluded.university_name,
                is_freshman_college=excluded.is_freshman_college
        """, (col_id, name, dean, univ, is_fresh))
    print(f"✓ Seeded {len(colleges)} institutional colleges.")

    # 5. Seed Departments
    departments = [
        # Freshman internal container
        ("dept_freshman_common", "Freshman Common Studies Division", "FCS101", "Dr. Girma Abebe", "col_freshman_dbu"),
        
        # Computing & Tech
        ("dept_data_science", "Department of Data Science", "DS01", "Dr. Adimias W", "col_computing_dbu"),
        ("dept_software_eng", "Department of Software Engineering", "SE01", "Ato Dawit K", "col_computing_dbu"),
        ("dept_computer_science", "Department of Computer Science", "CS01", "W/ro Tigist B", "col_computing_dbu"),
        
        # Natural & Computational Sciences
        ("dept_statistics", "Department of Statistics", "STAT01", "Dr. Almaz G", "col_natural_dbu"),
        ("dept_mathematics", "Department of Mathematics", "MATH01", "Dr. Kassahun T", "col_natural_dbu"),
        ("dept_physics", "Department of Physics", "PHYS01", "Dr. Yonas M", "col_natural_dbu"),
        
        # Health Sciences
        ("dept_medicine", "Department of Medicine", "MED01", "Dr. Rahel S", "col_health_dbu"),
        ("dept_public_health", "Department of Public Health", "PH01", "Dr. Binyam A", "col_health_dbu"),
        
        # Business & Economics
        ("dept_economics", "Department of Economics", "ECON01", "Dr. Eden W", "col_business_dbu"),
        ("dept_accounting", "Department of Accounting & Finance", "ACC01", "Ato Henok T", "col_business_dbu")
    ]
    for dept_id, name, code, head, col_id in departments:
        cursor.execute("""
            INSERT INTO departments (id, name, code, head_name, college_id)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name=excluded.name,
                code=excluded.code,
                head_name=excluded.head_name,
                college_id=excluded.college_id
        """, (dept_id, name, code, head, col_id))
    print(f"✓ Seeded {len(departments)} academic departments.")

    # 6. Seed Freshman Common Courses under College of Freshman Studies
    freshman_courses = [
        # Semester I
        ("crs_enla1011", "EnLa1011", "Communicative English Language Skills I", "dept_freshman_common", "Year 1", "Semester I", 3, 3, 0, 0, "English and Foreign Languages"),
        ("crs_math1011", "Math1011", "Mathematics for Natural Sciences", "dept_freshman_common", "Year 1", "Semester I", 4, 3, 0, 2, "Department of Mathematics"),
        ("crs_phys1011", "Phys1011", "General Physics", "dept_freshman_common", "Year 1", "Semester I", 4, 3, 2, 0, "Department of Physics"),
        ("crs_gees1011", "GeES1011", "Critical Thinking and Logic", "dept_freshman_common", "Year 1", "Semester I", 3, 3, 0, 0, "Department of Philosophy"),
        ("crs_cosc1011", "CoSc1011", "Introduction to Computing", "dept_freshman_common", "Year 1", "Semester I", 3, 2, 2, 0, "College of Computing"),
        
        # Semester II
        ("crs_enla1012", "EnLa1012", "Basic Writing Skills", "dept_freshman_common", "Year 1", "Semester II", 3, 3, 0, 0, "English and Foreign Languages"),
        ("crs_math1012", "Math1012", "Applied Mathematics II", "dept_freshman_common", "Year 1", "Semester II", 4, 3, 0, 2, "Department of Mathematics"),
        ("crs_chem1012", "Chem1012", "General Chemistry", "dept_freshman_common", "Year 1", "Semester II", 4, 3, 2, 0, "Department of Chemistry"),
        ("crs_psyc1012", "Psyc1012", "General Psychology", "dept_freshman_common", "Year 1", "Semester II", 3, 3, 0, 0, "Department of Psychology")
    ]
    for cid, code, title, did, yr, sem, cr, lec, lab, tut, prog in freshman_courses:
        cursor.execute("""
            INSERT INTO courses (id, code, title, department_id, academic_year, semester, credit_hours, lecture_hours, lab_hours, tutorial_hours, program_name, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Published')
            ON CONFLICT(id) DO UPDATE SET
                code=excluded.code,
                title=excluded.title,
                department_id=excluded.department_id,
                academic_year=excluded.academic_year,
                semester=excluded.semester,
                credit_hours=excluded.credit_hours,
                program_name=excluded.program_name
        """, (cid, code, title, did, yr, sem, cr, lec, lab, tut, prog))
    print(f"✓ Seeded {len(freshman_courses)} Freshman Common Courses.")

    # 7. Seed Placement Quotas
    quotas = [
        # College Quotas (for Mid-Year Post-Sem I)
        ("quota_col_computing", "college", "col_computing_dbu", "College of Computing & Technology", 120, 2.75),
        ("quota_col_natural", "college", "col_natural_dbu", "College of Natural & Computational Sciences", 100, 2.40),
        ("quota_col_health", "college", "col_health_dbu", "College of Health Sciences", 80, 3.20),
        ("quota_col_business", "college", "col_business_dbu", "College of Business & Economics", 150, 2.20),

        # Department Quotas (for Year-End Post-Sem II)
        ("quota_dept_data_sci", "department", "dept_data_science", "Department of Data Science", 40, 2.80),
        ("quota_dept_software", "department", "dept_software_eng", "Department of Software Engineering", 50, 3.10),
        ("quota_dept_cs", "department", "dept_computer_science", "Department of Computer Science", 45, 2.90),
        ("quota_dept_stats", "department", "dept_statistics", "Department of Statistics", 40, 2.50),
        ("quota_dept_math", "department", "dept_mathematics", "Department of Mathematics", 35, 2.40),
        ("quota_dept_med", "department", "dept_medicine", "Department of Medicine", 35, 3.50)
    ]
    for qid, qtype, tid, tname, qval, qthresh in quotas:
        cursor.execute("""
            INSERT INTO placement_quotas (id, target_type, target_id, target_name, quota, min_threshold)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                quota=excluded.quota,
                min_threshold=excluded.min_threshold
        """, (qid, qtype, tid, tname, qval, qthresh))
    print(f"✓ Seeded {len(quotas)} placement quotas.")

    conn.commit()
    conn.close()
    print("✨ Freshman and Placement schema migration completed successfully!")

if __name__ == "__main__":
    migrate()

