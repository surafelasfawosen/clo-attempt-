/**
 * test_pipeline_progression.js
 * Verification of the complete 3-Tier Academic Pipeline:
 * Tier 1: College of Freshman Studies (Semester I Foundation)
 * Tier 2: Degree College Common Core (Freshman Semester II)
 * Tier 3: Degree Department (Year 2 -> Graduation Permanent Cohort)
 */

global.window = global;
global.document = {
  getElementById: (id) => {
    return {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      innerHTML: '',
      innerText: '',
      value: '',
      setAttribute: () => {},
      getAttribute: () => null
    };
  }
};

// Load state and components
const fs = require('fs');
const stateCode = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
eval(stateCode + '\nglobal.State = State;');

// Mock Sidebar and API
global.Sidebar = {
  updateBreadcrumb: () => {},
  updateProgress: () => {}
};
global.API = {
  saveBatch: async () => ({ success: true }),
  forwardToDepartment: async () => ({ success: true }),
  getCourseRoster: async () => ({ students: [] }),
  assignCourseInstructor: async () => ({ success: true })
};
State.showToast = () => {};

const assignCode = fs.readFileSync('clo_system/static/js/components/assignments.js', 'utf8');
eval(assignCode + '\nglobal.AssignmentsComponent = AssignmentsComponent;');

