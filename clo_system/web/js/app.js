/**
 * app.js
 * Application Entrypoint, Stage Router & Global Event Bindings
 */

const App = {
  async init() {
    await State.loadAllData();

    // Check deep link URL parameters
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('course_id');
    const mode = params.get('mode') || (params.get('tab') === 'view' ? 'view' : (params.get('tab') ? 'edit' : 'view'));
    const tab = params.get('tab') && params.get('tab') !== 'view' ? params.get('tab') : 'spec';

    if (courseId) {
      const found = State.courses.find(c => c.id === courseId);
      if (found) {
        if (found.department_id === 'dept_freshman_common' || found.stream) {
          State.selectedDepartment = null;
          State.selectedCollege = State.colleges.find(col => col.id === 'col_freshman_dbu' || col.is_freshman_college === 1) || { id: 'col_freshman_dbu', name: 'College of Freshman Studies' };
          State._studioReturnStage = 'freshman-hub';
        } else {
          State.selectedDepartment = State.departments.find(d => d.id === found.department_id);
          if (State.selectedDepartment) {
            State.selectedCollege = State.colleges.find(col => col.id === State.selectedDepartment.college_id);
          }
          State._studioReturnStage = 'courses';
        }
        CourseStudioComponent.open(courseId, mode, tab);
        return;
      }
    }

    App.goToStage('colleges');
  },

  switchPortal(portalName) {
    if (portalName === 'assignments') {
      App.goToStage('assignments');
    } else {
      // Return to curriculum portal
      if (State.activeCourse) {
        App.goToStage('course-studio');
      } else if (State.selectedDepartment) {
        App.goToStage('courses');
      } else if (State.selectedCollege) {
        if (State.selectedCollege.id === 'col_freshman_dbu' || (State.selectedCollege.name && State.selectedCollege.name.toLowerCase().includes('freshman'))) {
          App.goToStage('freshman-hub');
        } else {
          App.goToStage('departments');
        }
      } else {
        App.goToStage('colleges');
      }
    }
  },

  goToAssignmentsForCurrentCourse() {
    App.goToStage('assignments');
  },

  goToStage(stageName) {
    State.currentStage = stageName;

    // Clear course query params when navigating back to higher stages
    if (stageName !== 'course-studio' && stageName !== 'assignments') {
      const url = new URL(window.location);
      url.searchParams.delete('course_id');
      url.searchParams.delete('mode');
      url.searchParams.delete('tab');
      window.history.replaceState({}, '', url);
    }

    const stages = ['colleges', 'departments', 'courses', 'course-studio', 'assignments', 'freshman-hub'];
    stages.forEach(s => {
      const el = document.getElementById(`stage-${s}`);
      if (el) {
        if (s === stageName) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
    });

    Sidebar.updateProgress(stageName);
    Sidebar.updateBreadcrumb(stageName);

    if (stageName === 'colleges') CollegesComponent.render();
    if (stageName === 'departments') DepartmentsComponent.render();
    if (stageName === 'courses') CoursesComponent.render();
    if (stageName === 'assignments') AssignmentsComponent.render();
    if (stageName === 'freshman-hub') FreshmanHubComponent.render();
  }
};

// ==============================================================================
// GLOBAL WINDOW BINDINGS (for HTML inline onclick/onchange handlers)
// ==============================================================================
window.App = App;
window.State = State;
window.API = API;
window.CollegesComponent = CollegesComponent;
window.DepartmentsComponent = DepartmentsComponent;
window.CoursesComponent = CoursesComponent;
window.CourseStudioComponent = CourseStudioComponent;
window.AssignmentsComponent = AssignmentsComponent;
window.AssessmentComponent = AssessmentComponent;
window.DossierComponent = DossierComponent;
window.FreshmanHubComponent = FreshmanHubComponent;

// Convenience aliases for existing HTML callbacks
window.goToStage = App.goToStage;
window.switchPortal = App.switchPortal;
window.showToast = State.showToast;

// Studio Mode & Tabs
window.setStudioMode = CourseStudioComponent.setMode;
window.switchStudioTab = CourseStudioComponent.switchTab;
window.saveActiveCourse = CourseStudioComponent.save;

// Chapters
window.addChapterRow = CourseStudioComponent.addChapter;
window.deleteChapterRow = CourseStudioComponent.deleteChapter;
window.updateChapterField = CourseStudioComponent.updateChapter;

// CLOs
window.addCLORow = CourseStudioComponent.addCLO;
window.deleteCLORow = CourseStudioComponent.deleteCLO;
window.updateCLOField = CourseStudioComponent.updateCLO;

// Assessment Blueprint
window.addAssessmentTask = CourseStudioComponent.addAssessment;
window.deleteAssessmentTask = CourseStudioComponent.deleteAssessment;
window.updateAssessmentField = CourseStudioComponent.updateAssessment;
window.toggleCLOInAssessment = CourseStudioComponent.toggleCLOInAssessment;
window.updateAllocatedMarks = CourseStudioComponent.updateAllocatedMarks;

// Dossier View, Print, Export
window.renderSyllabusDossier = DossierComponent.render;
window.printOfficialSyllabus = DossierComponent.print;
window.copySyllabusLink = DossierComponent.copyLink;
window.downloadSyllabusHtml = DossierComponent.downloadHtml;

// Modals: Colleges
window.openAddCollegeModal = CollegesComponent.openAddModal;
window.openEditCollegeModal = CollegesComponent.openEditModal;
window.closeCollegeModal = CollegesComponent.closeModal;
window.submitCollegeModal = CollegesComponent.submitModal;

// Modals: Departments
window.openAddDeptModal = DepartmentsComponent.openAddModal;
window.openEditDeptModal = DepartmentsComponent.openEditModal;
window.closeDeptModal = DepartmentsComponent.closeModal;
window.submitDeptModal = DepartmentsComponent.submitModal;

// Modals: Courses
window.openAddCourseModal = CoursesComponent.openAddModal;
window.closeAddCourseModal = CoursesComponent.closeAddModal;
window.fillTemplate = CoursesComponent.fillTemplate;
window.submitCourseModal = CoursesComponent.submitAddModal;
window.deleteCourse = CoursesComponent.deleteCourse;
window.setYearFilter = CoursesComponent.setYearFilter;
window.setSemFilter = CoursesComponent.setSemFilter;

// Modals: Program Learning Outcomes (PLOs)
window.openManagePLOsModal = CourseStudioComponent.openManagePLOsModal;
window.closeManagePLOsModal = CourseStudioComponent.closeManagePLOsModal;
window.submitNewPLO = CourseStudioComponent.submitNewPLO;
window.deletePLO = CourseStudioComponent.deletePLO;
window.startEditPLO = CourseStudioComponent.startEditPLO;
window.cancelEditPLO = CourseStudioComponent.cancelEditPLO;
window.saveEditPLO = CourseStudioComponent.saveEditPLO;

// Staffing & Student Assignments (Stage 5)
window.openChangeInstructorModal = () => (AssignmentsComponent.openChangeInstructorModal || CourseStudioComponent.openChangeInstructorModal)();
window.closeChangeInstructorModal = () => (AssignmentsComponent.closeChangeInstructorModal || CourseStudioComponent.closeChangeInstructorModal)();
window.assignInstructor = (id) => (AssignmentsComponent.assignInstructor || CourseStudioComponent.assignInstructor)(id);
window.onStaffingBatchChange = (b) => (AssignmentsComponent.onBatchChange || CourseStudioComponent.onStaffingBatchChange)(b);
window.onStaffingSectionChange = (s) => (AssignmentsComponent.onSectionChange || CourseStudioComponent.onStaffingSectionChange)(s);
window.enrollSelectedBatch = () => (AssignmentsComponent.enrollSelectedBatch || CourseStudioComponent.enrollSelectedBatch)();
window.removeStudentFromRoster = (id) => (AssignmentsComponent.removeStudentFromRoster || CourseStudioComponent.removeStudentFromRoster)(id);
window.openAddStudentModal = () => (AssignmentsComponent.openAddStudentModal || CourseStudioComponent.openAddStudentModal)();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', App.init);

