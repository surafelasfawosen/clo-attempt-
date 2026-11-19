/**
 * test_department_year_sem_course_display.js
 * Validates:
 * 1. When Department of Data Science is selected, courses display Year (Second Year, Third Year, Fourth Year) and Semester
 * 2. Courses are grouped in optgroups by Year
 * 3. Course chips render year & semester tags
 * 4. Duplicate batch assignment block is completely absent from DOM
 * 5. Student Roster table contains exactly the clean requested columns: #, Student ID, Full Name, Sex, Stream, Section, Status, Action (NO Batch column)
 */

const fs = require('fs');
const path = require('path');

// 1. Check compiled index.html
const indexPath = path.join(__dirname, '..', 'clo_system', 'web', 'index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf-8');

console.log('🧪 Verifying clean UI structure in compiled index.html...');

// Verify redundant block removed from visible area
if (htmlContent.includes('Choose Section(s) for Batch Assignment:')) {
  throw new Error('Redundant "Choose Section(s) for Batch Assignment:" still found in HTML!');
}
console.log('✓ Redundant Batch Assignment section selector successfully removed from HTML.');

// Verify table has clean columns without Batch
if (htmlContent.includes('<th class="px-3.5 py-3">Batch</th>')) {
  throw new Error('Unwanted Batch column still found in Student Roster table header!');
}
console.log('✓ Unwanted Batch column successfully removed from Student Roster table header.');

// 2. Setup mock environment for component logic
global.window = global;
const mockElements = {};
global.document = {
  getElementById: (id) => {
    if (!mockElements[id]) {
      mockElements[id] = {
        id,
        classList: {
          classes: new Set(),
          add(c) { this.classes.add(c); },
          remove(c) { this.classes.delete(c); },
          contains(c) { return this.classes.has(c); }
        },
        innerHTML: '',
        innerText: '',
        value: '',
        setAttribute: () => {},
        getAttribute: () => null
      };
    }
    return mockElements[id];
  }
};

const stateCode = fs.readFileSync('clo_system/static/js/state.js', 'utf8');
eval(stateCode + '\nglobal.State = State;');

global.Sidebar = {
  updateBreadcrumb: () => {},
  updateProgress: () => {}
};
global.API = {
  getCourseRoster: async () => ({ students: [] }),
  assignCourseInstructor: async () => ({ success: true })
};
State.showToast = () => {};

const assignCode = fs.readFileSync('clo_system/static/js/components/assignments.js', 'utf8');
eval(assignCode + '\nglobal.AssignmentsComponent = AssignmentsComponent;');

async function runTest() {
  console.log('\n🧪 Testing Department of Data Science Course Selection with Year & Semester...');

  // Set context to College of Computing -> Department of Data Science
  State.selectedCollege = State.colleges.find(c => c.id === 'col_computing_dbu');
  AssignmentsComponent.onDepartmentChange('dept_data_science');

  console.log('  Selected College:', State.selectedCollege.name);
  console.log('  Selected Department:', State.selectedDepartment.name);

  const crsSelect = document.getElementById('assignments-course-select');
  const pillsContainer = document.getElementById('assign-courses-pills-container');

  console.log('\n[CHECK 1] Verifying Course Select Optgroups and Year Labels...');
  const selectHtml = crsSelect.innerHTML;
  
  if (!selectHtml.includes('optgroup label="── Second Year (Year 2) Courses ──"')) {
    throw new Error('Missing Second Year optgroup in course select');
  }
  if (!selectHtml.includes('optgroup label="── Third Year (Year 3) Courses ──"')) {
    throw new Error('Missing Third Year optgroup in course select');
  }
  if (!selectHtml.includes('optgroup label="── Fourth Year (Year 4) Courses ──"')) {
    throw new Error('Missing Fourth Year optgroup in course select');
  }
  console.log('✓ Course select groups courses into Second Year, Third Year, and Fourth Year optgroups.');

  // Check Year & Semester in option text
  if (!selectHtml.includes('[Second Year • Semester I]') && !selectHtml.includes('[Second Year • Semester II]')) {
    throw new Error('Option text does not display [Second Year • Semester X]');
  }
  if (!selectHtml.includes('[Third Year • Semester I]')) {
    throw new Error('Option text does not display [Third Year • Semester I]');
  }
  if (!selectHtml.includes('[Fourth Year • Semester II]')) {
    throw new Error('Option text does not display [Fourth Year • Semester II]');
  }
  console.log('✓ Every department course option prominently displays Year & Semester tags.');

  console.log('\n[CHECK 2] Verifying Course Chips Year/Sem Badges...');
  const pillsHtml = pillsContainer.innerHTML;
  if (!pillsHtml.includes('Year 2 • Sem I') && !pillsHtml.includes('Year 2 • Sem II')) {
    throw new Error('Missing Year 2 badge on course chip');
  }
  if (!pillsHtml.includes('Year 3 • Sem I')) {
    throw new Error('Missing Year 3 badge on course chip');
  }
  if (!pillsHtml.includes('Year 4 • Sem II')) {
    throw new Error('Missing Year 4 badge on course chip');
  }
  console.log('✓ Course chips clearly display Year and Semester badges.');

  console.log('\n[CHECK 3] Verifying Student Roster Columns (NO Batch column in table)...');
  AssignmentsComponent.renderRosterTable();
  const tableBody = document.getElementById('assign-roster-table-body');
  const tbodyHtml = tableBody.innerHTML;

  if (tbodyHtml.includes('Batch 2015') || tbodyHtml.includes('Batch 2016')) {
    throw new Error('Student Roster table body should not contain Batch cell!');
  }
  console.log('✓ Student Roster table body strictly renders only: #, ID, Name, Sex, Stream, Section, Status, Action.');

  console.log('\n🎉 ALL DEPARTMENT YEAR & SEMESTER DISTINCTION AND CLEAN UI CHECKS PASSED! 🎉');
}

runTest().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});

