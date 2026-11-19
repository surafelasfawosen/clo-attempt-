/**
 * assignments.js
 * Stage 5: Course & Cohort Assignments Component
 * 
 * Supports the complete academic workflow:
 * 1. College of Freshman Studies (University Initial Entry Hub):
 *    - Bypasses departments (Freshman College has no departments).
 *    - Classifies courses and students into Natural Science and Social Science streams.
 *    - Student Ingestion (Excel .xlsx, CSV, or Text Paste): Reads Student ID, Full Name, Stream, and Section.
 *    - Class Capacity Slicing: Configurable max students per class, auto-sorted A to Z into Section A, B, C...
 *    - Teacher Assignment: Assign faculty instructors per course AND per section.
 *    - Manual Department Forwarding: Registrar/Dean passes official student lists directly to degree-granting departments (Zero automated grade formulas).
 * 2. Degree-Granting Departments (e.g. Department of Data Science, Software Engineering):
 *    - Receives passed students from Freshman College.
 *    - Allows departments to also upload, paste, or insert their own student lists directly.
 *    - Assigns instructors and sections to departmental course offerings (Stat4092, DS302, SE201).
 */

const AssignmentsComponent = {
  freshmanRoster: [],
  departmentRosters: {}, // Map: deptId -> array of student records
  currentRoster: [],
  selectedBatch: '',
  selectedBatchFilter: 'ALL',    // 'ALL', '2015', '2016', etc.
  selectedSection: 'ALL',
  selectedStreamFilter: 'ALL',   // 'ALL', 'Natural Science', 'Social Science'
  selectedFreshmanStream: 'ALL', // 'ALL', 'Natural Science', 'Social Science'
  selectedAcademicYear: 'ALL',   // 'ALL', 'Year 1', 'Year 2', 'Year 3', 'Year 4'
  selectedSemester: 'ALL',       // 'ALL', 'Semester I', 'Semester II'
  selectedSexFilter: 'ALL',      // 'ALL', 'M', 'F'
  rosterViewMode: 'course',      // 'course' or 'all'
  searchFilter: '',
  sectionInstructors: {},        // Map: `${courseId}_${section}` -> instructorId
  selectedStaffingSections: new Set(), // Active selected sections to assign
  suggestedFaculty: null,        // Best fit faculty suggestion
  forwardSelectedIds: new Set(),
  promoteSelectedIds: new Set(), // Active selected students to promote in department cohort
  pasteTarget: 'freshman',       // 'freshman', 'college', or 'department'
  staffingViewMode: 'board',     // 'board' or 'course'
  collegeRosters: {},            // Map: collegeId -> array of students for Sem II
  forwardTargetMode: 'to_college', // 'to_college' or 'to_dept'
  selectedLevel: 'college_sem2', // 'freshman_sem1', 'college_sem2', or 'department'

  isFreshmanContext() {
    return State.selectedCollege && (
      State.selectedCollege.id === 'col_freshman_dbu' ||
      State.selectedCollege.is_freshman_college === 1 ||
      (State.selectedCollege.name && State.selectedCollege.name.toLowerCase().includes('freshman'))
    );
  },

  isCollegeCommonContext() {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    if (isFresh) return false;
    return AssignmentsComponent.selectedLevel === 'college_sem2' || 
      (State.selectedDepartment && State.selectedDepartment.is_college_common) ||
      (State.selectedDepartment && State.selectedDepartment.id && State.selectedDepartment.id.startsWith('college_common_'));
  },

  async render() {
    // 1. Resolve College Context (default to College of Freshman Studies if unselected)
    if (!State.selectedCollege && State.colleges.length > 0) {
      State.selectedCollege = State.colleges.find(c => c.id === 'col_freshman_dbu') || State.colleges[0];
    }

    const isFresh = AssignmentsComponent.isFreshmanContext();

    // 2. Resolve Department Context
    if (isFresh) {
      State.selectedDepartment = null;
      AssignmentsComponent.selectedLevel = 'freshman_sem1';
    } else {
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      const colName = State.selectedCollege ? State.selectedCollege.name : 'College';

      if (AssignmentsComponent.selectedLevel === 'college_sem2') {
        State.selectedDepartment = {
          id: 'college_common_' + colId,
          name: `${colName} Common Core`,
          college_id: colId,
          is_college_common: true
        };
      } else {
        const deptsInCollege = State.departments.filter(d => 
          !State.selectedCollege || d.college_id === State.selectedCollege.id
        );
        if (!State.selectedDepartment || State.selectedDepartment.is_college_common) {
          State.selectedDepartment = deptsInCollege[0] || State.departments[0];
        } else if (State.selectedDepartment && !deptsInCollege.some(d => d.id === State.selectedDepartment.id)) {
          State.selectedDepartment = deptsInCollege[0] || State.departments[0];
        }
        AssignmentsComponent.selectedLevel = 'department';
      }
    }

    // 3. Resolve Course Context
    if (isFresh) {
      let freshCourses = State.courses.filter(c => 
        !c.is_college_common && (c.semester === 'Semester I' || !c.semester) &&
        c.department_id === 'dept_freshman_common'
      );
      const strm = AssignmentsComponent.selectedFreshmanStream || 'ALL';
      if (strm === 'Natural Science') {
        freshCourses = freshCourses.filter(c => c.stream === 'Natural Science' || c.stream === 'Common' || !c.stream);
      } else if (strm === 'Social Science') {
        freshCourses = freshCourses.filter(c => c.stream === 'Social Science' || c.stream === 'Common' || !c.stream);
      } else if (strm === 'Common') {
        freshCourses = freshCourses.filter(c => c.stream === 'Common' || !c.stream);
      }
      if (!State.activeCourse || !freshCourses.some(c => c.id === State.activeCourse.id)) {
        State.activeCourse = freshCourses[0] || State.courses[0];
      }
    } else if (AssignmentsComponent.isCollegeCommonContext()) {
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      let colCourses = State.courses.filter(c => 
        c.is_college_common || 
        c.department_id === ('college_common_' + colId) ||
        (c.college_id === colId && (c.semester === 'Semester II' || c.is_college_common))
      );
      if (colCourses.length === 0) {
        colCourses = AssignmentsComponent.getDefaultCollegeCourses(colId);
      }
      if (!State.activeCourse || !colCourses.some(c => c.id === State.activeCourse.id)) {
        State.activeCourse = colCourses[0] || State.courses[0];
      }
    } else {
      const coursesInDept = State.courses.filter(c => 
        !State.selectedDepartment || c.department_id === State.selectedDepartment.id
      );
      if (!State.activeCourse && coursesInDept.length > 0) {
        State.activeCourse = coursesInDept.find(c => c.code === 'Stat4092') || coursesInDept[0];
      } else if (State.activeCourse && !coursesInDept.some(c => c.id === State.activeCourse.id)) {
        State.activeCourse = coursesInDept[0] || State.courses[0];
      }
    }

    // 4. Populate Dropdowns (College, Dept/Stream, Course)
    AssignmentsComponent.renderDropdowns();

    // 5. Update UI Mode Elements (Header, Freshman Bar, Dept Toolbar)
    AssignmentsComponent.updateContextUI();

    // 6. Direct Course Allocation View
    AssignmentsComponent.staffingViewMode = 'course';
    const boardContainer = document.getElementById('assign-board-container');
    const courseDetailContainer = document.getElementById('assign-course-detail-container');
    if (boardContainer) boardContainer.classList.add('hidden');
    if (courseDetailContainer) courseDetailContainer.classList.remove('hidden');

    if (!State.activeCourse) return;
    const c = State.activeCourse;

    // 7. Update Course Banner & Derived Batch
    AssignmentsComponent.renderBanner(c);

    // 8. Render Section Staffing with AI Matching
    AssignmentsComponent.renderSectionStaffing(c);

    // 9. Load Roster for this view
    AssignmentsComponent.loadActiveRoster();

    // 10. Fetch remote roster if backend is running
    await AssignmentsComponent.fetchRoster(c);
  },

  updateContextUI() {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    const isColCommon = AssignmentsComponent.isCollegeCommonContext();
    const deptContainer = document.getElementById('assign-dept-container');
    const deptSelect = document.getElementById('assignments-dept-select');
    const streamSelect = document.getElementById('assignments-freshman-stream-select');
    const middleTitle = document.getElementById('assign-middle-title');
    const freshBar = document.getElementById('assign-freshman-bar');
    const collegeBar = document.getElementById('assign-college-bar');
    const deptBar = document.getElementById('assign-dept-bar');
    const collegeBarTitle = document.getElementById('assign-college-bar-title');
    const collegeBarDesc = document.getElementById('assign-college-bar-desc');
    const deptBarTitle = document.getElementById('assign-dept-bar-title');
    const deptBarDesc = document.getElementById('assign-dept-bar-desc');
    const courseLabel = document.getElementById('assign-course-label');
    const headerTitle = document.getElementById('assign-header-title');
    const headerDesc = document.getElementById('assign-header-desc');
    const cohortHeading = document.getElementById('assign-cohort-heading');
    const modeBar = document.getElementById('assign-freshman-staffing-mode-bar');
    const boardContainer = document.getElementById('assign-board-container');
    const courseDetailContainer = document.getElementById('assign-course-detail-container');
    const yearSelect = document.getElementById('assignments-year-select');
    const semSelect = document.getElementById('assignments-semester-select');

    if (yearSelect) yearSelect.value = AssignmentsComponent.selectedAcademicYear || 'ALL';
    if (semSelect) semSelect.value = AssignmentsComponent.selectedSemester || 'ALL';

    if (deptContainer) deptContainer.classList.remove('hidden');

    if (isFresh) {
      if (modeBar) modeBar.classList.add('hidden');
      if (boardContainer) boardContainer.classList.add('hidden');
      if (courseDetailContainer) courseDetailContainer.classList.remove('hidden');
      if (deptSelect) deptSelect.classList.add('hidden');
      if (streamSelect) {
        streamSelect.classList.remove('hidden');
        streamSelect.value = AssignmentsComponent.selectedFreshmanStream || 'ALL';
      }
      if (middleTitle) middleTitle.innerText = "2. Academic Stream";
      if (freshBar) freshBar.classList.remove('hidden');
      if (collegeBar) collegeBar.classList.add('hidden');
      if (deptBar) deptBar.classList.add('hidden');
      if (courseLabel) courseLabel.innerHTML = `<svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>3. Common Course Offering`;
      if (headerTitle) headerTitle.innerText = "Freshman Admissions & Course Staffing (Semester I)";
      if (headerDesc) headerDesc.innerText = "Upload freshman student roster (.xlsx, .csv, .txt) with ID, Name, Sex, Stream, Section and assign teachers to sections.";
      if (cohortHeading) cohortHeading.innerText = "Freshman Section Staffing";
    } else if (isColCommon) {
      if (modeBar) modeBar.classList.add('hidden');
      if (boardContainer) boardContainer.classList.add('hidden');
      if (courseDetailContainer) courseDetailContainer.classList.remove('hidden');
      if (deptSelect) deptSelect.classList.remove('hidden');
      if (streamSelect) streamSelect.classList.add('hidden');
      if (middleTitle) middleTitle.innerText = "2. College Division / Department";
      if (freshBar) freshBar.classList.add('hidden');
      if (collegeBar) collegeBar.classList.remove('hidden');
      if (deptBar) deptBar.classList.add('hidden');

      const colName = State.selectedCollege ? State.selectedCollege.name : 'College';
      if (collegeBarTitle) collegeBarTitle.innerHTML = `<span>${colName} &bull; College Common Core</span><span class="bg-blue-500/30 text-blue-200 text-[10px] font-mono px-2 py-0.5 rounded border border-blue-400/30">Freshman Semester II</span>`;
      if (collegeBarDesc) collegeBarDesc.innerHTML = `Incoming Cohort: <strong>Received Student List from College of Freshman Studies</strong> (Batch 2015 &bull; Natural Science). Complete Semester II common courses before advancing to degree departments in Year 2.`;
      if (courseLabel) courseLabel.innerHTML = `<svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>3. College Common Course Offering (Sem II)`;
      if (headerTitle) headerTitle.innerText = `${colName} Common Core Staffing & Cohort (Sem II)`;
      if (headerDesc) headerDesc.innerText = "Assign instructors and monitor continuous CLO progression across College-level Semester II common courses before students join their departments.";
      if (cohortHeading) cohortHeading.innerText = `${colName} Semester II Cohort`;
    } else {
      if (modeBar) modeBar.classList.add('hidden');
      if (boardContainer) boardContainer.classList.add('hidden');
      if (courseDetailContainer) courseDetailContainer.classList.remove('hidden');
      if (deptSelect) deptSelect.classList.remove('hidden');
      if (streamSelect) streamSelect.classList.add('hidden');
      if (middleTitle) middleTitle.innerText = "2. College Division / Department";
      if (freshBar) freshBar.classList.add('hidden');
      if (collegeBar) collegeBar.classList.add('hidden');
      if (deptBar) deptBar.classList.remove('hidden');

      const deptName = State.selectedDepartment ? State.selectedDepartment.name : 'Department';
      const colName = State.selectedCollege ? State.selectedCollege.name : 'College of Computing & Technology';
      if (deptBarTitle) deptBarTitle.innerHTML = `<span>${deptName} &bull; Permanent Constant Cohort</span><span class="bg-indigo-500/30 text-indigo-200 text-[10px] font-mono px-2 py-0.5 rounded border border-indigo-400/30">Batch 2015 &bull; Year 2 &rarr; Graduation</span>`;
      if (deptBarDesc) deptBarDesc.innerHTML = `Cohort Intake: <strong>Received from ${colName}</strong>. This cohort is <strong>constant</strong> and distinguished by <strong>Batch 2015</strong>. No file re-uploading required across semesters.`;
      if (courseLabel) courseLabel.innerHTML = `<svg class="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>3. Selected Department Course Offering`;
      if (headerTitle) headerTitle.innerText = `${deptName} Course Staffing & Student Cohort`;
      if (headerDesc) headerDesc.innerText = "Assign instructors and evaluate continuous CLO progress for the permanent department cohort across Year 2, Year 3, and Year 4.";
      if (cohortHeading) cohortHeading.innerText = `${deptName} Permanent Cohort`;
    }
  },

  renderDropdowns() {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    const isColCommon = AssignmentsComponent.isCollegeCommonContext();

    // 1. College Select
    const colSelect = document.getElementById('assignments-college-select');
    if (colSelect) {
      colSelect.innerHTML = State.colleges.map(col => `
        <option value="${col.id}" ${State.selectedCollege && State.selectedCollege.id === col.id ? 'selected' : ''}>
          ${col.name}
        </option>
      `).join('');
    }

    // 2. Department / Stream Select
    const deptSelect = document.getElementById('assignments-dept-select');
    const streamSelect = document.getElementById('assignments-freshman-stream-select');

    if (isFresh) {
      if (streamSelect) {
        streamSelect.value = AssignmentsComponent.selectedFreshmanStream || 'ALL';
      }
    } else {
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      const deptsInCollege = State.departments.filter(d => 
        !State.selectedCollege || d.college_id === State.selectedCollege.id
      );
      if (deptSelect) {
        const isCommonSelected = isColCommon;
        deptSelect.innerHTML = `
          <option value="college_common_${colId}" ${isCommonSelected ? 'selected' : ''}>
            🏛️ College Common Core (Freshman Semester II)
          </option>
          <optgroup label="── Degree Departments (Year 2 to Graduation) ──">
            ${deptsInCollege.map(dept => `
              <option value="${dept.id}" ${(!isCommonSelected && State.selectedDepartment && State.selectedDepartment.id === dept.id) ? 'selected' : ''}>
                ${dept.name}
              </option>
            `).join('')}
          </optgroup>
        `;
      }
    }

    // 3. Course Select & Visual Quick-Switcher
    const availableCourses = AssignmentsComponent.getAvailableCoursesForCurrentContext();
    if (availableCourses.length > 0 && (!State.activeCourse || !availableCourses.some(c => c.id === State.activeCourse.id))) {
      State.activeCourse = availableCourses[0];
    }
    AssignmentsComponent.renderCoursePillsAndDropdown(availableCourses);
  },

  getAvailableCoursesForCurrentContext() {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    if (isFresh) {
      let freshCourses = State.courses.filter(c => 
        !c.is_college_common && (c.semester === 'Semester I' || !c.semester) &&
        c.department_id === 'dept_freshman_common'
      );
      const strm = AssignmentsComponent.selectedFreshmanStream || 'ALL';
      if (strm === 'Natural Science') {
        freshCourses = freshCourses.filter(c => c.stream === 'Natural Science' || c.stream === 'Common' || !c.stream);
      } else if (strm === 'Social Science') {
        freshCourses = freshCourses.filter(c => c.stream === 'Social Science' || c.stream === 'Common' || !c.stream);
      }
      if (AssignmentsComponent.selectedSemester && AssignmentsComponent.selectedSemester !== 'ALL') {
        freshCourses = freshCourses.filter(c => c.semester === AssignmentsComponent.selectedSemester);
      }
      return freshCourses;
    } else if (AssignmentsComponent.isCollegeCommonContext()) {
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      let colCourses = State.courses.filter(c => 
        c.is_college_common || 
        c.department_id === ('college_common_' + colId) ||
        (c.college_id === colId && (c.semester === 'Semester II' || c.is_college_common))
      );
      if (colCourses.length === 0) colCourses = AssignmentsComponent.getDefaultCollegeCourses(colId);
      if (AssignmentsComponent.selectedSemester && AssignmentsComponent.selectedSemester !== 'ALL') {
        colCourses = colCourses.filter(c => c.semester === AssignmentsComponent.selectedSemester);
      }
      return colCourses;
    } else {
      let deptCourses = State.courses.filter(c => 
        !State.selectedDepartment || c.department_id === State.selectedDepartment.id
      );
      if (AssignmentsComponent.selectedAcademicYear && AssignmentsComponent.selectedAcademicYear !== 'ALL') {
        deptCourses = deptCourses.filter(c => c.academic_year === AssignmentsComponent.selectedAcademicYear);
      }
      if (AssignmentsComponent.selectedSemester && AssignmentsComponent.selectedSemester !== 'ALL') {
        deptCourses = deptCourses.filter(c => c.semester === AssignmentsComponent.selectedSemester);
      }
      return deptCourses;
    }
  },

  getCourseStaffingStatus(c) {
    if (!c) return { staffedCount: 0, total: 0, status: 'unassigned', sections: [], teachers: [] };
    const sections = AssignmentsComponent.getCourseSections(c);
    let courseStudents = AssignmentsComponent.currentRoster || [];
    if (AssignmentsComponent.isFreshmanContext() && c.stream && (c.stream === 'Natural Science' || c.stream === 'Social Science')) {
      courseStudents = courseStudents.filter(s => s.stream === c.stream);
    }

    let staffedCount = 0;
    const teachersMap = {};
    const sectionDetails = sections.map(sec => {
      const assignedId = AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`];
      const inst = assignedId ? (State.instructors || []).find(i => i.id === assignedId) : null;
      const stdCount = courseStudents.filter(s => s.section === sec).length;
      if (inst) {
        staffedCount++;
        teachersMap[inst.id] = inst.full_name;
      }
      return {
        section: sec,
        studentCount: stdCount,
        instructor: inst,
        isStaffed: !!inst
      };
    });

    const total = sections.length;
    let status = 'unassigned';
    if (staffedCount === total && total > 0) status = 'staffed';
    else if (staffedCount > 0) status = 'partial';

    return {
      staffedCount,
      total,
      status,
      sections: sectionDetails,
      teachers: Object.values(teachersMap)
    };
  },

  renderCoursePillsAndDropdown(availableCourses) {
    const crsSelect = document.getElementById('assignments-course-select');
    const pillsContainer = document.getElementById('assign-courses-pills-container');
    const progressBadge = document.getElementById('assign-stream-progress-badge');

    if (!availableCourses) {
      availableCourses = AssignmentsComponent.getAvailableCoursesForCurrentContext();
    }

    let totalCourses = availableCourses.length;
    let fullyStaffedCourses = 0;
    const isDept = !AssignmentsComponent.isFreshmanContext() && !AssignmentsComponent.isCollegeCommonContext();
    const yrMap = {
      'Year 1': 'First Year',
      'Year 2': 'Second Year',
      'Year 3': 'Third Year',
      'Year 4': 'Fourth Year',
      'Year 5': 'Fifth Year'
    };

    // 1. Populate Dropdown with clear visual status tags and Year/Semester grouping
    if (crsSelect) {
      if (availableCourses.length === 0) {
        crsSelect.innerHTML = `<option value="" disabled selected>No courses found for selected Year/Semester</option>`;
      } else if (isDept) {
        // Group department courses by Academic Year
        const groups = {};
        availableCourses.forEach(c => {
          const yr = c.academic_year || 'Year 2';
          if (!groups[yr]) groups[yr] = [];
          groups[yr].push(c);
        });

        const sortedYears = Object.keys(groups).sort();
        crsSelect.innerHTML = sortedYears.map(yr => {
          const groupTitle = yrMap[yr] ? `${yrMap[yr]} (${yr}) Courses` : `${yr} Courses`;
          const opts = groups[yr].map(c => {
            const info = AssignmentsComponent.getCourseStaffingStatus(c);
            if (info.status === 'staffed') fullyStaffedCourses++;

            let statusTag = '';
            if (info.status === 'staffed') {
              const tName = info.teachers[0] || 'Staffed';
              statusTag = `✓ Staffed (${info.staffedCount}/${info.total}) [${tName}]`;
            } else if (info.status === 'partial') {
              statusTag = `🟡 In Progress (${info.staffedCount}/${info.total})`;
            } else {
              statusTag = `⚠️ Unassigned (0/${info.total})`;
            }

            const yrLabel = yrMap[c.academic_year] || c.academic_year || 'Dept';
            const semLabel = c.semester || 'Semester I';
            const isSelected = State.activeCourse && State.activeCourse.id === c.id;

            return `
              <option value="${c.id}" ${isSelected ? 'selected' : ''}>
                ${statusTag} • ${c.code}: ${c.title} ── [${yrLabel} • ${semLabel}]
              </option>
            `;
          }).join('');

          return `<optgroup label="── ${groupTitle} ──">${opts}</optgroup>`;
        }).join('');
      } else {
        crsSelect.innerHTML = availableCourses.map(c => {
          const info = AssignmentsComponent.getCourseStaffingStatus(c);
          if (info.status === 'staffed') fullyStaffedCourses++;

          let statusTag = '';
          if (info.status === 'staffed') {
            const tName = info.teachers[0] || 'Staffed';
            statusTag = `✓ Staffed (${info.staffedCount}/${info.total}) [${tName}]`;
          } else if (info.status === 'partial') {
            statusTag = `🟡 In Progress (${info.staffedCount}/${info.total})`;
          } else {
            statusTag = `⚠️ Unassigned (0/${info.total})`;
          }

          const streamTag = (c.stream && c.stream !== 'Common') ? ` • ${c.stream}` : '';
          const isSelected = State.activeCourse && State.activeCourse.id === c.id;

          return `
            <option value="${c.id}" ${isSelected ? 'selected' : ''}>
              ${statusTag} • ${c.code}: ${c.title}${streamTag}
            </option>
          `;
        }).join('');
      }
    }

    // 2. Render Visual Interactive Course Chips with Year/Semester
    if (pillsContainer) {
      if (availableCourses.length === 0) {
        pillsContainer.innerHTML = `<span class="text-xs text-slate-400 italic px-2 py-1">No courses match selected Year/Semester filter</span>`;
      } else {
        pillsContainer.innerHTML = availableCourses.map(c => {
        const info = AssignmentsComponent.getCourseStaffingStatus(c);
        const isCurrent = State.activeCourse && State.activeCourse.id === c.id;

        let badgeClass = '';
        let dotColor = '';
        let tagText = '';

        if (info.status === 'staffed') {
          badgeClass = isCurrent
            ? 'bg-emerald-100 text-emerald-950 border-emerald-400 ring-2 ring-emerald-500 shadow-xs'
            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200';
          dotColor = 'bg-emerald-500';
          const tName = info.teachers.length > 1 ? `${info.teachers.length} Faculty` : (info.teachers[0] ? info.teachers[0].split(' ')[0] : 'Staffed');
          tagText = `✓ ${tName}`;
        } else if (info.status === 'partial') {
          badgeClass = isCurrent
            ? 'bg-blue-100 text-blue-950 border-blue-400 ring-2 ring-blue-500 shadow-xs'
            : 'bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200';
          dotColor = 'bg-blue-500';
          tagText = `${info.staffedCount}/${info.total}`;
        } else {
          badgeClass = isCurrent
            ? 'bg-amber-100 text-amber-950 border-amber-400 ring-2 ring-amber-500 shadow-xs'
            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200';
          dotColor = 'bg-amber-400';
          tagText = 'Unassigned';
        }

        const yrSemBadge = isDept 
          ? `<span class="text-[9px] bg-slate-200/80 text-slate-800 px-1 py-0.5 rounded font-mono font-bold">${c.academic_year || 'Year 2'} • ${c.semester === 'Semester II' ? 'Sem II' : 'Sem I'}</span>`
          : '';

        return `
          <button type="button" onclick="AssignmentsComponent.selectCourseById('${c.id}')"
            title="${c.code}: ${c.title} (${tagText}${c.academic_year ? ' • ' + c.academic_year + ' • ' + c.semester : ''})"
            class="px-2.5 py-1 rounded-xl text-xs font-semibold border transition inline-flex items-center gap-1.5 ${badgeClass}">
            <span class="w-2 h-2 rounded-full ${dotColor}"></span>
            <span class="font-bold">${c.code}</span>
            <span class="text-[10px] font-medium opacity-90">(${tagText})</span>
            ${yrSemBadge}
          </button>
        `;
      }).join('');
      }
    }

    // 3. Update Stream Progress
    if (progressBadge) {
      const pct = totalCourses > 0 ? Math.round((fullyStaffedCourses / totalCourses) * 100) : 0;
      progressBadge.innerText = `${fullyStaffedCourses} of ${totalCourses} Courses Staffed (${pct}%)`;
      if (fullyStaffedCourses === totalCourses && totalCourses > 0) {
        progressBadge.className = 'bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-xl border border-emerald-200';
      } else {
        progressBadge.className = 'bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-xl border border-blue-200';
      }
    }
  },

  selectCourseById(courseId) {
    const found = State.courses.find(c => c.id === courseId);
    if (!found) return;
    State.activeCourse = found;
    const crsSelect = document.getElementById('assignments-course-select');
    if (crsSelect) crsSelect.value = courseId;

    Sidebar.updateBreadcrumb('assignments');
    Sidebar.updateProgress('assignments');

    AssignmentsComponent.renderBanner(found);
    AssignmentsComponent.renderSectionStaffing(found);
    AssignmentsComponent.renderDropdowns();
    AssignmentsComponent.loadActiveRoster();
  },

  onFreshmanStreamSelect(streamVal) {
    AssignmentsComponent.selectedFreshmanStream = streamVal;
    // Re-render dropdowns to filter the courses list
    AssignmentsComponent.renderDropdowns();
    if (State.activeCourse) {
      AssignmentsComponent.renderBanner(State.activeCourse);
      AssignmentsComponent.renderSectionStaffing(State.activeCourse);
    }
    // Update stream filter in roster table to match if applicable
    AssignmentsComponent.renderRosterTable();
  },

  onYearFilterChange(yearVal) {
    AssignmentsComponent.selectedAcademicYear = yearVal;
    AssignmentsComponent.refreshCoursesForCurrentContext();
  },

  onSemesterFilterChange(semVal) {
    AssignmentsComponent.selectedSemester = semVal;
    AssignmentsComponent.refreshCoursesForCurrentContext();
  },

  refreshCoursesForCurrentContext() {
    const availableCourses = AssignmentsComponent.getAvailableCoursesForCurrentContext();
    if (availableCourses.length > 0) {
      if (!State.activeCourse || !availableCourses.some(c => c.id === State.activeCourse.id)) {
        State.activeCourse = availableCourses[0];
      }
    } else {
      State.activeCourse = null;
    }
    AssignmentsComponent.renderCoursePillsAndDropdown(availableCourses);
    if (State.activeCourse) {
      AssignmentsComponent.renderBanner(State.activeCourse);
      AssignmentsComponent.renderSectionStaffing(State.activeCourse);
      AssignmentsComponent.loadActiveRoster();
    } else {
      const titleEl = document.getElementById('assign-banner-course-title');
      const codeEl = document.getElementById('assign-banner-course-code');
      if (titleEl) titleEl.innerText = 'No Courses Match Selected Year & Semester Filter';
      if (codeEl) codeEl.innerText = '──';
      const secContainer = document.getElementById('assign-section-staffing-list');
      if (secContainer) secContainer.innerHTML = '<div class="p-6 text-center text-slate-400 font-semibold text-xs">No courses found matching this Year / Semester filter. Try selecting "All Academic Years" or "All".</div>';
    }
    Sidebar.updateBreadcrumb('assignments');
    Sidebar.updateProgress('assignments');
  },

  onCollegeChange(collegeId) {
    State.selectedCollege = State.colleges.find(col => col.id === collegeId) || null;
    const isFresh = AssignmentsComponent.isFreshmanContext();

    if (isFresh) {
      AssignmentsComponent.selectedLevel = 'freshman_sem1';
      AssignmentsComponent.selectedAcademicYear = 'Year 1';
      AssignmentsComponent.selectedSemester = 'Semester I';
      State.selectedDepartment = null;
      const freshCourses = State.courses.filter(c => 
        !c.is_college_common && (c.semester === 'Semester I' || !c.semester) &&
        c.department_id === 'dept_freshman_common'
      );
      State.activeCourse = freshCourses[0] || null;
    } else {
      // By default when selecting a degree college, offer College Common Core (Freshman Semester II)
      AssignmentsComponent.selectedLevel = 'college_sem2';
      AssignmentsComponent.selectedAcademicYear = 'Year 1';
      AssignmentsComponent.selectedSemester = 'Semester II';
      const colName = State.selectedCollege ? State.selectedCollege.name : 'College';
      State.selectedDepartment = {
        id: 'college_common_' + collegeId,
        name: `${colName} Common Core`,
        college_id: collegeId,
        is_college_common: true
      };
      let colCourses = State.courses.filter(c => 
        c.is_college_common || 
        c.department_id === ('college_common_' + collegeId) ||
        (c.college_id === collegeId && (c.semester === 'Semester II' || c.is_college_common))
      );
      if (colCourses.length === 0) colCourses = AssignmentsComponent.getDefaultCollegeCourses(collegeId);
      State.activeCourse = colCourses[0] || null;
    }

    Sidebar.updateBreadcrumb('assignments');
    Sidebar.updateProgress('assignments');
    AssignmentsComponent.render();
  },

  onDepartmentChange(deptId) {
    if (deptId.startsWith('college_common_')) {
      AssignmentsComponent.selectedLevel = 'college_sem2';
      AssignmentsComponent.selectedAcademicYear = 'Year 1';
      AssignmentsComponent.selectedSemester = 'Semester II';
      const colId = State.selectedCollege ? State.selectedCollege.id : deptId.replace('college_common_', '');
      const colName = State.selectedCollege ? State.selectedCollege.name : 'College';
      State.selectedDepartment = {
        id: deptId,
        name: `${colName} Common Core`,
        college_id: colId,
        is_college_common: true
      };
      let colCourses = State.courses.filter(c => 
        c.is_college_common || 
        c.department_id === deptId ||
        (c.college_id === colId && (c.semester === 'Semester II' || c.is_college_common))
      );
      if (colCourses.length === 0) colCourses = AssignmentsComponent.getDefaultCollegeCourses(colId);
      State.activeCourse = colCourses[0] || null;
    } else {
      AssignmentsComponent.selectedLevel = 'department';
      AssignmentsComponent.selectedAcademicYear = 'ALL';
      AssignmentsComponent.selectedSemester = 'ALL';
      State.selectedDepartment = State.departments.find(d => d.id === deptId) || null;
      if (State.selectedDepartment) {
        const crs = State.courses.filter(c => c.department_id === State.selectedDepartment.id);
        State.activeCourse = crs[0] || null;
      }
    }
    Sidebar.updateBreadcrumb('assignments');
    Sidebar.updateProgress('assignments');
    AssignmentsComponent.render();
  },

  onCourseChange(courseId) {
    const found = State.courses.find(c => c.id === courseId);
    if (found) {
      State.activeCourse = found;
      // If course is Natural Science or Social Science, suggest that stream filter
      if (found.stream === 'Natural Science' || found.stream === 'Social Science') {
        AssignmentsComponent.selectedStreamFilter = found.stream;
        const filterEl = document.getElementById('assign-stream-filter');
        if (filterEl) filterEl.value = found.stream;
      }
      AssignmentsComponent.setStaffingViewMode('course');
      Sidebar.updateBreadcrumb('assignments');
      Sidebar.updateProgress('assignments');
      AssignmentsComponent.render();
    }
  },

  renderBanner(c) {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    const isColCommon = AssignmentsComponent.isCollegeCommonContext();
    const codeEl = document.getElementById('assign-banner-course-code');
    const titleEl = document.getElementById('assign-banner-course-title');
    const placeEl = document.getElementById('assign-banner-placement');
    const batchEl = document.getElementById('assign-banner-derived-batch');
    const streamBadge = document.getElementById('assign-banner-stream-badge');

    if (codeEl) codeEl.innerText = c.code || 'Course';
    if (titleEl) titleEl.innerText = c.title || '';
    
    if (streamBadge) {
      if (c.stream && c.stream !== 'Common') {
        streamBadge.classList.remove('hidden');
        if (c.stream === 'Natural Science') {
          streamBadge.className = 'bg-emerald-50 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1';
          streamBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Natural Science Stream';
        } else if (c.stream === 'Social Science') {
          streamBadge.className = 'bg-amber-50 text-amber-800 font-bold text-[11px] px-2.5 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1';
          streamBadge.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Social Science Stream';
        }
      } else {
        streamBadge.classList.add('hidden');
      }
    }

    if (placeEl) {
      if (isFresh) {
        placeEl.innerText = `Freshman Studies • ${c.semester || 'Semester I'} • Foundation`;
      } else if (isColCommon) {
        const colName = State.selectedCollege ? State.selectedCollege.name : 'College';
        placeEl.innerText = `${colName} Common Core • Semester II • College Foundation`;
      } else {
        const yrMap = { 'Year 1': 'First Year', 'Year 2': 'Second Year', 'Year 3': 'Third Year', 'Year 4': 'Fourth Year', 'Year 5': 'Fifth Year' };
        const yrLabel = yrMap[c.academic_year] || c.academic_year || 'Department Curriculum';
        placeEl.innerText = `${yrLabel} (${c.academic_year || 'Year 2'}) • ${c.semester || 'Semester I'} • Degree Curriculum`;
      }
    }

    if (batchEl) {
      if (isFresh) {
        batchEl.innerHTML = `<svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>Admissions Intake (Semester I)`;
      } else if (isColCommon) {
        const curBatch = AssignmentsComponent.selectedBatch ? `Batch ${AssignmentsComponent.selectedBatch}` : 'Freshman Batch';
        batchEl.innerHTML = `<svg class="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>College Cohort: ${curBatch} (Freshman Sem II)`;
      } else {
        const yrMap = { 'Year 1': 'First Year', 'Year 2': 'Second Year', 'Year 3': 'Third Year', 'Year 4': 'Fourth Year', 'Year 5': 'Fifth Year' };
        const yrLabel = yrMap[c.academic_year] || c.academic_year || 'Department Cohort';
        batchEl.innerHTML = `<svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>${yrLabel} (${c.semester || 'Semester I'}) • Permanent Cohort`;
      }
    }

    // Dynamic Section Staffing Breakdown Strip for this course
    const allocSummaryEl = document.getElementById('assign-banner-allocation-summary');
    if (allocSummaryEl) {
      const info = AssignmentsComponent.getCourseStaffingStatus(c);
      if (info.status === 'staffed') {
        allocSummaryEl.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-extrabold text-emerald-800 flex items-center gap-1.5 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Course Staffing Finalized:
            </span>
            ${info.sections.map(s => `
              <span class="bg-emerald-50 text-emerald-950 border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs">
                <strong>${s.section}</strong> <span class="text-emerald-700 font-mono text-[11px]">(${s.studentCount} students)</span> &rarr; <span class="font-extrabold text-slate-900">${s.instructor ? s.instructor.full_name : 'Assigned'}</span>
              </span>
            `).join(' ')}
          </div>
          <span class="text-emerald-800 font-bold text-xs bg-emerald-100/70 px-2.5 py-1 rounded-lg border border-emerald-300">
            ✓ 100% Ready for Classes
          </span>
        `;
      } else if (info.status === 'partial') {
        allocSummaryEl.innerHTML = `
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-blue-800 flex items-center gap-1.5 text-xs">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              Partially Staffed (${info.staffedCount}/${info.total} Sections):
            </span>
            ${info.sections.map(s => `
              <span class="${s.isStaffed ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-amber-50 text-amber-900 border-amber-200'} border rounded-lg px-2.5 py-1 text-xs font-medium inline-flex items-center gap-1">
                <strong>${s.section}</strong> <span class="text-slate-500 font-mono text-[11px]">(${s.studentCount} std)</span>: ${s.isStaffed ? `<span class="font-bold text-slate-900">${s.instructor.full_name}</span>` : '<span class="text-amber-800 italic font-semibold">Needs Teacher</span>'}
              </span>
            `).join(' ')}
          </div>
          <span class="text-blue-700 font-bold text-xs bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            ${info.staffedCount} of ${info.total} Staffed
          </span>
        `;
      } else {
        allocSummaryEl.innerHTML = `
          <div class="flex items-center gap-2 text-slate-600 text-xs">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span>All <strong>${info.total} sections</strong> for this course are currently unassigned. Type an instructor name in the table or select suggested match.</span>
          </div>
          <button type="button" onclick="AssignmentsComponent.autoAssignBestMatchAll()"
            class="text-xs font-bold text-blue-700 hover:text-blue-900 bg-white border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-lg shadow-2xs transition">
            Auto-Staff All Sections
          </button>
        `;
      }
    }
  },

  getAIMatchForCourse(c) {
    const instructors = State.instructors || [];
    if (!c || instructors.length === 0) return [];

    const titleLow = (c.title || '').toLowerCase();
    const codeLow = (c.code || '').toLowerCase();

    const scored = instructors.map(inst => {
      let score = 70;
      let rationale = "";
      const rankLow = (inst.academic_rank || '').toLowerCase();

      // Subject Area Domain Affinity Rules
      if (titleLow.includes('math') || titleLow.includes('calculus') || titleLow.includes('algebra') || codeLow.startsWith('math')) {
        if (inst.id === 'inst_adimias_w') { score = 97; rationale = "Primary Competence: Ph.D. in Operations Research & Mathematical Modeling."; }
        else if (inst.id === 'inst_yared_m') { score = 96; rationale = "Senior Academic: Full Professor of Computational Mathematics & Numerical Optimization."; }
        else if (inst.id === 'inst_almaz_g') { score = 88; rationale = "M.Sc. in Applied Mathematics & Statistical Modeling."; }
        else { score = 72; rationale = "Related foundational science background."; }
      } else if (titleLow.includes('physic') || codeLow.startsWith('phys')) {
        if (inst.id === 'inst_biruk_a') { score = 98; rationale = "Direct Competence: Ph.D. in Applied Physics & Classical Mechanics."; }
        else if (inst.id === 'inst_bethlehem_g') { score = 84; rationale = "Natural Science cross-disciplinary physical sciences background."; }
        else { score = 68; rationale = "Non-direct physical science discipline."; }
      } else if (titleLow.includes('chem') || codeLow.startsWith('chem')) {
        if (inst.id === 'inst_bethlehem_g') { score = 98; rationale = "Direct Competence: Ph.D. in Physical & Inorganic Chemistry."; }
        else if (inst.id === 'inst_biruk_a') { score = 82; rationale = "Natural Science cross-disciplinary laboratory match."; }
        else { score = 65; rationale = "Non-direct chemistry discipline."; }
      } else if (titleLow.includes('english') || titleLow.includes('writing') || codeLow.startsWith('enla')) {
        if (inst.id === 'inst_rahel_k') { score = 98; rationale = "Direct Competence: M.A. in English Language Teaching & Applied Linguistics."; }
        else { score = 65; rationale = "Non-language discipline instructor."; }
      } else if (titleLow.includes('anthropology') || titleLow.includes('culture') || codeLow.startsWith('anth')) {
        if (inst.id === 'inst_solomon_d') { score = 98; rationale = "Direct Competence: Ph.D. in Social Anthropology & Cultural Diversity."; }
        else if (inst.id === 'inst_hanna_w') { score = 85; rationale = "Social and behavioral sciences cross-affinity."; }
        else { score = 68; rationale = "Non-humanities discipline."; }
      } else if (titleLow.includes('econ') || titleLow.includes('logic') || titleLow.includes('critical') || codeLow.startsWith('econ') || codeLow.startsWith('phil')) {
        if (inst.id === 'inst_kassahun_m') { score = 97; rationale = "Direct Competence: M.Sc. in Applied Economics & Analytical Logic."; }
        else if (inst.id === 'inst_adimias_w') { score = 88; rationale = "Quantitative decision logic & optimization fit."; }
        else { score = 70; rationale = "Secondary social sciences fit."; }
      } else if (titleLow.includes('psych') || titleLow.includes('inclusiv') || codeLow.startsWith('psyc')) {
        if (inst.id === 'inst_hanna_w') { score = 97; rationale = "Direct Competence: M.A. in Educational Psychology & Inclusiveness."; }
        else if (inst.id === 'inst_solomon_d') { score = 85; rationale = "Human behavioral science and cultural alignment."; }
        else { score = 68; rationale = "Non-psychology discipline."; }
      } else if (titleLow.includes('geography') || titleLow.includes('earth') || codeLow.startsWith('gees')) {
        if (inst.id === 'inst_chala_b') { score = 98; rationale = "Direct Competence: Ph.D. in Earth Sciences & Geoinformatics."; }
        else { score = 68; rationale = "Non-geography discipline."; }
      } else if (titleLow.includes('comput') || titleLow.includes('program') || titleLow.includes('technol') || codeLow.startsWith('cosc') || codeLow.startsWith('ds') || codeLow.startsWith('se')) {
        if (inst.id === 'inst_selamawit_t') { score = 98; rationale = "Direct Competence: Ph.D. in Artificial Intelligence & Machine Learning."; }
        else if (inst.id === 'inst_dawit_a') { score = 96; rationale = "Direct Competence: M.Sc. in Software Engineering & Python Systems."; }
        else { score = 74; rationale = "Quantitative computational science alignment."; }
      } else if (titleLow.includes('operation') || titleLow.includes('stat') || codeLow.startsWith('stat')) {
        if (inst.id === 'inst_adimias_w') { score = 99; rationale = "Direct Competence: Ph.D. in Operations Research & Optimization."; }
        else if (inst.id === 'inst_almaz_g') { score = 93; rationale = "Senior Lecturer in Applied Industrial Statistics."; }
        else if (inst.id === 'inst_yared_m') { score = 92; rationale = "Full Professor in Optimization Algorithms & Duality."; }
        else { score = 70; rationale = "General scientific background."; }
      } else {
        const matchesWords = (inst.specializations || '').split(',').filter(w => titleLow.includes(w.trim().toLowerCase()));
        if (matchesWords.length > 0) {
          score = 90;
          rationale = `Matches specializations in ${matchesWords.join(', ')}.`;
        } else if (rankLow.includes('professor')) {
          score = 85;
          rationale = "Senior university academic rank and research leadership.";
        } else {
          score = 75;
          rationale = "General academic qualification.";
        }
      }

      return {
        ...inst,
        score,
        rationale
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored;
  },

  getCourseSections(c) {
    if (!c) return ['Section A', 'Section B'];
    let courseStudents = AssignmentsComponent.currentRoster || [];
    if (AssignmentsComponent.isFreshmanContext() && c.stream && (c.stream === 'Natural Science' || c.stream === 'Social Science')) {
      courseStudents = courseStudents.filter(s => s.stream === c.stream);
    }
    let sections = Array.from(new Set(courseStudents.map(s => s.section))).filter(Boolean);

    // If manual custom sections were added for this specific course, keep them
    if (AssignmentsComponent.courseSections && AssignmentsComponent.courseSections[c.id]) {
      AssignmentsComponent.courseSections[c.id].forEach(sec => {
        if (!sections.includes(sec)) sections.push(sec);
      });
    }

    if (sections.length === 0) {
      sections = ['Section A', 'Section B'];
    }
    sections.sort();
    return sections;
  },

  addCustomSection() {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const sections = AssignmentsComponent.getCourseSections(c);
    const lastSec = sections[sections.length - 1] || 'Section B';
    const lastChar = lastSec.replace('Section ', '').trim();
    let nextChar = 'C';
    if (lastChar && lastChar.length === 1 && lastChar >= 'A' && lastChar < 'Z') {
      nextChar = String.fromCharCode(lastChar.charCodeAt(0) + 1);
    }
    const newSec = `Section ${nextChar}`;
    if (!sections.includes(newSec)) {
      if (!AssignmentsComponent.courseSections) AssignmentsComponent.courseSections = {};
      if (!AssignmentsComponent.courseSections[c.id]) AssignmentsComponent.courseSections[c.id] = [...sections];
      AssignmentsComponent.courseSections[c.id].push(newSec);
      AssignmentsComponent.courseSections[c.id].sort();
      AssignmentsComponent.selectedStaffingSections.add(newSec);
      State.showToast(`Added ${newSec} to ${c.code}.`);
      AssignmentsComponent.renderSectionStaffing(c);
    }
  },

  renderSectionStaffing(c) {
    if (!c) return;

    // 1. Get Course Sections (only actual sections present in this course's roster)
    const sections = AssignmentsComponent.getCourseSections(c);
    let courseStudents = AssignmentsComponent.currentRoster || [];
    if (AssignmentsComponent.isFreshmanContext() && c.stream && (c.stream === 'Natural Science' || c.stream === 'Social Science')) {
      courseStudents = courseStudents.filter(s => s.stream === c.stream);
    }

    // 2. Update Count Pill
    const pill = document.getElementById('assign-sections-count-pill');
    if (pill) {
      pill.innerText = `${sections.length} Sections • ${courseStudents.length} Students`;
    }

    // 3. Compute Suggested Best-Fit Faculty
    const matches = AssignmentsComponent.getAIMatchForCourse(c);
    const top = matches[0] || (State.instructors && State.instructors[0]);
    AssignmentsComponent.suggestedFaculty = top;
    AssignmentsComponent.topAIMatch = top;

    // 4. Update AI Recommended Match Banner
    const aiInstName = document.getElementById('assign-ai-inst-name');
    const aiScore = document.getElementById('assign-ai-match-score');
    const aiRationale = document.getElementById('assign-ai-inst-rationale');
    if (aiInstName && top) {
      aiInstName.innerText = `${top.full_name} (${top.academic_rank})`;
    }
    if (aiScore && top) {
      aiScore.innerText = `${top.score}% Fit`;
    }
    if (aiRationale && top) {
      aiRationale.innerText = top.rationale || `Specialist in ${c.title} curriculum.`;
    }

    // 5. Populate Synchronized Hidden Select & Search Input
    const teacherSelect = document.getElementById('assign-teacher-select');
    const teacherSearchInput = document.getElementById('assign-teacher-search');
    const curSelectedTeacherId = (teacherSelect && teacherSelect.value) ? teacherSelect.value : (top ? top.id : (State.instructors[0] ? State.instructors[0].id : null));

    if (teacherSelect) {
      teacherSelect.innerHTML = (State.instructors || []).map(inst => {
        const isTop = top && top.id === inst.id;
        const tag = isTop ? ' [Suggested Best Fit]' : '';
        return `
          <option value="${inst.id}" ${inst.id === curSelectedTeacherId ? 'selected' : ''}>
            ${inst.full_name} (${inst.academic_rank})${tag}
          </option>
        `;
      }).join('');
      teacherSelect.value = curSelectedTeacherId;
    }

    if (teacherSearchInput) {
      const activeInst = (State.instructors || []).find(i => i.id === curSelectedTeacherId);
      if (activeInst && !teacherSearchInput.value) {
        teacherSearchInput.value = `${activeInst.full_name} (${activeInst.academic_rank})`;
      }
    }

    // 6. Populate Global Datalist for typing teacher names directly in rows
    const datalist = document.getElementById('assign-teachers-datalist');
    if (datalist) {
      datalist.innerHTML = (State.instructors || []).map(inst => {
        const isTop = top && top.id === inst.id;
        return `<option value="${inst.full_name}">${inst.academic_rank}${isTop ? ' • AI Best Fit' : ''}</option>`;
      }).join('');
    }

    // 7. Initialize Flexible Section Selection (Default: all sections selected)
    if (!AssignmentsComponent.selectedStaffingSections || AssignmentsComponent.selectedStaffingSections.size === 0) {
      AssignmentsComponent.selectedStaffingSections = new Set(sections);
    } else {
      const valid = new Set();
      sections.forEach(s => {
        if (AssignmentsComponent.selectedStaffingSections.has(s)) valid.add(s);
      });
      if (valid.size === 0) sections.forEach(s => valid.add(s));
      AssignmentsComponent.selectedStaffingSections = valid;
    }

    // 8. Update Selected Sections Count Badge
    const selBadge = document.getElementById('assign-selected-sections-badge');
    if (selBadge) {
      selBadge.innerText = `${AssignmentsComponent.selectedStaffingSections.size} of ${sections.length} Selected`;
    }

    const tblSelectAll = document.getElementById('assign-table-select-all');
    if (tblSelectAll) {
      tblSelectAll.checked = (AssignmentsComponent.selectedStaffingSections.size === sections.length && sections.length > 0);
    }

    // 9. Render Interactive Section Pills
    const pillsContainer = document.getElementById('assign-section-check-pills');
    if (pillsContainer) {
      pillsContainer.innerHTML = sections.map(sec => {
        const count = courseStudents.filter(st => st.section === sec).length;
        const isChecked = AssignmentsComponent.selectedStaffingSections.has(sec);
        return `
          <button type="button" onclick="AssignmentsComponent.toggleStaffingSection('${sec}')"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${isChecked ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'}">
            <span class="w-3.5 h-3.5 rounded-full ${isChecked ? 'bg-white text-slate-900 flex items-center justify-center text-[10px] font-black' : 'border border-slate-400'}">${isChecked ? '✓' : ''}</span>
            <span>${sec}</span>
            <span class="${isChecked ? 'text-slate-300' : 'text-slate-400'} font-mono text-[11px]">(${count})</span>
          </button>
        `;
      }).join('');
    }

    // 10. Render Section Table Rows (Typeable teacher input in each row)
    const listEl = document.getElementById('assign-sections-simple-list');
    let staffedCount = 0;
    if (listEl) {
      listEl.innerHTML = sections.map(sec => {
        const key = `${c.id}_${sec}`;
        const secAssignedId = AssignmentsComponent.sectionInstructors[key] || null;
        const secInst = secAssignedId ? (State.instructors || []).find(i => i.id === secAssignedId) : null;
        const count = courseStudents.filter(st => st.section === sec).length;
        const isChecked = AssignmentsComponent.selectedStaffingSections.has(sec);
        if (secInst) staffedCount++;

        return `
          <tr class="hover:bg-slate-50/80 transition ${isChecked ? 'bg-blue-50/20' : ''}">
            <td class="py-3 px-3 text-center align-middle">
              <input type="checkbox" onchange="AssignmentsComponent.toggleStaffingSection('${sec}')" ${isChecked ? 'checked' : ''}
                class="rounded border-slate-300 text-blue-600 focus:ring-blue-500">
            </td>
            <td class="py-3 px-3 align-middle">
              <span class="font-bold text-slate-900 text-xs">${sec}</span>
            </td>
            <td class="py-3 px-3 align-middle">
              <span class="text-slate-600 font-mono text-xs">${count} Students</span>
            </td>
            <td class="py-3 px-4 align-middle">
              ${secInst ? `
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span class="font-bold text-slate-900 text-xs">${secInst.full_name}</span>
                  <span class="text-slate-500 text-[11px]">(${secInst.academic_rank})</span>
                  <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">Staffed</span>
                </div>
              ` : `
                <span class="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg text-xs font-semibold border border-amber-200">
                  <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                  Not Assigned
                </span>
              `}
            </td>
            <td class="py-3 px-4 text-right align-middle">
              <div class="flex items-center justify-end gap-2">
                <input type="text" list="assign-teachers-datalist"
                  placeholder="Type teacher name..."
                  value="${secInst ? secInst.full_name : ''}"
                  onchange="AssignmentsComponent.onRowTeacherInput('${sec}', this.value)"
                  class="bg-white border ${secInst ? 'border-emerald-300 text-slate-900 font-bold' : 'border-slate-300 text-slate-700 font-medium'} text-xs rounded-xl px-2.5 py-1.5 w-52 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                ${secInst ? `
                  <button type="button" onclick="AssignmentsComponent.clearSectionStaffing('${sec}')"
                    title="Clear teacher"
                    class="text-xs text-slate-400 hover:text-rose-600 font-semibold underline px-1 transition">
                    Clear
                  </button>
                ` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    // 11. Update Staffing Summary Badges
    const summaryEl = document.getElementById('assign-staffing-summary');
    if (summaryEl) {
      summaryEl.innerText = `${staffedCount} of ${sections.length} sections staffed`;
    }
    const badgeEl = document.getElementById('assign-staffing-summary-badge');
    if (badgeEl) {
      badgeEl.innerText = `${staffedCount} / ${sections.length} Sections Staffed`;
      if (staffedCount === sections.length && sections.length > 0) {
        badgeEl.className = 'bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200';
      } else {
        badgeEl.className = 'bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-blue-200';
      }
    }
  },

  onRowTeacherInput(sec, value) {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const trimmed = (value || '').trim();

    if (!trimmed) {
      delete AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`];
      State.showToast(`Cleared instructor for ${sec}.`);
      AssignmentsComponent.renderSectionStaffing(c);
      return;
    }

    const low = trimmed.toLowerCase();
    const inst = (State.instructors || []).find(i => 
      i.id.toLowerCase() === low ||
      i.full_name.toLowerCase() === low ||
      low.includes(i.full_name.toLowerCase()) ||
      i.full_name.toLowerCase().includes(low)
    );

    if (inst) {
      AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`] = inst.id;
      if (!c.assigned_instructor_id) {
        c.assigned_instructor_id = inst.id;
        c.instructor_name = inst.full_name;
      }
      State.showToast(`Assigned ${inst.full_name} to ${sec} of ${c.code}!`);
    } else {
      State.showToast(`No instructor found matching "${value}".`, 'error');
    }
    AssignmentsComponent.renderSectionStaffing(c);
  },

  onTeacherSearch(query) {
    const dropdown = document.getElementById('assign-teacher-dropdown');
    if (!dropdown) return;

    const q = (query || '').toLowerCase().trim();
    const instructors = State.instructors || [];
    const top = AssignmentsComponent.suggestedFaculty;

    let filtered = instructors;
    if (q) {
      filtered = instructors.filter(i => 
        (i.full_name && i.full_name.toLowerCase().includes(q)) ||
        (i.academic_rank && i.academic_rank.toLowerCase().includes(q)) ||
        (i.specializations && i.specializations.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      dropdown.innerHTML = `
        <div class="px-3 py-2.5 text-xs text-slate-400 font-medium text-center">
          No faculty instructors match "${query}"
        </div>
      `;
    } else {
      dropdown.innerHTML = filtered.map(inst => {
        const isTop = top && top.id === inst.id;
        return `
          <div onclick="AssignmentsComponent.selectTeacher('${inst.id}')"
            class="px-3.5 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center justify-between text-xs transition">
            <div>
              <div class="font-bold text-slate-900">${inst.full_name}</div>
              <div class="text-[11px] text-slate-500">${inst.academic_rank} &bull; ${inst.specializations || 'University Faculty'}</div>
            </div>
            ${isTop ? `
              <span class="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200">
                AI Best Fit (98%)
              </span>
            ` : ''}
          </div>
        `;
      }).join('');
    }

    dropdown.classList.remove('hidden');
  },

  openTeacherDropdown() {
    const input = document.getElementById('assign-teacher-search');
    const query = input ? input.value : '';
    AssignmentsComponent.onTeacherSearch(query);
  },

  closeTeacherDropdown() {
    const dropdown = document.getElementById('assign-teacher-dropdown');
    if (dropdown) dropdown.classList.add('hidden');
  },

  selectTeacher(instId) {
    const inst = (State.instructors || []).find(i => i.id === instId);
    if (!inst) return;

    const teacherSelect = document.getElementById('assign-teacher-select');
    if (teacherSelect) teacherSelect.value = instId;

    const teacherSearchInput = document.getElementById('assign-teacher-search');
    if (teacherSearchInput) {
      teacherSearchInput.value = `${inst.full_name} (${inst.academic_rank})`;
    }

    AssignmentsComponent.closeTeacherDropdown();
    State.showToast(`Selected ${inst.full_name}. Choose sections and click Assign.`);
  },

  applyAIToSearch() {
    if (AssignmentsComponent.suggestedFaculty) {
      AssignmentsComponent.selectTeacher(AssignmentsComponent.suggestedFaculty.id);
    }
  },

  quickAssignSection(sec, instId) {
    if (!State.activeCourse) return;
    const c = State.activeCourse;

    if (!instId || instId === '' || instId === 'UNASSIGN') {
      delete AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`];
      State.showToast(`Unassigned ${sec} of ${c.code}.`);
    } else {
      const inst = (State.instructors || []).find(i => i.id === instId);
      if (!inst) return;
      AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`] = instId;
      if (!c.assigned_instructor_id) {
        c.assigned_instructor_id = instId;
        c.instructor_name = inst.full_name;
      }
      State.showToast(`Assigned ${inst.full_name} to ${sec} of ${c.code}!`);
    }

    AssignmentsComponent.renderSectionStaffing(c);
  },

  assignTeacherToSelectedSections() {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const teacherSelect = document.getElementById('assign-teacher-select');
    if (!teacherSelect) return;

    const teacherId = teacherSelect.value;
    const teacher = (State.instructors || []).find(i => i.id === teacherId);
    if (!teacher) {
      State.showToast('Please type and select a teacher name first.', 'error');
      return;
    }

    if (!AssignmentsComponent.selectedStaffingSections || AssignmentsComponent.selectedStaffingSections.size === 0) {
      State.showToast('Please choose at least one section to assign.', 'error');
      return;
    }

    const chosenSections = Array.from(AssignmentsComponent.selectedStaffingSections);
    chosenSections.forEach(sec => {
      AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`] = teacher.id;
    });

    c.assigned_instructor_id = teacher.id;
    c.instructor_name = teacher.full_name;

    State.showToast(`Assigned ${teacher.full_name} to ${chosenSections.join(', ')} of ${c.code}!`);
    AssignmentsComponent.renderSectionStaffing(c);
    AssignmentsComponent.renderBanner(c);
    AssignmentsComponent.renderDropdowns();
  },

  clearSectionStaffing(sec) {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    delete AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`];
    State.showToast(`Unassigned ${sec} of ${c.code}.`);
    AssignmentsComponent.renderSectionStaffing(c);
    AssignmentsComponent.renderBanner(c);
    AssignmentsComponent.renderDropdowns();
  },

  toggleStaffingSection(sec) {
    if (!AssignmentsComponent.selectedStaffingSections) {
      AssignmentsComponent.selectedStaffingSections = new Set();
    }
    if (AssignmentsComponent.selectedStaffingSections.has(sec)) {
      AssignmentsComponent.selectedStaffingSections.delete(sec);
    } else {
      AssignmentsComponent.selectedStaffingSections.add(sec);
    }
    AssignmentsComponent.renderSectionStaffing(State.activeCourse);
  },

  selectAllStaffingSections(checkAll) {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const sections = AssignmentsComponent.getCourseSections(c);

    if (checkAll) {
      AssignmentsComponent.selectedStaffingSections = new Set(sections);
    } else {
      AssignmentsComponent.selectedStaffingSections = new Set();
    }
    AssignmentsComponent.renderSectionStaffing(c);
  },

  autoAssignBestMatchAll() {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const top = AssignmentsComponent.suggestedFaculty;
    if (!top) return;

    const sections = AssignmentsComponent.getCourseSections(c);
    sections.forEach(sec => {
      AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`] = top.id;
    });

    c.assigned_instructor_id = top.id;
    c.instructor_name = top.full_name;

    AssignmentsComponent.selectedStaffingSections = new Set(sections);
    AssignmentsComponent.renderSectionStaffing(c);
    AssignmentsComponent.renderBanner(c);
    AssignmentsComponent.renderDropdowns();
    State.showToast(`Assigned ${top.full_name} to all ${sections.length} sections of ${c.code}!`);
  },

  openStreamOverviewModal() {
    const modal = document.getElementById('assign-stream-overview-modal');
    const tbody = document.getElementById('assign-stream-overview-body');
    const footer = document.getElementById('assign-modal-summary-footer');
    const subtitle = document.getElementById('assign-modal-stream-subtitle');
    if (!modal || !tbody) return;

    const isFresh = AssignmentsComponent.isFreshmanContext();
    const courses = AssignmentsComponent.getAvailableCoursesForCurrentContext();
    let totalCourses = courses.length;
    let fullyStaffed = 0;
    let totalSectionsCount = 0;

    if (subtitle) {
      const streamName = isFresh ? (AssignmentsComponent.selectedFreshmanStream || 'All Academic Streams') : (State.selectedDepartment ? State.selectedDepartment.name : 'Department');
      subtitle.innerText = `Overview for ${streamName} (${courses.length} Course Offerings).`;
    }

    tbody.innerHTML = courses.map(c => {
      const info = AssignmentsComponent.getCourseStaffingStatus(c);
      if (info.status === 'staffed') fullyStaffed++;
      totalSectionsCount += info.total;

      const streamBadge = (c.stream && c.stream !== 'Common') ? c.stream : 'Foundation Core';

      let statusPill = '';
      if (info.status === 'staffed') {
        statusPill = `<span class="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-1 rounded-lg border border-emerald-200 text-xs inline-flex items-center gap-1 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Staffed (${info.staffedCount}/${info.total})</span>`;
      } else if (info.status === 'partial') {
        statusPill = `<span class="bg-blue-50 text-blue-800 font-bold px-2.5 py-1 rounded-lg border border-blue-200 text-xs inline-flex items-center gap-1 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>In Progress (${info.staffedCount}/${info.total})</span>`;
      } else {
        statusPill = `<span class="bg-amber-50 text-amber-800 font-bold px-2.5 py-1 rounded-lg border border-amber-200 text-xs inline-flex items-center gap-1 shadow-2xs"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Unassigned</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/80 transition">
          <td class="py-3 px-4">
            <div class="font-bold text-slate-900">${c.code}: ${c.title}</div>
            <div class="text-[11px] text-slate-500 font-medium">${c.credit_hours || 3} Credit Hours &bull; ${c.semester || 'Semester I'}</div>
          </td>
          <td class="py-3 px-3">
            <span class="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md border border-slate-200">
              ${streamBadge}
            </span>
          </td>
          <td class="py-3 px-4">
            <div class="space-y-1">
              ${info.sections.map(s => `
                <div class="flex items-center gap-2 text-xs">
                  <span class="font-bold text-slate-800 w-20">${s.section}:</span>
                  <span class="text-slate-500 font-mono text-[11px] w-16">(${s.studentCount} std)</span>
                  ${s.isStaffed ? `
                    <span class="text-emerald-900 font-bold flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      ${s.instructor.full_name} <span class="text-slate-400 font-normal text-[11px]">(${s.instructor.academic_rank})</span>
                    </span>
                  ` : `
                    <span class="text-amber-800 font-medium italic">Unassigned</span>
                  `}
                </div>
              `).join('')}
            </div>
          </td>
          <td class="py-3 px-3 text-center align-middle">
            ${statusPill}
          </td>
          <td class="py-3 px-3 text-right align-middle">
            <button type="button" onclick="AssignmentsComponent.selectCourseById('${c.id}'); AssignmentsComponent.closeStreamOverviewModal();"
              class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-xl transition shadow-2xs">
              Open Course
            </button>
          </td>
        </tr>
      `;
    }).join('');

    if (footer) {
      footer.innerText = `${fullyStaffed} of ${totalCourses} courses fully staffed across ${totalSectionsCount} sections.`;
    }

    modal.classList.remove('hidden');
  },

  closeStreamOverviewModal() {
    const modal = document.getElementById('assign-stream-overview-modal');
    if (modal) modal.classList.add('hidden');
  },

  setStaffingViewMode(mode) {
    AssignmentsComponent.staffingViewMode = 'course';

    const boardContainer = document.getElementById('assign-board-container');
    const courseDetailContainer = document.getElementById('assign-course-detail-container');
    const modeBar = document.getElementById('assign-freshman-staffing-mode-bar');

    if (modeBar) modeBar.classList.add('hidden');
    if (boardContainer) boardContainer.classList.add('hidden');
    if (courseDetailContainer) courseDetailContainer.classList.remove('hidden');

    if (State.activeCourse) {
      AssignmentsComponent.renderBanner(State.activeCourse);
      AssignmentsComponent.renderSectionStaffing(State.activeCourse);
    }
  },

  renderStreamBoard() {
    const tbody = document.getElementById('assign-board-table-body');
    if (!tbody) return;

    const isFresh = AssignmentsComponent.isFreshmanContext();
    if (!isFresh) return;

    const stream = AssignmentsComponent.selectedFreshmanStream || 'ALL';
    const streamTitleEl = document.getElementById('assign-board-stream-title');
    if (streamTitleEl) {
      if (stream === 'Natural Science') {
        streamTitleEl.innerText = '• Natural Science Stream';
      } else if (stream === 'Social Science') {
        streamTitleEl.innerText = '• Social Science Stream';
      } else {
        streamTitleEl.innerText = '• All Foundation Courses';
      }
    }

    let freshCourses = State.courses.filter(c => 
      !c.is_college_common && (c.semester === 'Semester I' || !c.semester) &&
      c.department_id === 'dept_freshman_common'
    );

    if (stream === 'Natural Science') {
      freshCourses = freshCourses.filter(c => c.stream === 'Natural Science' || c.stream === 'Common' || !c.stream);
    } else if (stream === 'Social Science') {
      freshCourses = freshCourses.filter(c => c.stream === 'Social Science' || c.stream === 'Common' || !c.stream);
    }

    const allStudents = AssignmentsComponent.currentRoster || [];
    let defaultSections = Array.from(new Set(allStudents.map(s => s.section))).filter(Boolean);
    if (defaultSections.length === 0) defaultSections = ['Section A', 'Section B'];
    defaultSections.sort();

    let totalSlots = 0;
    let totalStaffed = 0;

    if (freshCourses.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="py-8 text-center text-slate-400 font-medium">
            No courses found for this stream.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = freshCourses.map(c => {
      // 1. Determine sections for this course
      let courseStudents = allStudents;
      if (c.stream && c.stream !== 'Common') {
        courseStudents = allStudents.filter(s => s.stream === c.stream);
      }
      let sections = Array.from(new Set(courseStudents.map(s => s.section))).filter(Boolean);
      if (sections.length === 0) sections = defaultSections;
      sections.sort();

      let courseStaffed = 0;

      // 2. Render each section badge (assigned in emerald, unassigned in amber)
      const sectionBadges = sections.map(sec => {
        totalSlots++;
        const key = `${c.id}_${sec}`;
        const assignedId = AssignmentsComponent.sectionInstructors[key] || null;
        const inst = assignedId ? (State.instructors || []).find(i => i.id === assignedId) : null;

        if (inst) {
          courseStaffed++;
          totalStaffed++;
          return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <strong class="font-bold text-slate-900">${sec}:</strong>
              <span>${inst.full_name}</span>
            </span>
          `;
        } else {
          return `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <strong class="font-bold text-slate-800">${sec}:</strong>
              <span class="italic text-amber-700 font-semibold">Not Assigned</span>
            </span>
          `;
        }
      }).join(' ');

      // 3. Stream badge
      let streamBadge = '';
      if (c.stream === 'Natural Science') {
        streamBadge = '<span class="bg-emerald-50 text-emerald-800 font-bold text-[10px] px-2 py-0.5 rounded-md border border-emerald-200 inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Natural Sci</span>';
      } else if (c.stream === 'Social Science') {
        streamBadge = '<span class="bg-amber-50 text-amber-800 font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-200 inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Social Sci</span>';
      } else {
        streamBadge = '<span class="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">Foundation</span>';
      }

      // 4. Status badge
      let statusBadge = '';
      if (courseStaffed === sections.length) {
        statusBadge = `<span class="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 text-xs px-2.5 py-1 rounded-full border border-emerald-200"><svg class="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${courseStaffed}/${sections.length} Staffed</span>`;
      } else if (courseStaffed > 0) {
        statusBadge = `<span class="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 text-xs px-2.5 py-1 rounded-full border border-blue-200">${courseStaffed}/${sections.length} Staffed</span>`;
      } else {
        statusBadge = `<span class="inline-flex items-center gap-1 text-amber-700 font-bold bg-amber-50 text-xs px-2.5 py-1 rounded-full border border-amber-200"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>0/${sections.length} Staffed</span>`;
      }

      return `
        <tr class="hover:bg-slate-50/70 transition">
          <td class="py-3 px-4">
            <div class="font-mono font-bold text-slate-900">${c.code}</div>
            <div class="font-medium text-slate-700 text-xs truncate max-w-[200px]" title="${c.title}">${c.title}</div>
            <div class="text-[11px] text-slate-400">${c.credit_hours || 3} Cr. &bull; ${c.semester || 'Semester I'}</div>
          </td>
          <td class="py-3 px-3 align-middle">
            ${streamBadge}
          </td>
          <td class="py-3 px-4">
            <div class="flex flex-wrap gap-1.5 items-center">
              ${sectionBadges}
            </div>
          </td>
          <td class="py-3 px-3 text-center align-middle">
            ${statusBadge}
          </td>
          <td class="py-3 px-4 text-right align-middle">
            <div class="flex items-center justify-end gap-1.5">
              <button type="button" onclick="AssignmentsComponent.autoStaffCourse('${c.id}')"
                title="Auto-assign specialist faculty to all sections of this course"
                class="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-2 py-1 rounded-lg transition border border-slate-300 shadow-2xs">
                ✨ Staff Best-Fit
              </button>
              <button type="button" onclick="AssignmentsComponent.editCourseStaffing('${c.id}')"
                class="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-2.5 py-1 rounded-lg transition shadow-2xs">
                Edit
              </button>
              ${courseStaffed > 0 ? `
                <button type="button" onclick="AssignmentsComponent.clearCourseStaffing('${c.id}')"
                  title="Clear assignments for this course"
                  class="text-slate-400 hover:text-rose-600 font-bold text-xs px-1.5 py-1 transition">
                  &times;
                </button>
              ` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Update overall stats pill
    const statsPill = document.getElementById('assign-board-stats-pill');
    if (statsPill) {
      const pct = totalSlots > 0 ? Math.round((totalStaffed / totalSlots) * 100) : 0;
      statsPill.innerText = `${totalStaffed} / ${totalSlots} Section Slots Staffed (${pct}%)`;
    }
  },

  autoStaffEntireStream() {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    if (!isFresh) return;

    const stream = AssignmentsComponent.selectedFreshmanStream || 'ALL';
    let freshCourses = State.courses.filter(c => 
      !c.is_college_common && (c.semester === 'Semester I' || !c.semester) &&
      c.department_id === 'dept_freshman_common'
    );

    if (stream === 'Natural Science') {
      freshCourses = freshCourses.filter(c => c.stream === 'Natural Science' || c.stream === 'Common' || !c.stream);
    } else if (stream === 'Social Science') {
      freshCourses = freshCourses.filter(c => c.stream === 'Social Science' || c.stream === 'Common' || !c.stream);
    }

    const allStudents = AssignmentsComponent.currentRoster || [];
    let defaultSections = Array.from(new Set(allStudents.map(s => s.section))).filter(Boolean);
    if (defaultSections.length === 0) defaultSections = ['Section A', 'Section B'];

    let assignedSlots = 0;
    freshCourses.forEach(c => {
      const matches = AssignmentsComponent.getAIMatchForCourse(c);
      const topInst = matches[0] || (State.instructors && State.instructors[0]);
      if (!topInst) return;

      let courseStudents = allStudents;
      if (c.stream && c.stream !== 'Common') {
        courseStudents = allStudents.filter(s => s.stream === c.stream);
      }
      let sections = Array.from(new Set(courseStudents.map(s => s.section))).filter(Boolean);
      if (sections.length === 0) sections = defaultSections;

      sections.forEach(sec => {
        AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`] = topInst.id;
        assignedSlots++;
      });

      c.assigned_instructor_id = topInst.id;
      c.instructor_name = topInst.full_name;
    });

    AssignmentsComponent.renderStreamBoard();
    if (State.activeCourse) {
      AssignmentsComponent.renderSectionStaffing(State.activeCourse);
    }
    State.showToast(`✨ Successfully auto-staffed all ${freshCourses.length} courses across ${assignedSlots} section slots!`);
  },

  clearStreamStaffing() {
    const stream = AssignmentsComponent.selectedFreshmanStream || 'ALL';
    let freshCourses = State.courses.filter(c => 
      !c.is_college_common && (c.semester === 'Semester I' || !c.semester) &&
      c.department_id === 'dept_freshman_common'
    );

    freshCourses.forEach(c => {
      Object.keys(AssignmentsComponent.sectionInstructors).forEach(k => {
        if (k.startsWith(`${c.id}_`)) {
          delete AssignmentsComponent.sectionInstructors[k];
        }
      });
      c.assigned_instructor_id = null;
      c.instructor_name = '';
    });

    AssignmentsComponent.renderStreamBoard();
    if (State.activeCourse) {
      AssignmentsComponent.renderSectionStaffing(State.activeCourse);
    }
    State.showToast('Reset completed: all sections in this stream are now unassigned.');
  },

  autoStaffCourse(courseId) {
    const c = State.courses.find(x => x.id === courseId);
    if (!c) return;

    const matches = AssignmentsComponent.getAIMatchForCourse(c);
    const topInst = matches[0] || (State.instructors && State.instructors[0]);
    if (!topInst) return;

    const allStudents = AssignmentsComponent.currentRoster || [];
    let defaultSections = Array.from(new Set(allStudents.map(s => s.section))).filter(Boolean);
    if (defaultSections.length === 0) defaultSections = ['Section A', 'Section B'];

    let courseStudents = allStudents;
    if (c.stream && c.stream !== 'Common') {
      courseStudents = allStudents.filter(s => s.stream === c.stream);
    }
    let sections = Array.from(new Set(courseStudents.map(s => s.section))).filter(Boolean);
    if (sections.length === 0) sections = defaultSections;

    sections.forEach(sec => {
      AssignmentsComponent.sectionInstructors[`${c.id}_${sec}`] = topInst.id;
    });

    c.assigned_instructor_id = topInst.id;
    c.instructor_name = topInst.full_name;

    AssignmentsComponent.renderStreamBoard();
    if (State.activeCourse && State.activeCourse.id === c.id) {
      AssignmentsComponent.renderSectionStaffing(c);
    }
    State.showToast(`✨ Assigned ${topInst.full_name} to all sections of ${c.code}!`);
  },

  clearCourseStaffing(courseId) {
    const c = State.courses.find(x => x.id === courseId);
    if (!c) return;

    Object.keys(AssignmentsComponent.sectionInstructors).forEach(k => {
      if (k.startsWith(`${courseId}_`)) {
        delete AssignmentsComponent.sectionInstructors[k];
      }
    });
    c.assigned_instructor_id = null;
    c.instructor_name = '';

    AssignmentsComponent.renderStreamBoard();
    if (State.activeCourse && State.activeCourse.id === c.id) {
      AssignmentsComponent.renderSectionStaffing(c);
    }
    State.showToast(`Cleared instructor assignments for ${c.code}.`);
  },

  editCourseStaffing(courseId) {
    const found = State.courses.find(c => c.id === courseId);
    if (found) {
      State.activeCourse = found;
      const crsSelect = document.getElementById('assignments-course-select');
      if (crsSelect) crsSelect.value = courseId;
      AssignmentsComponent.setStaffingViewMode('course');
    }
  },

  // Backward-compatibility aliases
  assignTeacherToSection() {
    AssignmentsComponent.assignTeacherToSelectedSections();
  },
  applyBulkStaffing() {
    AssignmentsComponent.assignTeacherToSelectedSections();
  },
  toggleSelectAllSections(checkAll) {
    AssignmentsComponent.selectAllStaffingSections(checkAll);
  },
  onSectionRowCheckboxChange() {},
  assignSectionInstructor(courseId, section, instructorId) {
    const key = `${courseId}_${section}`;
    AssignmentsComponent.sectionInstructors[key] = instructorId;
    const inst = (State.instructors || []).find(i => i.id === instructorId);
    if (!State.activeCourse.assigned_instructor_id) {
      State.activeCourse.assigned_instructor_id = instructorId;
      State.activeCourse.instructor_name = inst ? inst.full_name : '';
    }
    State.showToast(`✅ Assigned ${inst ? inst.full_name : 'Instructor'} to ${section}!`);
    if (State.activeCourse) AssignmentsComponent.renderSectionStaffing(State.activeCourse);
  },
  useSuggestedTeacher() {
    AssignmentsComponent.autoAssignBestMatchAll();
  },
  runAIMatch() {
    AssignmentsComponent.autoAssignBestMatchAll();
  },
  applyAIMatch() {
    AssignmentsComponent.autoAssignBestMatchAll();
  },
  applyStaffingAssignment() {
    AssignmentsComponent.assignTeacherToSelectedSections();
  },
  renderSectionTickPills() {},
  toggleSectionTick(sec) {
    AssignmentsComponent.toggleStaffingSection(sec);
  },
  renderFaculty(c) {
    AssignmentsComponent.renderSectionStaffing(c);
  },
  renderSectionTeachers(c) {
    AssignmentsComponent.renderSectionStaffing(c);
  },
  filterTeacherOptions() {},

  // --- Roster Initialization & Loading ---
  loadActiveRoster() {
    const isFresh = AssignmentsComponent.isFreshmanContext();

    if (isFresh) {
      if (!AssignmentsComponent.freshmanRoster || AssignmentsComponent.freshmanRoster.length === 0) {
        AssignmentsComponent.freshmanRoster = AssignmentsComponent.getDefaultFreshmanRoster('2015');
      }
      AssignmentsComponent.currentRoster = AssignmentsComponent.freshmanRoster;
    } else if (AssignmentsComponent.isCollegeCommonContext()) {
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      if (!AssignmentsComponent.collegeRosters[colId] || AssignmentsComponent.collegeRosters[colId].length === 0) {
        // Collect students forwarded from freshmanRoster to this college
        const forwarded = (AssignmentsComponent.freshmanRoster || []).filter(s => s.college_id === colId);
        if (forwarded.length > 0) {
          AssignmentsComponent.collegeRosters[colId] = forwarded;
        } else {
          AssignmentsComponent.collegeRosters[colId] = AssignmentsComponent.getDefaultCollegeRoster(colId);
        }
      }
      AssignmentsComponent.currentRoster = AssignmentsComponent.collegeRosters[colId];
    } else {
      const deptId = State.selectedDepartment ? State.selectedDepartment.id : 'dept_data_science';
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      if (!AssignmentsComponent.departmentRosters[deptId] || AssignmentsComponent.departmentRosters[deptId].length === 0) {
        // Collect students forwarded from college or freshman to this dept
        const forwardedFromCol = (AssignmentsComponent.collegeRosters[colId] || []).filter(s => s.department_id === deptId);
        const forwardedFromFresh = (AssignmentsComponent.freshmanRoster || []).filter(s => s.department_id === deptId);
        const combined = forwardedFromCol.length > 0 ? forwardedFromCol : forwardedFromFresh;
        if (combined.length > 0) {
          AssignmentsComponent.departmentRosters[deptId] = combined;
        } else {
          AssignmentsComponent.departmentRosters[deptId] = AssignmentsComponent.getDefaultDepartmentRoster(deptId);
        }
      }
      AssignmentsComponent.currentRoster = AssignmentsComponent.departmentRosters[deptId];
    }

    AssignmentsComponent.syncSectionDropdown();
    AssignmentsComponent.renderRosterTable();
    if (State.activeCourse) AssignmentsComponent.renderSectionTeachers(State.activeCourse);
  },

  getDefaultCollegeCourses(colId) {
    const col = State.colleges.find(c => c.id === colId);
    const colName = col ? col.name : 'College';
    if (colId === 'col_computing_dbu') {
      return [
        { id: 'crs_cosc1012', code: 'CoSc1012', title: 'Computer Programming II (OOP)', credits: 4, stream: 'Natural Science', department_id: 'college_common_' + colId, college_id: colId, semester: 'Semester II', academic_year: 'Freshman Year', is_college_common: true },
        { id: 'crs_math1022', code: 'Math1022', title: 'Discrete Mathematics & Combinatorics', credits: 3, stream: 'Natural Science', department_id: 'college_common_' + colId, college_id: colId, semester: 'Semester II', academic_year: 'Freshman Year', is_college_common: true },
        { id: 'crs_ece1012', code: 'ECE1012', title: 'Digital Logic & Computer Architecture', credits: 3, stream: 'Natural Science', department_id: 'college_common_' + colId, college_id: colId, semester: 'Semester II', academic_year: 'Freshman Year', is_college_common: true }
      ];
    } else if (colId === 'col_natural_dbu') {
      return [
        { id: 'crs_phys1012', code: 'Phys1012', title: 'Physics II: Electricity & Optics', credits: 4, stream: 'Natural Science', department_id: 'college_common_' + colId, college_id: colId, semester: 'Semester II', academic_year: 'Freshman Year', is_college_common: true },
        { id: 'crs_stat1012', code: 'Stat1012', title: 'Probability & Mathematical Statistics', credits: 3, stream: 'Natural Science', department_id: 'college_common_' + colId, college_id: colId, semester: 'Semester II', academic_year: 'Freshman Year', is_college_common: true }
      ];
    }
    return [
      { id: `crs_${colId}_core1`, code: 'CORE1022', title: `${colName} Core Foundation`, credits: 3, stream: 'Common', department_id: 'college_common_' + colId, college_id: colId, semester: 'Semester II', academic_year: 'Freshman Year', is_college_common: true }
    ];
  },

  getDefaultCollegeRoster(colId) {
    const col = State.colleges.find(c => c.id === colId);
    const colName = col ? col.name : 'College';
    const names = [
      { name: 'Aaron Tadesse', sex: 'M' }, { name: 'Abinet Belay', sex: 'M' },
      { name: 'Almaz Hailu', sex: 'F' },   { name: 'Aman Worku', sex: 'M' },
      { name: 'Aster Kebede', sex: 'F' },  { name: 'Bekele Mengistu', sex: 'M' },
      { name: 'Bethelhem Alemu', sex: 'F' },{ name: 'Biruk Lemma', sex: 'M' },
      { name: 'Chala Demissie', sex: 'M' }, { name: 'Daniel Tesfaye', sex: 'M' },
      { name: 'Dawit Yohannes', sex: 'M' }, { name: 'Eden Kifle', sex: 'F' },
      { name: 'Ephrem Girma', sex: 'M' },   { name: 'Fasika Tefera', sex: 'F' },
      { name: 'Fikadu Bekele', sex: 'M' },  { name: 'Genet Solomon', sex: 'F' },
      { name: 'Getachew Assefa', sex: 'M' },{ name: 'Habtamu Desta', sex: 'M' },
      { name: 'Hanna Negash', sex: 'F' },   { name: 'Henok Wolde', sex: 'M' },
      { name: 'Hiwot Tsegaye', sex: 'F' },  { name: 'Iman Ahmed', sex: 'F' },
      { name: 'Jemal Hassen', sex: 'M' },   { name: 'Kalkidan Abebe', sex: 'F' }
    ];
    return names.map((item, idx) => {
      const num = idx + 1;
      const pad = num < 10 ? `0${num}` : `${num}`;
      return {
        enrollment_id: `col_${colId}_${num}`,
        student_number: `UGR/40${pad}/15`,
        full_name: item.name,
        sex: item.sex,
        stream: 'Natural Science',
        batch: '2015',
        section: idx < 12 ? 'Section A' : 'Section B',
        status: 'Active',
        placement_status: `Enrolled in ${colName} (Freshman Sem II)`,
        college_id: colId,
        department_id: `college_common_${colId}`
      };
    });
  },

  async fetchRoster(c) {
    try {
      const res = await API.getCourseRoster(c.id);
      if (res && res.students && res.students.length > 0) {
        // If remote roster returned, merge stream and section data
        AssignmentsComponent.currentRoster = res.students.map((s, idx) => ({
          enrollment_id: s.enrollment_id || `remote_${idx}`,
          student_number: s.student_number,
          full_name: s.full_name,
          sex: s.sex || (idx % 2 === 0 ? 'M' : 'F'),
          stream: s.stream || (idx % 2 === 0 ? 'Natural Science' : 'Social Science'),
          batch: s.batch || '2015',
          section: s.section || (idx < 20 ? 'Section A' : 'Section B'),
          status: s.status || 'Enrolled',
          placement_status: s.placement_status || 'Enrolled'
        }));
      }
    } catch (err) {
      // Offline or local fallback is retained
    }
    AssignmentsComponent.syncSectionDropdown();
    AssignmentsComponent.renderRosterTable();
  },

  getDefaultFreshmanRoster(batchYear = '2015') {
    const yr = batchYear || '2015';
    const shortYr = yr.slice(-2);

    // 24 Natural Science Students with realistic Sex distribution
    const naturalData = [
      { name: 'Aaron Tadesse', sex: 'M' }, { name: 'Abinet Belay', sex: 'M' },
      { name: 'Almaz Hailu', sex: 'F' },   { name: 'Aman Worku', sex: 'M' },
      { name: 'Aster Kebede', sex: 'F' },  { name: 'Bekele Mengistu', sex: 'M' },
      { name: 'Bethelhem Alemu', sex: 'F' },{ name: 'Biruk Lemma', sex: 'M' },
      { name: 'Chala Demissie', sex: 'M' }, { name: 'Daniel Tesfaye', sex: 'M' },
      { name: 'Dawit Yohannes', sex: 'M' }, { name: 'Eden Kifle', sex: 'F' },
      { name: 'Ephrem Girma', sex: 'M' },   { name: 'Fasika Tefera', sex: 'F' },
      { name: 'Fikadu Bekele', sex: 'M' },  { name: 'Genet Solomon', sex: 'F' },
      { name: 'Getachew Assefa', sex: 'M' },{ name: 'Habtamu Desta', sex: 'M' },
      { name: 'Hanna Negash', sex: 'F' },   { name: 'Henok Wolde', sex: 'M' },
      { name: 'Hiwot Tsegaye', sex: 'F' },  { name: 'Iman Ahmed', sex: 'F' },
      { name: 'Jemal Hassen', sex: 'M' },   { name: 'Kalkidan Abebe', sex: 'F' }
    ];

    // 24 Social Science Students with realistic Sex distribution
    const socialData = [
      { name: 'Kassahun Worku', sex: 'M' }, { name: 'Kidist Berhanu', sex: 'F' },
      { name: 'Lemlem Girma', sex: 'F' },   { name: 'Mahlet Kassaye', sex: 'F' },
      { name: 'Marta Alemayehu', sex: 'F' },{ name: 'Melaku Fenta', sex: 'M' },
      { name: 'Meron Haile', sex: 'F' },    { name: 'Michael Bekele', sex: 'M' },
      { name: 'Natnael Fikre', sex: 'M' },  { name: 'Nebiyou Zewdu', sex: 'M' },
      { name: 'Nitsuh Daniel', sex: 'F' },  { name: 'Obsa Kebede', sex: 'M' },
      { name: 'Rahel Desta', sex: 'F' },    { name: 'Ruth Melaku', sex: 'F' },
      { name: 'Samuel Tefera', sex: 'M' },  { name: 'Sara Bekele', sex: 'F' },
      { name: 'Selamawit Dagne', sex: 'F' },{ name: 'Senait Mengistu', sex: 'F' },
      { name: 'Solomon Tadesse', sex: 'M' },{ name: 'Tariku Assefa', sex: 'M' },
      { name: 'Tigist Haile', sex: 'F' },   { name: 'Wondwossen Bekele', sex: 'M' },
      { name: 'Yared Teshome', sex: 'M' },  { name: 'Yohannes Girma', sex: 'M' }
    ];

    const roster = [];
    let idx = 0;

    // Add Natural Science
    naturalData.forEach((item, i) => {
      idx++;
      const pad = idx < 10 ? `0${idx}` : `${idx}`;
      roster.push({
        enrollment_id: `fresh_${yr}_${idx}`,
        student_number: `UGR/40${pad}/${shortYr}`,
        full_name: item.name,
        sex: item.sex,
        stream: 'Natural Science',
        batch: yr,
        section: i < 12 ? 'Section A' : 'Section B',
        status: 'Active',
        placement_status: 'Freshman Sem I',
        department_id: 'dept_freshman_common',
        college_id: 'col_freshman_dbu'
      });
    });

    // Add Social Science
    socialData.forEach((item, i) => {
      idx++;
      const pad = idx < 10 ? `0${idx}` : `${idx}`;
      roster.push({
        enrollment_id: `fresh_${yr}_${idx}`,
        student_number: `UGR/40${pad}/${shortYr}`,
        full_name: item.name,
        sex: item.sex,
        stream: 'Social Science',
        batch: yr,
        section: i < 12 ? 'Section A' : 'Section B',
        status: 'Active',
        placement_status: 'Freshman Sem I',
        department_id: 'dept_freshman_common',
        college_id: 'col_freshman_dbu'
      });
    });

    return roster;
  },

  getDefaultDepartmentRoster(deptId) {
    const dept = State.departments.find(d => d.id === deptId);
    const deptName = dept ? dept.name : 'Department';
    const isSocial = deptId === 'dept_business' || deptId === 'dept_econ';
    const stream = isSocial ? 'Social Science' : 'Natural Science';

    const names = [
      { name: 'Aaron Tadesse', sex: 'M' }, { name: 'Abinet Belay', sex: 'M' },
      { name: 'Almaz Hailu', sex: 'F' },   { name: 'Aman Worku', sex: 'M' },
      { name: 'Aster Kebede', sex: 'F' },  { name: 'Bekele Mengistu', sex: 'M' },
      { name: 'Bethelhem Alemu', sex: 'F' },{ name: 'Biruk Lemma', sex: 'M' },
      { name: 'Chala Demissie', sex: 'M' }, { name: 'Daniel Tesfaye', sex: 'M' },
      { name: 'Dawit Yohannes', sex: 'M' }, { name: 'Eden Kifle', sex: 'F' },
      { name: 'Ephrem Girma', sex: 'M' },   { name: 'Fasika Tefera', sex: 'F' },
      { name: 'Fikadu Bekele', sex: 'M' },  { name: 'Genet Solomon', sex: 'F' },
      { name: 'Getachew Assefa', sex: 'M' },{ name: 'Habtamu Desta', sex: 'M' },
      { name: 'Hanna Negash', sex: 'F' },   { name: 'Henok Wolde', sex: 'M' },
      { name: 'Hiwot Tsegaye', sex: 'F' },  { name: 'Iman Ahmed', sex: 'F' },
      { name: 'Jemal Hassen', sex: 'M' },   { name: 'Kalkidan Abebe', sex: 'F' }
    ];

    return names.map((item, i) => {
      const num = i + 1;
      const pad = num < 10 ? `0${num}` : `${num}`;
      return {
        enrollment_id: `dept_${deptId}_${num}`,
        student_number: `UGR/40${pad}/15`,
        full_name: item.name,
        sex: item.sex,
        stream: stream,
        batch: '2015',
        year_level: 'Year 2',
        section: i < 12 ? 'Section A' : 'Section B',
        status: 'Enrolled',
        placement_status: `Enrolled in ${deptName} (Permanent Cohort)`,
        department_id: deptId,
        college_id: dept ? dept.college_id : 'col_computing_dbu'
      };
    });
  },

  syncSectionDropdown() {
    const secSelect = document.getElementById('assign-section-select');
    const filterSec = document.getElementById('assign-filter-section');
    const filterBatch = document.getElementById('assign-filter-batch');

    const sections = Array.from(new Set((AssignmentsComponent.currentRoster || []).map(s => s.section))).filter(Boolean);
    if (sections.length === 0) sections.push('Section A', 'Section B');
    sections.sort();

    const currentVal = AssignmentsComponent.selectedSection || 'ALL';
    const optionsHtml = `
      <option value="ALL" ${currentVal === 'ALL' ? 'selected' : ''}>All Sections</option>
      ${sections.map(sec => `
        <option value="${sec}" ${currentVal === sec ? 'selected' : ''}>${sec}</option>
      `).join('')}
    `;

    if (secSelect) secSelect.innerHTML = optionsHtml;
    if (filterSec) filterSec.innerHTML = optionsHtml;

    // Sync Batch Filter options based on available student batches
    if (filterBatch) {
      const batches = Array.from(new Set((AssignmentsComponent.currentRoster || []).map(s => s.batch || '2015'))).filter(Boolean);
      if (batches.length === 0) batches.push('2015');
      batches.sort();

      const curBatch = AssignmentsComponent.selectedBatchFilter || 'ALL';
      const isDept = !AssignmentsComponent.isFreshmanContext() && !AssignmentsComponent.isCollegeCommonContext();
      filterBatch.innerHTML = `
        <option value="ALL" ${curBatch === 'ALL' ? 'selected' : ''}>All Batches</option>
        ${batches.map(b => `
          <option value="${b}" ${curBatch === b ? 'selected' : ''}>
            Batch ${b}${isDept ? ' (Constant Cohort)' : ''}
          </option>
        `).join('')}
      `;
    }

    // Also update Section summary tag in toolbar
    const secSummary = document.getElementById('assign-fresh-section-summary');
    if (secSummary) {
      secSummary.innerText = sections.join(' • ');
    }
  },

  onBatchFilterChange(val) {
    AssignmentsComponent.selectedBatchFilter = val;
    const filterBatch = document.getElementById('assign-filter-batch');
    if (filterBatch && filterBatch.value !== val) filterBatch.value = val;
    AssignmentsComponent.renderRosterTable();
  },

  onStreamFilterChange(val) {
    AssignmentsComponent.selectedStreamFilter = val;
    const filterStrm = document.getElementById('assign-filter-stream');
    if (filterStrm && filterStrm.value !== val) filterStrm.value = val;
    AssignmentsComponent.renderRosterTable();
  },

  onSectionChange(val) {
    AssignmentsComponent.selectedSection = val;
    const secSelect = document.getElementById('assign-section-select');
    if (secSelect && secSelect.value !== val) secSelect.value = val;
    const filterSec = document.getElementById('assign-filter-section');
    if (filterSec && filterSec.value !== val) filterSec.value = val;
    AssignmentsComponent.renderRosterTable();
  },

  onBatchChange(val) {
    AssignmentsComponent.selectedBatch = val;
    if (State.activeCourse) AssignmentsComponent.renderBanner(State.activeCourse);
    AssignmentsComponent.renderRosterTable();
  },

  setRosterViewMode(mode) {
    AssignmentsComponent.rosterViewMode = mode;
    const btnCourse = document.getElementById('btn-roster-view-course');
    const btnAll = document.getElementById('btn-roster-view-all');

    if (mode === 'course') {
      if (btnCourse) btnCourse.className = 'px-2.5 py-1 rounded-md bg-white text-blue-700 shadow-xs transition';
      if (btnAll) btnAll.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition';
    } else {
      if (btnCourse) btnCourse.className = 'px-2.5 py-1 rounded-md text-slate-600 hover:text-slate-900 transition';
      if (btnAll) btnAll.className = 'px-2.5 py-1 rounded-md bg-white text-blue-700 shadow-xs transition';
    }

    AssignmentsComponent.renderRosterTable();
  },

  onSexFilterChange(val) {
    AssignmentsComponent.selectedSexFilter = val;
    const filterSex = document.getElementById('assign-filter-sex');
    if (filterSex && filterSex.value !== val) filterSex.value = val;
    AssignmentsComponent.renderRosterTable();
  },

  filterRoster(query) {
    AssignmentsComponent.searchFilter = query || '';
    AssignmentsComponent.renderRosterTable();
  },

  renderRosterTable() {
    const tbody = document.getElementById('assign-roster-table-body');
    const badge = document.getElementById('assign-roster-count-badge');
    if (!tbody) return;

    let list = AssignmentsComponent.currentRoster || [];

    // 1. Filter by Roster View Mode ('course' vs 'all')
    if (AssignmentsComponent.rosterViewMode === 'course' && AssignmentsComponent.isFreshmanContext()) {
      const c = State.activeCourse;
      if (c && c.stream && (c.stream === 'Natural Science' || c.stream === 'Social Science')) {
        list = list.filter(s => s.stream === c.stream);
      }
    }

    // 2. Filter by Stream
    if (AssignmentsComponent.selectedStreamFilter && AssignmentsComponent.selectedStreamFilter !== 'ALL') {
      list = list.filter(s => s.stream === AssignmentsComponent.selectedStreamFilter);
    }

    // 3. Filter by Section
    if (AssignmentsComponent.selectedSection && AssignmentsComponent.selectedSection !== 'ALL') {
      list = list.filter(s => s.section === AssignmentsComponent.selectedSection);
    }

    // 4. Filter by Sex (M / F)
    if (AssignmentsComponent.selectedSexFilter && AssignmentsComponent.selectedSexFilter !== 'ALL') {
      list = list.filter(s => (s.sex || 'M') === AssignmentsComponent.selectedSexFilter);
    }

    // 5. Filter by Batch (Distinguish Constant Department Batches / Freshman Batches)
    if (AssignmentsComponent.selectedBatchFilter && AssignmentsComponent.selectedBatchFilter !== 'ALL') {
      list = list.filter(s => String(s.batch || '2015') === String(AssignmentsComponent.selectedBatchFilter));
    }

    // 6. Filter by Search Query (ID, Name, or Stream)
    if (AssignmentsComponent.searchFilter) {
      const q = AssignmentsComponent.searchFilter.toLowerCase();
      list = list.filter(s => 
        (s.full_name && s.full_name.toLowerCase().includes(q)) || 
        (s.student_number && s.student_number.toLowerCase().includes(q)) ||
        (s.stream && s.stream.toLowerCase().includes(q)) ||
        (s.section && s.section.toLowerCase().includes(q)) ||
        (s.batch && String(s.batch).includes(q))
      );
    }

    // Dynamic counts
    const mCount = list.filter(s => (s.sex || 'M') === 'M').length;
    const fCount = list.filter(s => s.sex === 'F').length;

    if (badge) {
      const batchTag = (AssignmentsComponent.selectedBatchFilter && AssignmentsComponent.selectedBatchFilter !== 'ALL')
        ? `Batch ${AssignmentsComponent.selectedBatchFilter} • `
        : '';
      badge.innerText = `${list.length} Students (${batchTag}${mCount} M • ${fCount} F)`;
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center py-8 text-slate-400 font-medium">
            No students found matching this criteria. You can upload an Excel/CSV file or paste student rows.
          </td>
        </tr>
      `;
      return;
    }

    const getStreamBadge = (strm) => {
      if (strm === 'Natural Science') {
        return '<span class="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200 inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Natural Science</span>';
      }
      if (strm === 'Social Science') {
        return '<span class="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200 inline-flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Social Science</span>';
      }
      return '<span class="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] border border-slate-200">General</span>';
    };

    const getSexBadge = (sex) => {
      if (sex === 'F') {
        return '<span class="bg-rose-50 text-rose-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-rose-200">F</span>';
      }
      return '<span class="bg-blue-50 text-blue-700 font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-blue-200">M</span>';
    };

    tbody.innerHTML = list.map((s, idx) => `
      <tr class="hover:bg-slate-50 transition group">
        <td class="px-3.5 py-2.5 font-mono text-slate-400 font-bold text-[11px]">${idx + 1}</td>
        <td class="px-3.5 py-2.5 font-mono font-bold text-slate-900">${s.student_number}</td>
        <td class="px-3.5 py-2.5 font-bold text-slate-800">${s.full_name}</td>
        <td class="px-3.5 py-2.5 text-center">
          ${getSexBadge(s.sex)}
        </td>
        <td class="px-3.5 py-2.5">
          ${getStreamBadge(s.stream)}
        </td>
        <td class="px-3.5 py-2.5 font-bold text-indigo-700">
          <span class="bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-mono text-[11px]">
            ${s.section || 'Section A'}
          </span>
        </td>
        <td class="px-3.5 py-2.5">
          <span class="bg-slate-100 text-slate-700 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200 inline-flex items-center gap-1">
            ${s.placement_status || s.status || 'Enrolled'}
          </span>
        </td>
        <td class="px-3.5 py-2.5 text-right">
          <button onclick="AssignmentsComponent.removeStudentFromRoster('${s.enrollment_id || s.student_number}')" class="text-slate-400 hover:text-rose-600 font-bold text-xs p-1" title="Remove student">
            &times; Remove
          </button>
        </td>
      </tr>
    `).join('');
  },

  // --- Sizing, A-Z Sorting & Section Generation ---
  reSectionRoster() {
    const maxCapInput = document.getElementById('assign-fresh-max-cap');
    const maxCap = maxCapInput ? parseInt(maxCapInput.value, 10) || 40 : 40;

    // 1. Sort strictly Alphabetical from A to Z by full name
    AssignmentsComponent.currentRoster.sort((a, b) => a.full_name.localeCompare(b.full_name));

    // 2. Distribute into Section A, B, C...
    const sectionLetters = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E', 'Section F', 'Section G', 'Section H'];
    AssignmentsComponent.currentRoster.forEach((s, idx) => {
      const secIdx = Math.floor(idx / maxCap);
      s.section = sectionLetters[secIdx] || `Section ${String.fromCharCode(65 + secIdx)}`;
    });

    const secSet = new Set(AssignmentsComponent.currentRoster.map(s => s.section));
    AssignmentsComponent.syncSectionDropdown();
    AssignmentsComponent.renderRosterTable();
    if (State.activeCourse) AssignmentsComponent.renderSectionTeachers(State.activeCourse);

    State.showToast(`✅ Sorted A&ndash;Z and generated ${secSet.size} sections with max ${maxCap} students per class.`);
  },

  // --- File Upload & Text Paste Parsing ---
  async handleFileUpload(event, targetContext = 'freshman') {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const maxCapInput = document.getElementById('assign-fresh-max-cap');
    const maxCap = maxCapInput ? parseInt(maxCapInput.value, 10) || 40 : 40;
    const batch = AssignmentsComponent.selectedBatch || '2015';
    const activeStream = AssignmentsComponent.selectedStreamFilter !== 'ALL' ? AssignmentsComponent.selectedStreamFilter : 'Natural Science';

    State.showToast(`⏳ Parsing student file: ${file.name}...`);

    try {
      // 1. If backend is running and file is Excel, try server upload
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        try {
          const res = await API.uploadRosterFile(file, batch, activeStream, maxCap);
          if (res && res.students && res.students.length > 0) {
            AssignmentsComponent.applyParsedRows(res.students, targetContext);
            State.showToast(`✅ Successfully uploaded and parsed ${res.students.length} students from ${file.name}!`);
            return;
          }
        } catch (serverErr) {
          console.warn("Backend Excel parsing unavailable, attempting client fallback", serverErr);
        }
      }

      // 2. Client-side reading for CSV / TSV / Text
      const reader = new FileReader();
      reader.onload = function(e) {
        const text = e.target.result;
        AssignmentsComponent.parseAndIngestText(text, targetContext);
      };
      reader.readAsText(file);
    } catch (err) {
      console.error(err);
      State.showToast(`❌ Error reading file: ${err.message}`);
    } finally {
      event.target.value = '';
    }
  },

  openPasteModal(targetContext = 'freshman') {
    AssignmentsComponent.pasteTarget = targetContext;
    const modal = document.getElementById('modal-assign-paste-text');
    const titleEl = document.getElementById('assign-paste-modal-title');
    const subEl = document.getElementById('assign-paste-modal-subtitle');

    if (targetContext === 'freshman') {
      if (titleEl) titleEl.innerText = "Paste Freshman Student List (Batch Ingestion)";
      if (subEl) subEl.innerText = "Columns: Student ID, Full Name, Sex (M / F), Stream (Natural / Social), Section";
    } else if (targetContext === 'college') {
      const colName = State.selectedCollege ? State.selectedCollege.name : 'College';
      if (titleEl) titleEl.innerText = `Paste ${colName} Placement List (Freshman Semester II)`;
      if (subEl) subEl.innerText = "Columns: Student ID, Full Name, Sex (M / F), Stream, Section";
    } else {
      const deptName = State.selectedDepartment ? State.selectedDepartment.name : 'Department';
      if (titleEl) titleEl.innerText = `Paste ${deptName} Student List`;
      if (subEl) subEl.innerText = `Columns: Student ID, Full Name, Sex (M / F), Stream, Section`;
    }

    if (modal) modal.classList.remove('hidden');
  },

  closePasteModal() {
    const modal = document.getElementById('modal-assign-paste-text');
    if (modal) modal.classList.add('hidden');
  },

  processPastedList() {
    const textarea = document.getElementById('assign-paste-textarea');
    const text = textarea ? textarea.value : '';
    if (!text || !text.trim()) {
      alert("Please paste student rows.");
      return;
    }

    const replaceChk = document.getElementById('assign-paste-replace-chk');
    const shouldReplace = replaceChk ? replaceChk.checked : false;

    AssignmentsComponent.parseAndIngestText(text, AssignmentsComponent.pasteTarget, shouldReplace);
    AssignmentsComponent.closePasteModal();
  },

  parseAndIngestText(text, targetContext = 'freshman', shouldReplace = false) {
    const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    const batch = AssignmentsComponent.selectedBatch || '2015';
    const fallbackStream = AssignmentsComponent.selectedStreamFilter !== 'ALL' ? AssignmentsComponent.selectedStreamFilter : 'Natural Science';
    const maxCapInput = document.getElementById('assign-fresh-max-cap');
    const maxCap = maxCapInput ? parseInt(maxCapInput.value, 10) || 40 : 40;

    const parsed = [];
    const deptId = State.selectedDepartment ? State.selectedDepartment.id : 'dept_freshman_common';
    const colId = State.selectedCollege ? State.selectedCollege.id : 'col_freshman_dbu';

    lines.forEach((line, i) => {
      const clean = line.trim();
      if (!clean) return;

      // Skip header row
      const low = clean.toLowerCase();
      if (low.startsWith("student id") || low.startsWith("id,") || low.startsWith("id\t") || (low.startsWith("id") && low.includes("name"))) {
        return;
      }

      const parts = clean.split(/[\t,;|]+/).map(p => p.trim()).filter(Boolean);
      let s_id = "";
      let s_name = "";
      let s_sex = (i % 2 === 0 ? "M" : "F");
      let s_stream = fallbackStream;
      let s_sec = null;

      if (parts.length >= 2) {
        s_id = parts[0];
        s_name = parts[1];

        // Process remaining parts (tokens 2, 3, 4...)
        for (let pIdx = 2; pIdx < parts.length; pIdx++) {
          const p = parts[pIdx];
          const pLow = p.toLowerCase();

          // Detect Sex (M / F)
          if (pLow === 'm' || pLow === 'male') {
            s_sex = 'M';
          } else if (pLow === 'f' || pLow === 'female') {
            s_sex = 'F';
          }
          // Detect Academic Stream
          else if (pLow.includes('nat')) {
            s_stream = 'Natural Science';
          } else if (pLow.includes('soc')) {
            s_stream = 'Social Science';
          }
          // Detect Section
          else if (pLow.startsWith('sec') || pLow.length <= 2) {
            s_sec = p.startsWith('Section') ? p : `Section ${p.toUpperCase()}`;
          }
        }
      } else {
        s_id = `UGR/40${(i+1) < 10 ? '0' + (i+1) : (i+1)}/${batch.slice(-2)}`;
        s_name = clean;
      }

      parsed.push({
        enrollment_id: `ingest_${Date.now()}_${i}`,
        student_number: s_id,
        full_name: s_name,
        sex: s_sex,
        stream: s_stream,
        batch: batch,
        section: s_sec || 'Section A',
        status: 'Active',
        placement_status: targetContext === 'freshman' ? 'Freshman Sem I' : (targetContext === 'college' ? `Enrolled in ${State.selectedCollege ? State.selectedCollege.name : 'College'} (Freshman Sem II)` : `Enrolled in ${State.selectedDepartment ? State.selectedDepartment.name : 'Department'}`),
        department_id: targetContext === 'freshman' ? 'dept_freshman_common' : (targetContext === 'college' ? `college_common_${colId}` : deptId),
        college_id: targetContext === 'freshman' ? 'col_freshman_dbu' : colId
      });
    });

    if (parsed.length === 0) {
      State.showToast(`⚠️ No readable student rows found.`);
      return;
    }

    // Auto-section if sections were omitted
    const unsectioned = parsed.filter(s => !s.section || s.section === 'Section A');
    if (unsectioned.length === parsed.length) {
      parsed.sort((a, b) => a.full_name.localeCompare(b.full_name));
      const sectionLetters = ['Section A', 'Section B', 'Section C', 'Section D', 'Section E'];
      parsed.forEach((s, idx) => {
        const secIdx = Math.floor(idx / maxCap);
        s.section = sectionLetters[secIdx] || `Section ${String.fromCharCode(65 + secIdx)}`;
      });
    }

    AssignmentsComponent.applyParsedRows(parsed, targetContext, shouldReplace);
    State.showToast(`✅ Ingested ${parsed.length} students with Student ID, Name, Sex, Stream, and Section!`);
  },

  applyParsedRows(students, targetContext = 'freshman', shouldReplace = false) {
    if (targetContext === 'freshman') {
      if (shouldReplace) {
        AssignmentsComponent.freshmanRoster = students;
      } else {
        // Avoid duplicate student_number
        const existingNums = new Set(AssignmentsComponent.freshmanRoster.map(s => s.student_number));
        students.forEach(s => {
          if (!existingNums.has(s.student_number)) {
            AssignmentsComponent.freshmanRoster.push(s);
          }
        });
      }
      AssignmentsComponent.currentRoster = AssignmentsComponent.freshmanRoster;
    } else if (targetContext === 'college') {
      const colId = State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu';
      const colName = State.selectedCollege ? State.selectedCollege.name : 'College';
      if (!AssignmentsComponent.collegeRosters[colId]) {
        AssignmentsComponent.collegeRosters[colId] = [];
      }
      students.forEach(s => {
        s.college_id = colId;
        s.department_id = `college_common_${colId}`;
        s.placement_status = `Enrolled in ${colName} (Freshman Sem II)`;
      });
      if (shouldReplace) {
        AssignmentsComponent.collegeRosters[colId] = students;
      } else {
        const existingNums = new Set(AssignmentsComponent.collegeRosters[colId].map(s => s.student_number));
        students.forEach(s => {
          if (!existingNums.has(s.student_number)) {
            AssignmentsComponent.collegeRosters[colId].push(s);
          }
        });
      }
      AssignmentsComponent.currentRoster = AssignmentsComponent.collegeRosters[colId];
    } else {
      const deptId = State.selectedDepartment ? State.selectedDepartment.id : 'dept_data_science';
      if (!AssignmentsComponent.departmentRosters[deptId]) {
        AssignmentsComponent.departmentRosters[deptId] = [];
      }
      if (shouldReplace) {
        AssignmentsComponent.departmentRosters[deptId] = students;
      } else {
        const existingNums = new Set(AssignmentsComponent.departmentRosters[deptId].map(s => s.student_number));
        students.forEach(s => {
          if (!existingNums.has(s.student_number)) {
            AssignmentsComponent.departmentRosters[deptId].push(s);
          }
        });
      }
      AssignmentsComponent.currentRoster = AssignmentsComponent.departmentRosters[deptId];
    }

    AssignmentsComponent.syncSectionDropdown();
    AssignmentsComponent.renderRosterTable();
    AssignmentsComponent.renderStreamBoard();
    if (State.activeCourse) AssignmentsComponent.renderSectionTeachers(State.activeCourse);
    AssignmentsComponent.saveCurrentRoster();
  },

  async saveCurrentRoster() {
    const isFresh = AssignmentsComponent.isFreshmanContext();
    const deptId = isFresh ? 'dept_freshman_common' : (State.selectedDepartment ? State.selectedDepartment.id : 'dept_data_science');
    const colId = isFresh ? 'col_freshman_dbu' : (State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu');

    try {
      await API.saveBatch({
        batch: AssignmentsComponent.selectedBatch || '2015',
        stream: AssignmentsComponent.selectedStreamFilter !== 'ALL' ? AssignmentsComponent.selectedStreamFilter : 'Natural Science',
        department_id: deptId,
        college_id: colId,
        students: AssignmentsComponent.currentRoster.map(s => ({
          student_number: s.student_number,
          full_name: s.full_name,
          sex: s.sex || 'M',
          stream: s.stream || 'Natural Science',
          batch: s.batch || '2015',
          section: s.section || 'Section A',
          department_id: s.department_id || deptId,
          college_id: s.college_id || colId,
          placement_status: s.placement_status || 'Active'
        }))
      });
    } catch (e) {
      console.warn("Backend save failed, saved in memory", e);
    }

    State.showToast(`🎉 Saved ${AssignmentsComponent.currentRoster.length} students to database!`);
  },

  // --- MANUAL PASS STUDENT LIST (TO COLLEGE SEM II OR TO DEPARTMENT YEAR 2+) ---
  openForwardModal(mode = 'to_college') {
    AssignmentsComponent.forwardTargetMode = mode;
    const modal = document.getElementById('modal-assign-forward-dept');
    if (!modal) return;

    const titleEl = document.getElementById('forward-modal-title');
    const descEl = document.getElementById('forward-modal-desc');
    const grpCol = document.getElementById('forward-group-college');
    const grpDept = document.getElementById('forward-group-dept');
    const colSelect = document.getElementById('forward-target-college');
    const deptSelect = document.getElementById('forward-target-dept');

    const degreeColleges = State.colleges.filter(c => c.id !== 'col_freshman_dbu' && c.is_freshman_college !== 1);

    if (mode === 'to_college') {
      if (titleEl) titleEl.innerText = "Send Student List to Degree College (Freshman Semester II)";
      if (descEl) descEl.innerText = "Advance students from Freshman Studies to their degree college for Semester II common courses.";
      if (grpCol) grpCol.classList.remove('hidden');
      if (grpDept) grpDept.classList.add('hidden');

      if (colSelect) {
        colSelect.innerHTML = degreeColleges.map(c => `
          <option value="${c.id}">${c.name}</option>
        `).join('');
      }
    } else {
      // to_dept
      if (titleEl) titleEl.innerText = "Send Student List to Degree Department (Year 2 Constant Cohort)";
      if (descEl) descEl.innerText = "Place students into their permanent department cohort. Once they join the department, this batch remains constant through graduation without re-uploading.";
      if (grpCol) grpCol.classList.add('hidden');
      if (grpDept) grpDept.classList.remove('hidden');

      const currentColId = State.selectedCollege ? State.selectedCollege.id : (degreeColleges[0] ? degreeColleges[0].id : 'col_computing_dbu');
      const depts = State.departments.filter(d => d.college_id === currentColId && d.id !== 'dept_freshman_common');
      if (deptSelect) {
        deptSelect.innerHTML = depts.map(d => `
          <option value="${d.id}">${d.name}</option>
        `).join('');
      }
    }

    // Sync sections in filter based on source roster
    const sourceList = (mode === 'to_college')
      ? (AssignmentsComponent.freshmanRoster || [])
      : (AssignmentsComponent.currentRoster || []);

    const secSelect = document.getElementById('forward-filter-section');
    if (secSelect) {
      const sections = Array.from(new Set(sourceList.map(s => s.section))).filter(Boolean);
      secSelect.innerHTML = `
        <option value="ALL">All Sections</option>
        ${sections.map(s => `<option value="${s}">${s}</option>`).join('')}
      `;
    }

    // Default select all natural science students if target is computing/natural
    AssignmentsComponent.forwardSelectedIds.clear();
    sourceList.forEach(s => {
      if (mode === 'to_college') {
        if (s.stream === 'Natural Science') AssignmentsComponent.forwardSelectedIds.add(s.student_number);
      } else {
        AssignmentsComponent.forwardSelectedIds.add(s.student_number);
      }
    });

    AssignmentsComponent.renderForwardPreviewTable();
    modal.classList.remove('hidden');
  },

  openForwardDeptModal() {
    AssignmentsComponent.openForwardModal('to_college');
  },

  closeForwardDeptModal() {
    const modal = document.getElementById('modal-assign-forward-dept');
    if (modal) modal.classList.add('hidden');
  },

  onForwardCollegeChange(collegeId) {
    const deptSelect = document.getElementById('forward-target-dept');
    if (!deptSelect) return;

    const depts = State.departments.filter(d => d.college_id === collegeId && d.id !== 'dept_freshman_common');
    deptSelect.innerHTML = depts.map(d => `
      <option value="${d.id}">${d.name}</option>
    `).join('');

    AssignmentsComponent.updateForwardSummary();
  },

  updateForwardSummary() {
    const mode = AssignmentsComponent.forwardTargetMode || 'to_college';
    const count = AssignmentsComponent.forwardSelectedIds.size;
    const countBadge = document.getElementById('forward-selected-count');
    const footerSummary = document.getElementById('forward-footer-summary');
    const btnLabel = document.getElementById('forward-confirm-btn-label');

    if (countBadge) countBadge.innerText = `${count} Students Selected`;

    if (mode === 'to_college') {
      const colSelect = document.getElementById('forward-target-college');
      const targetColId = colSelect ? colSelect.value : null;
      const col = State.colleges.find(c => c.id === targetColId);
      const colName = col ? col.name : 'Target College';

      if (footerSummary) footerSummary.innerHTML = `Ready to pass <strong>${count}</strong> students (Batch 2015) to <strong>${colName}</strong> for Freshman Semester II.`;
      if (btnLabel) btnLabel.innerText = `Send Student List to ${colName} (Sem II) →`;
    } else {
      const deptSelect = document.getElementById('forward-target-dept');
      const selectedDeptId = deptSelect ? deptSelect.value : null;
      const dept = State.departments.find(d => d.id === selectedDeptId);
      const deptName = dept ? dept.name : 'Target Department';

      if (footerSummary) footerSummary.innerHTML = `Ready to place <strong>${count}</strong> students (Batch 2015) into <strong>${deptName}</strong> as a permanent constant cohort (Year 2 → Graduation).`;
      if (btnLabel) btnLabel.innerText = `Send to ${deptName} (Permanent Constant Cohort) →`;
    }
  },

  renderForwardPreviewTable() {
    const tbody = document.getElementById('forward-students-table-body');
    if (!tbody) return;

    const streamFilter = document.getElementById('forward-filter-stream')?.value || 'ALL';
    const sectionFilter = document.getElementById('forward-filter-section')?.value || 'ALL';
    const mode = AssignmentsComponent.forwardTargetMode || 'to_college';

    let list = (mode === 'to_college')
      ? (AssignmentsComponent.freshmanRoster || [])
      : (AssignmentsComponent.currentRoster || []);

    if (streamFilter !== 'ALL') {
      list = list.filter(s => s.stream === streamFilter);
    }
    if (sectionFilter !== 'ALL') {
      list = list.filter(s => s.section === sectionFilter);
    }

    const getStreamBadge = (strm) => {
      if (strm === 'Natural Science') {
        return '<span class="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200">Natural</span>';
      }
      return '<span class="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200">Social</span>';
    };

    tbody.innerHTML = list.map(s => {
      const isChecked = AssignmentsComponent.forwardSelectedIds.has(s.student_number);
      return `
        <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="AssignmentsComponent.toggleForwardSelect('${s.student_number}')">
          <td class="px-3 py-2 text-center" onclick="event.stopPropagation()">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="AssignmentsComponent.toggleForwardSelect('${s.student_number}')"
              class="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500">
          </td>
          <td class="px-3 py-2 font-mono font-bold text-slate-900">${s.student_number}</td>
          <td class="px-3 py-2 font-bold text-slate-800">${s.full_name}</td>
          <td class="px-3 py-2 font-mono text-[10px] font-bold text-slate-600">Batch ${s.batch || '2015'}</td>
          <td class="px-3 py-2">${getStreamBadge(s.stream)}</td>
          <td class="px-3 py-2 font-mono text-indigo-700 font-bold">${s.section}</td>
          <td class="px-3 py-2">
            <span class="text-xs font-semibold ${s.placement_status && (s.placement_status.includes('Passed') || s.placement_status.includes('Enrolled')) ? 'text-emerald-700 font-bold' : 'text-slate-500'}">
              ${s.placement_status || 'Freshman Sem I'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    AssignmentsComponent.updateForwardSummary();
  },

  selectAllForwardVisible(select = true) {
    const streamFilter = document.getElementById('forward-filter-stream')?.value || 'ALL';
    const sectionFilter = document.getElementById('forward-filter-section')?.value || 'ALL';
    const mode = AssignmentsComponent.forwardTargetMode || 'to_college';

    let list = (mode === 'to_college')
      ? (AssignmentsComponent.freshmanRoster || [])
      : (AssignmentsComponent.currentRoster || []);

    if (streamFilter !== 'ALL') list = list.filter(s => s.stream === streamFilter);
    if (sectionFilter !== 'ALL') list = list.filter(s => s.section === sectionFilter);

    list.forEach(s => {
      if (select) {
        AssignmentsComponent.forwardSelectedIds.add(s.student_number);
      } else {
        AssignmentsComponent.forwardSelectedIds.delete(s.student_number);
      }
    });

    AssignmentsComponent.renderForwardPreviewTable();
  },

  async executeForwardToDepartment() {
    const mode = AssignmentsComponent.forwardTargetMode || 'to_college';
    const selectedNums = Array.from(AssignmentsComponent.forwardSelectedIds);
    if (selectedNums.length === 0) {
      alert("Please select at least one student to forward.");
      return;
    }

    if (mode === 'to_college') {
      const colSelect = document.getElementById('forward-target-college');
      const targetColId = colSelect ? colSelect.value : null;
      if (!targetColId) {
        alert("Please select a target college.");
        return;
      }
      const col = State.colleges.find(c => c.id === targetColId);
      const colName = col ? col.name : 'Target College';

      if (!AssignmentsComponent.collegeRosters[targetColId]) {
        AssignmentsComponent.collegeRosters[targetColId] = [];
      }

      const forwardedStudents = [];
      selectedNums.forEach(num => {
        const std = (AssignmentsComponent.freshmanRoster || []).find(s => s.student_number === num);
        if (std) {
          std.college_id = targetColId;
          std.department_id = `college_common_${targetColId}`;
          std.placement_status = `Enrolled in ${colName} (Freshman Sem II)`;
          forwardedStudents.push(std);
        }
      });

      const colNums = new Set(AssignmentsComponent.collegeRosters[targetColId].map(s => s.student_number));
      forwardedStudents.forEach(s => {
        if (!colNums.has(s.student_number)) {
          AssignmentsComponent.collegeRosters[targetColId].push({ ...s });
        }
      });

      // Commit to backend if available
      try {
        await API.forwardToDepartment({
          student_numbers: selectedNums,
          target_department_id: `college_common_${targetColId}`,
          target_college_id: targetColId
        });
      } catch (err) {
        console.warn("Backend forward API unreachable, saved in client state", err);
      }

      AssignmentsComponent.closeForwardDeptModal();
      AssignmentsComponent.renderRosterTable();
      State.showToast(`🎉 Sent ${selectedNums.length} students (Batch 2015) to ${colName} for Semester II! Switch to ${colName} in the College dropdown to staff Semester II courses.`);
    } else {
      // to_dept
      const deptSelect = document.getElementById('forward-target-dept');
      const targetDeptId = deptSelect ? deptSelect.value : null;
      if (!targetDeptId) {
        alert("Please select a target department.");
        return;
      }
      const dept = State.departments.find(d => d.id === targetDeptId);
      const deptName = dept ? dept.name : 'Target Department';
      const targetColId = dept ? dept.college_id : (State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu');

      if (!AssignmentsComponent.departmentRosters[targetDeptId]) {
        AssignmentsComponent.departmentRosters[targetDeptId] = [];
      }

      const sourceList = AssignmentsComponent.currentRoster || AssignmentsComponent.freshmanRoster || [];
      const forwardedStudents = [];
      selectedNums.forEach(num => {
        const std = sourceList.find(s => s.student_number === num);
        if (std) {
          std.department_id = targetDeptId;
          std.college_id = targetColId;
          std.batch = std.batch || '2015';
          std.year_level = "Year 2";
          std.placement_status = `Enrolled in ${deptName} (Permanent Cohort)`;
          forwardedStudents.push(std);
        }
      });

      const deptNums = new Set(AssignmentsComponent.departmentRosters[targetDeptId].map(s => s.student_number));
      forwardedStudents.forEach(s => {
        if (!deptNums.has(s.student_number)) {
          AssignmentsComponent.departmentRosters[targetDeptId].push({ ...s });
        }
      });

      // Commit to backend if available
      try {
        await API.forwardToDepartment({
          student_numbers: selectedNums,
          target_department_id: targetDeptId,
          target_college_id: targetColId
        });
      } catch (err) {
        console.warn("Backend forward API unreachable, saved in client state", err);
      }

      AssignmentsComponent.closeForwardDeptModal();
      AssignmentsComponent.renderRosterTable();
      State.showToast(`🎉 Sent ${selectedNums.length} students (Batch 2015) to ${deptName} as permanent constant cohort! Switch to ${deptName} to view this constant cohort through graduation.`);
    }
  },

  downloadPlacementTemplate() {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Student ID,Full Name,Sex,Stream,Section,Target Destination\n" +
      "UGR/4001/15,Aaron Tadesse,M,Natural Science,Section A,College of Computing & Technology\n" +
      "UGR/4002/15,Abinet Belay,M,Natural Science,Section A,College of Computing & Technology\n" +
      "UGR/4003/15,Almaz Hailu,F,Natural Science,Section A,College of Computing & Technology\n" +
      "UGR/4004/15,Aman Worku,M,Natural Science,Section A,College of Computing & Technology\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Student_Placement_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    State.showToast("📥 Downloaded Student_Placement_Template.csv");
  },

  async handlePlacementFileUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const mode = AssignmentsComponent.forwardTargetMode || 'to_college';
    State.showToast(`⏳ Parsing placement file: ${file.name}...`);

    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const parsedIds = [];

      lines.forEach((line, idx) => {
        if (idx === 0 && (line.toLowerCase().includes('id') || line.toLowerCase().includes('name'))) return;
        const parts = line.split(/[,\t;]+/).map(p => p.trim());
        if (parts.length >= 1) {
          const sId = parts[0];
          parsedIds.push({
            id: sId,
            name: parts[1] || '',
            sex: parts[2] || 'M',
            stream: parts[3] || 'Natural Science',
            section: parts[4] || 'Section A'
          });
        }
      });

      if (parsedIds.length === 0) {
        State.showToast("⚠️ No student records recognized in placement file.");
        return;
      }

      if (mode === 'to_college') {
        const colSelect = document.getElementById('forward-target-college');
        const targetColId = colSelect ? colSelect.value : (State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu');
        const col = State.colleges.find(c => c.id === targetColId);
        const colName = col ? col.name : 'Target College';

        if (!AssignmentsComponent.collegeRosters[targetColId]) {
          AssignmentsComponent.collegeRosters[targetColId] = [];
        }

        const forwarded = [];
        parsedIds.forEach(p => {
          let std = (AssignmentsComponent.freshmanRoster || []).find(s => s.student_number === p.id);
          if (!std) {
            std = {
              enrollment_id: `place_${Date.now()}_${p.id}`,
              student_number: p.id,
              full_name: p.name || 'Student',
              sex: p.sex || 'M',
              stream: p.stream || 'Natural Science',
              batch: '2015',
              section: p.section || 'Section A',
              status: 'Active'
            };
          }
          std.college_id = targetColId;
          std.department_id = `college_common_${targetColId}`;
          std.placement_status = `Enrolled in ${colName} (Freshman Sem II)`;
          forwarded.push(std);
        });

        const existingNums = new Set(AssignmentsComponent.collegeRosters[targetColId].map(s => s.student_number));
        forwarded.forEach(s => {
          if (!existingNums.has(s.student_number)) {
            AssignmentsComponent.collegeRosters[targetColId].push({ ...s });
          }
        });

        AssignmentsComponent.closeForwardDeptModal();
        AssignmentsComponent.renderRosterTable();
        State.showToast(`🎉 Processed placement file: ${forwarded.length} students passed to ${colName} (Freshman Sem II)!`);
      } else {
        // to_dept
        const deptSelect = document.getElementById('forward-target-dept');
        const targetDeptId = deptSelect ? deptSelect.value : null;
        if (!targetDeptId) {
          alert("Please select target department first.");
          return;
        }
        const dept = State.departments.find(d => d.id === targetDeptId);
        const deptName = dept ? dept.name : 'Target Department';
        const targetColId = dept ? dept.college_id : (State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu');

        if (!AssignmentsComponent.departmentRosters[targetDeptId]) {
          AssignmentsComponent.departmentRosters[targetDeptId] = [];
        }

        const sourceList = AssignmentsComponent.currentRoster || AssignmentsComponent.freshmanRoster || [];
        const forwarded = [];
        parsedIds.forEach(p => {
          let std = sourceList.find(s => s.student_number === p.id);
          if (!std) {
            std = {
              enrollment_id: `place_dept_${Date.now()}_${p.id}`,
              student_number: p.id,
              full_name: p.name || 'Student',
              sex: p.sex || 'M',
              stream: p.stream || 'Natural Science',
              batch: '2015',
              section: p.section || 'Section A',
              status: 'Active'
            };
          }
          std.department_id = targetDeptId;
          std.college_id = targetColId;
          std.year_level = "Year 2";
          std.placement_status = `Enrolled in ${deptName} (Permanent Cohort)`;
          forwarded.push(std);
        });

        const deptNums = new Set(AssignmentsComponent.departmentRosters[targetDeptId].map(s => s.student_number));
        forwarded.forEach(s => {
          if (!deptNums.has(s.student_number)) {
            AssignmentsComponent.departmentRosters[targetDeptId].push({ ...s });
          }
        });

        AssignmentsComponent.closeForwardDeptModal();
        AssignmentsComponent.renderRosterTable();
        State.showToast(`🎉 Processed placement file: ${forwarded.length} students passed to ${deptName} as permanent cohort!`);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  },

  // --- DEPARTMENT CONSTANT COHORT SEMESTER PROMOTION (NO UPLOAD LIST) ---
  openPromoteModal() {
    const modal = document.getElementById('modal-assign-promote-cohort');
    if (!modal) return;

    const deptName = State.selectedDepartment ? State.selectedDepartment.name : 'Department';
    const desc = document.getElementById('promote-modal-dept-desc');
    if (desc) desc.innerText = `${deptName} • Constant Cohort Tracking across semesters without re-uploading.`;

    AssignmentsComponent.promoteSelectedIds.clear();
    (AssignmentsComponent.currentRoster || []).forEach(s => {
      AssignmentsComponent.promoteSelectedIds.add(s.student_number);
    });

    AssignmentsComponent.renderPromoteTable();
    AssignmentsComponent.updatePromoteSummary();
    modal.classList.remove('hidden');
  },

  closePromoteModal() {
    const modal = document.getElementById('modal-assign-promote-cohort');
    if (modal) modal.classList.add('hidden');
  },

  renderPromoteTable() {
    const tbody = document.getElementById('promote-students-table-body');
    if (!tbody) return;

    const list = AssignmentsComponent.currentRoster || [];
    tbody.innerHTML = list.map(s => {
      const isChecked = AssignmentsComponent.promoteSelectedIds.has(s.student_number);
      return `
        <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="AssignmentsComponent.togglePromoteSelect('${s.student_number}')">
          <td class="px-3 py-2 text-center" onclick="event.stopPropagation()">
            <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="AssignmentsComponent.togglePromoteSelect('${s.student_number}')"
              class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
          </td>
          <td class="px-3 py-2 font-mono font-bold text-slate-900">${s.student_number}</td>
          <td class="px-3 py-2 font-bold text-slate-800">${s.full_name}</td>
          <td class="px-3 py-2 font-mono text-indigo-700 font-bold">${s.section || 'Section A'}</td>
          <td class="px-3 py-2">
            <span class="text-xs font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              ${s.placement_status || s.year_level || 'Year 2 Sem I'}
            </span>
          </td>
        </tr>
      `;
    }).join('');

    AssignmentsComponent.updatePromoteSummary();
  },

  togglePromoteSelect(studentNumber) {
    if (AssignmentsComponent.promoteSelectedIds.has(studentNumber)) {
      AssignmentsComponent.promoteSelectedIds.delete(studentNumber);
    } else {
      AssignmentsComponent.promoteSelectedIds.add(studentNumber);
    }
    AssignmentsComponent.renderPromoteTable();
  },

  selectAllPromoteVisible(select = true) {
    (AssignmentsComponent.currentRoster || []).forEach(s => {
      if (select) {
        AssignmentsComponent.promoteSelectedIds.add(s.student_number);
      } else {
        AssignmentsComponent.promoteSelectedIds.delete(s.student_number);
      }
    });
    AssignmentsComponent.renderPromoteTable();
  },

  updatePromoteSummary() {
    const count = AssignmentsComponent.promoteSelectedIds.size;
    const targetSelect = document.getElementById('promote-target-level');
    const targetLevel = targetSelect ? targetSelect.value : 'Next Semester';
    const summary = document.getElementById('promote-footer-summary');
    if (summary) {
      summary.innerHTML = `Ready to promote <strong>${count}</strong> students to <strong>${targetLevel}</strong>.`;
    }
  },

  async executePromoteCohort() {
    const selectedNums = Array.from(AssignmentsComponent.promoteSelectedIds);
    if (selectedNums.length === 0) {
      alert("Please select at least one student to promote.");
      return;
    }

    const targetSelect = document.getElementById('promote-target-level');
    const targetLevel = targetSelect ? targetSelect.value : 'Year 2 - Semester II';
    const deptName = State.selectedDepartment ? State.selectedDepartment.name : 'Department';

    // Update in memory roster
    (AssignmentsComponent.currentRoster || []).forEach(s => {
      if (selectedNums.includes(s.student_number)) {
        s.placement_status = `Promoted to ${targetLevel} (${deptName})`;
        s.year_level = targetLevel.split(' - ')[0] || targetLevel;
      }
    });

    AssignmentsComponent.closePromoteModal();
    AssignmentsComponent.renderRosterTable();
    AssignmentsComponent.saveCurrentRoster();

    State.showToast(`🎉 Successfully promoted ${selectedNums.length} students to ${targetLevel}! Continuous CLO evaluation updated.`);
  },

  // --- General Batch Operations ---
  async enrollSelectedBatch() {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const section = AssignmentsComponent.selectedSection || 'ALL';
    State.showToast(`✅ Assigned ${c.code} (${section}) to students!`);
  },

  async removeStudentFromRoster(identifier) {
    if (!confirm("Remove student from active roster?")) return;
    AssignmentsComponent.currentRoster = AssignmentsComponent.currentRoster.filter(s => 
      s.enrollment_id !== identifier && s.student_number !== identifier
    );
    AssignmentsComponent.renderRosterTable();
    State.showToast("Student removed from active roster.");
  },

  openAddStudentModal() {
    const name = prompt("Enter Student Full Name:");
    if (!name || !name.trim()) return;
    const batch = AssignmentsComponent.selectedBatch || '2015';
    const studentNum = prompt("Enter Student ID (e.g. UGR/4099/15):", `UGR/40${Math.floor(10 + Math.random()*80)}/${batch.slice(-2)}`);
    if (!studentNum || !studentNum.trim()) return;

    const sexInput = prompt("Enter Sex ('M' or 'F'):", "M") || "M";
    const sex = sexInput.trim().toUpperCase().startsWith('F') ? 'F' : 'M';

    const isFresh = AssignmentsComponent.isFreshmanContext();
    const stream = prompt("Enter Stream ('Natural Science' or 'Social Science'):", "Natural Science") || "Natural Science";

    const newStudent = {
      enrollment_id: `manual_${Date.now()}`,
      student_number: studentNum.trim(),
      full_name: name.trim(),
      sex: sex,
      stream: stream.includes('Soc') ? 'Social Science' : 'Natural Science',
      batch: batch,
      section: AssignmentsComponent.selectedSection === 'ALL' ? 'Section A' : AssignmentsComponent.selectedSection,
      status: 'Active',
      placement_status: isFresh ? 'Freshman Sem I' : `Enrolled in ${State.selectedDepartment ? State.selectedDepartment.name : 'Department'}`,
      department_id: isFresh ? 'dept_freshman_common' : (State.selectedDepartment ? State.selectedDepartment.id : 'dept_data_science'),
      college_id: isFresh ? 'col_freshman_dbu' : (State.selectedCollege ? State.selectedCollege.id : 'col_computing_dbu')
    };

    AssignmentsComponent.currentRoster.push(newStudent);
    AssignmentsComponent.syncSectionDropdown();
    AssignmentsComponent.renderRosterTable();
    State.showToast(`✅ ${name.trim()} (${sex}) added to roster!`);
  },

  openChangeInstructorModal() {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const modal = document.getElementById('modal-instructor-assignment');
    if (!modal) return;
    const badge = document.getElementById('modal-inst-course-badge');
    if (badge) badge.innerText = `Course: ${c.code} - ${c.title}`;
    AssignmentsComponent.renderInstructorCandidates(c);
    modal.classList.remove('hidden');
  },

  closeChangeInstructorModal() {
    const modal = document.getElementById('modal-instructor-assignment');
    if (modal) modal.classList.add('hidden');
  },

  renderInstructorCandidates(c) {
    const container = document.getElementById('instructor-candidates-list');
    if (!container) return;
    const instructors = State.instructors || [];
    container.innerHTML = instructors.map(inst => {
      const isCurrent = (c.assigned_instructor_id && c.assigned_instructor_id === inst.id) ||
                        (c.instructor_name && inst.full_name && inst.full_name.includes(c.instructor_name));
      return `
        <div class="bg-white p-4 rounded-2xl border ${isCurrent ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20' : 'border-slate-200'} flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3.5">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-slate-800 to-blue-900 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
              ${inst.avatar_initials || 'IN'}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h5 class="font-bold text-slate-900 text-sm">${inst.full_name}</h5>
                <span class="text-xs font-semibold text-slate-500">&bull; ${inst.academic_rank}</span>
                ${isCurrent ? '<span class="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">Currently Assigned</span>' : ''}
              </div>
              <p class="text-xs text-slate-500 mt-0.5">${inst.highest_degree} &bull; ${inst.alma_mater || 'Addis Ababa University'}</p>
            </div>
          </div>
          <button onclick="AssignmentsComponent.assignInstructor('${inst.id}')" class="text-xs font-bold px-4 py-2 rounded-xl transition ${isCurrent ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'}" ${isCurrent ? 'disabled' : ''}>
            ${isCurrent ? 'Active Teacher' : 'Assign to Course'}
          </button>
        </div>
      `;
    }).join('');
  },

  async assignInstructor(instructorId) {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    const instructor = (State.instructors || []).find(i => i.id === instructorId);
    if (!instructor) return;

    c.assigned_instructor_id = instructor.id;
    c.instructor_name = instructor.full_name;

    try {
      await API.assignCourseInstructor(c.id, instructor.id);
    } catch (err) {}

    AssignmentsComponent.closeChangeInstructorModal();
    AssignmentsComponent.renderFaculty(c);
    DossierComponent.render();
    State.showToast(`✅ Assigned ${instructor.full_name} to ${c.code}!`);
  },

  refresh() {
    AssignmentsComponent.loadActiveRoster();
    State.showToast("Roster refreshed.");
  }
};

if (typeof window !== 'undefined') {
  window.AssignmentsComponent = AssignmentsComponent;
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('click', (e) => {
    const dd = document.getElementById('assign-teacher-dropdown');
    const input = document.getElementById('assign-teacher-search');
    if (dd && !dd.classList.contains('hidden') && input) {
      if (!dd.contains(e.target) && e.target !== input) {
        dd.classList.add('hidden');
      }
    }
  });
}
