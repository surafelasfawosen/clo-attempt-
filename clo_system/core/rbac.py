"""
core/rbac.py
Role-Based Access Control (RBAC) definitions and permission checks.
"""

from typing import List, Dict

ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "curriculum_editor": [
        "course:create",
        "course:edit",
        "clo:create",
        "clo:edit",
        "clo:delete",
        "plo:map",
        "assessment_blueprint:configure",
        "course:view"
    ],
    "teacher": [
        "course:view",
        "scores:view",
        "scores:edit",
        "attainment:calculate",
        "attainment:view",
        "report:submit"
    ],
    "department_head": [
        "course:view",
        "scores:view",
        "attainment:view",
        "department:view_all",
        "plo:view_rollup",
        "report:approve",
        "report:reject"
    ],
    "dean": [
        "college:view_all",
        "department:view_all",
        "course:view",
        "attainment:view",
        "accreditation:audit_export"
    ],
    "student": [
        "student:view_own_outcomes"
    ]
}


def has_permission(role: str, permission: str) -> bool:
    """Verify if a user role possesses a specific capability."""
    perms = ROLE_PERMISSIONS.get(role, [])
    return permission in perms

