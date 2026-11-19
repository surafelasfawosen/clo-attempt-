"""
app/api/departments.py
FastAPI Router for Institutional Structure (Colleges, Departments, and PLOs).
Provides full CRUD: List, Create, Update, Delete for Colleges and Departments.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid

from app.database import get_db
from app.models.institution import Department, College, Program
from app.models.curriculum import Course, PLO, CLOPLOMapping
import re

router = APIRouter(tags=["Institution & PLOs"])

# -------------------------------------------------------------
# Pydantic Schemas for College & Department CRUD
# -------------------------------------------------------------
class CollegeCreate(BaseModel):
    name: str
    dean_name: Optional[str] = "Dean"
    university_name: Optional[str] = "Debre Berhan University"

class CollegeUpdate(BaseModel):
    name: Optional[str] = None
    dean_name: Optional[str] = None
    university_name: Optional[str] = None

class DepartmentCreate(BaseModel):
    name: str
    code: Optional[str] = None
    college_id: str
    head_name: Optional[str] = None
    head_of_department: Optional[str] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    head_name: Optional[str] = None
    head_of_department: Optional[str] = None

class PLOCreate(BaseModel):
    code: str
    title: str
    description: Optional[str] = ""
    category: Optional[str] = "Technical Core"
    program_id: Optional[str] = None

class PLOUpdate(BaseModel):
    code: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


# -------------------------------------------------------------
# College Endpoints
# -------------------------------------------------------------
@router.get("/colleges")
def list_colleges(db: Session = Depends(get_db)):
    colleges = db.query(College).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "dean_name": c.dean_name,
            "university_name": c.university_name,
            "departments_count": len(c.departments)
        }
        for c in colleges
    ]

@router.post("/colleges", status_code=status.HTTP_201_CREATED)
def create_college(payload: CollegeCreate, db: Session = Depends(get_db)):
    c_id = f"col_{uuid.uuid4().hex[:8]}"
    new_col = College(
        id=c_id,
        name=payload.name,
        dean_name=payload.dean_name,
        university_name=payload.university_name
    )
    db.add(new_col)
    db.commit()
    db.refresh(new_col)
    return {"message": "College created", "college": {"id": new_col.id, "name": new_col.name}}

@router.put("/colleges/{college_id}")
def update_college(college_id: str, payload: CollegeUpdate, db: Session = Depends(get_db)):
    col = db.query(College).filter(College.id == college_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="College not found")
    if payload.name is not None:
        col.name = payload.name
    if payload.dean_name is not None:
        col.dean_name = payload.dean_name
    if payload.university_name is not None:
        col.university_name = payload.university_name
    db.commit()
    return {"message": "College updated", "college": {"id": col.id, "name": col.name}}

@router.delete("/colleges/{college_id}")
def delete_college(college_id: str, db: Session = Depends(get_db)):
    col = db.query(College).filter(College.id == college_id).first()
    if not col:
        raise HTTPException(status_code=404, detail="College not found")
    db.delete(col)
    db.commit()
    return {"message": "College deleted successfully"}


# -------------------------------------------------------------
# Department Endpoints
# -------------------------------------------------------------
@router.get("/departments")
def list_departments(college_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Department)
    if college_id:
        query = query.filter(Department.college_id == college_id)
    depts = query.all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "code": d.code,
            "head_name": d.head_name or "Department Head",
            "head_of_department": d.head_name or "Department Head",
            "college_id": d.college_id,
            "courses_count": len(d.courses)
        }
        for d in depts
    ]

@router.post("/departments", status_code=status.HTTP_201_CREATED)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db)):
    head = (payload.head_name or payload.head_of_department or "Department Head").strip()
    raw_code = (payload.code or "").strip().upper()
    if not raw_code:
        # Generate acronym from words in department name
        words = [w for w in payload.name.split() if w.lower() not in ("of", "and", "the", "in", "for", "department", "dept")]
        if words:
            raw_code = "".join(w[0] for w in words).upper()[:6]
        else:
            raw_code = "".join(c for c in payload.name if c.isalnum()).upper()[:4]
        if not raw_code:
            raw_code = "DEPT"

    code_candidate = raw_code
    counter = 1
    while db.query(Department).filter(Department.code == code_candidate).first():
        code_candidate = f"{raw_code[:4]}{counter}"
        counter += 1

    d_id = f"dept_{code_candidate.lower()}_{uuid.uuid4().hex[:4]}"
    new_dept = Department(
        id=d_id,
        name=payload.name.strip(),
        code=code_candidate,
        college_id=payload.college_id,
        head_name=head
    )
    db.add(new_dept)
    db.commit()
    db.refresh(new_dept)
    return {
        "message": "Department created",
        "department": {
            "id": new_dept.id,
            "name": new_dept.name,
            "code": new_dept.code,
            "head_name": new_dept.head_name,
            "head_of_department": new_dept.head_name
        }
    }

@router.put("/departments/{dept_id}")
def update_department(dept_id: str, payload: DepartmentUpdate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    if payload.name is not None:
        dept.name = payload.name.strip()
    if payload.code is not None and payload.code.strip():
        dept.code = payload.code.strip().upper()
    head = payload.head_name or payload.head_of_department
    if head is not None:
        dept.head_name = head.strip()
    db.commit()
    return {
        "message": "Department updated",
        "department": {
            "id": dept.id,
            "name": dept.name,
            "code": dept.code,
            "head_name": dept.head_name,
            "head_of_department": dept.head_name
        }
    }

@router.delete("/departments/{dept_id}")
def delete_department(dept_id: str, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    db.delete(dept)
    db.commit()
    return {"message": "Department deleted successfully"}


# -------------------------------------------------------------
# PLO Endpoints (Full CRUD with Natural Sorting)
# -------------------------------------------------------------
@router.get("/plos")
def list_plos(program_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(PLO)
    if program_id:
        query = query.filter(PLO.program_id == program_id)
    plos = query.all()
    
    def natural_sort_key(p):
        digits = re.findall(r'\d+', p.code)
        return int(digits[0]) if digits else 999

    sorted_plos = sorted(plos, key=natural_sort_key)
    return [
        {
            "id": p.id,
            "program_id": p.program_id,
            "code": p.code,
            "title": p.title,
            "description": p.description,
            "category": p.category
        }
        for p in sorted_plos
    ]

@router.post("/plos", status_code=status.HTTP_201_CREATED)
def create_plo(payload: PLOCreate, db: Session = Depends(get_db)):
    raw_code = payload.code.strip().upper()
    if not raw_code:
        raise HTTPException(status_code=400, detail="PLO code cannot be empty")

    clean_code = f"PLO{raw_code}" if raw_code.isdigit() else raw_code
    title = payload.title.strip() if payload.title and payload.title.strip() else f"{clean_code} Program Outcome"

    prog_id = payload.program_id
    if not prog_id:
        prog = db.query(Program).first()
        prog_id = prog.id if prog else "prog_bsc_ds"

    # If duplicate code exists in the same program, update it smoothly
    existing = db.query(PLO).filter(PLO.program_id == prog_id, PLO.code == clean_code).first()
    if existing:
        existing.title = title
        if payload.description is not None:
            existing.description = payload.description.strip()
        if payload.category is not None:
            existing.category = payload.category.strip()
        db.commit()
        db.refresh(existing)
        return {
            "message": f"PLO '{clean_code}' updated successfully",
            "plo": {
                "id": existing.id,
                "program_id": existing.program_id,
                "code": existing.code,
                "title": existing.title,
                "description": existing.description,
                "category": existing.category
            }
        }

    p_id = f"plo_{clean_code.lower().replace(' ', '_')}_{uuid.uuid4().hex[:4]}"
    new_plo = PLO(
        id=p_id,
        program_id=prog_id,
        code=clean_code,
        title=title,
        description=(payload.description or "").strip(),
        category=payload.category or "Technical Core"
    )
    db.add(new_plo)
    db.commit()
    db.refresh(new_plo)
    return {
        "message": "PLO created successfully",
        "plo": {
            "id": new_plo.id,
            "program_id": new_plo.program_id,
            "code": new_plo.code,
            "title": new_plo.title,
            "description": new_plo.description,
            "category": new_plo.category
        }
    }

@router.put("/plos/{plo_id}")
def update_plo(plo_id: str, payload: PLOUpdate, db: Session = Depends(get_db)):
    plo = db.query(PLO).filter(PLO.id == plo_id).first()
    if not plo:
        plo = db.query(PLO).filter(PLO.code == plo_id.upper()).first()
    if not plo and payload.code:
        plo = db.query(PLO).filter(PLO.code == payload.code.strip().upper()).first()
    
    if not plo:
        # Upsert: create if not found
        prog = db.query(Program).first()
        prog_id = prog.id if prog else "prog_bsc_ds"
        clean_code = (payload.code or plo_id).strip().upper()
        clean_code = f"PLO{clean_code}" if clean_code.isdigit() else clean_code
        plo = PLO(
            id=f"plo_{clean_code.lower().replace(' ', '_')}_{uuid.uuid4().hex[:4]}",
            program_id=prog_id,
            code=clean_code,
            title=(payload.title or f"{clean_code} Program Outcome").strip(),
            description=(payload.description or "").strip(),
            category=(payload.category or "Technical Core").strip()
        )
        db.add(plo)
        db.commit()
        db.refresh(plo)
        return {
            "message": "PLO created successfully",
            "plo": {
                "id": plo.id,
                "program_id": plo.program_id,
                "code": plo.code,
                "title": plo.title,
                "description": plo.description,
                "category": plo.category
            }
        }

    if payload.code is not None and payload.code.strip():
        plo.code = payload.code.strip().upper()
    if payload.title is not None:
        plo.title = payload.title.strip()
    if payload.description is not None:
        plo.description = payload.description.strip()
    if payload.category is not None:
        plo.category = payload.category.strip()
    db.commit()
    db.refresh(plo)
    return {
        "message": "PLO updated successfully",
        "plo": {
            "id": plo.id,
            "program_id": plo.program_id,
            "code": plo.code,
            "title": plo.title,
            "description": plo.description,
            "category": plo.category
        }
    }

@router.delete("/plos/{plo_id}")
def delete_plo(plo_id: str, db: Session = Depends(get_db)):
    plo = db.query(PLO).filter(PLO.id == plo_id).first()
    if not plo:
        plo = db.query(PLO).filter(PLO.code == plo_id.upper()).first()
    if not plo:
        return {"message": "PLO not found or already deleted"}
    # Clean up any mappings referencing this PLO to maintain referential integrity
    db.query(CLOPLOMapping).filter((CLOPLOMapping.plo_id == plo.id) | (CLOPLOMapping.plo_id == plo.code)).delete()
    db.delete(plo)
    db.commit()
    return {"message": "PLO deleted successfully"}
