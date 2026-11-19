"""
app/api/freshman.py
REST API Router for College of Freshman Studies & Placement Engine.
Supports:
1. Direct Freshman Common Courses management without department routing.
2. Batch Admissions Ingestion (.xlsx, .csv, raw text) with A-Z sorting and flexible max-students sectioning.
3. Mid-Year College Placement (Mode A direct list & Mode B merit engine with customizable weights & quotas).
4. Year-End Department Placement (Mode A direct list & Mode B merit engine).
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uuid
import re

from app.database import get_db
from app.models.institution import College, Department
from app.models.curriculum import Course
from app.models.student import Student, CourseEnrollment, PlacementQuota
from app.services.course_service import CourseService

router = APIRouter(prefix="", tags=["Freshman Studies & Placement"])

# ==============================================================================
# PYDANTIC SCHEMAS
# ==============================================================================

class FreshmanCourseCreate(BaseModel):
    code: str
    title: str
    semester: str = "Semester I"          # Semester I or Semester II
    stream: str = "Common"                # Natural Science, Social Science, or Common
    credit_hours: int = 3
    lecture_hours: int = 3
    lab_hours: int = 0
    tutorial_hours: int = 0
    program_name: str = "Common University Foundation"

class ParseRosterRequest(BaseModel):
    raw_text: Optional[str] = ""
    batch: str = "2015"
    stream: str = "Natural Science"       # Default fallback stream
    max_students_per_section: int = 40    # Configurable maximum students per class

class StudentRecord(BaseModel):
    student_number: str
    full_name: str
    stream: str = "Natural Science"
    batch: str = "2015"
    section: str = "Section A"
    department_id: Optional[str] = None
    college_id: Optional[str] = None
    placement_status: Optional[str] = None

class SaveBatchRequest(BaseModel):
    batch: str
    stream: Optional[str] = "Natural Science"
    department_id: Optional[str] = "dept_freshman_common"
    college_id: Optional[str] = "col_freshman_dbu"
    students: List[StudentRecord]

class ForwardDepartmentRequest(BaseModel):
    student_numbers: List[str]
    target_department_id: str
    target_college_id: Optional[str] = None

class StudentUpdate(BaseModel):
    full_name: Optional[str] = None
    student_number: Optional[str] = None
    stream: Optional[str] = None
    section: Optional[str] = None
    national_exam_score: Optional[float] = None
    freshman_sem1_gpa: Optional[float] = None
    freshman_sem2_gpa: Optional[float] = None
    college_id: Optional[str] = None
    department_id: Optional[str] = None
    placement_status: Optional[str] = None

class CollegePlacementRequest(BaseModel):
    batch: str = "2015"
    stream: str = "Natural Science"
    mode: str = "engine"                  # 'direct_list' or 'engine'
    gpa_weight: float = 0.70              # e.g. 70% GPA
    exam_weight: float = 0.30             # e.g. 30% National Exam
    direct_mappings: Optional[List[Dict[str, str]]] = None # [{"student_number": "...", "target_college_id": "..."}]

class DepartmentPlacementRequest(BaseModel):
    batch: str = "2015"
    college_id: str
    mode: str = "engine"                  # 'direct_list' or 'engine'
    gpa_weight: float = 0.70
    exam_weight: float = 0.30
    direct_mappings: Optional[List[Dict[str, str]]] = None # [{"student_number": "...", "target_department_id": "..."}]

class QuotaUpdate(BaseModel):
    quota: int
    min_threshold: float

# ==============================================================================
# 1. FRESHMAN COMMON COURSES (Direct under College of Freshman Studies)
# ==============================================================================

@router.get("/freshman/courses")
def get_freshman_courses(semester: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Course).filter(Course.department_id == "dept_freshman_common")
    if semester:
        query = query.filter(Course.semester == semester)
    courses = query.order_by(Course.code).all()
    return [CourseService.serialize_course(c) for c in courses]

@router.post("/freshman/courses")
def create_freshman_course(payload: FreshmanCourseCreate, db: Session = Depends(get_db)):
    existing = db.query(Course).filter(Course.code == payload.code.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Course code '{payload.code}' already exists.")

    new_course = Course(
        id=f"crs_{payload.code.strip().lower()}_{uuid.uuid4().hex[:6]}",
        code=payload.code.strip(),
        title=payload.title.strip(),
        department_id="dept_freshman_common",
        academic_year="Year 1",
        semester=payload.semester,
        stream=payload.stream or "Common",
        credit_hours=payload.credit_hours,
        lecture_hours=payload.lecture_hours,
        lab_hours=payload.lab_hours,
        tutorial_hours=payload.tutorial_hours,
        program_name=payload.program_name,
        status="Published"
    )
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return CourseService.serialize_course(new_course)

# ==============================================================================
# 2. BATCH ADMISSIONS INGESTION & FLEXIBLE A-Z SECTIONING
# ==============================================================================

def _normalize_stream(val: Optional[str], fallback: str = "Natural Science") -> str:
    if not val:
        return fallback
    low = val.strip().lower()
    if "soc" in low:
        return "Social Science"
    if "nat" in low:
        return "Natural Science"
    return fallback

def _normalize_section(val: Optional[str]) -> Optional[str]:
    if not val or not val.strip():
        return None
    s = val.strip()
    if s.lower().startswith("sec"):
        parts = s.split()
        if len(parts) >= 2:
            return f"Section {parts[-1].upper()}"
        return s.title()
    if len(s) <= 3:
        return f"Section {s.upper()}"
    return s

@router.post("/freshman/parse-roster")
def parse_roster(payload: ParseRosterRequest):
    """
    Parses pasted text or imported rows with columns:
    Student ID, Full Name, Stream (Natural Science / Social Science), Section.
    Sorts A-Z and auto-assigns sections if Section is omitted.
    """
    lines = [line.strip() for line in (payload.raw_text or "").split("\n") if line.strip()]
    parsed_students = []

    for i, line in enumerate(lines):
        low = line.lower()
        if low.startswith("student id") or low.startswith("id,") or low.startswith("id\t") or (low.startswith("id") and "name" in low):
            continue

        # Support tab, comma, semicolon, or pipe delimiters
        parts = [p.strip() for p in re.split(r'[\t,;|]+', line) if p.strip()]
        s_id = ""
        s_name = ""
        s_stream = payload.stream or "Natural Science"
        s_section = None
        s_sex = "M"

        if len(parts) >= 2:
            s_id = parts[0]
            s_name = parts[1]
            for p in parts[2:]:
                p_clean = p.strip()
                p_low = p_clean.lower()
                if p_low in ("m", "f", "male", "female"):
                    s_sex = "F" if "f" in p_low else "M"
                elif "nat" in p_low or "soc" in p_low:
                    s_stream = _normalize_stream(p_clean, s_stream)
                elif p_low.startswith("sec") or (len(p_clean) == 1 and p_clean.isalpha()):
                    s_section = _normalize_section(p_clean)
        else:
            match = re.match(r'^(UGR[/\d\w\-_]+)\s+(.+)$', line, re.IGNORECASE)
            if match:
                s_id = match.group(1).strip()
                s_name = match.group(2).strip()
            else:
                s_id = f"UGR/{4000 + i + 1}/{payload.batch[-2:]}"
                s_name = line.strip()

        parsed_students.append({
            "student_number": s_id,
            "full_name": s_name,
            "sex": s_sex,
            "stream": s_stream,
            "batch": payload.batch,
            "section": s_section
        })

    # Sort Alphabetically from A to Z
    parsed_students.sort(key=lambda s: s["full_name"].lower())

    # Auto-assign sections only for rows without an explicit section
    max_cap = max(1, min(500, payload.max_students_per_section or 40))
    section_letters = ["Section A", "Section B", "Section C", "Section D", "Section E", 
                       "Section F", "Section G", "Section H", "Section I", "Section J"]

    unassigned_idx = 0
    for std in parsed_students:
        if not std.get("section"):
            sec_idx = unassigned_idx // max_cap
            std["section"] = section_letters[sec_idx] if sec_idx < len(section_letters) else f"Section {chr(65 + sec_idx)}"
            unassigned_idx += 1

    distinct_sections = sorted(list(set(s["section"] for s in parsed_students)))

    return {
        "batch": payload.batch,
        "stream": payload.stream,
        "total_parsed": len(parsed_students),
        "max_per_section": max_cap,
        "total_sections": len(distinct_sections),
        "students": parsed_students
    }

@router.post("/freshman/upload-roster")
async def upload_roster_file(
    file: UploadFile = File(...),
    batch: str = Form("2015"),
    stream: str = Form("Natural Science"),
    max_students_per_section: int = Form(40)
):
    """
    Accepts Excel (.xlsx, .xls), CSV (.csv), or Text (.txt) file uploads.
    Extracts Student ID, Full Name, Stream (Natural / Social), and Section.
    """
    contents = await file.read()
    filename = (file.filename or "").lower()
    raw_lines = []

    if filename.endswith(".xlsx") or filename.endswith(".xls"):
        import io
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(contents), data_only=True)
        sheet = wb.active
        for row in sheet.iter_rows(values_only=True):
            if not row or not any(row):
                continue
            cells = [str(c).strip() for c in row if c is not None and str(c).strip()]
            if not cells:
                continue
            first_val = cells[0].lower()
            if "student id" in first_val or ("id" in first_val and any("name" in c.lower() for c in cells)):
                continue
            raw_lines.append("\t".join(cells[:4]))
    else:
        text = contents.decode("utf-8", errors="replace")
        for line in text.splitlines():
            line_s = line.strip()
            if not line_s:
                continue
            if line_s.lower().startswith("student id") or line_s.lower().startswith("id,") or line_s.lower().startswith("id\t"):
                continue
            raw_lines.append(line_s)

    req = ParseRosterRequest(
        raw_text="\n".join(raw_lines),
        batch=batch,
        stream=stream,
        max_students_per_section=max_students_per_section
    )
    return parse_roster(req)

@router.post("/freshman/save-batch")
def save_batch(payload: SaveBatchRequest, db: Session = Depends(get_db)):
    """
    Saves or updates student records in database for either Freshman Studies or a Department.
    """
    saved_count = 0
    default_dept = payload.department_id or "dept_freshman_common"
    default_col = payload.college_id or "col_freshman_dbu"

    for s in payload.students:
        target_dept = s.department_id or default_dept
        target_col = s.college_id or default_col
        target_stream = s.stream or payload.stream or "Natural Science"
        target_status = s.placement_status or ("Freshman Sem I" if target_dept == "dept_freshman_common" else "Enrolled in Department")

        existing = db.query(Student).filter(Student.student_number == s.student_number.strip()).first()
        if existing:
            existing.full_name = s.full_name.strip()
            existing.stream = target_stream
            existing.batch = s.batch or payload.batch
            existing.section = s.section or "Section A"
            existing.department_id = target_dept
            existing.college_id = target_col
            existing.placement_status = target_status
        else:
            new_student = Student(
                id=f"std_{uuid.uuid4().hex[:10]}",
                student_number=s.student_number.strip(),
                full_name=s.full_name.strip(),
                department_id=target_dept,
                college_id=target_col,
                batch=s.batch or payload.batch,
                section=s.section or "Section A",
                stream=target_stream,
                placement_status=target_status,
                status="Active"
            )
            db.add(new_student)
        saved_count += 1

    db.commit()
    return {"status": "success", "saved_count": saved_count, "batch": payload.batch}

@router.post("/freshman/forward-to-department")
def forward_to_department(payload: ForwardDepartmentRequest, db: Session = Depends(get_db)):
    """
    Manually forwards/passes selected students directly to a target department.
    Zero grade calculation or automated formulas.
    """
    dept = db.query(Department).filter(Department.id == payload.target_department_id).first()
    dept_name = dept.name if dept else payload.target_department_id
    col_id = payload.target_college_id or (dept.college_id if dept else None)

    updated = 0
    for s_num in payload.student_numbers:
        std = db.query(Student).filter(Student.student_number == s_num.strip()).first()
        if std:
            std.department_id = payload.target_department_id
            if col_id:
                std.college_id = col_id
            std.placement_status = f"Passed to {dept_name}"
            std.year_level = "Year 1"
            updated += 1

    db.commit()
    return {
        "status": "success",
        "forwarded_count": updated,
        "target_department_id": payload.target_department_id,
        "target_department_name": dept_name
    }

@router.get("/freshman/students")
def get_freshman_students(
    batch: Optional[str] = "2015",
    stream: Optional[str] = None,
    placement_status: Optional[str] = None,
    college_id: Optional[str] = None,
    department_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Student)
    if batch:
        query = query.filter(Student.batch == batch)
    if stream:
        query = query.filter(Student.stream == stream)
    if placement_status:
        query = query.filter(Student.placement_status == placement_status)
    if college_id:
        query = query.filter(Student.college_id == college_id)
    if department_id:
        query = query.filter(Student.department_id == department_id)

    students = query.order_by(Student.full_name).all()
    return students

@router.put("/freshman/students/{student_id}")
def update_student(student_id: str, payload: StudentUpdate, db: Session = Depends(get_db)):
    std = db.query(Student).filter(Student.id == student_id).first()
    if not std:
        raise HTTPException(status_code=404, detail="Student not found")

    if payload.full_name is not None: std.full_name = payload.full_name.strip()
    if payload.student_number is not None: std.student_number = payload.student_number.strip()
    if payload.stream is not None: std.stream = payload.stream
    if payload.section is not None: std.section = payload.section
    if payload.national_exam_score is not None: std.national_exam_score = payload.national_exam_score
    if payload.freshman_sem1_gpa is not None: std.freshman_sem1_gpa = payload.freshman_sem1_gpa
    if payload.freshman_sem2_gpa is not None: std.freshman_sem2_gpa = payload.freshman_sem2_gpa
    if payload.college_id is not None: std.college_id = payload.college_id
    if payload.department_id is not None: std.department_id = payload.department_id
    if payload.placement_status is not None: std.placement_status = payload.placement_status

    db.commit()
    db.refresh(std)
    return std

@router.delete("/freshman/students/{student_id}")
def delete_student(student_id: str, db: Session = Depends(get_db)):
    std = db.query(Student).filter(Student.id == student_id).first()
    if not std:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(std)
    db.commit()
    return {"status": "deleted", "student_id": student_id}

# ==============================================================================
# 3. QUOTAS & PLACEMENT CONFIGURATION
# ==============================================================================

@router.get("/freshman/quotas")
def get_quotas(target_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PlacementQuota)
    if target_type:
        query = query.filter(PlacementQuota.target_type == target_type)
    return query.all()

@router.put("/freshman/quotas/{quota_id}")
def update_quota(quota_id: str, payload: QuotaUpdate, db: Session = Depends(get_db)):
    q = db.query(PlacementQuota).filter(PlacementQuota.id == quota_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quota record not found")
    q.quota = payload.quota
    q.min_threshold = payload.min_threshold
    db.commit()
    db.refresh(q)
    return q

# ==============================================================================
# 4. MID-YEAR COLLEGE PLACEMENT (Post-Semester I)
# ==============================================================================

@router.post("/freshman/simulate-college-placement")
def simulate_college_placement(payload: CollegePlacementRequest, db: Session = Depends(get_db)):
    """
    Ranks students based on: (Freshman Sem I GPA / 4.0 * 100 * GPA_WEIGHT) + (National Exam * EXAM_WEIGHT)
    Matches with student choices and respect college intake quotas.
    """
    students = db.query(Student).filter(
        Student.batch == payload.batch,
        Student.stream == payload.stream
    ).all()

    quotas = {q.target_id: {"name": q.target_name, "quota": q.quota, "min_threshold": q.min_threshold, "assigned": 0} 
              for q in db.query(PlacementQuota).filter(PlacementQuota.target_type == "college").all()}

    # Name-to-ID lookup for student choices
    colleges = db.query(College).filter(College.is_freshman_college == 0).all()
    name_to_id = {c.name.lower(): c.id for c in colleges}

    ranked_candidates = []
    w_gpa = payload.gpa_weight or 0.70
    w_exam = payload.exam_weight or 0.30

    for s in students:
        # Composite score calculation (0 - 100)
        gpa_score = ((s.freshman_sem1_gpa or 3.0) / 4.0) * 100.0
        exam_score = s.national_exam_score or 75.0
        composite = round((gpa_score * w_gpa) + (exam_score * w_exam), 2)

        ranked_candidates.append({
            "id": s.id,
            "student_number": s.student_number,
            "full_name": s.full_name,
            "gpa": s.freshman_sem1_gpa or 3.0,
            "exam_score": exam_score,
            "composite": composite,
            "choice_1": s.choice_1,
            "choice_2": s.choice_2,
            "choice_3": s.choice_3,
            "assigned_college_id": None,
            "assigned_college_name": None,
            "placement_reason": "Unassigned"
        })

    # Sort descending by composite score
    ranked_candidates.sort(key=lambda x: x["composite"], reverse=True)

    # Allocation algorithm respecting choices & quotas
    for c in ranked_candidates:
        choices = [c["choice_1"], c["choice_2"], c["choice_3"]]
        placed = False
        for choice_num, choice_name in enumerate(choices, 1):
            if not choice_name: continue
            cid = name_to_id.get(choice_name.strip().lower())
            if cid and cid in quotas:
                q_info = quotas[cid]
                if q_info["assigned"] < q_info["quota"] and c["gpa"] >= q_info["min_threshold"]:
                    c["assigned_college_id"] = cid
                    c["assigned_college_name"] = q_info["name"]
                    c["placement_reason"] = f"Choice #{choice_num} Granted"
                    q_info["assigned"] += 1
                    placed = True
                    break

        if not placed:
            # Fallback to available college with remaining quota
            for cid, q_info in quotas.items():
                if q_info["assigned"] < q_info["quota"]:
                    c["assigned_college_id"] = cid
                    c["assigned_college_name"] = q_info["name"]
                    c["placement_reason"] = "Capacity Fallback"
                    q_info["assigned"] += 1
                    placed = True
                    break

    return {
        "batch": payload.batch,
        "stream": payload.stream,
        "weights": {"gpa": w_gpa, "exam": w_exam},
        "quotas_summary": quotas,
        "total_students": len(ranked_candidates),
        "placed_students": ranked_candidates
    }

@router.post("/freshman/execute-college-placement")
def execute_college_placement(payload: CollegePlacementRequest, db: Session = Depends(get_db)):
    """
    Executes and commits mid-year college placement for students.
    """
    if payload.mode == "direct_list" and payload.direct_mappings:
        # Mode A: Direct list from Dean
        updated = 0
        for m in payload.direct_mappings:
            std = db.query(Student).filter(Student.student_number == m.get("student_number")).first()
            if std and m.get("target_college_id"):
                std.college_id = m.get("target_college_id")
                std.placement_status = "Placed to College (Freshman Sem II)"
                updated += 1
        db.commit()
        return {"status": "success", "mode": "direct_list", "placed_count": updated}

    # Mode B: Automated Merit Placement Engine
    sim = simulate_college_placement(payload, db)
    placed_list = sim.get("placed_students", [])
    updated = 0

    for item in placed_list:
        if item.get("assigned_college_id"):
            std = db.query(Student).filter(Student.id == item["id"]).first()
            if std:
                std.college_id = item["assigned_college_id"]
                std.placement_status = "Placed to College (Freshman Sem II)"
                updated += 1

    db.commit()
    return {"status": "success", "mode": "engine", "placed_count": updated, "summary": sim.get("quotas_summary")}

# ==============================================================================
# 5. YEAR-END DEPARTMENT PLACEMENT (Post-Semester II)
# ==============================================================================

@router.post("/freshman/simulate-department-placement")
def simulate_department_placement(payload: DepartmentPlacementRequest, db: Session = Depends(get_db)):
    """
    Places students inside an assigned College into their final degree-granting Departments.
    Uses Cumulative GPA (Sem I + Sem II) + National Exam Score.
    """
    students = db.query(Student).filter(
        Student.batch == payload.batch,
        Student.college_id == payload.college_id
    ).all()

    depts = db.query(Department).filter(Department.college_id == payload.college_id).all()
    quotas = {q.target_id: {"name": q.target_name, "quota": q.quota, "min_threshold": q.min_threshold, "assigned": 0} 
              for q in db.query(PlacementQuota).filter(PlacementQuota.target_type == "department").all()
              if q.target_id in [d.id for d in depts]}

    # Ensure all departments in college have quota records
    for d in depts:
        if d.id not in quotas:
            quotas[d.id] = {"name": d.name, "quota": 40, "min_threshold": 2.50, "assigned": 0}

    ranked = []
    w_gpa = payload.gpa_weight or 0.70
    w_exam = payload.exam_weight or 0.30

    for s in students:
        cgpa = round(((s.freshman_sem1_gpa or 3.0) + (s.freshman_sem2_gpa or 3.0)) / 2.0, 2)
        gpa_score = (cgpa / 4.0) * 100.0
        exam_score = s.national_exam_score or 75.0
        composite = round((gpa_score * w_gpa) + (exam_score * w_exam), 2)

        ranked.append({
            "id": s.id,
            "student_number": s.student_number,
            "full_name": s.full_name,
            "cgpa": cgpa,
            "composite": composite,
            "assigned_department_id": None,
            "assigned_department_name": None,
            "status": "Unassigned"
        })

    ranked.sort(key=lambda x: x["composite"], reverse=True)

    # Distribute among departments in the college
    dept_ids = list(quotas.keys())
    for idx, c in enumerate(ranked):
        # Round-robin preference distribution respecting quotas
        assigned = False
        for target_did in dept_ids:
            q_info = quotas[target_did]
            if q_info["assigned"] < q_info["quota"] and c["cgpa"] >= q_info["min_threshold"]:
                c["assigned_department_id"] = target_did
                c["assigned_department_name"] = q_info["name"]
                c["status"] = "Placed"
                q_info["assigned"] += 1
                assigned = True
                break

        if not assigned and dept_ids:
            fallback = dept_ids[idx % len(dept_ids)]
            c["assigned_department_id"] = fallback
            c["assigned_department_name"] = quotas[fallback]["name"]
            c["status"] = "Capacity Fallback"
            quotas[fallback]["assigned"] += 1

    return {
        "batch": payload.batch,
        "college_id": payload.college_id,
        "quotas_summary": quotas,
        "total_students": len(ranked),
        "placed_students": ranked
    }

@router.post("/freshman/execute-department-placement")
def execute_department_placement(payload: DepartmentPlacementRequest, db: Session = Depends(get_db)):
    """
    Executes and commits year-end department placement.
    """
    if payload.mode == "direct_list" and payload.direct_mappings:
        updated = 0
        for m in payload.direct_mappings:
            std = db.query(Student).filter(Student.student_number == m.get("student_number")).first()
            if std and m.get("target_department_id"):
                std.department_id = m.get("target_department_id")
                std.placement_status = "Placed to Department (Year 2 Ready)"
                std.year_level = "Year 2"
                updated += 1
        db.commit()
        return {"status": "success", "mode": "direct_list", "placed_count": updated}

    sim = simulate_department_placement(payload, db)
    placed_list = sim.get("placed_students", [])
    updated = 0

    for item in placed_list:
        if item.get("assigned_department_id"):
            std = db.query(Student).filter(Student.id == item["id"]).first()
            if std:
                std.department_id = item["assigned_department_id"]
                std.placement_status = "Placed to Department (Year 2 Ready)"
                std.year_level = "Year 2"
                updated += 1

    db.commit()
    return {"status": "success", "mode": "engine", "placed_count": updated, "summary": sim.get("quotas_summary")}
