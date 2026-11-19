import sys
import os

sys.path.append(os.path.dirname(__file__))

from core.db import db
from core.analytics import AttainmentEngine

def test_engine():
    course = db.find_one("courses", "id", "course_ds302")
    scores = db.find_many("scores", "course_id", "course_ds302")
    surveys = db.find_many("surveys", "course_id", "course_ds302")
    plos = db.get_collection("plos")

    print(f"Loaded Course: {course['code']} - {course['title']}")
    print(f"Total Enrolled Students: {len(scores)}")
    print(f"Total Surveys: {len(surveys)}")
    print(f"Total PLOs: {len(plos)}")

    res = AttainmentEngine.calculate_course_attainment(course, scores, surveys)
    print("\n=== CLO ATTAINMENT SUMMARY ===")
    print(f"Total CLOs: {res['summary']['total_clos']}")
    print(f"Attained CLOs: {res['summary']['attained_clos']}")
    print(f"Unattained CLOs: {res['summary']['unattained_clos']}")
    print(f"Average Direct Attainment: {res['summary']['average_direct_attainment_pct']}%")
    print(f"Average Indirect Attainment: {res['summary']['average_indirect_attainment_pct']}%")
    print(f"Average Combined Attainment: {res['summary']['average_combined_attainment_pct']}%")

    print("\n=== CLO DETAILS ===")
    for item in res['clo_attainment_details']:
        status = "PASSED" if item['is_attained'] else "FAILED"
        print(f"{item['clo_code']} ({item['blooms_level']}): Direct={item['direct_attainment_pct']}% | Indirect={item['indirect_attainment_pct']}% | Combined={item['combined_attainment_pct']}% | Status={status}")
        if item['corrective_action']:
            print(f"   --> CQI Action: {item['corrective_action']}")

    plo_res = AttainmentEngine.calculate_plo_rollup(res, plos)
    print("\n=== PLO ROLLUP ===")
    for p in plo_res:
        status = "PASSED" if p['is_attained'] else "AT RISK"
        print(f"{p['plo_code']} ({p['title']}): Attainment={p['plo_attainment_pct']}% | Status={status}")

if __name__ == "__main__":
    test_engine()

