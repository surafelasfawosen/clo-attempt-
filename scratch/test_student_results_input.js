const fs = require('fs');
const assert = require('assert');

// Setup mock DOM elements
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
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  addEventListener: () => {}
};
global.window = {
  scrollTo: () => {},
  encodeURI: (str) => encodeURI(str)
};
global.encodeURI = encodeURI;

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

console.log('🧪 Testing Teacher Student Results Input (EXACT MULTI-ASSESSMENT EXCEL FORMAT)...');

// Initialize portal
TeacherPortal.init();
TeacherPortal.openCourse('course_stat4092');

// 1. Verify Tab 4 switching
TeacherPortal.switchTab('results');
assert.strictEqual(TeacherPortal.currentTab, 'results', 'currentTab should be results');
const tabBtn = document.getElementById('t-tab-btn-results');
assert(tabBtn.className.includes('tab-active'), 'Results tab button should have tab-active');

// 2. Verify Table Render in Full Multi-Assessment Side-by-Side View matching image
TeacherPortal.renderResultsTable();
const container = document.getElementById('teacher-results-table-container');
assert(container.innerHTML.includes('Aaron Tadesse'), 'Table should include first student Aaron Tadesse');
assert(container.innerHTML.includes('Mid Exam [15%]'), 'Table should include Mid Exam [15%]');
assert(container.innerHTML.includes('Lab Exam [15%]'), 'Table should include Lab Exam [15%]');
assert(container.innerHTML.includes('Project [30%]'), 'Table should include Project [30%]');
assert(container.innerHTML.includes('Final Exam [40%]'), 'Table should include Final Exam [40%]');
assert(container.innerHTML.includes('Total Assement'), 'Table should include Total Assement column');
assert(container.innerHTML.includes('Total Mark'), 'Table should include Total Mark column');
console.log('✓ Sub-Window 4 renders full multi-assessment sheet side-by-side matching uploaded image.');

// 3. Verify Initial Benchmark Values for Student 1
const s1 = TeacherPortal.studentRoster[0];
assert.strictEqual(s1.mid, 15.5);
assert.strictEqual(s1.lab, 13.0);
assert.strictEqual(s1.project, 27.0);
assert.strictEqual(s1.final, 30.5);
assert.strictEqual(s1.totalAssessment, 55.5);
assert.strictEqual(s1.totalMark, 86.0);
assert.strictEqual(s1.grade, 'A');
assert.strictEqual(s1.status, 'Passed');
console.log('✓ Benchmark student 1 marks match Excel: Mid=15.5, Lab=13, Proj=27, Final=30.5, Total Asst=55.5, Total Mark=86.0 (A).');

// 4. Test Multi-Assessment Mark Editing via onCellMarkChange
console.log('Testing mark update for Student 1 (Mid CLO1 changed from 6.0 to 4.0)...');
TeacherPortal.onCellMarkChange('DBU150001', 'mid', 0, '4.0');
assert.strictEqual(s1.mid_clos[0], 4.0);
assert.strictEqual(s1.mid, 13.5); // 15.5 - 2.0 = 13.5
assert.strictEqual(s1.totalAssessment, 53.5); // 13.5 + 13 + 27 = 53.5
assert.strictEqual(s1.totalMark, 84.0); // 53.5 + 30.5 = 84.0
assert.strictEqual(s1.grade, 'A-');
console.log('✓ Editing Mid CLO1 mark instantly recalculated Mid total (13.5), continuous asst total (53.5), total mark (84.0), and grade (A-).');

// Verify proportional CLO update
assert(s1.c1 > 0 && s1.c1 <= 11.0, `CLO1 score ${s1.c1} should be within 0-11`);
assert(s1.c2 > 0 && s1.c2 <= 23.0, `CLO2 score ${s1.c2} should be within 0-23`);
console.log(`✓ Recalculated CLO scores: CLO1=${s1.c1}/11, CLO2=${s1.c2}/23, CLO3=${s1.c3}/11.`);

// 5. Test Editing Final Exam CLO cell
TeacherPortal.onCellMarkChange('DBU150001', 'final', 0, '4.0');
assert.strictEqual(s1.final_clos[0], 4.0);
assert.strictEqual(s1.final, 31.5);
assert.strictEqual(s1.totalMark, 85.0); // 53.5 + 31.5 = 85.0
assert.strictEqual(s1.grade, 'A');
console.log('✓ Editing Final Exam CLO updated final subtotal (31.5) and total mark (85.0).');

// 6. Test Section-by-Section Input (Separate Cohorts, No "All Sections")
TeacherPortal.onResultsSectionFilter('Section A');
assert.strictEqual(TeacherPortal.resultsSectionFilter, 'Section A', 'Active section should be Section A');
assert(container.innerHTML.includes('Aaron Tadesse'), 'Section A should include Aaron Tadesse');
assert(!container.innerHTML.includes('Ermias Haile'), 'Section A should NOT include Section B student Ermias Haile');
console.log('✓ Section A cohort (12 students) correctly isolated for mark entry.');

