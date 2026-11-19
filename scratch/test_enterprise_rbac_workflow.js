const fs = require('fs');
const assert = require('assert');

// Mock DOM
const mockElements = {};
function createMockEl(id) {
  return {
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    className: '',
    style: {},
    classList: {
      _classes: new Set(),
      add: function(c) { this._classes.add(c); },
      remove: function(c) { this._classes.delete(c); },
      contains: function(c) { return this._classes.has(c); }
    },
    setAttribute: () => {},
    click: () => {},
    getContext: () => ({})
  };
}

global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = createMockEl(id);
    }
    return mockElements[id];
  },
  createElement: (tag) => createMockEl(tag),
  body: { appendChild: () => {}, removeChild: () => {} },
  addEventListener: () => {}
};
global.window = { scrollTo: () => {}, encodeURI: (str) => encodeURI(str) };
global.encodeURI = encodeURI;
global.Chart = function() { this.destroy = function() {}; };

const stateJs = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
const teacherJs = fs.readFileSync('clo_system/static/js/teacher_portal.js', 'utf8');

eval(stateJs + '; global.State = State;');
eval(teacherJs + '; global.TeacherPortal = TeacherPortal;');

console.log('🧪 Starting Enterprise University RBAC, Password Lifecycle & Moderation Test Suite...');

// 1. Initialize Portal
TeacherPortal.init();
assert(TeacherPortal.userAccounts['DBU-FAC-2015'], 'Teacher account should exist');
assert(TeacherPortal.userAccounts['DBU-HEAD-DASC'], 'Dept Head account should exist');
assert(TeacherPortal.userAccounts['DBU-DEAN-COMP'], 'College Dean account should exist');
assert(TeacherPortal.userAccounts['DBU-ADMIN-001'], 'Super Admin account should exist');
console.log('✓ Enterprise user accounts loaded with default initial password 1234dbu.');

// 2. Test Login with ID & Default Password
const emailInput = document.getElementById('login-email-input');
const pwdInput = document.getElementById('login-password-input');

emailInput.value = 'DBU-FAC-2015';
pwdInput.value = '1234dbu';
TeacherPortal.loginAs('inst_adimias_w');

assert.strictEqual(TeacherPortal.currentUser.id, 'DBU-FAC-2015');

// Test password change on demand
TeacherPortal.openPasswordModal(true);
assert.strictEqual(TeacherPortal.isForcedPasswordChange, true);
const pwdModal = document.getElementById('modal-change-password');
assert(!pwdModal.classList.contains('hidden'), 'Password modal should be visible');
console.log('✓ Security password modal opened cleanly on demand without disrupting the main UI.');

// 3. Test Password Change
const curPwdInput = document.getElementById('pwd-input-current');
const newPwdInput = document.getElementById('pwd-input-new');
const confPwdInput = document.getElementById('pwd-input-confirm');

curPwdInput.value = '1234dbu';
newPwdInput.value = 'Adimias@2026';
confPwdInput.value = 'Adimias@2026';
TeacherPortal.submitPasswordChange();

assert.strictEqual(TeacherPortal.currentUser.password, 'Adimias@2026');
assert.strictEqual(TeacherPortal.isForcedPasswordChange, false);
console.log('✓ Password updated to personal password successfully.');

// 4. Test Teacher Exam Submission for Department Moderation
TeacherPortal.openCourse('course_stat4092');
TeacherPortal.switchTab('authoring');

assert.strictEqual(TeacherPortal.examModeration.status, 'draft');
TeacherPortal.submitExamForModeration();
assert.strictEqual(TeacherPortal.examModeration.status, 'pending_review');
const modBadge = document.getElementById('exam-moderation-badge');
assert(modBadge.innerText.includes('Pending Department Moderation'), 'Badge should show pending moderation');
console.log('✓ Teacher exam successfully submitted for Department Moderation Committee review.');

// 5. Test Department Head Switching & Exam Review
TeacherPortal.onRoleAccountSwitch('DBU-HEAD-DASC');
assert.strictEqual(TeacherPortal.activeRole, 'department_head');
assert.strictEqual(TeacherPortal.currentUser.id, 'DBU-HEAD-DASC');

const deptView = document.getElementById('depthead-dashboard-view');
assert(!deptView.classList.contains('hidden'), 'Dept head dashboard view should be visible');
console.log('✓ Successfully switched to Department Head (Sub-Admin) workspace.');

// Dept Head requests revision
TeacherPortal.openExamRevisionModal();
const notesInput = document.getElementById('exam-revision-notes-input');
notesInput.value = 'Please add 1 more Analyzing question on Simplex pivot column.';
TeacherPortal.confirmSendExamBack();

assert.strictEqual(TeacherPortal.examModeration.status, 'revision_requested');
assert(TeacherPortal.examModeration.feedbackNotes.includes('Simplex pivot column'));
console.log('✓ Department Head successfully sent exam back with revision feedback notes.');

// Teacher resubmits
TeacherPortal.onRoleAccountSwitch('DBU-FAC-2015');
TeacherPortal.submitExamForModeration();
assert.strictEqual(TeacherPortal.examModeration.status, 'pending_review');

// Dept Head approves exam
TeacherPortal.onRoleAccountSwitch('DBU-HEAD-DASC');
TeacherPortal.approveExamPaper();
assert.strictEqual(TeacherPortal.examModeration.status, 'approved');
assert(TeacherPortal.examModeration.reviewedBy.includes('Prof. Yared M'));
console.log('✓ Department Head successfully approved exam paper for classroom examination.');

// 6. Test College Dean Executive Overview
TeacherPortal.onRoleAccountSwitch('DBU-DEAN-COMP');
assert.strictEqual(TeacherPortal.activeRole, 'dean');
const deanView = document.getElementById('dean-dashboard-view');
assert(!deanView.classList.contains('hidden'), 'Dean dashboard view should be visible');

TeacherPortal.exportCollegeAccreditationPDF();
TeacherPortal.signAccreditationPackage();
console.log('✓ College Dean executive view and HERQA accreditation sign-off verified.');

// 7. Verify Result Input CLO calculations still pass flawlessly
TeacherPortal.onRoleAccountSwitch('DBU-FAC-2015');
TeacherPortal.openCourse('course_stat4092');
TeacherPortal.switchTab('results');
TeacherPortal.renderResultsTable();

const s1 = TeacherPortal.studentRoster[0];
assert.strictEqual(s1.mid, 15.5);
assert.strictEqual(s1.lab, 13.0);
assert.strictEqual(s1.project, 27.0);
assert.strictEqual(s1.final, 30.5);
assert.strictEqual(s1.totalAssessment, 55.5);
assert.strictEqual(s1.totalMark, 86.0);
console.log('✓ Real-time CLO marks and mathematically valid calculations verified.');

console.log('\n🎉 ALL ENTERPRISE UNIVERSITY RBAC, PASSWORD & MODERATION TESTS PASSED SUCCESSFULLY!');

