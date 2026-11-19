const fs = require('fs');
const path = require('path');

const portalJsPath = path.join(__dirname, '../clo_system/static/js/teacher_portal.js');
let portalJs = fs.readFileSync(portalJsPath, 'utf8');

const targetStr = `  switchToRoleView(role) {
    TeacherPortal.activeRole = role;

    const teacherScreen = document.getElementById('teacher-dashboard-screen');
    const adminScreen = document.getElementById('admin-curriculum-workspace');
    const teacherHome = document.getElementById('teacher-course-selection-view');
    const teacherCourse = document.getElementById('teacher-course-workspace');
    const deptView = document.getElementById('depthead-dashboard-view');
    const deanView = document.getElementById('dean-dashboard-view');
    const rolePill = document.getElementById('header-active-role-pill');
    const accountSelect = document.getElementById('teacher-account-select');
    const adminAccountSelect = document.getElementById('admin-account-select');

    if (accountSelect && TeacherPortal.currentUser) {
      accountSelect.value = TeacherPortal.currentUser.id;
    }
    if (adminAccountSelect && TeacherPortal.currentUser) {
      adminAccountSelect.value = TeacherPortal.currentUser.id;
    }

    if (role === 'super_admin') {
      if (adminScreen) adminScreen.classList.remove('hidden');
      if (teacherScreen) teacherScreen.classList.add('hidden');
      if (rolePill) {
        rolePill.innerText = 'Super Admin';
        rolePill.className = 'hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200';
      }
      if (typeof window !== 'undefined' && window.App && window.App.goToStage) {
        window.App.goToStage(window.State?.currentStage || 'colleges');
      }
    } else {
      if (adminScreen) adminScreen.classList.add('hidden');
      if (teacherScreen) teacherScreen.classList.remove('hidden');`;

const replacementStr = `  switchToRoleView(role) {
    TeacherPortal.activeRole = role;

    const teacherScreen = document.getElementById('teacher-dashboard-screen');
    const adminScreen = document.getElementById('admin-curriculum-workspace');
    const teacherHome = document.getElementById('teacher-course-selection-view');
    const teacherCourse = document.getElementById('teacher-course-workspace');
    const deptView = document.getElementById('depthead-dashboard-view');
    const deanView = document.getElementById('dean-dashboard-view');
    const rolePill = document.getElementById('header-active-role-pill');
    const accountSelect = document.getElementById('teacher-account-select');
    const adminAccountSelect = document.getElementById('admin-account-select');
    const adminStudioBtn = document.getElementById('header-admin-studio-btn');
    const userNameEl = document.getElementById('header-user-name');
    const userIdEl = document.getElementById('header-user-id');

    if (userNameEl && TeacherPortal.currentUser) {
      userNameEl.innerText = TeacherPortal.currentUser.name;
    }
    if (userIdEl && TeacherPortal.currentUser) {
      userIdEl.innerText = TeacherPortal.currentUser.id;
    }

    if (accountSelect && TeacherPortal.currentUser) {
      accountSelect.value = TeacherPortal.currentUser.id;
    }
    if (adminAccountSelect && TeacherPortal.currentUser) {
      adminAccountSelect.value = TeacherPortal.currentUser.id;
    }

    if (role === 'super_admin') {
      if (adminScreen) adminScreen.classList.remove('hidden');
      if (teacherScreen) teacherScreen.classList.add('hidden');
      if (adminStudioBtn) adminStudioBtn.classList.remove('hidden');
      if (rolePill) {
        rolePill.innerText = 'Super Admin';
        rolePill.className = 'hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200';
      }
      if (typeof window !== 'undefined' && window.App && window.App.goToStage) {
        window.App.goToStage(window.State?.currentStage || 'colleges');
      }
    } else {
      // Teachers and department staff never see Curriculum Studio
      if (adminStudioBtn) adminStudioBtn.classList.add('hidden');
      if (adminScreen) adminScreen.classList.add('hidden');
      if (teacherScreen) teacherScreen.classList.remove('hidden');`;

if (portalJs.includes(targetStr)) {
  portalJs = portalJs.replace(targetStr, replacementStr);
  console.log('✓ Updated switchToRoleView to strictly hide Curriculum Studio from teachers');
} else {
  console.warn('⚠️ Target string not matched');
}

// Remove checkmark emoji
portalJs = portalJs.replace(
  'TeacherPortal.showToast("✓ Exam paper submitted for Department Moderation Committee review.");',
  'TeacherPortal.showToast("Exam paper submitted for Department Moderation Committee review.");'
);

fs.writeFileSync(portalJsPath, portalJs, 'utf8');
console.log('✓ Successfully saved updated teacher_portal.js');

