"""
migrate_courses_fields.py
Adds missing syllabus specification columns to courses table in SQLite DB
and seeds defaults for existing courses.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "obe_platform.db")

NEW_COLUMNS = [
    ("program_name", "TEXT DEFAULT 'B.Sc in Data Science'"),
    ("course_category", "TEXT DEFAULT 'Core'"),
    ("independent_hours", "INTEGER DEFAULT 30"),
    ("assessment_hours", "INTEGER DEFAULT 15"),
    ("total_notional_hours", "INTEGER DEFAULT 120"),
    ("corequisites", "TEXT DEFAULT 'None'"),
    ("textbooks", "TEXT DEFAULT ''"),
    ("reference_books", "TEXT DEFAULT ''"),
    ("teaching_strategy", "TEXT DEFAULT ''")
]

STAT4092_TEXTBOOKS = "Taha, H.A. (2006). Operations Research: An Introduction (8th edition). Prentice-Hall, India, New Delhi."

STAT4092_REFERENCES = """Carter, M.W. and Price, C.C. (2000). Operations Research: A Practical Introduction CRC.
Ravindran, A., Phillips, D.T. and Solberg, J.J. (1987). Operations Research: Principles and Practice. (2nd edition). Wiley.
ND Vohra, Quantitative Techniques in Management, Tata McGraw Hill, 4th Edition, 2011.
J. K. Sharma, Operations Research Theory and Applications, Macmillan, 5th Edition, 2012.
Hiller F.S, Liberman G.J, Introduction to Operations Research, 10th Edition McGraw Hill, 2017.
Ravindran A., Philip D.T., and Solberg J.J., Operations Research, John Wiley, 2nd Edition 2007."""

STAT4092_TEACHING_STRATEGY = "The main teaching method will be Lecture, Problem-based learning (PBL), Lab sessions, individual and group assignments, and cooperative learning supported by tutorial sessions. The students will be expected to perform presentations and self-learning exercises on operations research."

DS302_TEXTBOOKS = "Bishop, C. M. (2006). Pattern Recognition and Machine Learning. Springer.\nHastie, T., Tibshirani, R., & Friedman, J. (2009). The Elements of Statistical Learning. Springer."

DS302_REFERENCES = """Goodfellow, I., Bengio, Y., & Courville, A. (2016). Deep Learning. MIT Press.
Murphy, K. P. (2022). Probabilistic Machine Learning: An Introduction. MIT Press.
Géron, A. (2019). Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow. O'Reilly Media."""

DS302_TEACHING_STRATEGY = "Instructional methods integrate interactive theory lectures with hands-on coding labs in Jupyter environments, weekly algorithmic problem-solving assignments, and a semester-long capstone predictive modeling project."

def migrate():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    existing_cols = [r[1] for r in cur.execute("PRAGMA table_info(courses)").fetchall()]
    print("Existing course columns:", existing_cols)

    for col_name, col_def in NEW_COLUMNS:
        if col_name not in existing_cols:
            print(f"Adding column '{col_name}'...")
            cur.execute(f"ALTER TABLE courses ADD COLUMN {col_name} {col_def}")
        else:
            print(f"Column '{col_name}' already exists.")

    con.commit()

    # Update Stat4092 defaults
    cur.execute("""
        UPDATE courses SET
            program_name = COALESCE(NULLIF(program_name, ''), 'B.Sc in Data Science'),
            course_category = COALESCE(NULLIF(course_category, ''), 'Core'),
            independent_hours = CASE WHEN independent_hours IS NULL OR independent_hours = 0 THEN 30 ELSE independent_hours END,
            assessment_hours = CASE WHEN assessment_hours IS NULL OR assessment_hours = 0 THEN 15 ELSE assessment_hours END,
            total_notional_hours = CASE WHEN total_notional_hours IS NULL OR total_notional_hours = 0 THEN 120 ELSE total_notional_hours END,
            corequisites = COALESCE(NULLIF(corequisites, ''), 'None'),
            textbooks = CASE WHEN textbooks IS NULL OR textbooks = '' THEN ? ELSE textbooks END,
            reference_books = CASE WHEN reference_books IS NULL OR reference_books = '' THEN ? ELSE reference_books END,
            teaching_strategy = CASE WHEN teaching_strategy IS NULL OR teaching_strategy = '' THEN ? ELSE teaching_strategy END
        WHERE code = 'Stat4092'
    """, (STAT4092_TEXTBOOKS, STAT4092_REFERENCES, STAT4092_TEACHING_STRATEGY))

    # Update DS302 defaults
    cur.execute("""
        UPDATE courses SET
            program_name = COALESCE(NULLIF(program_name, ''), 'B.Sc in Data Science'),
            course_category = COALESCE(NULLIF(course_category, ''), 'Core'),
            independent_hours = CASE WHEN independent_hours IS NULL OR independent_hours = 0 THEN 35 ELSE independent_hours END,
            assessment_hours = CASE WHEN assessment_hours IS NULL OR assessment_hours = 0 THEN 15 ELSE assessment_hours END,
            total_notional_hours = CASE WHEN total_notional_hours IS NULL OR total_notional_hours = 0 THEN 135 ELSE total_notional_hours END,
            corequisites = COALESCE(NULLIF(corequisites, ''), 'None'),
            textbooks = CASE WHEN textbooks IS NULL OR textbooks = '' THEN ? ELSE textbooks END,
            reference_books = CASE WHEN reference_books IS NULL OR reference_books = '' THEN ? ELSE reference_books END,
            teaching_strategy = CASE WHEN teaching_strategy IS NULL OR teaching_strategy = '' THEN ? ELSE teaching_strategy END
        WHERE code = 'DS302'
    """, (DS302_TEXTBOOKS, DS302_REFERENCES, DS302_TEACHING_STRATEGY))

    con.commit()

    print("✅ Migration completed successfully!")
    cur.execute("SELECT code, program_name, course_category, independent_hours, assessment_hours, total_notional_hours, corequisites FROM courses")
    rows = cur.fetchall()
    for row in rows:
        print("Course record:", row)

    con.close()

if __name__ == "__main__":
    migrate()

