"""
migrate_clo_plo_matrix.py
1. Adds assessment_methods column to clos table if not present.
2. Seeds PLO1 to PLO5 in plos table for the Data Science program.
3. Maps Stat4092 CLOs to PLOs and populates exact assessment methods requested by user.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "obe_platform.db")

PLOS_DATA = [
    ("plo1", "prog_bsc_ds", "PLO1", "Computing & Mathematical Foundations", "Apply mathematical foundations, algorithmic principles, and theory in modeling.", "Core"),
    ("plo2", "prog_bsc_ds", "PLO2", "Problem Analysis & Optimization", "Identify, formulate, and analyze complex data science and optimization problems.", "Core"),
    ("plo3", "prog_bsc_ds", "PLO3", "Design & Implementation", "Design solutions and implement algorithms meeting specified stakeholder requirements.", "Core"),
    ("plo4", "prog_bsc_ds", "PLO4", "Modern Tool Usage & Modeling", "Apply modern techniques, skills, and data engineering/optimization tools.", "Core"),
    ("plo5", "prog_bsc_ds", "PLO5", "Communication & Teamwork", "Communicate technical concepts effectively with diverse audiences.", "Core")
]

STAT4092_MAPPINGS = [
    ("stat4092_clo1", ["plo1"], 
     "Assignments (Optimization Problems), In-class Quizzes, Midterm Examination, Comprehensive Final Examination"),
    
    ("stat4092_clo2", ["plo1", "plo2"], 
     "Assignments (Optimization Problems), Midterm Examination, Comprehensive Final Examination"),
    
    ("stat4092_clo3", ["plo2", "plo3"], 
     "Midterm Examination, Comprehensive Final Examination"),
    
    ("stat4092_clo4", ["plo3"], 
     "Comprehensive Final Examination"),
    
    ("stat4092_clo5", ["plo4"], 
     "In-class Quizzes, Comprehensive Final Examination"),
    
    ("stat4092_clo6", ["plo5"], 
     "Comprehensive Final Examination")
]

def migrate():
    con = sqlite3.connect(DB_PATH)
    cur = con.cursor()

    # 1. Add assessment_methods to clos table if missing
    clo_cols = [r[1] for r in cur.execute("PRAGMA table_info(clos)").fetchall()]
    if "assessment_methods" not in clo_cols:
        print("Adding column 'assessment_methods' to clos table...")
        cur.execute("ALTER TABLE clos ADD COLUMN assessment_methods TEXT DEFAULT ''")
    else:
        print("Column 'assessment_methods' already exists in clos.")

    con.commit()

    # 2. Seed PLO1 to PLO5
    for p_id, prog_id, code, title, desc, cat in PLOS_DATA:
        cur.execute("""
            INSERT OR REPLACE INTO plos (id, program_id, code, title, description, category)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (p_id, prog_id, code, title, desc, cat))
    
    con.commit()
    print("Seeded/Verified PLO1 through PLO5.")

    # 3. Update Stat4092 CLOs with exact PLO mappings and assessment methods
    for clo_id, mapped_plo_codes, asm_text in STAT4092_MAPPINGS:
        # Update assessment_methods text on CLO
        cur.execute("UPDATE clos SET assessment_methods = ? WHERE id = ?", (asm_text, clo_id))

        # Clear old mappings for this CLO
        cur.execute("DELETE FROM clo_plo_mappings WHERE clo_id = ?", (clo_id,))

        # Insert new mappings
        for plo_code in mapped_plo_codes:
            # find plo id
            plo_row = cur.execute("SELECT id FROM plos WHERE LOWER(code) = LOWER(?) OR LOWER(id) = LOWER(?)", (plo_code, plo_code)).fetchone()
            if plo_row:
                p_id = plo_row[0]
                map_id = f"map_{clo_id}_{plo_code}"
                cur.execute("""
                    INSERT OR REPLACE INTO clo_plo_mappings (id, clo_id, plo_id, correlation_weight)
                    VALUES (?, ?, ?, 2)
                """, (map_id, clo_id, p_id))

    con.commit()
    print("✅ Stat4092 CLO to PLO mappings & Assessment Methods successfully populated!")

    # Verify
    rows = cur.execute("""
        SELECT c.code, c.assessment_methods, GROUP_CONCAT(p.code)
        FROM clos c
        LEFT JOIN clo_plo_mappings m ON c.id = m.clo_id
        LEFT JOIN plos p ON m.plo_id = p.id
        WHERE c.course_id = 'course_stat4092'
        GROUP BY c.id
        ORDER BY c.code
    """).fetchall()

    for r in rows:
        print(f" - {r[0]} | PLOs: {r[2]} | Asm: {r[1]}")

    con.close()

if __name__ == "__main__":
    migrate()

