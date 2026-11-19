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
    classList: {
      contains: () => false,
      add: () => {},
      remove: () => {}
    },
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
  addEventListener: () => {}
};
global.window = {
  scrollTo: () => {}
};
global.Chart = function() {
  this.destroy = () => {};
};

const stateJs = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
const teacherJs = fs.readFileSync('clo_system/static/js/teacher_portal.js', 'utf8');

eval(stateJs + '; global.State = State;');
eval(teacherJs + '; global.TeacherPortal = TeacherPortal;');

console.log('🧪 Testing Teacher Question Studio & CLO View Flow...');

// 1. Initialize portal
TeacherPortal.init();
assert.strictEqual(TeacherPortal.authoringMode, 'view_clos');
console.log('✓ Teacher portal initialized in view_clos mode.');

// 2. Test switching to Compose mode and selecting types
TeacherPortal.setAuthoringMode('compose');
assert.strictEqual(TeacherPortal.authoringMode, 'compose');

TeacherPortal.selectComposerType('mcq');
assert.strictEqual(TeacherPortal.composerState.type, 'mcq');
let dynamicHtml = document.getElementById('composer-dynamic-inputs').innerHTML;
assert.ok(dynamicHtml.includes('Multiple Choice Options'));
console.log('✓ MCQ type dynamic inputs rendered.');

TeacherPortal.selectComposerType('tf');
assert.strictEqual(TeacherPortal.composerState.type, 'tf');
dynamicHtml = document.getElementById('composer-dynamic-inputs').innerHTML;
assert.ok(dynamicHtml.includes('True (Statement is Mathematically Valid)'));
console.log('✓ True/False type dynamic inputs rendered.');

TeacherPortal.selectComposerType('blank');
assert.strictEqual(TeacherPortal.composerState.type, 'blank');
dynamicHtml = document.getElementById('composer-dynamic-inputs').innerHTML;
assert.ok(dynamicHtml.includes('Expected Blank Space Answer Key'));
console.log('✓ Fill in Blank type dynamic inputs rendered.');

TeacherPortal.selectComposerType('workout');
assert.strictEqual(TeacherPortal.composerState.type, 'workout');
dynamicHtml = document.getElementById('composer-dynamic-inputs').innerHTML;
assert.ok(dynamicHtml.includes('Step-by-Step Marking Rubric'));
console.log('✓ Workout Problem type dynamic inputs rendered.');

// 3. Test authoring a new question and saving
TeacherPortal.selectComposerType('mcq');
TeacherPortal.composerState.targetCLO = 'CLO1';
TeacherPortal.composerState.targetChapter = 'Chapter 1: Linear Programming & Simplex Method';
TeacherPortal.composerState.text = 'What is the primal-dual optimality condition in linear programming?';
TeacherPortal.composerState.points = 4;
TeacherPortal.composerState.bloomsLevel = 'Analyzing';

// Evaluate AI
TeacherPortal.evaluateComposerAI();
assert.ok(TeacherPortal.composerState.aiEvaluation.alignmentScore >= 90);
console.log(`✓ AI Evaluated question: ${TeacherPortal.composerState.aiEvaluation.alignmentScore}% aligned.`);

const countBefore = TeacherPortal.questions.length;
TeacherPortal.saveComposerQuestion();
assert.strictEqual(TeacherPortal.questions.length, countBefore + 1);
assert.strictEqual(TeacherPortal.authoringMode, 'view_clos', 'Must automatically switch to view_clos after saving');
console.log('✓ Question saved and automatically transitioned to View by CLO mode.');

// 4. Verify View by CLO container
TeacherPortal.renderQuestionsByCLO();
const cloViewHtml = document.getElementById('teacher-clos-view-container').innerHTML;
assert.ok(cloViewHtml.includes('CLO1'), 'Must render CLO1 container');
assert.ok(cloViewHtml.includes('CLO2'), 'Must render CLO2 container');
assert.ok(cloViewHtml.includes('CLO3'), 'Must render CLO3 container');
assert.ok(cloViewHtml.includes('primal-dual optimality condition'), 'New authored question must appear under CLO1');
console.log('✓ Questions successfully rendered organized by Course Learning Outcome (CLO).');

// 5. Verify Student Exam Preview
TeacherPortal.setAuthoringMode('preview_student');
assert.strictEqual(TeacherPortal.authoringMode, 'preview_student');
const examSheetHtml = document.getElementById('teacher-student-exam-sheet').innerHTML;
assert.ok(examSheetHtml.includes('Online Assessment Portal') || examSheetHtml.includes('Q1'));
assert.ok(examSheetHtml.includes('primal-dual optimality condition'));
console.log('✓ Student Exam Preview sheet renders all items with student inputs.');

console.log('\n🎉 ALL QUESTION STUDIO & CLO VIEW TESTS PASSED SUCCESSFULLY!');

