"""
test_rls_security.py
Verifies backend Row-Level Security (RLS) and institutional role boundaries:
1. Super Admin has unrestricted institutional access across colleges and departments.
2. College Dean has access restricted to courses within their accredited college.
3. Department Head has access restricted to courses in their assigned department.
4. Teacher/Instructor access is restricted strictly to assigned courses.
5. Unauthorized cross-department or cross-teacher access throws HTTP 403 Forbidden.
"""

import sys
import os
from types import SimpleNamespace
from fastapi import HTTPException

# Add clo_system root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'clo_system')))

from app.security import (
    ROLE_TEACHER,
    ROLE_DEPT_HEAD,
    ROLE_COLLEGE_DEAN,
    ROLE_SUPER_ADMIN,
    UserContext,
    enforce_course_access_rls,
    INSTITUTIONAL_ACCOUNTS,
    get_current_user
)

def run_rls_tests():
    print("🧪 Running Backend Row-Level Security (RLS) Verification...")

    # Mock courses
    course_cosc1012 = SimpleNamespace(
        id="course_cosc1012",
        code="CoSc1012",
        department_id="dept_data_science",
        college_id="col_computing_dbu",
        assigned_instructor_id="inst_solomon"
    )

    course_stat4092 = SimpleNamespace(
        id="course_stat4092",
        code="Stat4092",
        department_id="dept_data_science",
        college_id="col_computing_dbu",
        assigned_instructor_id="inst_solomon"
    )

    course_anth1012 = SimpleNamespace(
        id="course_anth1012",
        code="Anth1012",
        department_id="dept_freshman_common",
        college_id="col_freshman_dbu",
        assigned_instructor_id="inst_tadesse"
    )

    # 1. Super Admin: full access
    admin_user = UserContext(user_id="DBU-ADMIN-001", role=ROLE_SUPER_ADMIN)
    assert enforce_course_access_rls(admin_user, course_cosc1012, None) == True
    assert enforce_course_access_rls(admin_user, course_stat4092, None) == True
    assert enforce_course_access_rls(admin_user, course_anth1012, None) == True
    print("✓ 1. Super Admin: Unrestricted institutional access across all courses confirmed.")

    # 2. College Dean: isolated to Computing College
    dean_user = UserContext(
        user_id="DBU-DEAN-01",
        role=ROLE_COLLEGE_DEAN,
        college_id="col_computing_dbu"
    )
    assert enforce_course_access_rls(dean_user, course_cosc1012, None) == True
    assert enforce_course_access_rls(dean_user, course_stat4092, None) == True
    try:
        enforce_course_access_rls(dean_user, course_anth1012, None)
        assert False, "Dean must not be permitted access to other colleges"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"✓ 2. College Dean: Cross-college access blocked with 403 ({e.detail}).")

    # 3. Department Head: isolated to Data Science
    dept_head = UserContext(
        user_id="DBU-HEAD-01",
        role=ROLE_DEPT_HEAD,
        department_id="dept_data_science",
        college_id="col_computing_dbu"
    )
    assert enforce_course_access_rls(dept_head, course_cosc1012, None) == True
    try:
        enforce_course_access_rls(dept_head, course_anth1012, None)
        assert False, "Department Head must not access other department's course"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"✓ 3. Department Head: Cross-department access blocked with 403 ({e.detail}).")

    # 4. Teacher: Dr. Solomon assigned to CoSc1012
    teacher_solomon = UserContext(
        user_id="DBU-FAC-01",
        role=ROLE_TEACHER,
        instructor_id="inst_solomon",
        department_id="dept_data_science"
    )
    assert enforce_course_access_rls(teacher_solomon, course_cosc1012, None) == True
    assert enforce_course_access_rls(teacher_solomon, course_stat4092, None) == True
    try:
        enforce_course_access_rls(teacher_solomon, course_anth1012, None)
        assert False, "Teacher must not access unassigned course"
    except HTTPException as e:
        assert e.status_code == 403
        print(f"✓ 4. Teacher: Unauthorized course access blocked with 403 ({e.detail}).")

    # 5. Header extraction verification
    super_ctx = get_current_user(x_user_id="DBU-ADMIN-001")
    assert super_ctx.is_super_admin == True
    assert super_ctx.role == ROLE_SUPER_ADMIN
    print("✓ 5. Authenticated institutional context extraction verified.")

    print("\n🎉 ALL BACKEND ROW-LEVEL SECURITY (RLS) POLICIES VERIFIED! 🎉")

if __name__ == "__main__":
    run_rls_tests()
