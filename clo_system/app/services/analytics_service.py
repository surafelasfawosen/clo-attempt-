"""
app/services/analytics_service.py
Mathematical Computation Engine for Outcome-Based Education (OBE).
Processes Direct Assessment Marks, 5 Stakeholder Surveys, and PLO Rollup.
"""

from sqlalchemy.orm import Session
from typing import Dict, Any, List
from collections import defaultdict

from app.models.curriculum import Course, CLO, PLO, CLOPLOMapping
from app.models.assessment import AssessmentInstrument, AssessmentCLOAllocation
from app.models.student import CourseEnrollment, StudentAssessmentScore, Student
from app.models.survey import SurveySession, SurveyCLORating

SURVEY_WEIGHTS = {
    "student_exit": 0.30,
    "teacher_reflection": 0.15,
    "alumni": 0.20,
    "employer": 0.20,
    "industry_partner": 0.15
}

class AnalyticsService:

    @staticmethod
    def calculate_course_attainment(db: Session, course_id: str) -> Dict[str, Any]:
        course = db.query(Course).filter(Course.id == course_id).first()
        if not course:
            return {"error": "Course not found"}

        clos = course.clos
        assessments = course.assessments
        direct_weight = (course.direct_weight_pct or 80.0) / 100.0
        indirect_weight = (course.indirect_weight_pct or 20.0) / 100.0

        # Fetch enrollments
        enrollments = db.query(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).all()
        total_students = len(enrollments)

        # ---------------------------------------------------------
        # 1. DIRECT ASSESSMENT
        # ---------------------------------------------------------
        # Precompute total possible marks per CLO across all assessments
        clo_max_marks = {clo.id: 0.0 for clo in clos}
        asm_clo_map = defaultdict(dict) # {asm_id: {clo_id: marks}}

        for asm in assessments:
            for alloc in asm.clo_allocations:
                clo_max_marks[alloc.clo_id] = clo_max_marks.get(alloc.clo_id, 0.0) + alloc.allocated_marks
                asm_clo_map[asm.id][alloc.clo_id] = alloc.allocated_marks

        # Compute each student's score per CLO
        student_clo_pcts = {}
        student_scores_by_enrollment = defaultdict(dict) # {enrollment_id: {asm_id: score}}

        scores = db.query(StudentAssessmentScore).join(CourseEnrollment).filter(CourseEnrollment.course_id == course_id).all()
        for s in scores:
            student_scores_by_enrollment[s.enrollment_id][s.assessment_id] = s.score_obtained

        for enr in enrollments:
            s_num = enr.student.student_number if enr.student else enr.id
            s_asm_scores = student_scores_by_enrollment.get(enr.id, {})
            
            student_clo_earned = {clo.id: 0.0 for clo in clos}

            for asm in assessments:
                asm_total = asm.total_marks or 1.0
                earned_in_asm = s_asm_scores.get(asm.id, 0.0)
                ratio = earned_in_asm / asm_total if asm_total > 0 else 0.0

                for clo_id, alloc_marks in asm_clo_map[asm.id].items():
                    if clo_id in student_clo_earned:
                        student_clo_earned[clo_id] += ratio * alloc_marks

            # Calculate % for each CLO
            student_clo_pcts[s_num] = {}
            for clo_id, earned in student_clo_earned.items():
                max_m = clo_max_marks.get(clo_id, 0.0)
                pct = (earned / max_m * 100.0) if max_m > 0 else 0.0
                student_clo_pcts[s_num][clo_id] = round(pct, 2)

        # Direct attainment threshold check
        direct_attainment_summary = {}
        for clo in clos:
            pass_mark = clo.passing_score_pct or 60.0
            passing_count = sum(
                1 for pcts in student_clo_pcts.values()
                if pcts.get(clo.id, 0.0) >= pass_mark
            )
            direct_pct = (passing_count / total_students * 100.0) if total_students > 0 else 0.0
            direct_attainment_summary[clo.id] = {
                "passing_count": passing_count,
                "total_students": total_students,
                "direct_attainment_pct": round(direct_pct, 2)
            }

        # ---------------------------------------------------------
        # 2. INDIRECT ASSESSMENT (5 STAKEHOLDERS)
        # ---------------------------------------------------------
        survey_sessions = db.query(SurveySession).filter(SurveySession.course_id == course_id).all()
        stakeholder_clo_ratings = defaultdict(lambda: defaultdict(list))

        for session in survey_sessions:
            stype = session.stakeholder_type
            for r in session.ratings:
                # Convert 1-5 to %
                pct_val = (r.rating_score / 5.0) * 100.0
                stakeholder_clo_ratings[r.clo_id][stype].append(pct_val)

        indirect_attainment_by_clo = {}
        survey_breakdown_by_clo = {}

        for clo in clos:
            breakdown = {}
            weighted_sum = 0.0
            total_weight = 0.0

            for stype, w in SURVEY_WEIGHTS.items():
                ratings_list = stakeholder_clo_ratings[clo.id].get(stype, [])
                if ratings_list:
                    avg_score = sum(ratings_list) / len(ratings_list)
                    breakdown[stype] = round(avg_score, 2)
                    weighted_sum += avg_score * w
                    total_weight += w

            final_indirect = (weighted_sum / total_weight) if total_weight > 0 else 0.0
            indirect_attainment_by_clo[clo.id] = round(final_indirect, 2)
            survey_breakdown_by_clo[clo.id] = breakdown

        # ---------------------------------------------------------
        # 3. COMBINED OUTCOME & GAP ANALYSIS
        # ---------------------------------------------------------
        clo_cards = []
        for clo in clos:
            direct_val = direct_attainment_summary[clo.id]["direct_attainment_pct"]
            indirect_val = indirect_attainment_by_clo.get(clo.id, 0.0)
            target = clo.target_attainment_pct or 70.0

            combined_val = round((direct_val * direct_weight) + (indirect_val * indirect_weight), 2)
            gap = round(combined_val - target, 2)
            is_attained = combined_val >= target

            cqi_action = None
            if not is_attained:
                cqi_action = f"Attainment deficit of {abs(gap)}%. Review prerequisite concept delivery, introduce formative lab checkpoints, and offer targeted tutorial sessions."

            clo_cards.append({
                "clo_id": clo.id,
                "clo_code": clo.code,
                "description": clo.description,
                "blooms_level": clo.blooms_level,
                "target_pct": target,
                "passing_score_pct": clo.passing_score_pct,
                "students_evaluated": total_students,
                "students_passed": direct_attainment_summary[clo.id]["passing_count"],
                "direct_attainment_pct": direct_val,
                "indirect_attainment_pct": indirect_val,
                "combined_attainment_pct": combined_val,
                "is_attained": is_attained,
                "gap_pct": gap,
                "cqi_action": cqi_action,
                "survey_breakdown": survey_breakdown_by_clo.get(clo.id, {})
            })

        # PLO Rollup
        plos = db.query(PLO).all()
        plo_cards = []
        for plo in plos:
            mappings = db.query(CLOPLOMapping).join(CLO).filter(
                CLOPLOMapping.plo_id == plo.id,
                CLO.course_id == course_id
            ).all()

            weighted_sum = 0.0
            sum_weights = 0
            contribs = []

            for m in mappings:
                c_card = next((c for c in clo_cards if c["clo_id"] == m.clo_id), None)
                if c_card:
                    w = m.correlation_weight or 2
                    attain = c_card["combined_attainment_pct"]
                    weighted_sum += attain * w
                    sum_weights += w
                    contribs.append({
                        "clo_code": c_card["clo_code"],
                        "weight": w,
                        "attainment_pct": attain
                    })

            plo_pct = round(weighted_sum / sum_weights, 2) if sum_weights > 0 else 0.0
            plo_cards.append({
                "plo_id": plo.id,
                "plo_code": plo.code,
                "title": plo.title,
                "description": plo.description,
                "contributing_clos": contribs,
                "plo_attainment_pct": plo_pct,
                "target_pct": 70.0,
                "is_attained": plo_pct >= 70.0
            })

        attained_count = sum(1 for c in clo_cards if c["is_attained"])

        return {
            "course_id": course.id,
            "course_code": course.code,
            "course_title": course.title,
            "total_students": total_students,
            "summary": {
                "total_clos": len(clo_cards),
                "attained_clos": attained_count,
                "unattained_clos": len(clo_cards) - attained_count,
                "status": "Attained" if attained_count == len(clo_cards) else "Action Required",
                "avg_direct_pct": round(sum(c["direct_attainment_pct"] for c in clo_cards) / len(clo_cards), 2) if clo_cards else 0,
                "avg_indirect_pct": round(sum(c["indirect_attainment_pct"] for c in clo_cards) / len(clo_cards), 2) if clo_cards else 0,
                "avg_combined_pct": round(sum(c["combined_attainment_pct"] for c in clo_cards) / len(clo_cards), 2) if clo_cards else 0
            },
            "clo_cards": clo_cards,
            "plo_cards": plo_cards,
            "student_clo_matrix": student_clo_pcts
        }

