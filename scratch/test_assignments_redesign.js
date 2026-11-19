/**
 * scratch/test_assignments_redesign.js
 * Comprehensive validation of the overhauled Course Assignments interface:
 * 1. Single unified Course Staffing Workbench (no confusing mode bar / back buttons)
 * 2. Searchable/typeable teacher input + AI best-fit suggestion
 * 3. Actual cohort sections displayed (NO fake 0-student sections like C(0), D(0), G(0))
 * 4. Inline typeable quick-assign per section & batch multi-section assignment
 * 5. Clean, professional Student Roster header
 */

const fs = require('fs');
const path = require('path');

// 1. Verify HTML Structure in compiled clo_system/web/index.html
console.log('🧪 Checking compiled index.html for Course Assignments...');
const indexPath = path.join(__dirname, '..', 'clo_system', 'web', 'index.html');
const htmlContent = fs.readFileSync(indexPath, 'utf-8');

if (htmlContent.includes('assign-freshman-staffing-mode-bar')) {
  throw new Error('Confusing assign-freshman-staffing-mode-bar still found in compiled index.html');
}
console.log('✓ Confusing View Mode toggle bar successfully removed from HTML.');

if (!htmlContent.includes('id="assign-course-detail-container"')) {
  throw new Error('assign-course-detail-container missing from HTML');
}
console.log('✓ Direct Course Staffing Workbench container present.');

if (!htmlContent.includes('id="assign-teacher-search"')) {
  throw new Error('assign-teacher-search missing from HTML');
}
console.log('✓ Typeable/Searchable Teacher Input element present.');

if (!htmlContent.includes('id="assign-teachers-datalist"')) {
  throw new Error('assign-teachers-datalist missing from HTML');
}
console.log('✓ Row-level Teacher Autocomplete Datalist present.');

if (!htmlContent.includes('id="assign-sections-simple-list"')) {
  throw new Error('assign-sections-simple-list table present.');
}
console.log('✓ Section Allocation Table present.');

// 2. Setup mock environment for JS component testing
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
        checked: false
      };
    }
    return mockElements[id];
  },
  addEventListener: () => {}
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
State.showToast = (msg) => { console.log('  [TOAST]', msg); };

const assignCode = fs.readFileSync('clo_system/static/js/components/assignments.js', 'utf8');
eval(assignCode + '\nglobal.AssignmentsComponent = AssignmentsComponent;');

