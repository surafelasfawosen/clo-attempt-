const fs = require('fs');
const assert = require('assert');

// Mock DOM
const mockElements = {};
function createMockEl(id) {
  const classListSet = new Set();
  return {
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    className: '',
    classList: {
      contains: (cls) => classListSet.has(cls),
      add: (cls) => classListSet.add(cls),
      remove: (cls) => classListSet.delete(cls)
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

console.log('🧪 Testing openCourse functionality for both courses...');

TeacherPortal.init();

// Test opening course 1 (Stat4092)
TeacherPortal.openCourse('course_stat4092');
const homeView = document.getElementById('teacher-course-selection-view');
const courseView = document.getElementById('teacher-course-workspace');
const codeBadge = document.getElementById('active-course-code-badge');

assert.ok(homeView.classList.contains('hidden'), 'Home view must be hidden after opening course');
assert.ok(!courseView.classList.contains('hidden'), 'Course workspace must NOT be hidden after opening course');
assert.strictEqual(TeacherPortal.activeCourseId, 'course_stat4092');
assert.strictEqual(codeBadge.innerText, 'Stat4092');
console.log('✓ Course Stat4092 opens successfully with active badges and hidden home view.');

// Test opening course 2 (DaSc4061)
TeacherPortal.openCourse('course_dasc4061');
assert.strictEqual(TeacherPortal.activeCourseId, 'course_dasc4061');
assert.strictEqual(codeBadge.innerText, 'DaSc4061');
assert.ok(homeView.classList.contains('hidden'));
assert.ok(!courseView.classList.contains('hidden'));
console.log('✓ Course DaSc4061 opens successfully with active badges and hidden home view.');

// Test closing course back to home
TeacherPortal.closeCourse();
assert.ok(!homeView.classList.contains('hidden'), 'Home view must be visible after closeCourse');
assert.ok(courseView.classList.contains('hidden'), 'Course workspace must be hidden after closeCourse');
console.log('✓ closeCourse returns cleanly to course offerings selection view.');

// Test HTML file content for structured portfolio on top and new line for courses
const html = fs.readFileSync('clo_system/web/teacher.html', 'utf8');
assert.ok(html.includes('Assigned Course Offerings'), 'teacher.html must contain Assigned Course Offerings');
assert.ok(html.includes('Stat4092'), 'teacher.html must contain Stat4092');
assert.ok(html.includes('DaSc4061'), 'teacher.html must contain DaSc4061');

console.log('\n🎉 ALL OPEN COURSE & STYLING TESTS PASSED!');

