const fs = require('fs');
const path = require('path');

// Mock browser DOM
const elements = {};
function getOrCreateEl(id) {
  if (!elements[id]) {
    elements[id] = {
      id,
      innerHTML: '',
      innerText: '',
      className: '',
      getContext: () => ({}),
      appendChild: () => {},
      removeChild: () => {},
      setAttribute: () => {},
      click: () => {}
    };
  }
  return elements[id];
}

global.window = global;
global.document = {
  getElementById: (id) => getOrCreateEl(id),
  addEventListener: () => {},
  createElement: (tag) => ({
    setAttribute: () => {},
    click: () => {},
    style: {}
  }),
  body: {
    appendChild: () => {},
    removeChild: () => {}
  }
};
global.Chart = function(ctx, config) {
  this.ctx = ctx;
  this.config = config;
  this.destroy = () => {};
};
global.URL = {
  createObjectURL: () => 'blob:mock',
  revokeObjectURL: () => {}
};
global.Blob = function(parts, opts) {
  this.parts = parts;
  this.opts = opts;
};

// Load State & teacher_portal.js
global.State = {
  courses: [{
    id: 'crs-stat4092',
    code: 'Stat4092',
    title: 'Operations Research and Optimization',
    credit_hours: 3,
    academic_year: 'Year 4',
    semester: 'Semester II'
  }]
};

const portalCode = fs.readFileSync(path.join(__dirname, '../clo_system/static/js/teacher_portal.js'), 'utf-8');
eval(portalCode);

console.log('Testing TeacherPortal.renderReport()...');
TeacherPortal.renderReport();

console.log('Testing TeacherPortal.renderCharts()...');
TeacherPortal.renderCharts();

// Verify KPIs populated
const kpiHtml = elements['rep-kpi-row'] ? elements['rep-kpi-row'].innerHTML : '';
console.log('KPI Row populated:', kpiHtml.includes('Cohort Size') && kpiHtml.includes('Mean Score'));

// Verify narratives populated
const narrativeHtml = elements['rep-narratives'] ? elements['rep-narratives'].innerHTML : '';
console.log('Narratives populated:', narrativeHtml.includes('Executive Attainment Summary'));

// Verify student table populated
const stuTbody = elements['rep-student-attain-tbody'] ? elements['rep-student-attain-tbody'].innerHTML : '';
const stuRows = (stuTbody.match(/<tr/g) || []).length;
console.log('Student Table rows count:', stuRows);

// Verify summary table populated
const sumTbody = elements['rep-summary-tbody'] ? elements['rep-summary-tbody'].innerHTML : '';
const sumRows = (sumTbody.match(/<tr/g) || []).length;
console.log('CLO Summary rows count:', sumRows);

// Verify audit table populated
const auditTbody = elements['rep-audit-tbody'] ? elements['rep-audit-tbody'].innerHTML : '';
const auditRows = (auditTbody.match(/<tr/g) || []).length;
console.log('Audit Trail rows count:', auditRows);

// Verify Charts registered
const chartKeys = Object.keys(TeacherPortal.charts || {});
console.log('Rendered chart keys:', chartKeys);

if (kpiHtml && narrativeHtml && stuRows === 24 && sumRows === 3 && auditRows >= 5 && chartKeys.length >= 4) {
  console.log('\n>>> ALL TEACHER REPORT UNIT TESTS PASSED SUCCESSFULLY! <<<');
} else {
  console.error('\n>>> SOME TESTS FAILED! Check outputs above. <<<');
  process.exit(1);
}
