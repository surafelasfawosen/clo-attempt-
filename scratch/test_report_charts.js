const fs = require('fs');

// Mock DOM elements
const mockElements = {};
function createMockEl(id) {
  return {
    id,
    value: '',
    innerText: '',
    innerHTML: '',
    className: '',
    classList: {
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
global.window = {};

// Mock Chart.js
global.Chart = function(ctx, config) {
  this.ctx = ctx;
  this.config = config;
  this.destroy = function() {};
};

const stateJs = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
const teacherJs = fs.readFileSync('clo_system/static/js/teacher_portal.js', 'utf8');

eval(stateJs + '; global.State = State;');
eval(teacherJs + '; global.TeacherPortal = TeacherPortal;');

console.log('Testing TeacherPortal Report & Charts...');
TeacherPortal.renderReport();
console.log('Attainment chart created:', !!TeacherPortal.charts['attainment']);
console.log('Distribution chart created:', !!TeacherPortal.charts['distribution']);
console.log('Radar chart created:', !!TeacherPortal.charts['radar']);

// Check summary data
const tableHtml = document.getElementById('rep-summary-tbody').innerHTML;
if (!tableHtml.includes('CLO1') || !tableHtml.includes('NO • Gap') || !tableHtml.includes('YES • Attained')) {
  console.error('FAIL: Summary table does not match expected OBE attainment structure');
  process.exit(1);
}

// Test Search Filter
TeacherPortal.onRosterSearch('Abebe');
const tbody = document.getElementById('teacher-roster-tbody').innerHTML;
if (!tbody.includes('Abebe')) {
  console.error('FAIL: Roster search failed');
  process.exit(1);
}

console.log('✓ All Report, Chart, and Search tests passed successfully!');
