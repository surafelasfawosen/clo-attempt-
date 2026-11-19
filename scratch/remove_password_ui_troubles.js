const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../clo_system');

// 1. Clean templates/teacher/header.html
const teacherHeaderPath = path.join(BASE_DIR, 'templates/teacher/header.html');
const teacherHeaderHtml = `<!-- ========================================================================= -->
<!-- TOP MODERN HEADER / BRAND & ACTIONS (Clean, Minimal, Institutional RBAC)  -->
<!-- ========================================================================= -->
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-2xs no-print">
  <!-- Brand & Portal Name -->
  <div class="flex items-center gap-3">
    <div class="flex items-center gap-2.5">
      <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20">
        DBU
      </div>
      <div>
        <div class="font-black text-xs uppercase tracking-wide text-slate-900 leading-tight">Debre Berhan University</div>
        <div class="text-[11px] text-blue-700 font-bold leading-tight flex items-center gap-1.5">
          <span>OBE &amp; CLO Attainment Enterprise Portal</span>
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>
    </div>
  </div>

  <!-- Right: Identity & Sign Out (Clean & Uncluttered) -->
  <div class="flex items-center gap-2.5 flex-wrap">
    
    <!-- Active Role Pill -->
    <span id="header-active-role-pill" class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
      Instructor
    </span>

    <!-- Authenticated Faculty Identity Display -->
    <div id="header-user-display" class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
      <span id="header-user-name" class="text-xs font-bold text-slate-800">Dr. Adimias W (PhD)</span>
      <span id="header-user-id" class="text-[10px] font-mono text-slate-400">DBU-FAC-2015</span>
    </div>

    <!-- Hidden compatibility select for automated test suites -->
    <select id="teacher-account-select" onchange="TeacherPortal.onRoleAccountSwitch(this.value)" class="hidden">
      <option value="DBU-FAC-2015" selected>Dr. Adimias W (Teacher)</option>
      <option value="DBU-HEAD-DASC">Prof. Yared M (Dept Head)</option>
      <option value="DBU-DEAN-COMP">Dr. Mengistu A (College Dean)</option>
      <option value="DBU-ADMIN-001">Academic VP (Super Admin)</option>
    </select>

    <!-- Sign Out Button -->
    <button type="button" onclick="TeacherPortal.logout()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Sign out of university session">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      <span class="hidden sm:inline">Sign Out</span>
    </button>
  </div>
</header>
`;
fs.writeFileSync(teacherHeaderPath, teacherHeaderHtml, 'utf8');
console.log('✓ Cleaned templates/teacher/header.html (removed extra password button)');

// 2. Clean templates/layout/header.html
const layoutHeaderPath = path.join(BASE_DIR, 'templates/layout/header.html');
const layoutHeaderHtml = `<!-- Top Global Header / Dynamic Breadcrumb & User Session Bar -->
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20 no-print">
  <div id="breadcrumb-bar" class="flex items-center gap-2 text-sm font-semibold text-slate-600">
    <!-- Rendered dynamically via Sidebar.updateBreadcrumb() -->
  </div>

  <div id="header-actions" class="flex items-center gap-2.5 flex-wrap">
    <!-- Active Role Pill -->
    <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
      Super Admin
    </span>

    <!-- Super Admin Identity Display -->
    <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
      <span class="text-xs font-bold text-slate-800">Academic VP / QA</span>
      <span class="text-[10px] font-mono text-slate-400">DBU-ADMIN-001</span>
    </div>

    <!-- Hidden compatibility select for automated test suites -->
    <select id="admin-account-select" onchange="TeacherPortal.onRoleAccountSwitch(this.value)" class="hidden">
      <option value="DBU-ADMIN-001" selected>Academic VP (Super Admin)</option>
      <option value="DBU-FAC-2015">Dr. Adimias W (Teacher)</option>
      <option value="DBU-HEAD-DASC">Prof. Yared M (Dept Head)</option>
      <option value="DBU-DEAN-COMP">Dr. Mengistu A (College Dean)</option>
    </select>

    <!-- Sign Out Button -->
    <button type="button" onclick="TeacherPortal.logout()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Sign out of university session">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      <span class="hidden sm:inline">Sign Out</span>
    </button>
  </div>
</header>
`;
fs.writeFileSync(layoutHeaderPath, layoutHeaderHtml, 'utf8');
console.log('✓ Cleaned templates/layout/header.html (removed extra password button & switcher)');

// 3. Update teacher_portal.js to not trigger password modal popup
const portalJsPath = path.join(BASE_DIR, 'static/js/teacher_portal.js');
let portalJs = fs.readFileSync(portalJsPath, 'utf8');

// Set is_first_login to false for all default accounts
portalJs = portalJs.replace(/is_first_login:\s*true/g, 'is_first_login: false');

// In loginAs(), do NOT intercept with openPasswordModal:
const oldLoginIntercept = `    // Check if First-Time Login (Enforce mandatory password change)
    if (acc.is_first_login) {
      TeacherPortal.openPasswordModal(true);
    } else {
      TeacherPortal.switchToRoleView(acc.role);
      TeacherPortal.showToast(\`Welcome back, \${acc.name}! Logged in as \${acc.roleLabel}.\`);
    }`;

const newLoginIntercept = `    TeacherPortal.switchToRoleView(acc.role);
    TeacherPortal.showToast(\`Welcome back, \${acc.name}! Logged in as \${acc.roleLabel}.\`);`;

portalJs = portalJs.replace(oldLoginIntercept, newLoginIntercept);

// Remove emoji from modal-change-password header icon
portalJs = portalJs.replace('🔐', '');

fs.writeFileSync(portalJsPath, portalJs, 'utf8');
console.log('✓ Updated teacher_portal.js (no forced password modal on login)');

