/**
 * test_batch_progression_order.js
 * Comprehensive Verification of:
 * 1. Freshman College sending student list to Degree College (Sem II)
 * 2. Degree College receiving the student list from Freshman Studies
 * 3. Degree College sending student list to Degree Department (Year 2+)
 * 4. Department receiving the student list as a PERMANENT CONSTANT COHORT
 * 5. Cohort is strictly distinguished by Batch (Batch 2015, Batch 2016)
 * 6. Department promotes cohort semester-to-semester with NO re-uploading
 */

const fs = require('fs');

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
const stateCode = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
eval(stateCode + '\nglobal.State = State;');

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
State.showToast = (msg) => console.log('  [TOAST]', msg);

const assignCode = fs.readFileSync('clo_system/static/js/components/assignments.js', 'utf8');
eval(assignCode + '\nglobal.AssignmentsComponent = AssignmentsComponent;');

async function runTest() {
  console.log("🧪 Starting University Student List Progression & Constant Batch Test Suite...\n");

  // Step 1: Check Freshman College Intake
  State.selectedCollege = State.colleges.find(c => c.id === 'col_freshman_dbu');
  await AssignmentsComponent.render();

  console.log("[STEP 1] Verifying Freshman Admissions Intake...");
  console.log("  Freshman Context Active?", AssignmentsComponent.isFreshmanContext());
  console.log("  Freshman Roster Count:", AssignmentsComponent.currentRoster.length);
  if (!AssignmentsComponent.isFreshmanContext()) throw new Error("Expected Freshman Context");
  if (AssignmentsComponent.currentRoster.length !== 48) throw new Error("Expected 48 Freshman Students");

  // Verify all freshman students have a batch
  const allHaveBatch = AssignmentsComponent.currentRoster.every(s => s.batch === '2015');
  console.log("  All Freshman students tagged with Batch 2015?", allHaveBatch);
  if (!allHaveBatch) throw new Error("Expected all freshman students to have batch: '2015'");

  // Step 2: Freshman Sends Student List to College of Computing (Semester II)
  console.log("\n[STEP 2] Freshman College Sends Student List to College of Computing & Technology...");
  AssignmentsComponent.forwardTargetMode = 'to_college';
  AssignmentsComponent.forwardSelectedIds.clear();

  // Pick 24 Natural Science students from Batch 2015
  AssignmentsComponent.freshmanRoster.filter(s => s.stream === 'Natural Science').forEach(s => {
    AssignmentsComponent.forwardSelectedIds.add(s.student_number);
  });
  console.log(`  Selected ${AssignmentsComponent.forwardSelectedIds.size} Natural Science students (Batch 2015) to send to College.`);

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

  // Step 3: College of Computing receives the student list
  console.log("\n[STEP 3] College of Computing & Technology Receives Student List for Semester II...");
  AssignmentsComponent.onCollegeChange('col_computing_dbu');

  console.log("  Is College Common Context?", AssignmentsComponent.isCollegeCommonContext());
  if (!AssignmentsComponent.isCollegeCommonContext()) throw new Error("Expected College Common Context");

  const collegeRoster = AssignmentsComponent.currentRoster;
  console.log("  College Sem II Cohort Count:", collegeRoster.length);
  if (collegeRoster.length !== 24) throw new Error("Expected 24 students received at College level");

  const collegeBatchConstant = collegeRoster.every(s => s.batch === '2015');
  console.log("  Are all received students distinguished by Batch 2015?", collegeBatchConstant);
  if (!collegeBatchConstant) throw new Error("Expected all college students to retain Batch 2015");

  console.log("  Sample College Student Status:", collegeRoster[0].placement_status);
  if (!collegeRoster[0].placement_status.includes('Freshman Sem II')) {
    throw new Error("Expected placement_status to indicate Freshman Sem II");
  }

  // Step 4: College of Computing Sends Student List to Department of Software Engineering
  console.log("\n[STEP 4] College of Computing Sends Student List to Department of Software Engineering...");
  AssignmentsComponent.forwardTargetMode = 'to_dept';
  AssignmentsComponent.forwardSelectedIds.clear();

  collegeRoster.forEach(s => {
    AssignmentsComponent.forwardSelectedIds.add(s.student_number);
  });
  console.log(`  Selected ${AssignmentsComponent.forwardSelectedIds.size} students (Batch 2015) to pass to Software Engineering.`);

  await AssignmentsComponent.executeForwardToDepartment();

  // Step 5: Department of Software Engineering Receives Student List as PERMANENT CONSTANT COHORT
  console.log("\n[STEP 5] Department Receives Permanent Constant Cohort...");
  AssignmentsComponent.onDepartmentChange('dept_software_eng');

  console.log("  Department Context Active?", AssignmentsComponent.selectedLevel === 'department');
  console.log("  Active Department:", State.selectedDepartment ? State.selectedDepartment.name : 'None');
  console.log("  Department Cohort Size:", AssignmentsComponent.currentRoster.length);
  if (AssignmentsComponent.currentRoster.length !== 24) throw new Error("Expected 24 students in Department Cohort");

  const deptStudents = AssignmentsComponent.currentRoster;
  const deptBatchConstant = deptStudents.every(s => s.batch === '2015');
  console.log("  Are all department students permanently tagged with Batch 2015?", deptBatchConstant);
  if (!deptBatchConstant) throw new Error("Expected all department students to have Batch 2015");

  const deptPermanentStatus = deptStudents.every(s => s.placement_status.includes('Permanent Cohort'));
  console.log("  Are all students enrolled as Permanent Cohort?", deptPermanentStatus);
  if (!deptPermanentStatus) throw new Error("Expected all students to have 'Permanent Cohort' status");

  // Step 6: Test Batch Filtering in Department (Distinguishing Batches)
  console.log("\n[STEP 6] Testing Batch Filter in Department Roster...");
  AssignmentsComponent.onBatchFilterChange('2015');
  console.log("  Filtered by Batch 2015, active filter:", AssignmentsComponent.selectedBatchFilter);
  if (AssignmentsComponent.selectedBatchFilter !== '2015') throw new Error("Expected selectedBatchFilter to be 2015");

  // Step 7: Continuous Semester-to-Semester Promotion (NO re-uploading)
  console.log("\n[STEP 7] Promoting Constant Cohort across Semesters (NO file re-upload)...");
  AssignmentsComponent.openPromoteModal();
  console.log("  Cohort Students Selected for Promotion:", AssignmentsComponent.promoteSelectedIds.size);
  if (AssignmentsComponent.promoteSelectedIds.size !== 24) throw new Error("Expected 24 students selected for promotion");

  // Promote from Year 2 to Year 3 Sem I
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

  const promotedStudent = AssignmentsComponent.currentRoster[0];
  console.log("  Promoted Student Placement Status:", promotedStudent.placement_status);
  console.log("  Promoted Student Year Level:", promotedStudent.year_level);
  console.log("  Promoted Student Batch remains intact?", promotedStudent.batch === '2015');

  if (!promotedStudent.placement_status.includes('Year 3 - Semester I')) throw new Error("Promotion status failed");
  if (promotedStudent.year_level !== 'Year 3') throw new Error("Year level update failed");
  if (promotedStudent.batch !== '2015') throw new Error("Batch was altered during promotion");

  console.log("\n🎉 ALL STUDENT LIST PROGRESSION & CONSTANT BATCH TESTS PASSED! 🎉");
}

runTest().catch(err => {
  console.error("TEST FAILED:", err);
  process.exit(1);
});