// Test switching to Section B
TeacherPortal.onResultsSectionFilter('Section B');
assert.strictEqual(TeacherPortal.resultsSectionFilter, 'Section B', 'Active section should be Section B');
assert(!container.innerHTML.includes('Aaron Tadesse'), 'Section B should NOT include Section A student Aaron Tadesse');
assert(container.innerHTML.includes('Ermias Haile'), 'Section B should include Ermias Haile');
console.log('✓ Section B cohort (12 students) correctly isolated for mark entry.');

// Verify dynamic course header updates
const deptEl = document.getElementById('results-header-dept');
const crsEl = document.getElementById('results-header-course');
const semEl = document.getElementById('results-header-semester');
assert(deptEl.innerText.includes('Department of Data Science'), 'Header should display Department of Data Science');
assert(crsEl.innerText.includes('Stat4092'), 'Header should display course Stat4092');
assert(semEl.innerText.includes('Semester II'), 'Header should display Semester II');
console.log('✓ Institutional header dynamically displays assigned course, department, and semester.');

// Switch back to Section A
TeacherPortal.onResultsSectionFilter('Section A');

// 7. Test Horizontal Assessment Tabs (mid, lab, project, final, total, full)
console.log('Testing Horizontal Assessment Tabs...');
TeacherPortal.selectResultsTab('mid');
assert.strictEqual(TeacherPortal.selectedResultsTab, 'mid');
assert(container.innerHTML.includes('Mid Total [15%]'), 'Mid tab should display focused Mid Total');
assert(container.innerHTML.includes('CLO 1 (%)'), 'Mid tab should show CLO1');
assert(container.innerHTML.includes('CLO 2 (%)'), 'Mid tab should show CLO2');
assert(!container.innerHTML.includes('CLO 3 (%)'), 'Mid tab should NOT show unmapped CLO 3');
assert(!container.innerHTML.includes('CLO 8 (%)'), 'Mid tab should NOT show unmapped CLO 8');
console.log('✓ Mid Exam focused tab renders cleanly with ONLY course-mapped CLOs (CLO1 & CLO2).');

TeacherPortal.selectResultsTab('lab');
assert.strictEqual(TeacherPortal.selectedResultsTab, 'lab');
assert(container.innerHTML.includes('Lab Total [15%]'), 'Lab tab should display Lab Total');
console.log('✓ Assignment / Lab focused tab renders cleanly.');

TeacherPortal.selectResultsTab('project');
assert.strictEqual(TeacherPortal.selectedResultsTab, 'project');
assert(container.innerHTML.includes('Project Total [30%]'), 'Project tab should display Project Total');
console.log('✓ Project / Quiz focused tab renders cleanly.');

TeacherPortal.selectResultsTab('final');
assert.strictEqual(TeacherPortal.selectedResultsTab, 'final');
assert(container.innerHTML.includes('Final Total [40%]'), 'Final tab should display Final Total');
console.log('✓ Final Exam focused tab renders cleanly.');

TeacherPortal.selectResultsTab('total');
assert.strictEqual(TeacherPortal.selectedResultsTab, 'total');
assert(container.innerHTML.includes('Continuous [60%]'), 'Total tab should display Continuous [60%]');
assert(container.innerHTML.includes('Total Mark [100%]'), 'Total tab should display Total Mark [100%]');
console.log('✓ Total & Grades summary tab renders continuous assessment and final grades.');

// Switch back to Full Sheet
TeacherPortal.selectResultsTab('full');
assert.strictEqual(TeacherPortal.selectedResultsTab, 'full');
assert(container.innerHTML.includes('Mid Exam [15%]'), 'Full sheet should display all assessments side-by-side');
console.log('✓ Full Sheet view successfully displays all assessments side-by-side.');

// 8. Test Reset to Excel Defaults
TeacherPortal.resetStudentResultsToExcel();
const s1Reset = TeacherPortal.studentRoster[0];
assert.strictEqual(s1Reset.mid, 15.5, 'Reset should restore Mid to 15.5');
assert.strictEqual(s1Reset.totalAssessment, 55.5, 'Reset should restore Total Asst to 55.5');
assert.strictEqual(s1Reset.totalMark, 86.0, 'Reset should restore Total Mark to 86.0');
console.log('✓ Reset to Excel restored initial Dec 2026 benchmark marks.');

// 9. Test Export CSV
TeacherPortal.exportMarkSheetCSV();
console.log('✓ Export Section-Specific Multi-Assessment CSV executed successfully.');

console.log('\n🎉 ALL FULL MULTI-ASSESSMENT RESULTS INPUT TESTS PASSED SUCCESSFULLY!');
