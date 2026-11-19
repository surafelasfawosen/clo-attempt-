/**
 * test_teacher_page.js
 * Verification of Dedicated Teacher Portal & Clean Main Page
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Verification Suite for Teacher Portal & Clean Architecture...');

// 1. Verify index.html is clean
const indexHtml = fs.readFileSync(path.join(__dirname, '../clo_system/web/index.html'), 'utf8');

// Check that top header does NOT have "Login as Teacher" floating button
assert.ok(!indexHtml.includes('Login as Teacher'), "index.html must NOT have floating 'Login as Teacher' button");
assert.ok(indexHtml.includes('teacher-login-screen'), "index.html must have official institutional login screen");

// Check that messy portal 3 and stage 6 were removed from index.html
assert.ok(!indexHtml.includes('portal-btn-assessment'), "index.html must NOT contain portal-btn-assessment");
assert.ok(!indexHtml.includes('id="stage-assessment"'), "index.html must NOT contain stage-assessment");
console.log('✓ index.html successfully unified into secure portal with institutional login gate and NO "Login as Teacher" button.');

// 2. Verify teacher.html exists and has all requested teacher tools
const teacherHtml = fs.readFileSync(path.join(__dirname, '../clo_system/web/teacher.html'), 'utf8');
assert.ok(teacherHtml.includes('teacher-account-select'), "teacher.html must have teacher account login/switcher");
assert.ok(teacherHtml.includes('t-tab-btn-courses'), "teacher.html must have Assigned Courses & Students tab");
assert.ok(teacherHtml.includes('t-tab-btn-authoring'), "teacher.html must have Exam & Question Studio tab");
assert.ok(teacherHtml.includes('t-tab-btn-profile'), "teacher.html must have Faculty AI Profile tab");
assert.ok(teacherHtml.includes('t-tab-btn-report'), "teacher.html must have CLO Attainment Report tab");
console.log('✓ teacher.html verified with dedicated Teacher Workspace, Profile, Courses, Question Studio & Report.');

// 3. Test TeacherPortal logic in Node.js
const mockDocument = {
  elements: {},
  addEventListener: () => {},
  getElementById(id) {
    if (!this.elements[id]) {
      this.elements[id] = {
        id,
        innerHTML: '',
        innerText: '',
        value: '',
        classList: { contains: () => false, add: () => {}, remove: () => {} },
        querySelector: () => ({ className: '' })
      };
    }
    return this.elements[id];
  }
};
global.document = mockDocument;
global.window = { document: mockDocument, location: { search: '' } };

const stateCode = fs.readFileSync(path.join(__dirname, '../clo_system/static/js/state.js'), 'utf8');
eval(stateCode + '\nglobal.State = State;');

const teacherJsCode = fs.readFileSync(path.join(__dirname, '../clo_system/static/js/teacher_portal.js'), 'utf8');
eval(teacherJsCode + '\nglobal.TeacherPortal = TeacherPortal;');

// Test Teacher Profile & Sync
TeacherPortal.init();
assert.strictEqual(TeacherPortal.profile.fullName, "Dr. Adimias W (PhD)");
TeacherPortal.profile.academicRank = "Full Professor";
TeacherPortal.saveProfile();
const inst = State.instructors.find(i => i.id === 'inst_adimias_w');
assert.strictEqual(inst.academic_rank, "Full Professor", "Teacher profile must sync to State.instructors for AI engine");
console.log('✓ Teacher Profile saves and feeds AI engine.');

// Test Question Authoring & AI Alignment
assert.strictEqual(TeacherPortal.questions.length, 4);
TeacherPortal.evaluateQuestionAlignment(0);
assert.ok(TeacherPortal.questions[0].aiEvaluation.alignmentScore >= 90);
console.log(`✓ AI Question Alignment verified: ${TeacherPortal.questions[0].aiEvaluation.alignmentScore}% match.`);

// Test Course and Student Cohort
assert.strictEqual(TeacherPortal.studentRoster.length, 24);
console.log('✓ Teacher assigned permanent cohort of 24 students verified.');

console.log('\n🎉 ALL TEACHER PORTAL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
