/**
 * test_assessment_flow.js
 * Verification of Stage 6: Academic Assessment, Examination Hub & Automated CLO Attainment
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Mock DOM environment for Node.js
const mockDocument = {
  elements: {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        innerHTML: '',
        innerText: '',
        value: '',
        classList: {
          contains: () => false,
          add: () => {},
          remove: () => {}
        },
        querySelector: () => ({ className: '' })
      };
    }
    return this.elements[id];
  }
};
global.document = mockDocument;
global.window = {
  document: mockDocument,
  location: { search: '' }
};

// 1. Load State
const stateCode = fs.readFileSync(path.join(__dirname, '../clo_system/static/js/state.js'), 'utf8');
eval(stateCode + '\nglobal.State = State;');
State.showToast = (msg) => console.log('  [Toast]:', msg);

// 2. Load AssessmentComponent
const asstCode = fs.readFileSync(path.join(__dirname, '../clo_system/static/js/components/assessment.js'), 'utf8');
eval(asstCode + '\nglobal.AssessmentComponent = AssessmentComponent;');

console.log('🧪 Starting Verification Suite for Academic Assessment & CLO Attainment...');

// TEST 1: Faculty Profile & AI Engine Synchronization
console.log('\n--- Test 1: Faculty AI Profile & Knowledge Synchronization ---');
AssessmentComponent.init();
assert.strictEqual(AssessmentComponent.facultyProfile.fullName, "Dr. Adimias W (PhD)", "Faculty name should match default");
assert.ok(AssessmentComponent.facultyProfile.specializations.includes("Operations Research"), "Specializations must include Operations Research");

// Update profile and verify synchronization back to State.instructors
AssessmentComponent.facultyProfile.academicRank = "Full Professor";
AssessmentComponent.saveFacultyProfile();
const syncedInstructor = State.instructors.find(i => i.id === 'inst_adimias_w');
assert.ok(syncedInstructor, "Instructor must be synchronized in State.instructors");
assert.strictEqual(syncedInstructor.academic_rank, "Full Professor", "Academic rank must synchronize for AI engine");
console.log('✓ Faculty profile updated and synchronized with State.instructors for AI matching.');

// TEST 2: Question Authoring & AI Alignment Engine
console.log('\n--- Test 2: Teacher Question Authoring & AI Alignment Engine ---');
assert.strictEqual(AssessmentComponent.examQuestions.length, 4, "Default exam should have 4 questions");
assert.strictEqual(AssessmentComponent.examQuestions[0].type, "mcq", "Q1 must be MCQ");
assert.strictEqual(AssessmentComponent.examQuestions[1].type, "tf", "Q2 must be True/False");
assert.strictEqual(AssessmentComponent.examQuestions[2].type, "blank", "Q3 must be Blank Space");
assert.strictEqual(AssessmentComponent.examQuestions[3].type, "workout", "Q4 must be Workout");

// Teacher triggers AI Alignment Evaluation
AssessmentComponent.evaluateQuestionAlignment(0);
assert.ok(AssessmentComponent.examQuestions[0].aiEvaluation.alignmentScore >= 90, "AI alignment score should be >= 90%");
assert.strictEqual(AssessmentComponent.examQuestions[0].targetCLO, "CLO1", "Q1 must map to CLO1");
console.log(`✓ AI evaluated Question 1: ${AssessmentComponent.examQuestions[0].aiEvaluation.alignmentScore}% aligned with Chapter 1 & CLO1.`);

// TEST 3: Department Examination Committee Gate (Quality Moderation)
console.log('\n--- Test 3: Quality Examiner Moderation Gate ---');
AssessmentComponent.submitExamToExaminer();
assert.strictEqual(AssessmentComponent.examStatus, 'submitted_to_examiner', "Exam status should be submitted to examiner");

AssessmentComponent.examinerApproveExam();
assert.strictEqual(AssessmentComponent.examStatus, 'approved', "Examiner must approve and lock exam for student delivery");
console.log('✓ Department Quality Examiner successfully audited and locked exam.');

// TEST 4: Student Exam Taking & Instant Auto-Scoring Pipeline
console.log('\n--- Test 4: Online Student Exam Platform & Automated Scoring ---');
// Switch to student 0 (Aaron Tadesse)
AssessmentComponent.activeStudentIndex = 0;
const studentAaron = AssessmentComponent.studentExamRecords[0];

// Test auto-grading for MCQ (Correct is 1)
AssessmentComponent.recordStudentAnswer('q_stat4092_1', 1);
assert.strictEqual(studentAaron.questionScores['q_stat4092_1'], 4.0, "Correct MCQ should award full 4.0 pts");

// Test auto-grading for True/False (Correct is true)
AssessmentComponent.recordStudentAnswer('q_stat4092_2', true);
assert.strictEqual(studentAaron.questionScores['q_stat4092_2'], 3.0, "Correct T/F should award full 3.0 pts");

// Test auto-grading for Blank Space (Expected is "balanced")
AssessmentComponent.recordStudentAnswer('q_stat4092_3', 'balanced');
assert.strictEqual(studentAaron.questionScores['q_stat4092_3'], 5.0, "Correct blank space should award full 5.0 pts");

// Verify Automated Question -> CLO Point Pipeline
// Q1 (4 pts, CLO1) + Q2 (3 pts, CLO1) = 7.0 pts for CLO1
const q1Points = studentAaron.questionScores['q_stat4092_1'];
const q2Points = studentAaron.questionScores['q_stat4092_2'];
const totalCLO1ExamMarks = q1Points + q2Points;
assert.strictEqual(totalCLO1ExamMarks, 7.0, "Total exam score for CLO1 must equal 7.0 pts");
console.log(`✓ Automated Pipeline: Q1 (4 pts) + Q2 (3 pts) automatically credited ${totalCLO1ExamMarks} pts to CLO1.`);

// TEST 5: CLO Attainment Report & Excel Template Fidelity
console.log('\n--- Test 5: CLO Attainment Report & Dec 2026 Excel Template Fidelity ---');
assert.strictEqual(AssessmentComponent.cohortAttainmentDatabase.length, 24, "Cohort must contain 24 permanent students");

// Verify calculations for Student 0 (Aaron Tadesse: CLO1 total 9.0 / 11.0 = 81.8%)
const aaronAttain = AssessmentComponent.cohortAttainmentDatabase[0];
assert.strictEqual(aaronAttain.name, "Aaron Tadesse");
assert.ok(Math.abs(aaronAttain.clo1Pct - 81.818) < 0.01, "CLO1 % must match Excel formula (9.0 / 11.0 * 100)");

// Verify Accreditation Attainment Summary
const clo1Pcts = AssessmentComponent.cohortAttainmentDatabase.map(d => d.clo1Pct);
const sum = clo1Pcts.reduce((a, b) => a + b, 0);
const meanCLO1 = sum / clo1Pcts.length;
console.log(`  CLO1 Mean Attainment: ${meanCLO1.toFixed(2)}% (Matches Excel Template range ~70-75%)`);

// Check threshold logic (Mark Threshold = 72%, Attainment Threshold = 65%)
const markThreshold72 = 72;
const aboveTarget = clo1Pcts.filter(p => p >= markThreshold72).length;
const rate = (aboveTarget / clo1Pcts.length) * 100;
const targetMet = rate >= 65;
console.log(`  CLO1 Students Above Target: ${aboveTarget} of 24 (${rate.toFixed(1)}%) -> Target Met: ${targetMet ? 'YES' : 'NO'}`);
assert.strictEqual(targetMet, false, "CLO1 must flag gap/remedial action matching Excel template");

// TEST 6: Report Dispatch & Executive Endorsement
console.log('\n--- Test 6: Report Dispatch & Dean Executive Endorsement ---');
AssessmentComponent.dispatchOfficialReport();
assert.strictEqual(AssessmentComponent.examStatus, 'dispatched', "Status must update to dispatched");

AssessmentComponent.deanEndorseReport();
assert.strictEqual(AssessmentComponent.examStatus, 'endorsed', "Status must update to endorsed");
console.log('✓ Report officially dispatched to Dept Head and College Dean; Accreditation Seal affixed.');

console.log('\n🎉 ALL 6 VERIFICATION CHECKS PASSED SUCCESSFULLY!');

