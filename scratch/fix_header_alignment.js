const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../clo_system');

// 1. Update layout/header.html
const layoutHeaderPath = path.join(BASE_DIR, 'templates/layout/header.html');
const layoutHeaderHtml = `<!-- Top Global Header / Dynamic Breadcrumb & User Session Bar -->
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20 no-print gap-4">
  <div id="breadcrumb-bar" class="flex items-center gap-2 text-sm font-semibold text-slate-600 min-w-0 overflow-hidden whitespace-nowrap">
    <!-- Rendered dynamically via Sidebar.updateBreadcrumb() -->
  </div>

  <div id="header-actions" class="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
    <!-- Active Role Pill -->
    <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 flex-shrink-0">
      Super Admin
    </span>

    <!-- Super Admin Identity Display -->
    <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-shrink-0 text-xs">
      <span class="font-bold text-slate-800">Academic VP / QA</span>
      <span class="font-mono text-slate-400 text-[10px]">DBU-ADMIN-001</span>
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
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer flex-shrink-0" title="Sign out of university session">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      <span>Sign Out</span>
    </button>
  </div>
</header>
`;
fs.writeFileSync(layoutHeaderPath, layoutHeaderHtml, 'utf8');
console.log('✓ Fixed layout/header.html alignment (single horizontal row, no wrapping)');

// 2. Update teacher/header.html
const teacherHeaderPath = path.join(BASE_DIR, 'templates/teacher/header.html');
const teacherHeaderHtml = `<!-- ========================================================================= -->
<!-- TOP MODERN HEADER / BRAND & ACTIONS (Clean, Minimal, Institutional RBAC)  -->
<!-- ========================================================================= -->
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-2xs no-print gap-4">
  <!-- Brand & Portal Name -->
  <div class="flex items-center gap-3 min-w-0 overflow-hidden whitespace-nowrap">
    <div class="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
      DBU
    </div>
    <div class="min-w-0 truncate">
      <div class="font-black text-xs uppercase tracking-wide text-slate-900 leading-tight truncate">Debre Berhan University</div>
      <div class="text-[11px] text-blue-700 font-bold leading-tight flex items-center gap-1.5 truncate">
        <span>OBE &amp; CLO Attainment Enterprise Portal</span>
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0"></span>
      </div>
    </div>
  </div>

  <!-- Right: Identity & Sign Out (Clean, Single Line, No Wrap) -->
  <div class="flex items-center gap-3 flex-shrink-0 whitespace-nowrap">
    <!-- Active Role Pill -->
    <span id="header-active-role-pill" class="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
      Instructor
    </span>

    <!-- Authenticated Faculty Identity Display -->
    <div id="header-user-display" class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 flex-shrink-0 text-xs">
      <span id="header-user-name" class="font-bold text-slate-800">Dr. Adimias W (PhD)</span>
      <span id="header-user-id" class="font-mono text-slate-400 text-[10px]">DBU-FAC-2015</span>
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
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer flex-shrink-0" title="Sign out of university session">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      <span>Sign Out</span>
    </button>
  </div>
</header>
`;
fs.writeFileSync(teacherHeaderPath, teacherHeaderHtml, 'utf8');
console.log('✓ Fixed teacher/header.html alignment (single horizontal row, no wrapping)');

// 3. Update static/js/components/sidebar.js
const sidebarJsPath = path.join(BASE_DIR, 'static/js/components/sidebar.js');
let sidebarJs = fs.readFileSync(sidebarJsPath, 'utf8');

const targetMethodRegex = /updateBreadcrumb\(stage\) \{[\s\S]*?bar\.innerHTML = html;\s*\}/;
const newMethodCode = `updateBreadcrumb(stage) {
    const bar = document.getElementById('breadcrumb-bar');
    if (!bar) return;

    let html = \`
      <span class="hover:text-blue-600 cursor-pointer font-bold flex items-center gap-1.5 whitespace-nowrap flex-shrink-0" onclick="App.goToStage('colleges')">
        <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <span>Debre Berhan University</span>
      </span>
    \`;

    if (stage === 'freshman-hub') {
      html += \`
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 whitespace-nowrap truncate max-w-xs">
          College of Freshman Studies &bull; Common Courses Studio
        </span>
      \`;
      bar.innerHTML = html;
      return;
    }

    if (stage === 'assignments') {
      if (State.selectedCollege) {
        html += \`
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="font-semibold text-slate-600 whitespace-nowrap truncate max-w-[180px]">
            \${State.selectedCollege.name}
          </span>
        \`;
      }
      if (State.selectedDepartment) {
        html += \`
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="font-semibold text-slate-600 whitespace-nowrap truncate max-w-[180px]">
            \${State.selectedDepartment.name}
          </span>
        \`;
      }
      html += \`
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 whitespace-nowrap flex-shrink-0">
          Course Assignments
        </span>
      \`;
      bar.innerHTML = html;
      return;
    }

    const isFresh = (State.selectedCollege && (State.selectedCollege.id === 'col_freshman_dbu' || State.selectedCollege.is_freshman_college === 1)) ||
                    (stage === 'course-studio' && State.activeCourse && State.activeCourse.department_id === 'dept_freshman_common');

    if (isFresh) {
      html += \`
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="hover:text-blue-600 cursor-pointer font-semibold whitespace-nowrap truncate max-w-[180px]" onclick="App.goToStage('freshman-hub')">
          College of Freshman Studies
        </span>
      \`;
    } else {
      if (State.selectedCollege) {
        html += \`
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="hover:text-blue-600 cursor-pointer font-semibold whitespace-nowrap truncate max-w-[180px]" onclick="App.goToStage('departments')">
            \${State.selectedCollege.name}
          </span>
        \`;
      }

      if (State.selectedDepartment) {
        html += \`
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="hover:text-blue-600 cursor-pointer font-semibold whitespace-nowrap truncate max-w-[180px]" onclick="App.goToStage('courses')">
            \${State.selectedDepartment.name}
          </span>
        \`;
      }
    }

    if (stage === 'course-studio' && State.activeCourse) {
      html += \`
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 whitespace-nowrap truncate max-w-[240px]">
          \${State.activeCourse.code}: \${State.activeCourse.title}
        </span>
      \`;
    }

    bar.innerHTML = html;
  }`;

sidebarJs = sidebarJs.replace(targetMethodRegex, newMethodCode);
fs.writeFileSync(sidebarJsPath, sidebarJs, 'utf8');
console.log('✓ Fixed sidebar.js updateBreadcrumb (whitespace-nowrap & truncate on all breadcrumb items)');

