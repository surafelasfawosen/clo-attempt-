/**
 * sidebar.js
 * Vertical Sidebar and Top Header Breadcrumb Component
 */

const Sidebar = {
  updateProgress(stage) {
    const curBtn = document.getElementById('portal-btn-curriculum');
    const assignBtn = document.getElementById('portal-btn-assignments');
    const curSub = document.getElementById('portal-sub-curriculum');
    const assignSub = document.getElementById('portal-sub-assignments');

    const activeStyle = 'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 transition group';
    const inactiveStyle = 'w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/70 font-semibold transition group';

    if (stage === 'assignments') {
      if (curBtn) {
        curBtn.className = inactiveStyle;
        const curSvg = curBtn.querySelector('svg');
        if (curSvg) curSvg.className = 'w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-blue-400';
      }
      if (curSub) curSub.className = 'text-[11px] text-slate-400 font-normal';

      if (assignBtn) {
        assignBtn.className = activeStyle;
        const assignSvg = assignBtn.querySelector('svg');
        if (assignSvg) assignSvg.className = 'w-5 h-5 flex-shrink-0 text-white';
      }
      if (assignSub) assignSub.className = 'text-[11px] text-blue-100 font-normal';
    } else {
      if (curBtn) {
        curBtn.className = activeStyle;
        const curSvg = curBtn.querySelector('svg');
        if (curSvg) curSvg.className = 'w-5 h-5 flex-shrink-0 text-white';
      }
      if (curSub) curSub.className = 'text-[11px] text-blue-100 font-normal';

      if (assignBtn) {
        assignBtn.className = inactiveStyle;
        const assignSvg = assignBtn.querySelector('svg');
        if (assignSvg) assignSvg.className = 'w-5 h-5 flex-shrink-0 text-slate-400 group-hover:text-blue-400';
      }
      if (assignSub) assignSub.className = 'text-[11px] text-slate-400 font-normal';
    }
  },

  updateBreadcrumb(stage) {
    const bar = document.getElementById('breadcrumb-bar');
    if (!bar) return;

    let html = `
      <span class="hover:text-blue-600 cursor-pointer font-bold flex items-center gap-1.5 whitespace-nowrap flex-shrink-0" onclick="App.goToStage('colleges')">
        <svg class="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <span>Debre Berhan University</span>
      </span>
    `;

    if (stage === 'freshman-hub') {
      html += `
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 whitespace-nowrap truncate max-w-xs">
          College of Freshman Studies &bull; Common Courses Studio
        </span>
      `;
      bar.innerHTML = html;
      return;
    }

    if (stage === 'assignments') {
      if (State.selectedCollege) {
        html += `
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="font-semibold text-slate-600 whitespace-nowrap truncate max-w-[180px]">
            ${State.selectedCollege.name}
          </span>
        `;
      }
      if (State.selectedDepartment) {
        html += `
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="font-semibold text-slate-600 whitespace-nowrap truncate max-w-[180px]">
            ${State.selectedDepartment.name}
          </span>
        `;
      }
      html += `
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 whitespace-nowrap flex-shrink-0">
          Course Assignments
        </span>
      `;
      bar.innerHTML = html;
      return;
    }

    const isFresh = (State.selectedCollege && (State.selectedCollege.id === 'col_freshman_dbu' || State.selectedCollege.is_freshman_college === 1)) ||
                    (stage === 'course-studio' && State.activeCourse && State.activeCourse.department_id === 'dept_freshman_common');

    if (isFresh) {
      html += `
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="hover:text-blue-600 cursor-pointer font-semibold whitespace-nowrap truncate max-w-[180px]" onclick="App.goToStage('freshman-hub')">
          College of Freshman Studies
        </span>
      `;
    } else {
      if (State.selectedCollege) {
        html += `
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="hover:text-blue-600 cursor-pointer font-semibold whitespace-nowrap truncate max-w-[180px]" onclick="App.goToStage('departments')">
            ${State.selectedCollege.name}
          </span>
        `;
      }

      if (State.selectedDepartment) {
        html += `
          <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
          <span class="hover:text-blue-600 cursor-pointer font-semibold whitespace-nowrap truncate max-w-[180px]" onclick="App.goToStage('courses')">
            ${State.selectedDepartment.name}
          </span>
        `;
      }
    }

    if (stage === 'course-studio' && State.activeCourse) {
      html += `
        <span class="text-slate-300 flex-shrink-0">&rsaquo;</span>
        <span class="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200 whitespace-nowrap truncate max-w-[240px]">
          ${State.activeCourse.code}: ${State.activeCourse.title}
        </span>
      `;
    }

    bar.innerHTML = html;
  }
};

window.Sidebar = Sidebar;
