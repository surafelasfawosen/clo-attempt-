with open('clo_system/static/js/state.js', 'r', encoding='utf-8') as f:
    state_content = f.read()

with open('scratch/ds_courses_js.txt', 'r', encoding='utf-8') as f:
    ds_courses_js = f.read()

target_marker = '    // Degree-granting department courses\n'
start_idx = state_content.find(target_marker)
if start_idx != -1:
    end_marker = '    // College Common Core Courses'
    end_idx = state_content.find(end_marker)
    if end_idx != -1:
        se_course = '    {"id": "crs_se201", "code": "SE201", "title": "Object-Oriented Software Engineering", "department_id": "dept_software_eng", "academic_year": "Year 2", "semester": "Semester I", "credit_hours": 4, "lecture_hours": 3, "lab_hours": 2, "program_name": "B.Sc in Software Engineering", "status": "Published"},\n\n'
        new_section = target_marker + '    // Department of Data Science Courses (Restored Official Curriculum)\n' + ds_courses_js + '\n    // Department of Software Engineering\n' + se_course
        updated = state_content[:start_idx] + new_section + state_content[end_idx:]
        with open('clo_system/static/js/state.js', 'w', encoding='utf-8') as out_f:
            out_f.write(updated)
        print('Successfully updated state.js with all 7 Data Science courses!')
    else:
        print('Error: end_marker not found')
else:
    print('Error: target_marker not found')