async function runTest() {
  console.log("=== STARTING 3-TIER PROGRESSION TEST ===");

  // 1. Check State
  console.log(`[PASS] State loaded: ${State.colleges.length} colleges, ${State.departments.length} departments, ${State.courses.length} courses, ${State.instructors.length} instructors.`);

  // 2. Test Tier 1: Freshman Studies (Semester I)
  State.selectedCollege = State.colleges.find(c => c.id === 'col_freshman_dbu');
  await AssignmentsComponent.render();

  console.log(`[CHECK 1] Freshman Context Active?`, AssignmentsComponent.isFreshmanContext());
  if (!AssignmentsComponent.isFreshmanContext()) throw new Error("Expected Freshman Context");

  console.log(`[CHECK 1] Freshman Roster Count:`, AssignmentsComponent.currentRoster.length);
  if (AssignmentsComponent.currentRoster.length !== 48) throw new Error("Expected 48 Freshman Students");

  console.log(`[CHECK 1] Active Course:`, State.activeCourse ? State.activeCourse.code : 'None');
  if (!State.activeCourse || State.activeCourse.semester !== 'Semester I') {
    throw new Error("Expected Freshman Semester I active course");
  }

  // 3. Forward Students from Freshman (Sem I) to College of Computing (Freshman Sem II)
  AssignmentsComponent.forwardTargetMode = 'to_college';
  AssignmentsComponent.forwardSelectedIds.clear();

  // Select 24 Natural Science students to advance to Computing College
  AssignmentsComponent.freshmanRoster.filter(s => s.stream === 'Natural Science').forEach(s => {
    AssignmentsComponent.forwardSelectedIds.add(s.student_number);
  });
  console.log(`[CHECK 2] Forwarding ${AssignmentsComponent.forwardSelectedIds.size} Natural Science students to Computing College...`);

  // Mock DOM select elements
  global.document.getElementById = (id) => {
    if (id === 'forward-target-college') return { value: 'col_computing_dbu' };
    if (id === 'forward-target-dept') return { value: 'dept_software_eng' };
    return {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      innerHTML: '',
      innerText: '',
      value: '',
      setAttribute: () => {},
      getAttribute: () => null
    };
  };

  await AssignmentsComponent.executeForwardToDepartment();

  const compRoster = AssignmentsComponent.collegeRosters['col_computing_dbu'];
  console.log(`[CHECK 2] Computing College Sem II Roster Count:`, compRoster ? compRoster.length : 0);
  if (!compRoster || compRoster.length !== 24) throw new Error("Expected 24 students forwarded to Computing College");

  // 4. Test Tier 2: College of Computing & Technology - Semester II Common Core
  console.log("\n--- Switching to College of Computing & Technology (Tier 2) ---");
  AssignmentsComponent.onCollegeChange('col_computing_dbu');

  console.log(`[CHECK 3] Is College Common Context?`, AssignmentsComponent.isCollegeCommonContext());
  if (!AssignmentsComponent.isCollegeCommonContext()) throw new Error("Expected College Common Context");

  console.log(`[CHECK 3] Active Course for College Sem II:`, State.activeCourse ? `${State.activeCourse.code}: ${State.activeCourse.title}` : 'None');
  if (!State.activeCourse || !State.activeCourse.code.startsWith('CoSc') && !State.activeCourse.code.startsWith('Math') && !State.activeCourse.code.startsWith('ECE')) {
    throw new Error("Expected College Sem II course like CoSc1012, Math1022, or ECE1012");
  }

  console.log(`[CHECK 3] College Sem II Loaded Students:`, AssignmentsComponent.currentRoster.length);
  if (AssignmentsComponent.currentRoster.length !== 24) throw new Error("Expected 24 students in College Sem II");

  const sampleStd = AssignmentsComponent.currentRoster[0];
  console.log(`[CHECK 3] Sample Student Placement Status:`, sampleStd.placement_status);
  if (!sampleStd.placement_status.includes('Freshman Sem II')) {
    throw new Error("Expected placement_status to indicate Freshman Sem II");
  }

  // 5. Forward Students from College Sem II to Department of Software Engineering (Permanent Cohort)
  console.log("\n--- Forwarding from College Sem II to Software Engineering Department (Tier 3) ---");
  AssignmentsComponent.forwardTargetMode = 'to_dept';
  AssignmentsComponent.forwardSelectedIds.clear();
  AssignmentsComponent.currentRoster.forEach(s => {
    AssignmentsComponent.forwardSelectedIds.add(s.student_number);
  });

  await AssignmentsComponent.executeForwardToDepartment();

  const seRoster = AssignmentsComponent.departmentRosters['dept_software_eng'];
  console.log(`[CHECK 4] Department Roster Count:`, seRoster ? seRoster.length : 0);
  if (!seRoster || seRoster.length !== 24) throw new Error("Expected 24 students placed in Software Engineering Dept");

  // 6. Test Tier 3: Switch to Department of Software Engineering (Year 2 -> Graduation)
  console.log("\n--- Switching to Department of Software Engineering (Tier 3) ---");
  AssignmentsComponent.onDepartmentChange('dept_software_eng');

  console.log(`[CHECK 5] Context is Department? Level:`, AssignmentsComponent.selectedLevel);
  if (AssignmentsComponent.selectedLevel !== 'department') throw new Error("Expected department level");

  console.log(`[CHECK 5] Selected Department:`, State.selectedDepartment ? State.selectedDepartment.name : 'None');
  console.log(`[CHECK 5] Active Department Course:`, State.activeCourse ? `${State.activeCourse.code}: ${State.activeCourse.title}` : 'None');
  console.log(`[CHECK 5] Permanent Cohort Size:`, AssignmentsComponent.currentRoster.length);
  if (AssignmentsComponent.currentRoster.length !== 24) throw new Error("Expected 24 students in Department Permanent Cohort");

  const deptStd = AssignmentsComponent.currentRoster[0];
  console.log(`[CHECK 5] Department Student Placement Status:`, deptStd.placement_status);
  if (!deptStd.placement_status.includes('Permanent Cohort') && !deptStd.placement_status.includes('Department')) {
    throw new Error("Expected placement_status to indicate Permanent Cohort");
  }

  // 7. Test Manual Cohort Promotion (Year 2 to Graduation - WITHOUT re-uploading list)
  console.log("\n--- Testing Manual Semester Promotion in Department (NO upload list) ---");
  AssignmentsComponent.openPromoteModal();
  console.log(`[CHECK 6] Promotion Selected Count:`, AssignmentsComponent.promoteSelectedIds.size);
  if (AssignmentsComponent.promoteSelectedIds.size !== 24) throw new Error("Expected 24 students pre-selected for promotion");

  // Mock target level selection to 'Year 3 - Semester I'
  global.document.getElementById = (id) => {
    if (id === 'promote-target-level') return { value: 'Year 3 - Semester I' };
    return {
      classList: { add: () => {}, remove: () => {}, contains: () => false },
      innerHTML: '',
      innerText: '',
      value: '',
      setAttribute: () => {},
      getAttribute: () => null
    };
  };

  await AssignmentsComponent.executePromoteCohort();

  const promotedStd = AssignmentsComponent.currentRoster[0];
  console.log(`[CHECK 6] Promoted Student Placement Status:`, promotedStd.placement_status);
  console.log(`[CHECK 6] Promoted Student Year Level:`, promotedStd.year_level);
  if (!promotedStd.placement_status.includes('Year 3 - Semester I')) {
    throw new Error("Expected student status to reflect Year 3 - Semester I promotion");
  }
  if (promotedStd.year_level !== 'Year 3') {
    throw new Error("Expected student year_level to be 'Year 3'");
  }

  console.log("\n🎉 ALL 3-TIER PROGRESSION AND MANUAL PROMOTION TESTS PASSED SUCCESSFULLY! 🎉");
}

runTest().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});
