/**
 * unify_portal.js
 * Unifies the Debre Berhan University Portal into a single, secure, role-based entry point:
 * 1. Completely removes "Login as Teacher" button from all headers.
 * 2. Establishes institutional login gate at index.html (and teacher.html).
 * 3. Enforces initial password reset for first login.
 * 4. Dynamically routes authenticated users to their authorized workspace:
 *    - Teacher -> Teacher Portal, Assigned Courses, Exam Moderation & Student Result Collection Format
 *    - Department Head -> Moderation Queue & Staffing
 *    - College Dean -> Executive Accreditation Rollup
 *    - Super Admin -> Institutional Curriculum Studio
 * 5. Removes all emojis from login and header buttons.
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '../clo_system');

// 1. Update templates/layout/header.html
const layoutHeaderPath = path.join(BASE_DIR, 'templates/layout/header.html');
const layoutHeaderContent = `<!-- Top Global Header / Dynamic Breadcrumb & User Session Bar -->
<header class="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-20 no-print">
  <div id="breadcrumb-bar" class="flex items-center gap-2 text-sm font-semibold text-slate-600">
    <!-- Rendered dynamically via Sidebar.updateBreadcrumb() -->
  </div>

  <div id="header-actions" class="flex items-center gap-2.5 flex-wrap">
    <!-- Active Role Pill -->
    <span class="inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
      Super Admin
    </span>

    <!-- Role Account Switcher -->
    <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
      <span class="text-xs font-semibold text-slate-500 hidden md:inline">Account:</span>
      <select id="admin-account-select" onchange="TeacherPortal.onRoleAccountSwitch(this.value)"
        class="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate">
        <option value="DBU-ADMIN-001" selected>Academic VP (Super Admin)</option>
        <option value="DBU-FAC-2015">Dr. Adimias W (Teacher)</option>
        <option value="DBU-HEAD-DASC">Prof. Yared M (Dept Head)</option>
        <option value="DBU-DEAN-COMP">Dr. Mengistu A (College Dean)</option>
      </select>
    </div>

    <!-- Switch to Teacher View Button -->
    <button type="button" onclick="TeacherPortal.switchToRoleView('teacher')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Switch to Faculty View">
      <span>Teacher View &rarr;</span>
    </button>

    <!-- Password Modal Trigger -->
    <button type="button" onclick="TeacherPortal.openPasswordModal(false)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Security & Password Setup">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      <span class="hidden lg:inline">Password</span>
    </button>

    <!-- Sign Out Button -->
    <button type="button" onclick="TeacherPortal.logout()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Sign out of university session">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      <span class="hidden sm:inline">Sign Out</span>
    </button>
  </div>
</header>
`;
fs.writeFileSync(layoutHeaderPath, layoutHeaderContent, 'utf8');
console.log('✓ Updated templates/layout/header.html (removed Login as Teacher button)');

// 2. Update templates/teacher/header.html
const teacherHeaderPath = path.join(BASE_DIR, 'templates/teacher/header.html');
const teacherHeaderContent = `<!-- ========================================================================= -->
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

  <!-- Right: Role Switcher, Security & Sign Out -->
  <div class="flex items-center gap-2.5 flex-wrap">
    
    <!-- Active Role Pill -->
    <span id="header-active-role-pill" class="hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
      Instructor
    </span>

    <!-- Unified Role & Identity Switcher Dropdown -->
    <div class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
      <span class="text-xs font-semibold text-slate-500 hidden md:inline">Account:</span>
      <select id="teacher-account-select" onchange="TeacherPortal.onRoleAccountSwitch(this.value)"
        class="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[200px] truncate">
        <option value="DBU-FAC-2015" selected>Dr. Adimias W (Teacher)</option>
        <option value="DBU-HEAD-DASC">Prof. Yared M (Dept Head)</option>
        <option value="DBU-DEAN-COMP">Dr. Mengistu A (College Dean)</option>
        <option value="DBU-ADMIN-001">Academic VP (Super Admin)</option>
      </select>
    </div>

    <!-- Security: Change Password Button -->
    <button type="button" onclick="TeacherPortal.openPasswordModal(false)"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Security & Password Setup">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
      <span class="hidden lg:inline">Password</span>
    </button>

    <!-- Sign Out Button -->
    <button type="button" onclick="TeacherPortal.logout()"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Sign out / Switch account">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      <span class="hidden sm:inline">Sign Out</span>
    </button>

    <!-- Super Admin Curriculum Studio Button -->
    <button type="button" id="header-admin-studio-btn" onclick="TeacherPortal.switchToRoleView('super_admin')"
      class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer" title="Institutional Curriculum Studio">
      <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
      <span class="hidden sm:inline">Curriculum Studio</span>
    </button>
  </div>
</header>
`;
fs.writeFileSync(teacherHeaderPath, teacherHeaderContent, 'utf8');
console.log('✓ Updated templates/teacher/header.html');

// 3. Update templates/teacher/login_screen.html (No emojis, clean institutional design)
const loginScreenPath = path.join(BASE_DIR, 'templates/teacher/login_screen.html');
const loginScreenContent = `<!-- ========================================================================= -->
<!-- DEDICATED INSTITUTIONAL PORTAL LOGIN SCREEN                               -->
<!-- ========================================================================= -->
<section id="teacher-login-screen" class="min-h-screen w-full flex items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 fixed inset-0 z-50 overflow-y-auto">
  <div class="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden space-y-6 p-8 my-auto animate-fade-in">
    
    <!-- Institutional Branding Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-700 text-white font-black text-xl shadow-lg shadow-blue-600/30">
        DBU
      </div>
      <h2 class="text-xl font-black text-slate-900 tracking-tight">Debre Berhan University</h2>
      <p class="text-xs font-bold text-blue-700 uppercase tracking-wider">OBE Outcome &amp; Accreditation Portal</p>
      <p class="text-[11px] text-slate-500">Sign in with your Institutional ID and password (<span class="font-mono font-bold text-slate-700">1234dbu</span>) to access your authorized workspace.</p>
    </div>

    <!-- Quick Role / Institutional Account Selector -->
    <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
      <div class="flex items-center justify-between text-xs font-bold text-slate-700">
        <span>Select Institutional Account:</span>
        <span class="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-mono font-bold">Role-Based SSO</span>
      </div>
      
      <div class="grid grid-cols-2 gap-2 text-left">
        <button type="button" onclick="TeacherPortal.quickSelectAccount('DBU-FAC-2015')"
          class="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 transition flex flex-col text-left group cursor-pointer shadow-2xs">
          <div class="flex items-center justify-between w-full">
            <span class="text-[10px] font-bold text-blue-700 uppercase">Teacher</span>
            <span class="text-[10px] font-mono text-slate-400">FAC-2015</span>
          </div>
          <strong class="text-xs text-slate-800 group-hover:text-blue-700 truncate mt-0.5">Dr. Adimias W (PhD)</strong>
          <span class="text-[10px] text-slate-400 truncate">Dept of Data Science</span>
        </button>

        <button type="button" onclick="TeacherPortal.quickSelectAccount('DBU-HEAD-DASC')"
          class="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-500 hover:bg-indigo-50/40 transition flex flex-col text-left group cursor-pointer shadow-2xs">
          <div class="flex items-center justify-between w-full">
            <span class="text-[10px] font-bold text-indigo-700 uppercase">Dept Head</span>
            <span class="text-[10px] font-mono text-slate-400">Sub-Admin</span>
          </div>
          <strong class="text-xs text-slate-800 group-hover:text-indigo-700 truncate mt-0.5">Prof. Yared M (PhD)</strong>
          <span class="text-[10px] text-slate-400 truncate">Moderation &amp; Staffing</span>
        </button>

        <button type="button" onclick="TeacherPortal.quickSelectAccount('DBU-DEAN-COMP')"
          class="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 transition flex flex-col text-left group cursor-pointer shadow-2xs">
          <div class="flex items-center justify-between w-full">
            <span class="text-[10px] font-bold text-emerald-700 uppercase">College Dean</span>
            <span class="text-[10px] font-mono text-slate-400">Executive</span>
          </div>
          <strong class="text-xs text-slate-800 group-hover:text-emerald-700 truncate mt-0.5">Dr. Mengistu A (PhD)</strong>
          <span class="text-[10px] text-slate-400 truncate">College of Computing</span>
        </button>

        <button type="button" onclick="TeacherPortal.quickSelectAccount('DBU-ADMIN-001')"
          class="p-2.5 rounded-xl border border-slate-200 bg-white hover:border-purple-500 hover:bg-purple-50/40 transition flex flex-col text-left group cursor-pointer shadow-2xs">
          <div class="flex items-center justify-between w-full">
            <span class="text-[10px] font-bold text-purple-700 uppercase">Super Admin</span>
            <span class="text-[10px] font-mono text-slate-400">Senate/QA</span>
          </div>
          <strong class="text-xs text-slate-800 group-hover:text-purple-700 truncate mt-0.5">Academic VP / QA</strong>
          <span class="text-[10px] text-slate-400 truncate">Institutional Senate</span>
        </button>
      </div>

      <!-- Compatibility select for automated testing -->
      <select id="login-faculty-select" class="hidden">
        <option value="inst_adimias_w" selected>Dr. Adimias W (PhD)</option>
        <option value="inst_yared_m">Prof. Yared M (PhD)</option>
        <option value="inst_selamawit_t">Dr. Selamawit T (PhD)</option>
      </select>
    </div>

    <!-- Credentials Form -->
    <form onsubmit="event.preventDefault(); TeacherPortal.loginAs();" class="space-y-4 text-xs">
      <div>
        <label class="block font-bold text-slate-700 mb-1">Institutional ID or Email</label>
        <input type="text" id="login-email-input" value="DBU-FAC-2015" placeholder="e.g. DBU-FAC-2015 or adimias.w@dbu.edu.et" required class="w-full font-semibold px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900">
      </div>
      <div>
        <div class="flex items-center justify-between mb-1">
          <label class="block font-bold text-slate-700">Password</label>
          <span class="text-[10px] text-slate-400 font-mono">Default: 1234dbu</span>
        </div>
        <input type="password" id="login-password-input" value="1234dbu" placeholder="••••••••" required class="w-full font-mono px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900">
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-500">
        <label class="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="checkbox" checked class="rounded text-blue-600 focus:ring-blue-500">
          <span>Remember institutional session</span>
        </label>
        <span class="font-mono text-slate-400">Term: 2026/27 Sem II</span>
      </div>

      <div id="login-error-msg" class="hidden text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
        <!-- Error message rendered here -->
      </div>

      <button type="submit" class="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]">
        <span>Sign In to University Portal</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
      </button>
    </form>

    <!-- Institutional Footer -->
    <div class="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
      <span class="text-slate-400 flex items-center gap-1">
        <svg class="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd"></path></svg>
        256-Bit DBU SSL SSO
      </span>
      <span class="font-bold text-slate-500">
        Debre Berhan University &bull; 2026
      </span>
    </div>

  </div>
</section>
`;
fs.writeFileSync(loginScreenPath, loginScreenContent, 'utf8');
console.log('✓ Updated templates/teacher/login_screen.html (No emojis)');

// 4. Update templates/index.html to be the complete Unified Portal
const indexTmplPath = path.join(BASE_DIR, 'templates/index.html');
const indexTmplContent = `<!DOCTYPE html>
<html lang="en" class="h-full bg-slate-50">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Debre Berhan University &bull; OBE Outcome &amp; Accreditation Enterprise Portal</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Google Fonts: Plus Jakarta Sans & JetBrains Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- Chart.js for High-Fidelity Interactive Plots -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <!-- Modular Enterprise Stylesheets -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/studio.css">
  <link rel="stylesheet" href="css/teacher.css">
  <link rel="stylesheet" href="css/dossier.css">
  <link rel="stylesheet" href="css/print.css">
  <link rel="stylesheet" href="css/styles.css">
</head>

<body class="h-full flex overflow-hidden text-slate-800 antialiased flex-col">

  <!-- ========================================================================= -->
  <!-- DEDICATED INSTITUTIONAL PORTAL LOGIN SCREEN                               -->
  <!-- ========================================================================= -->
  {% include "teacher/login_screen.html" %}

  <!-- ========================================================================= -->
  <!-- WORKSPACE 1: FACULTY / DEPT HEAD / DEAN DASHBOARD CONTAINER              -->
  <!-- ========================================================================= -->
  <div id="teacher-dashboard-screen" class="h-full flex flex-1 overflow-hidden text-slate-800 antialiased flex-col">
    <!-- Top Modern Header & Active Role Switcher -->
    {% include "teacher/header.html" %}

    <!-- Main Workspace -->
    <main class="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto custom-scrollbar p-6 space-y-6">
      <div class="max-w-6xl mx-auto w-full space-y-6">
        <!-- Faculty Home (Profile & Assigned Courses) -->
        {% include "teacher/profile_banner.html" %}

        <!-- Department Head Dashboard -->
        {% include "teacher/depthead_view.html" %}

        <!-- College Dean Dashboard -->
        {% include "teacher/dean_view.html" %}

        <!-- Course Studio Workspace -->
        <div id="teacher-course-workspace" class="space-y-6 hidden">
          <!-- Top Course Navigation Bar -->
          <div class="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap justify-between items-center gap-4 no-print">
            <div class="flex items-center gap-3">
              <button type="button" onclick="TeacherPortal.closeCourse()" class="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer">
                <span>&larr; Back to My Courses</span>
              </button>
              <div class="h-5 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <div class="flex items-center gap-2">
                  <span id="active-course-code-badge" class="font-mono text-xs font-black bg-blue-600 text-white px-2.5 py-0.5 rounded-lg shadow-2xs">Stat4092</span>
                  <h2 id="active-course-title-heading" class="text-base font-black text-slate-900 tracking-tight">Operations Research and Optimization</h2>
                </div>
                <p id="active-course-stream-badge" class="text-[11px] text-slate-500 font-medium">B.Sc in Data Science &bull; Year 4 &bull; Semester II</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <select id="teacher-course-picker" onchange="TeacherPortal.onActiveCourseChange(this.value)" class="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer">
              </select>
              <span id="active-course-student-count" class="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-200">24 Students</span>
              <p id="active-course-desc" class="hidden">Operations Research</p>
            </div>
          </div>

          <!-- Horizontal Sub-Task Bar -->
          {% include "teacher/tabs_bar.html" %}

          <!-- Sub-Window 1: Assigned Courses & Roster -->
          {% include "teacher/tab_courses.html" %}

          <!-- Sub-Window 2: Exam & Question Studio -->
          {% include "teacher/tab_authoring.html" %}

          <!-- Sub-Window 3: Official CLO Attainment Report & Dashboard -->
          {% include "teacher/tab_report.html" %}

          <!-- Sub-Window 4: Student Result Collection & Mark Entry (Exact Excel Format) -->
          {% include "teacher/tab_results.html" %}
        </div>
      </div>
    </main>
  </div>

  <!-- ========================================================================= -->
  <!-- WORKSPACE 2: SUPER ADMIN CURRICULUM & SENATE STUDIO                      -->
  <!-- ========================================================================= -->
  <div id="admin-curriculum-workspace" class="h-full flex flex-1 overflow-hidden hidden">
    <!-- Vertical Taskbar Navigation -->
    {% include "layout/sidebar.html" %}

    <!-- Main Workspace -->
    <main class="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
      <!-- Top Dynamic Header & Breadcrumb -->
      {% include "layout/header.html" %}

      <!-- Scrollable Stage Content Container -->
      <div class="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <!-- Stage 1: Colleges -->
        {% include "stages/1_colleges.html" %}

        <!-- Stage 1.5: Freshman Academic & Placement Hub -->
        {% include "stages/freshman_hub.html" %}

        <!-- Stage 2: Departments -->
        {% include "stages/2_departments.html" %}

        <!-- Stage 3: Chronological Courses List -->
        {% include "stages/3_courses.html" %}

        <!-- Stage 4: Course Studio -->
        <section id="stage-course-studio" class="max-w-5xl mx-auto space-y-5 hidden">
          {% include "stages/4_studio/header.html" %}
          {% include "stages/4_studio/tabs_bar.html" %}
          {% include "stages/4_studio/tab_spec.html" %}
          {% include "stages/4_studio/tab_chapters.html" %}
          {% include "stages/4_studio/tab_clos.html" %}
          {% include "stages/4_studio/tab_blueprint.html" %}
          {% include "stages/4_studio/tab_dossier.html" %}
        </section>

        <!-- Stage 5: Course Staffing & Student Assignments Studio -->
        {% include "stages/5_assignments.html" %}
      </div>
    </main>
  </div>

  <!-- Dialog Modals for Curriculum Studio -->
  {% include "modals/college_modal.html" %}
  {% include "modals/department_modal.html" %}
  {% include "modals/course_modal.html" %}
  {% include "modals/plo_modal.html" %}
  {% include "modals/instructor_modal.html" %}

  <!-- Modals for Teacher Portal & Security -->
  {% include "teacher/tab_profile.html" %}
  {% include "teacher/modals.html" %}

  <!-- Toast Notification -->
  {% include "components/toast.html" %}

  <!-- JavaScript Components & Bootstrapper -->
  {% include "components/scripts.html" %}
  <script src="js/teacher_portal.js?v=6.0"></script>
  <script>
    function openCourse(id) {
      if (window.TeacherPortal && window.TeacherPortal.openCourse) {
        window.TeacherPortal.openCourse(id);
      }
    }
    function closeCourse() {
      if (window.TeacherPortal && window.TeacherPortal.closeCourse) {
        window.TeacherPortal.closeCourse();
      }
    }
  </script>
</body>
</html>
`;
fs.writeFileSync(indexTmplPath, indexTmplContent, 'utf8');
console.log('✓ Updated templates/index.html (Unified Portal)');

// 5. Update templates/teacher.html (Keep synchronized with index.html)
const teacherTmplPath = path.join(BASE_DIR, 'templates/teacher.html');
fs.writeFileSync(teacherTmplPath, indexTmplContent, 'utf8');
console.log('✓ Updated templates/teacher.html (Synchronized with Unified Portal)');