async function runTest() {
  console.log('\n🧪 Testing AssignmentsComponent Logic & Dynamic Section Allocation...');

  // Set active college to Freshman Studies and course to Anth1012 (Social Anthropology)
  State.selectedCollege = State.colleges.find(c => c.id === 'col_freshman_dbu');
  const anthCourse = State.courses.find(c => c.code === 'Anth1012') || State.courses[0];
  State.activeCourse = anthCourse;

  await AssignmentsComponent.render();

  console.log(`[CHECK 1] Active Course: ${State.activeCourse.code} (${State.activeCourse.title})`);

  // Verify AI Recommendation matches Social Anthropology specialist
  const aiInstName = document.getElementById('assign-ai-inst-name');
  console.log(`[CHECK 2] AI Recommended Instructor: ${aiInstName.innerText}`);
  if (!aiInstName.innerText.includes('Solomon Desta')) {
    throw new Error(`Expected Dr. Solomon Desta for Anthropology, got ${aiInstName.innerText}`);
  }
  console.log('✓ AI properly recommended Dr. Solomon Desta (PhD) for Social Anthropology.');

  // Verify sections only reflect the actual enrolled roster (Section A and Section B, NOT fake 0 sections)
  const sections = AssignmentsComponent.getCourseSections(anthCourse);
  console.log(`[CHECK 3] Supported Sections from actual student roster: ${sections.join(', ')}`);
  if (!sections.includes('Section A') || !sections.includes('Section B')) {
    throw new Error('Expected sections to include Section A and Section B');
  }
  if (sections.includes('Section G') || sections.includes('Section C')) {
    throw new Error('Sections should NOT include phantom 0-student sections by default');
  }
  console.log('✓ Course strictly displays actual cohort sections (Section A & Section B) without empty phantom sections.');

  // Test Typeable Search in top bar
  AssignmentsComponent.onTeacherSearch('Adimias');
  const dd = document.getElementById('assign-teacher-dropdown');
  if (!dd.innerHTML.includes('Adimias')) {
    throw new Error('Search for "Adimias" failed to populate dropdown');
  }
  console.log('✓ Top typeable teacher search dynamically filtered faculty by name.');

  // Test selecting teacher from top search
  AssignmentsComponent.selectTeacher('inst_adimias_w');
  const teacherSearch = document.getElementById('assign-teacher-search');
  if (!teacherSearch.value.includes('Adimias')) {
    throw new Error(`Expected search input to be updated with Adimias, got: ${teacherSearch.value}`);
  }
  console.log('✓ Selecting teacher updated search input and synchronized state.');

  // Test row-level typeable assignment: User types "Solomon" in Section A's row
  console.log('[CHECK 4] Testing typeable teacher assignment directly in Section A row...');
  AssignmentsComponent.onRowTeacherInput('Section A', 'Solomon');
  if (AssignmentsComponent.sectionInstructors[`${anthCourse.id}_Section A`] !== 'inst_solomon_d') {
    throw new Error('Section A not assigned to Dr. Solomon Desta via row typing');
  }
  console.log('✓ Section A successfully assigned to Dr. Solomon Desta by typing "Solomon" directly into table row!');

  // Test row-level typeable assignment: User types "Biruk" in Section B's row
  console.log('[CHECK 5] Testing typeable teacher assignment directly in Section B row...');
  AssignmentsComponent.onRowTeacherInput('Section B', 'Biruk');
  if (AssignmentsComponent.sectionInstructors[`${anthCourse.id}_Section B`] !== 'inst_biruk_a') {
    throw new Error('Section B not assigned to Dr. Biruk via row typing');
  }
  console.log('✓ Section B successfully assigned to Dr. Biruk Lemma by typing "Biruk" directly into table row!');

  // Test row-level clear/unassign by setting empty input
  AssignmentsComponent.onRowTeacherInput('Section B', '');
  if (AssignmentsComponent.sectionInstructors[`${anthCourse.id}_Section B`]) {
    throw new Error('Section B should be unassigned when typing empty value');
  }
  console.log('✓ Section B successfully unassigned when typing empty or clearing input.');

  // Test 1-Click Auto-Staff All Sections with Best Fit (assigns Dr. Solomon Desta to all actual sections)
  AssignmentsComponent.autoAssignBestMatchAll();
  sections.forEach(sec => {
    const assigned = AssignmentsComponent.sectionInstructors[`${anthCourse.id}_${sec}`];
    if (assigned !== 'inst_solomon_d') {
      throw new Error(`Section ${sec} was not assigned to best fit inst_solomon_d (got ${assigned})`);
    }
  });
  console.log('✓ 1-Click Auto-Staff successfully allocated best-fit faculty to all actual sections.');

  // Test Student Roster counts display
  AssignmentsComponent.renderRosterTable();
  const countBadge = document.getElementById('assign-roster-count-badge');
  console.log(`[CHECK 6] Student Roster Count Badge: ${countBadge.innerText}`);
  if (!countBadge.innerText.includes('Students') || !countBadge.innerText.includes('M')) {
    throw new Error(`Unexpected badge format: ${countBadge.innerText}`);
  }
  console.log('✓ Student Roster displays clean dynamic sex distribution badge.');

  console.log('\n🎉 ALL REFINED COURSE ASSIGNMENTS & TYPEABLE QUICK-ASSIGN TESTS PASSED! 🎉');
}

runTest().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
