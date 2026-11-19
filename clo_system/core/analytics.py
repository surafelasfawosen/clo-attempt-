"""
core/analytics.py
Mathematical and Statistical Engine for CLO & PLO Attainment.
Implements:
1. Direct Assessment Engine (Exams, Assignments, Lab Projects mapped to CLOs)
2. Indirect Assessment Engine (5 Stakeholder Surveys: Student, Teacher, Alumni, Employer, Industry)
3. Combined Outcome Attainment (80% Direct + 20% Indirect)
4. Program Learning Outcome (PLO) rollup
5. Gap Analysis and Pedagogical Recommendations
"""

from typing import Dict, List, Any
from core.models import CLOAttainmentResult


# Stakeholder survey default weights for indirect assessment
SURVEY_WEIGHTS: Dict[str, float] = {
    "student_exit": 0.30,        # 30%
    "teacher_reflection": 0.15,  # 15%
    "alumni": 0.20,              # 20%
    "employer": 0.20,            # 20%
    "industry_partner": 0.15     # 15%
}


class AttainmentEngine:
    """Calculates CLO direct, indirect, and combined attainment metrics."""

    @staticmethod
    def calculate_course_attainment(course: Dict[str, Any], scores: List[Dict[str, Any]], surveys: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compute full direct, indirect, and combined attainment for a given course.
        """
        clos = course.get("clos", [])
        assessments = course.get("assessments", [])
        direct_weight = course.get("direct_weight_pct", 80.0) / 100.0
        indirect_weight = course.get("indirect_weight_pct", 20.0) / 100.0

        total_students = len(scores)
        if total_students == 0:
            return {"error": "No student score records found for this course"}

        # -------------------------------------------------------------
        # 1. DIRECT ASSESSMENT COMPUTATION
        # -------------------------------------------------------------
        # Precompute total possible marks per CLO across all assessments
        clo_max_marks: Dict[str, float] = {clo["id"]: 0.0 for clo in clos}
        for asm in assessments:
            dist = asm.get("clo_marks_distribution", {})
            for clo_id, marks in dist.items():
                if clo_id in clo_max_marks:
                    clo_max_marks[clo_id] += marks

        # Compute each student's score on each CLO
        # student_clo_scores: {student_id: {clo_id: achieved_marks}}
        student_clo_scores: Dict[str, Dict[str, float]] = {}
        student_clo_pcts: Dict[str, Dict[str, float]] = {}

        for record in scores:
            s_id = record["student_id"]
            student_clo_scores[s_id] = {clo["id"]: 0.0 for clo in clos}

            for asm in assessments:
                asm_id = asm["id"]
                asm_total = asm["total_marks"]
                student_asm_score = record.get("assessment_scores", {}).get(asm_id, 0.0)
                ratio = student_asm_score / asm_total if asm_total > 0 else 0.0

                for clo_id, clo_alloc in asm.get("clo_marks_distribution", {}).items():
                    if clo_id in student_clo_scores[s_id]:
                        student_clo_scores[s_id][clo_id] += ratio * clo_alloc

            # Convert to percentage
            student_clo_pcts[s_id] = {}
            for clo_id, achieved in student_clo_scores[s_id].items():
                max_m = clo_max_marks.get(clo_id, 0.0)
                pct = (achieved / max_m * 100.0) if max_m > 0 else 0.0
                student_clo_pcts[s_id][clo_id] = round(pct, 2)

        # Direct Attainment per CLO:
        # % of students whose CLO score >= passing_score_pct (typically 60%)
        direct_attainment_by_clo: Dict[str, Dict[str, Any]] = {}
        for clo in clos:
            c_id = clo["id"]
            passing_threshold = clo.get("passing_score_pct", 60.0)
            meeting_count = 0

            for s_id, pcts in student_clo_pcts.items():
                if pcts.get(c_id, 0.0) >= passing_threshold:
                    meeting_count += 1

            direct_pct = (meeting_count / total_students * 100.0) if total_students > 0 else 0.0
            direct_attainment_by_clo[c_id] = {
                "meeting_count": meeting_count,
                "total_students": total_students,
                "direct_attainment_pct": round(direct_pct, 2)
            }

        # -------------------------------------------------------------
        # 2. INDIRECT ASSESSMENT (5 STAKEHOLDER SURVEYS)
        # -------------------------------------------------------------
        # Aggregate ratings (1 to 5) for each stakeholder type and CLO
        # survey_breakdown: {clo_id: {stakeholder_type: normalized_pct}}
        survey_breakdown: Dict[str, Dict[str, float]] = {clo["id"]: {} for clo in clos}

        for srv in surveys:
            stype = srv.get("stakeholder_type")
            ratings = srv.get("clo_ratings", {})
            for clo_id, rating in ratings.items():
                if clo_id in survey_breakdown:
                    # Convert 1-5 Likert scale to 0-100%
                    pct_rating = (rating / 5.0) * 100.0
                    survey_breakdown[clo_id][stype] = round(pct_rating, 2)

        # Weighted Indirect Attainment per CLO
        indirect_attainment_by_clo: Dict[str, float] = {}
        for clo in clos:
            c_id = clo["id"]
            bdown = survey_breakdown.get(c_id, {})
            weighted_sum = 0.0
            weight_acc = 0.0

            for stype, w in SURVEY_WEIGHTS.items():
                if stype in bdown:
                    weighted_sum += bdown[stype] * w
                    weight_acc += w

            final_indirect = (weighted_sum / weight_acc) if weight_acc > 0 else 0.0
            indirect_attainment_by_clo[c_id] = round(final_indirect, 2)

        # -------------------------------------------------------------
        # 3. COMBINED ATTAINMENT & GAP ANALYSIS
        # -------------------------------------------------------------
        clo_results: List[Dict[str, Any]] = []

        for clo in clos:
            c_id = clo["id"]
            target = clo.get("target_attainment_pct", 70.0)
            direct_data = direct_attainment_by_clo[c_id]
            direct_val = direct_data["direct_attainment_pct"]
            indirect_val = indirect_attainment_by_clo.get(c_id, 0.0)

            combined_val = round((direct_val * direct_weight) + (indirect_val * indirect_weight), 2)
            gap = round(combined_val - target, 2)
            is_attained = combined_val >= target

            # Automated pedagogical advice based on gap
            action = None
            if not is_attained:
                if clo.get("blooms_level") in ["Analyzing", "Evaluating", "Creating"]:
                    action = f"CLO target not met (gap: {gap}%). Increase formative lab milestones, offer targeted project office hours, and benchmark intermediate code deliverables before final submission."
                else:
                    action = f"CLO target not met (gap: {gap}%). Reinforce conceptual fundamentals via tutorial problem-solving sessions and provide peer-assisted learning."

            clo_results.append({
                "clo_id": c_id,
                "clo_code": clo["code"],
                "description": clo["description"],
                "blooms_level": clo.get("blooms_level", "Applying"),
                "target_pct": target,
                "threshold_score_pct": clo.get("passing_score_pct", 60.0),
                "students_evaluated_count": total_students,
                "students_meeting_threshold": direct_data["meeting_count"],
                "direct_attainment_pct": direct_val,
                "indirect_attainment_pct": indirect_val,
                "combined_attainment_pct": combined_val,
                "is_attained": is_attained,
                "gap_pct": gap,
                "survey_breakdown": survey_breakdown.get(c_id, {}),
                "corrective_action": action,
                "plo_mappings": clo.get("plo_mappings", [])
            })

        # Overall Course Attainment Summary
        avg_direct = round(sum(r["direct_attainment_pct"] for r in clo_results) / len(clo_results), 2)
        avg_indirect = round(sum(r["indirect_attainment_pct"] for r in clo_results) / len(clo_results), 2)
        avg_combined = round(sum(r["combined_attainment_pct"] for r in clo_results) / len(clo_results), 2)
        attained_count = sum(1 for r in clo_results if r["is_attained"])

        return {
            "course_id": course["id"],
            "course_code": course["code"],
            "course_title": course["title"],
            "academic_year": course["academic_year"],
            "semester": course["semester"],
            "total_students": total_students,
            "weights": {
                "direct_weight_pct": direct_weight * 100,
                "indirect_weight_pct": indirect_weight * 100,
                "survey_weights": SURVEY_WEIGHTS
            },
            "summary": {
                "total_clos": len(clo_results),
                "attained_clos": attained_count,
                "unattained_clos": len(clo_results) - attained_count,
                "course_attainment_status": "Attained" if attained_count == len(clo_results) else "Partially Attained",
                "average_direct_attainment_pct": avg_direct,
                "average_indirect_attainment_pct": avg_indirect,
                "average_combined_attainment_pct": avg_combined
            },
            "clo_attainment_details": clo_results,
            "student_clo_matrix": student_clo_pcts
        }

    @staticmethod
    def calculate_plo_rollup(course_attainment: Dict[str, Any], plos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Aggregate CLO attainments into Program Learning Outcomes (PLOs).
        Uses weighted averages based on CLO-to-PLO mapping weights (Low=1, Med=2, High=3).
        """
        clo_details = course_attainment.get("clo_attainment_details", [])
        weight_lookup = {"Low": 1, "Medium": 2, "High": 3}

        plo_results = []
        for plo in plos:
            p_id = plo["id"]
            contributing_clos = []
            weighted_sum = 0.0
            total_weight = 0

            for clo_res in clo_details:
                for mapping in clo_res.get("plo_mappings", []):
                    if mapping.get("plo_id") == p_id:
                        w_label = mapping.get("weight", "Medium")
                        w_num = weight_lookup.get(w_label, 2)
                        attainment = clo_res["combined_attainment_pct"]

                        weighted_sum += attainment * w_num
                        total_weight += w_num
                        contributing_clos.append({
                            "clo_code": clo_res["clo_code"],
                            "weight": w_label,
                            "attainment_pct": attainment
                        })

            if total_weight > 0:
                plo_attainment_pct = round(weighted_sum / total_weight, 2)
            else:
                plo_attainment_pct = 0.0

            plo_results.append({
                "plo_id": p_id,
                "plo_code": plo["code"],
                "title": plo["title"],
                "description": plo["description"],
                "contributing_clos": contributing_clos,
                "plo_attainment_pct": plo_attainment_pct,
                "target_pct": 70.0,
                "is_attained": plo_attainment_pct >= 70.0
            })

        return plo_results

