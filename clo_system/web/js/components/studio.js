/**
 * studio.js
 * Stage 4: Course Studio & 4 Editing Sub-Tabs Component
 * (Tab 1: Spec | Tab 2: Chapters | Tab 3: CLOs | Tab 4: Blueprint)
 */

const CourseStudioComponent = {
  open(courseId, initialMode = 'view', initialTab = 'spec') {
    const found = State.courses.find(c => c.id === courseId) ||
                  (typeof FreshmanHubComponent !== 'undefined' && (FreshmanHubComponent.courses || []).find(c => c.id === courseId)) ||
                  (State.activeCourse && State.activeCourse.id === courseId ? State.activeCourse : null);
    if (!found) return;
    State.activeCourse = found;
    if (!State.courses.some(c => c.id === found.id)) {
      State.courses.push(found);
    }

    App.goToStage('course-studio');

    // ── Determine context (freshman vs regular department) ──────────────────
    const isFreshmanCourse = found.department_id === 'dept_freshman_common' ||
                             (found.stream && found.stream !== '') ||
                             (State.selectedCollege && (State.selectedCollege.id === 'col_freshman_dbu' || State.selectedCollege.is_freshman_college === 1));

    // If this is a freshman course, force the correct context labels and
    // remember we came from freshman-hub so "Back" returns there.
    if (isFreshmanCourse) {
      State._studioReturnStage = 'freshman-hub';
      State.selectedDepartment = null; // No department for Freshman Studies
      State.selectedCollege = State.colleges
        ? State.colleges.find(col => col.id === 'col_freshman_dbu' || col.is_freshman_college === 1) || { id: 'col_freshman_dbu', name: 'College of Freshman Studies' }
        : { id: 'col_freshman_dbu', name: 'College of Freshman Studies' };
    } else {
      // For regular department courses, go back to the courses list
      State._studioReturnStage = 'courses';
      // Ensure selectedDepartment and selectedCollege are set correctly
      if (!State.selectedDepartment || State.selectedDepartment.id !== found.department_id) {
        State.selectedDepartment = (State.departments || []).find(d => d.id === found.department_id) || State.selectedDepartment;
      }
      if (State.selectedDepartment && (!State.selectedCollege || State.selectedCollege.id !== State.selectedDepartment.college_id)) {
        State.selectedCollege = (State.colleges || []).find(col => col.id === State.selectedDepartment.college_id) || State.selectedCollege;
      }
    }

    // Header metadata
    document.getElementById('studio-course-title').innerText = `${State.activeCourse.code}: ${State.activeCourse.title}`;
    document.getElementById('studio-course-year-pill').innerText = isFreshmanCourse 
      ? `${State.activeCourse.academic_year || 'Year 1'} • Semester I`
      : `${State.activeCourse.academic_year || 'Year 1'} • ${State.activeCourse.semester || 'Semester I'}`;
    const deptName = State.selectedDepartment ? State.selectedDepartment.name : 'Common Foundation Studies';
    const colName = State.selectedCollege ? State.selectedCollege.name : 'College of Freshman Studies';
    document.getElementById('studio-course-dept-label').innerText = isFreshmanCourse 
      ? 'College of Freshman Studies • Common Foundation Studies'
      : `${deptName} • ${colName}`;
    document.getElementById('studio-chapter-count-pill').innerText = (State.activeCourse.chapters || []).length;
    document.getElementById('studio-clo-count-pill').innerText = (State.activeCourse.clos || []).length;

    // Update back button label
    const backLabel = document.getElementById('studio-back-label');
    if (backLabel) {
      backLabel.innerHTML = isFreshmanCourse
        ? '&larr; Back to Freshman Courses'
        : '&larr; Back to Courses List';
    }

    // Populate Tab 1: Spec form
    const c = State.activeCourse;
    document.getElementById('spec_code').value = c.code || '';
    document.getElementById('spec_title').value = c.title || '';
    document.getElementById('spec_credits').value = c.credit_hours || 3;
    const progEl = document.getElementById('spec_program');
    if (progEl) progEl.value = c.program_name || 'B.Sc in Data Science';
    const catEl = document.getElementById('spec_category');
    if (catEl) catEl.value = c.course_category || 'Core';
    document.getElementById('spec_year').value = c.academic_year || 'Year 4';
    document.getElementById('spec_semester').value = c.semester || 'Semester II';
    document.getElementById('spec_lecture').value = c.lecture_hours || 40;
    document.getElementById('spec_tutorial').value = c.tutorial_hours || 15;
    document.getElementById('spec_lab').value = c.lab_hours || 20;
    const indEl = document.getElementById('spec_independent');
    if (indEl) indEl.value = c.independent_hours !== undefined ? c.independent_hours : 30;
    const asmHEl = document.getElementById('spec_assessment_hours');
    if (asmHEl) asmHEl.value = c.assessment_hours !== undefined ? c.assessment_hours : 15;
    const totEl = document.getElementById('spec_total_hours');
    if (totEl) totEl.value = c.total_notional_hours || 120;
    document.getElementById('spec_prereqs').value = c.prerequisites || '';
    const coreqEl = document.getElementById('spec_coreqs');
    if (coreqEl) coreqEl.value = c.corequisites || 'None';
    document.getElementById('spec_instructor').value = c.instructor_name || '';
    document.getElementById('spec_desc').value = c.description || '';
    const stratEl = document.getElementById('spec_strategy');
    if (stratEl) stratEl.value = c.teaching_strategy || '';
    const tbEl = document.getElementById('spec_textbooks');
    if (tbEl) tbEl.value = c.textbooks || '';
    const refEl = document.getElementById('spec_references');
    if (refEl) refEl.value = c.reference_books || '';

    // Stream field — only shown for Freshman courses
    const isFreshman = (c.department_id === 'dept_freshman_common') ||
                       (State.selectedCollege && State.selectedCollege.name && State.selectedCollege.name.toLowerCase().includes('freshman'));
    const streamRow = document.getElementById('spec-stream-row');
    const streamEl = document.getElementById('spec_stream');
    if (streamRow) streamRow.classList.toggle('hidden', !isFreshman);
    if (streamEl) streamEl.value = c.stream || 'Common';

    // Render datasets for tabs
    CourseStudioComponent.renderChapters();
    CourseStudioComponent.renderCLOs();
    CourseStudioComponent.renderBlueprint();
    DossierComponent.render();

    State.currentEditTab = initialTab;
    CourseStudioComponent.setMode(initialMode);
  },

  setMode(mode) {
    State.currentStudioMode = mode;
    const editBtn = document.getElementById('studio-mode-edit');
    const viewBtn = document.getElementById('studio-mode-view');
    const editTabBar = document.getElementById('studio-edit-tabs-bar');
    const viewContainer = document.getElementById('tab-content-view');
    const editActions = document.getElementById('studio-edit-actions');
    const viewActions = document.getElementById('studio-view-actions');

    if (mode === 'view') {
      // Toggle button styles
      if (viewBtn) viewBtn.className = 'px-4 py-2 rounded-lg text-sm font-extrabold transition flex items-center gap-2 bg-sky-600 text-white shadow-sm';
      if (editBtn) editBtn.className = 'px-4 py-2 rounded-lg text-sm font-extrabold transition flex items-center gap-2 text-slate-600 hover:text-slate-900';

      // Switch top header actions: Hide Save to DB, Show Download Word & Print
      if (editActions) editActions.classList.add('hidden');
      if (viewActions) viewActions.classList.remove('hidden');

      // Hide 4 edit tabs strip and edit contents
      if (editTabBar) editTabBar.classList.add('hidden');
      ['spec', 'chapters', 'clos', 'blueprint'].forEach(t => {
        const el = document.getElementById(`tab-content-${t}`);
        if (el) el.classList.add('hidden');
      });

      // Show full syllabus view
      if (viewContainer) viewContainer.classList.remove('hidden');
      DossierComponent.render();

      if (State.activeCourse) {
        const u = new URL(window.location);
        u.searchParams.set('course_id', State.activeCourse.id);
        u.searchParams.set('mode', 'view');
        u.searchParams.delete('tab');
        window.history.replaceState({}, '', u);
      }
    } else {
      // Edit mode
      if (editBtn) editBtn.className = 'px-4 py-2 rounded-lg text-sm font-extrabold transition flex items-center gap-2 bg-blue-600 text-white shadow-sm';
      if (viewBtn) viewBtn.className = 'px-4 py-2 rounded-lg text-sm font-extrabold transition flex items-center gap-2 text-slate-600 hover:text-slate-900';

      // Switch top header actions: Show Save to DB, Hide Download Word & Print
      if (editActions) editActions.classList.remove('hidden');
      if (viewActions) viewActions.classList.add('hidden');

      // Show 4 edit tabs strip and hide view dossier
      if (editTabBar) editTabBar.classList.remove('hidden');
      if (viewContainer) viewContainer.classList.add('hidden');

      CourseStudioComponent.switchTab(State.currentEditTab || 'spec');

      if (State.activeCourse) {
        const u = new URL(window.location);
        u.searchParams.set('course_id', State.activeCourse.id);
        u.searchParams.set('mode', 'edit');
        u.searchParams.set('tab', State.currentEditTab || 'spec');
        window.history.replaceState({}, '', u);
      }
    }
  },

  switchTab(tab) {
    State.currentEditTab = tab;
    ['spec', 'chapters', 'clos', 'blueprint'].forEach(t => {
      const btn = document.getElementById(`tab-btn-${t}`);
      const content = document.getElementById(`tab-content-${t}`);
      if (t === tab) {
        if (btn) btn.className = 'flex-1 py-2.5 rounded-xl tab-active transition flex items-center justify-center gap-2 text-sm font-bold';
        if (content) content.classList.remove('hidden');
      } else {
        if (btn) btn.className = 'flex-1 py-2.5 rounded-xl text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-2 text-sm font-semibold';
        if (content) content.classList.add('hidden');
      }
    });

    if (State.activeCourse && State.currentStudioMode === 'edit') {
      const u = new URL(window.location);
      u.searchParams.set('course_id', State.activeCourse.id);
      u.searchParams.set('mode', 'edit');
      u.searchParams.set('tab', tab);
      window.history.replaceState({}, '', u);
    }
  },

  // --- TAB 2: CHAPTERS (CLEAN STRUCTURED FRAMING & BOLDING) ---
  renderChapters() {
    const container = document.getElementById('studio-chapters-list');
    if (!container) return;
    const chapters = State.activeCourse.chapters || [];

    if (chapters.length === 0) {
      container.innerHTML = `
        <div class="bg-white p-10 text-center rounded-2xl border-2 border-dashed border-slate-300">
          <p class="text-slate-600 text-sm font-semibold">No chapters added to this course yet.</p>
          <button onclick="CourseStudioComponent.addChapter()" class="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-black shadow-sm transition">
            + Add First Chapter
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = chapters.map((ch, idx) => {
      // Clean title from redundant prefix if already present
      let displayTitle = ch.title || '';
      displayTitle = displayTitle.replace(/^Chapter\s*\d+\s*:\s*/i, '');

      return `
        <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-indigo-400 transition shadow-sm overflow-hidden space-y-0">
          <!-- Chapter Header Frame -->
          <div class="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-[280px]">
              <span class="bg-indigo-600 text-white font-mono font-black text-xs px-3 py-1 rounded-lg tracking-wider shadow-xs uppercase">
                Chapter ${ch.chapter_number || (idx + 1)}
              </span>
              <input type="text" value="${displayTitle}" onchange="CourseStudioComponent.updateChapter(${idx}, 'title', 'Chapter ' + (${ch.chapter_number || (idx + 1)}) + ': ' + this.value)" placeholder="Chapter Title (e.g. Linear Programming)" class="flex-1 font-black text-base text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs">
            </div>

            <button onclick="CourseStudioComponent.deleteChapter(${idx})" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition" title="Delete Chapter">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              <span>Delete</span>
            </button>
          </div>

          <!-- Chapter Body Frame -->
          <div class="p-5 space-y-4">
            <div>
              <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                Topics Covered
              </label>
              <textarea rows="3" onchange="CourseStudioComponent.updateChapter(${idx}, 'content', this.value)" placeholder="Enter chapter topics (separated by semicolons or newlines)..." class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-xs">${ch.content || ''}</textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Mapped Outcomes
                </label>
                <input type="text" value="${ch.mapped_clos || 'CLO1'}" onchange="CourseStudioComponent.updateChapter(${idx}, 'mapped_clos', this.value)" placeholder="e.g. CLO1, CLO2" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-blue-700 font-mono font-black focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs">
              </div>

              <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">
                  Instructional Methods
                </label>
                <input type="text" value="${ch.teaching_methods || 'Lecture, Tutorial'}" onchange="CourseStudioComponent.updateChapter(${idx}, 'teaching_methods', this.value)" placeholder="e.g. Lecture, Tutorial, Hands-on Lab" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs">
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    const countPill = document.getElementById('studio-chapter-count-pill');
    if (countPill) countPill.innerText = chapters.length;
  },

  addChapter() {
    State.activeCourse.chapters = State.activeCourse.chapters || [];
    const num = State.activeCourse.chapters.length + 1;
    State.activeCourse.chapters.push({
      id: `${State.activeCourse.id}_ch_${num}`,
      chapter_number: num,
      title: `Chapter ${num}: New Unit`,
      content: "Chapter topics and syllabus breakdown...",
      mapped_clos: `CLO${Math.min(num, (State.activeCourse.clos || []).length || 1)}`,
      teaching_methods: "Lecture, Tutorial, Lab"
    });
    CourseStudioComponent.renderChapters();
  },

  deleteChapter(idx) {
    if (confirm("Remove this chapter?")) {
      State.activeCourse.chapters.splice(idx, 1);
      CourseStudioComponent.renderChapters();
    }
  },

  updateChapter(idx, field, val) {
    State.activeCourse.chapters[idx][field] = val;
  },

  // --- TAB 3: CLOS ---
  getAvailablePLOs() {
    if (typeof State !== 'undefined' && State.loadPLOsLocally) {
      State.loadPLOsLocally();
    }
    const plos = (State.plos && State.plos.length > 0) ? [...State.plos] : [
      { id: 'plo1', code: 'PLO1', title: 'Computing & Mathematical Foundations', description: 'Apply mathematical foundations, algorithmic principles, and theory in modeling.' },
      { id: 'plo2', code: 'PLO2', title: 'Problem Analysis & Optimization', description: 'Identify, formulate, and analyze complex data science and optimization problems.' },
      { id: 'plo3', code: 'PLO3', title: 'Design & Implementation', description: 'Design solutions and implement algorithms meeting specified stakeholder requirements.' },
      { id: 'plo4', code: 'PLO4', title: 'Modern Tool Usage & Modeling', description: 'Apply modern techniques, skills, and data engineering/optimization tools.' },
      { id: 'plo5', code: 'PLO5', title: 'Communication & Teamwork', description: 'Communicate technical concepts effectively with diverse audiences.' },
      { id: 'plo6', code: 'PLO6', title: 'Professional Ethics & Governance', description: 'Apply ethical principles and commit to professional ethics, data privacy, and governance.' }
    ];
    return plos.sort((a, b) => {
      const numA = parseInt((a.code || '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.code || '').replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  },

  renderCLOs() {
    const matrixContainer = document.getElementById('studio-clo-matrix-rows');
    const headersContainer = document.getElementById('studio-clo-matrix-headers');
    const cardsContainer = document.getElementById('studio-clos-list');
    const clos = State.activeCourse ? (State.activeCourse.clos || []) : [];
    const asms = State.activeCourse ? (State.activeCourse.assessments || []) : [];
    const plos = CourseStudioComponent.getAvailablePLOs();

    // 0. Render Dynamic Matrix Headers based on all available PLOs
    if (headersContainer) {
      headersContainer.innerHTML = `
        <th class="p-2.5 font-black text-slate-700 uppercase tracking-wider text-center w-20 border-r border-slate-200">CLO</th>
        ${plos.map(p => `
          <th class="p-2.5 font-black text-slate-700 uppercase tracking-wider text-center w-14 border-r border-slate-200" title="${(p.title || p.code).replace(/"/g, '&quot;')}">
            ${p.code}
          </th>
        `).join('')}
        <th class="p-2.5 font-black text-slate-700 uppercase tracking-wider">Assessment Methods for this CLO</th>
      `;
    }

    // 1. Render Interactive Matrix (SQC Table 4)
    if (matrixContainer) {
      if (clos.length === 0) {
        matrixContainer.innerHTML = `<tr><td colspan="${2 + plos.length}" class="p-6 text-center text-slate-400 font-semibold">No CLOs defined yet. Click "+ Add CLO Outcome" above to begin.</td></tr>`;
      } else {
        const normalizeStr = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

        matrixContainer.innerHTML = clos.map((clo, idx) => {
          const mappedPlos = (clo.plo_mappings || []).map(m => normalizeStr(m.plo_id || m.code || m));
          const hasPlo = (target) => {
            const t = normalizeStr(target);
            return mappedPlos.some(p => p === t || p.includes(t) || t.includes(p));
          };

          // Default assessment string if empty
          let asmStr = clo.assessment_methods || '';
          if (!asmStr.trim()) {
            const testedAsms = [];
            asms.forEach(a => {
              if (a.clo_allocations && a.clo_allocations.length > 0) {
                if (a.clo_allocations.some(al => al.clo_id === clo.id)) testedAsms.push(a.name);
              } else {
                testedAsms.push(a.name);
              }
            });
            asmStr = [...new Set(testedAsms)].join(', ') || 'Comprehensive Final Examination';
            clo.assessment_methods = asmStr;
          }

          const ploTogglesHtml = plos.map(p => {
            const isChecked = hasPlo(p.id) || hasPlo(p.code);
            return `
              <td class="p-2 text-center border-r border-slate-200">
                <label class="inline-flex items-center justify-center p-1 cursor-pointer" title="${p.code}: ${(p.title || '').replace(/"/g, '&quot;')}">
                  <input type="checkbox" ${isChecked ? 'checked' : ''} onchange="CourseStudioComponent.toggleCLOPLOMapping(${idx}, '${p.code}', this.checked)" class="w-4 h-4 text-emerald-600 rounded cursor-pointer accent-emerald-600">
                </label>
              </td>
            `;
          }).join('');

          return `
            <tr class="border-b border-slate-200 hover:bg-slate-50/70 transition">
              <td class="p-2.5 font-mono font-black text-center text-blue-700 bg-slate-50/50 border-r border-slate-200">
                ${clo.code || `CLO${idx+1}`}
              </td>
              ${ploTogglesHtml}
              <td class="p-2">
                <input type="text" value="${asmStr.replace(/"/g, '&quot;')}" oninput="CourseStudioComponent.updateCLOAssessmentMethods(${idx}, this.value)" placeholder="e.g. Assignments (Optimization Problems), Midterm Examination, Comprehensive Final Examination" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs">
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 2. Render Detailed CLO Specification Cards below matrix
    if (cardsContainer) {
      if (clos.length === 0) {
        cardsContainer.innerHTML = `
          <div class="bg-white p-8 text-center rounded-2xl border border-slate-200">
            <p class="text-slate-500 text-sm font-semibold">No CLOs defined yet.</p>
            <button onclick="CourseStudioComponent.addCLO()" class="mt-3 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
              + Add First CLO
            </button>
          </div>
        `;
      } else {
        const normalizeStr = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

        cardsContainer.innerHTML = clos.map((clo, idx) => {
          const mappedPlos = (clo.plo_mappings || []).map(m => normalizeStr(m.plo_id || m.code || m));
          const hasPlo = (target) => {
            const t = normalizeStr(target);
            return mappedPlos.some(p => p === t || p.includes(t) || t.includes(p));
          };

          const ploBadgesHtml = plos.map(p => {
            const isChecked = hasPlo(p.id) || hasPlo(p.code);
            return `
              <button type="button" onclick="CourseStudioComponent.toggleCLOPLOMapping(${idx}, '${p.code}', ${!isChecked})" class="px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${isChecked ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}" title="${p.code}: ${(p.title || '').replace(/"/g, '&quot;')}">
                <span>${isChecked ? '✓' : '+'}</span>
                <span>${p.code}</span>
              </button>
            `;
          }).join('');

          return `
            <div class="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-400 transition shadow-sm overflow-hidden">
              <div class="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap justify-between items-center gap-3">
                <div class="flex items-center gap-2 flex-1 min-w-[260px]">
                  <input type="text" value="${clo.code || `CLO${idx+1}`}" onchange="CourseStudioComponent.updateCLO(${idx}, 'code', this.value)" class="w-24 font-mono font-black text-sm text-blue-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <select onchange="CourseStudioComponent.updateCLO(${idx}, 'blooms_level', this.value)" class="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    ${State.bloomsTaxonomy.map(b => `<option value="${b.name}" ${clo.blooms_level === b.name ? 'selected' : ''}>${b.name}</option>`).join('')}
                  </select>
                </div>

                <div class="flex items-center gap-2">
                  <button onclick="CourseStudioComponent.deleteCLO(${idx})" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition" title="Delete CLO">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    <span>Delete</span>
                  </button>
                </div>
              </div>

              <div class="p-5 space-y-4">
                <div>
                  <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">Outcome Statement</label>
                  <textarea rows="2" onchange="CourseStudioComponent.updateCLO(${idx}, 'description', this.value)" class="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed shadow-xs">${clo.description || ''}</textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                  <div class="md:col-span-6 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1.5">
                      Program Outcome Mapping (PLOs):
                    </label>
                    <div class="flex flex-wrap gap-1.5">
                      ${ploBadgesHtml}
                    </div>
                  </div>

                  <div class="md:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">Passing Threshold %</label>
                    <input type="number" value="${clo.passing_score_pct || 60}" onchange="CourseStudioComponent.updateCLO(${idx}, 'passing_score_pct', parseFloat(this.value))" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  </div>

                  <div class="md:col-span-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label class="block text-xs font-black uppercase text-slate-700 tracking-wider mb-1">Target Cohort Attainment %</label>
                    <input type="number" value="${clo.target_attainment_pct || 70}" onchange="CourseStudioComponent.updateCLO(${idx}, 'target_attainment_pct', parseFloat(this.value))" class="w-full bg-white border border-slate-200 rounded-lg px-3 py-1 font-bold text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    const countPill = document.getElementById('studio-clo-count-pill');
    if (countPill) countPill.innerText = clos.length;
  },

  toggleCLOPLOMapping(cloIdx, ploCode, isChecked) {
    const clo = State.activeCourse.clos[cloIdx];
    if (!clo) return;
    clo.plo_mappings = clo.plo_mappings || [];
    
    const normalizeStr = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetNorm = normalizeStr(ploCode);

    clo.plo_mappings = clo.plo_mappings.filter(m => {
      const pid = normalizeStr(m.plo_id || m.code || m);
      return pid !== targetNorm && !pid.includes(targetNorm) && !targetNorm.includes(pid);
    });

    if (isChecked) {
      clo.plo_mappings.push({ plo_id: ploCode, correlation_weight: 2 });
    }

    CourseStudioComponent.renderCLOs();
    DossierComponent.render();
  },

  // --- PLO MANAGEMENT MODAL ---
  editingPloIndex: null,

  openManagePLOsModal() {
    CourseStudioComponent.editingPloIndex = null;
    const modal = document.getElementById('modal-plo-management');
    if (modal) modal.classList.remove('hidden');
    CourseStudioComponent.renderManagePLOsList();

    // Auto-suggest next available PLO code
    const plos = CourseStudioComponent.getAvailablePLOs();
    let maxNum = 0;
    plos.forEach(p => {
      const match = (p.code || '').match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > maxNum) maxNum = n;
      }
    });
    const nextCode = `PLO${maxNum + 1 || (plos.length + 1)}`;
    const codeInput = document.getElementById('plo-new-code');
    if (codeInput && !codeInput.value.trim()) {
      codeInput.value = nextCode;
    }
  },

  closeManagePLOsModal() {
    CourseStudioComponent.editingPloIndex = null;
    const modal = document.getElementById('modal-plo-management');
    if (modal) modal.classList.add('hidden');
  },

  startEditPLO(idx) {
    CourseStudioComponent.editingPloIndex = idx;
    CourseStudioComponent.renderManagePLOsList();
    setTimeout(() => {
      const el = document.getElementById(`plo-edit-title-${idx}`);
      if (el) el.focus();
    }, 50);
  },

  cancelEditPLO() {
    CourseStudioComponent.editingPloIndex = null;
    CourseStudioComponent.renderManagePLOsList();
  },

  async saveEditPLO(idx) {
    const plos = CourseStudioComponent.getAvailablePLOs();
    const targetPlo = plos[idx];
    if (!targetPlo) return;

    const codeEl = document.getElementById(`plo-edit-code-${idx}`);
    const titleEl = document.getElementById(`plo-edit-title-${idx}`);
    const descEl = document.getElementById(`plo-edit-description-${idx}`);

    const code = codeEl ? codeEl.value.trim().toUpperCase() : targetPlo.code;
    const title = titleEl ? titleEl.value.trim() : targetPlo.title;
    const description = descEl ? descEl.value.trim() : (targetPlo.description || '');

    if (!code) {
      alert("PLO code cannot be empty.");
      if (codeEl) codeEl.focus();
      return;
    }
    if (!title) {
      alert("PLO title cannot be empty.");
      if (titleEl) titleEl.focus();
      return;
    }

    const oldCode = targetPlo.code;
    const ploId = targetPlo.id || `plo_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    // Update in State.plos
    const stateIdx = State.plos.findIndex(p => 
      (p.id && p.id === targetPlo.id) || 
      (p.code && p.code.toUpperCase() === oldCode.toUpperCase())
    );

    if (stateIdx >= 0) {
      State.plos[stateIdx].code = code;
      State.plos[stateIdx].title = title;
      State.plos[stateIdx].description = description;
    } else {
      State.plos.push({
        id: ploId,
        code: code,
        title: title,
        description: description,
        category: targetPlo.category || "Technical Core"
      });
    }

    // If code changed and active course has CLO mappings with oldCode, update them
    if (oldCode !== code && State.activeCourse && State.activeCourse.clos) {
      State.activeCourse.clos.forEach(clo => {
        (clo.plo_mappings || []).forEach(m => {
          if ((m.plo_id && m.plo_id.toLowerCase() === oldCode.toLowerCase()) || 
              (m.code && m.code.toLowerCase() === oldCode.toLowerCase())) {
            m.plo_id = code;
            m.code = code;
          }
        });
      });
    }

    // Persist to localStorage immediately
    State.savePLOsLocally();

    // Call API in background
    try {
      await API.updatePLO(ploId, { code, title, description });
    } catch (err) {
      console.warn("Server update skipped or offline; saved in local storage:", err);
    }

    CourseStudioComponent.editingPloIndex = null;
    CourseStudioComponent.renderManagePLOsList();
    CourseStudioComponent.renderCLOs();
    DossierComponent.render();
    State.showToast(`✅ ${code} updated & saved!`);
  },

  renderManagePLOsList() {
    const listContainer = document.getElementById('plo-modal-list');
    const countPill = document.getElementById('plo-modal-count-pill');
    if (!listContainer) return;

    const plos = CourseStudioComponent.getAvailablePLOs();
    if (countPill) countPill.innerText = `${plos.length} Program Outcome${plos.length === 1 ? '' : 's'}`;

    if (plos.length === 0) {
      listContainer.innerHTML = `<p class="text-xs text-slate-400 p-4 text-center">No PLOs configured yet.</p>`;
      return;
    }

    listContainer.innerHTML = plos.map((p, idx) => {
      const isEditing = CourseStudioComponent.editingPloIndex === idx;

      if (isEditing) {
        return `
          <div class="p-4 bg-indigo-50/80 rounded-2xl border-2 border-indigo-400 shadow-sm space-y-3 animate-in fade-in duration-150">
            <div class="flex items-center justify-between border-b border-indigo-100 pb-2">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
                <h5 class="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">Editing Program Outcome: <span class="font-mono text-indigo-700">${p.code}</span></h5>
              </div>
              <button onclick="CourseStudioComponent.cancelEditPLO()" class="text-slate-400 hover:text-slate-700 text-xs font-bold transition">
                &times; Cancel
              </button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div class="sm:col-span-3">
                <label class="block text-[11px] font-bold text-slate-700 mb-1">PLO Code *</label>
                <input type="text" id="plo-edit-code-${idx}" value="${p.code || ''}" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs">
              </div>
              <div class="sm:col-span-9">
                <label class="block text-[11px] font-bold text-slate-700 mb-1">Outcome Title *</label>
                <input type="text" id="plo-edit-title-${idx}" value="${(p.title || '').replace(/"/g, '&quot;')}" class="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs">
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-bold text-slate-700 mb-1">Outcome Statement / Description</label>
              <textarea id="plo-edit-description-${idx}" rows="2" class="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed shadow-xs">${p.description || ''}</textarea>
            </div>

            <div class="flex items-center justify-end gap-2 pt-1">
              <button onclick="CourseStudioComponent.cancelEditPLO()" class="px-3.5 py-1.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-bold transition">
                Cancel
              </button>
              <button onclick="CourseStudioComponent.saveEditPLO(${idx})" class="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        `;
      }

      return `
        <div class="flex items-start justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition shadow-xs">
          <div class="space-y-1 flex-1">
            <div class="flex items-center gap-2">
              <span class="font-mono font-black text-xs px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">${p.code}</span>
              <span class="font-bold text-xs text-slate-900">${p.title || ''}</span>
              ${p.category ? `<span class="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">${p.category}</span>` : ''}
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${p.description || 'No description provided.'}</p>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <button onclick="CourseStudioComponent.startEditPLO(${idx})" class="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer" title="Edit this PLO">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              <span>Edit</span>
            </button>
            <button onclick="CourseStudioComponent.deletePLO(${idx})" class="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition cursor-pointer" title="Delete PLO">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  async submitNewPLO() {
    const codeInput = document.getElementById('plo-new-code');
    const titleInput = document.getElementById('plo-new-title');
    const descInput = document.getElementById('plo-new-description');

    let rawCode = codeInput ? codeInput.value.trim() : '';
    let rawTitle = titleInput ? titleInput.value.trim() : '';
    const description = descInput ? descInput.value.trim() : '';

    // If empty code, auto-determine next PLO number
    if (!rawCode) {
      const plos = CourseStudioComponent.getAvailablePLOs();
      let maxNum = 0;
      plos.forEach(p => {
        const match = (p.code || '').match(/\d+/);
        if (match) {
          const n = parseInt(match[0], 10);
          if (n > maxNum) maxNum = n;
        }
      });
      rawCode = `PLO${maxNum + 1 || (plos.length + 1)}`;
    }

    // Auto-format code: if user enters "8" -> "PLO8", if "plo8" -> "PLO8"
    let code = rawCode.toUpperCase();
    if (/^\d+$/.test(code)) {
      code = `PLO${code}`;
    } else if (/^PLO\s*\d+$/i.test(code)) {
      code = code.replace(/\s+/g, '').toUpperCase();
    }

    // Default title if omitted
    const title = rawTitle || `${code}: Program Learning Outcome`;

    const payload = {
      id: `plo_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      code: code,
      title: title,
      description: description,
      category: "Technical Core"
    };

    // Upsert into State.plos immediately
    const existingIdx = State.plos.findIndex(p => 
      p.code && p.code.toUpperCase() === code.toUpperCase()
    );
    if (existingIdx >= 0) {
      State.plos[existingIdx] = { ...State.plos[existingIdx], ...payload };
    } else {
      State.plos.push(payload);
    }

    // Save to localStorage immediately
    State.savePLOsLocally();

    // Call API in background
    try {
      const res = await API.createPLO(payload);
      if (res && res.plo && res.plo.id) {
        const item = State.plos.find(p => p.code.toUpperCase() === code.toUpperCase());
        if (item) {
          item.id = res.plo.id;
          State.savePLOsLocally();
        }
      }
    } catch (err) {
      console.warn("API PLO creation skipped or offline, saved locally:", err);
    }

    // Clear inputs and advance code
    if (titleInput) titleInput.value = '';
    if (descInput) descInput.value = '';

    const updatedPlos = CourseStudioComponent.getAvailablePLOs();
    let nextMaxNum = 0;
    updatedPlos.forEach(p => {
      const match = (p.code || '').match(/\d+/);
      if (match) {
        const n = parseInt(match[0], 10);
        if (n > nextMaxNum) nextMaxNum = n;
      }
    });
    if (codeInput) {
      codeInput.value = `PLO${nextMaxNum + 1 || (updatedPlos.length + 1)}`;
    }

    CourseStudioComponent.renderManagePLOsList();
    if (State.activeCourse) {
      CourseStudioComponent.renderCLOs();
    }
    DossierComponent.render();
    State.showToast(`✨ ${code} successfully added & saved!`);
  },

  async deletePLO(idx) {
    const plos = CourseStudioComponent.getAvailablePLOs();
    const targetPlo = plos[idx];
    if (!targetPlo) return;
    const name = targetPlo.code;

    if (!confirm(`Are you sure you want to delete ${name}? Any course mappings to this PLO will also be unlinked.`)) {
      return;
    }

    // Remove from State.plos
    State.plos = State.plos.filter(p => 
      (p.id && p.id !== targetPlo.id) && 
      (p.code && p.code.toUpperCase() !== targetPlo.code.toUpperCase())
    );

    // Unlink from active course
    if (State.activeCourse && State.activeCourse.clos) {
      const normalizeStr = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');
      const targetNorm = normalizeStr(name);
      State.activeCourse.clos.forEach(clo => {
        clo.plo_mappings = (clo.plo_mappings || []).filter(m => {
          const pid = normalizeStr(m.plo_id || m.code || m);
          return pid !== targetNorm && !pid.includes(targetNorm) && !targetNorm.includes(pid);
        });
      });
    }

    // Save to localStorage immediately
    State.savePLOsLocally();

    // Call API in background
    try {
      await API.deletePLO(targetPlo.id || targetPlo.code);
    } catch (err) {
      console.warn("Server PLO delete failed or offline mode:", err);
    }

    CourseStudioComponent.editingPloIndex = null;
    CourseStudioComponent.renderManagePLOsList();
    CourseStudioComponent.renderCLOs();
    DossierComponent.render();
    State.showToast(`🗑️ ${name} removed from program.`);
  },

  updateCLOAssessmentMethods(cloIdx, text) {
    const clo = State.activeCourse.clos[cloIdx];
    if (!clo) return;
    clo.assessment_methods = text;
    DossierComponent.render();
  },

  autoFillAssessmentMethodsFromBlueprint() {
    const clos = State.activeCourse.clos || [];
    const asms = State.activeCourse.assessments || [];

    clos.forEach(clo => {
      const testedAsms = [];
      asms.forEach(a => {
        if (a.clo_allocations && a.clo_allocations.length > 0) {
          if (a.clo_allocations.some(al => al.clo_id === clo.id)) testedAsms.push(a.name);
        } else {
          testedAsms.push(a.name);
        }
      });
      clo.assessment_methods = [...new Set(testedAsms)].join(', ') || 'Comprehensive Final Examination';
    });

    CourseStudioComponent.renderCLOs();
    DossierComponent.render();
    State.showToast("⚡ Auto-filled assessment methods from Blueprint tasks!");
  },

  addCLO() {
    State.activeCourse.clos = State.activeCourse.clos || [];
    const num = State.activeCourse.clos.length + 1;
    State.activeCourse.clos.push({
      id: `${State.activeCourse.id}_clo_${num}`,
      code: `CLO${num}`,
      description: `Demonstrate mastery of outcome objectives for chapter ${num}.`,
      blooms_level: State.bloomsTaxonomy[Math.min(num - 1, 5)].name,
      passing_score_pct: 60.0,
      target_attainment_pct: 70.0
    });
    CourseStudioComponent.renderCLOs();
    CourseStudioComponent.renderBlueprint();
  },

  deleteCLO(idx) {
    if (confirm("Delete this CLO?")) {
      State.activeCourse.clos.splice(idx, 1);
      CourseStudioComponent.renderCLOs();
      CourseStudioComponent.renderBlueprint();
    }
  },

  updateCLO(idx, field, val) {
    State.activeCourse.clos[idx][field] = val;
  },

  // --- TAB 4: BLUEPRINT ---
  renderBlueprint() {
    const container = document.getElementById('studio-blueprint-list');
    if (!container) return;
    const asms = State.activeCourse.assessments || [];
    const clos = State.activeCourse.clos || [];

    let totalWeight = 0;
    asms.forEach(a => totalWeight += (parseFloat(a.course_weight_pct) || 0));

    const banner = document.getElementById('blueprint-weight-banner');
    if (banner) {
      if (Math.abs(totalWeight - 100) < 0.01) {
        banner.innerHTML = `<span class="text-emerald-700 font-black">✅ Total Course Weight: 100%</span>`;
      } else {
        banner.innerHTML = `<span class="text-rose-600 font-black">⚠️ Course Weight: ${totalWeight.toFixed(1)}% / 100%</span>`;
      }
    }

    if (asms.length === 0) {
      container.innerHTML = `
        <div class="p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p class="text-slate-500 text-sm">No assessment tasks registered yet.</p>
          <button onclick="CourseStudioComponent.addAssessment()" class="mt-3 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
            + Add Assessment Task
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = asms.map((asm, aIdx) => {
      const allocatedMap = {};
      (asm.clo_allocations || []).forEach(al => allocatedMap[al.clo_id] = al.allocated_marks);

      const cloCheckboxesHtml = clos.map(clo => {
        const isChecked = allocatedMap[clo.id] !== undefined;
        const marks = allocatedMap[clo.id] || 5;

        return `
          <div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border ${isChecked ? 'border-blue-400 bg-blue-50/40' : 'border-slate-200'}">
            <input type="checkbox" id="asm_${aIdx}_clo_${clo.id}" ${isChecked ? 'checked' : ''} onchange="CourseStudioComponent.toggleCLOInAssessment(${aIdx}, '${clo.id}', this.checked)" class="rounded text-blue-600">
            <label for="asm_${aIdx}_clo_${clo.id}" class="text-xs font-mono font-bold ${isChecked ? 'text-blue-700' : 'text-slate-600'} cursor-pointer">
              ${clo.code}
            </label>
            ${isChecked ? `
              <div class="flex items-center gap-1 text-[11px] font-bold text-slate-500 border-l pl-2 ml-1">
                <span>Marks:</span>
                <input type="number" value="${marks}" onchange="CourseStudioComponent.updateAllocatedMarks(${aIdx}, '${clo.id}', parseFloat(this.value))" class="w-12 text-center bg-slate-50 border border-slate-300 rounded text-xs py-0.5 font-bold text-slate-800">
              </div>
            ` : ''}
          </div>
        `;
      }).join('');

      return `
        <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div class="flex items-center gap-2 flex-1">
              <input type="text" value="${asm.name || ''}" onchange="CourseStudioComponent.updateAssessment(${aIdx}, 'name', this.value)" placeholder="Task Name (e.g. Midterm Examination)" class="w-full max-w-sm font-extrabold text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <select onchange="CourseStudioComponent.updateAssessment(${aIdx}, 'assessment_type', this.value)" class="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700">
                <option value="Assignment" ${asm.assessment_type === 'Assignment' ? 'selected' : ''}>Assignment</option>
                <option value="Quiz" ${asm.assessment_type === 'Quiz' ? 'selected' : ''}>Quiz</option>
                <option value="Midterm_Exam" ${asm.assessment_type === 'Midterm_Exam' ? 'selected' : ''}>Midterm Exam</option>
                <option value="Final_Exam" ${asm.assessment_type === 'Final_Exam' ? 'selected' : ''}>Final Exam</option>
                <option value="Lab_Project" ${asm.assessment_type === 'Lab_Project' ? 'selected' : ''}>Lab / Project</option>
              </select>
            </div>

            <div class="flex items-center gap-3 text-xs">
              <div class="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <span class="text-slate-500 font-semibold">Total Marks:</span>
                <input type="number" value="${asm.total_marks || 20}" onchange="CourseStudioComponent.updateAssessment(${aIdx}, 'total_marks', parseFloat(this.value))" class="w-14 text-center bg-slate-50 border border-slate-200 rounded font-bold text-xs py-0.5">
              </div>

              <div class="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <span class="text-emerald-800 font-bold">Course Weight %:</span>
                <input type="number" value="${asm.course_weight_pct || 20}" onchange="CourseStudioComponent.updateAssessment(${aIdx}, 'course_weight_pct', parseFloat(this.value))" class="w-14 text-center bg-white border border-emerald-300 rounded font-extrabold text-emerald-800 text-xs py-0.5">%
              </div>

              <button onclick="CourseStudioComponent.deleteAssessment(${aIdx})" class="text-slate-400 hover:text-red-600 font-bold text-xs p-1" title="Delete Task">
                &times; Delete
              </button>
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-extrabold uppercase text-slate-500 tracking-wider">
              Course Learning Outcomes (CLOs) Included in this Assessment Task:
            </label>
            <div class="flex flex-wrap gap-2 pt-1">
              ${cloCheckboxesHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  addAssessment() {
    State.activeCourse.assessments = State.activeCourse.assessments || [];
    const num = State.activeCourse.assessments.length + 1;
    State.activeCourse.assessments.push({
      id: `${State.activeCourse.id}_asm_${num}`,
      name: `Assessment Task ${num}`,
      assessment_type: "Assignment",
      total_marks: 20.0,
      course_weight_pct: 20.0,
      clo_allocations: []
    });
    CourseStudioComponent.renderBlueprint();
  },

  deleteAssessment(idx) {
    if (confirm("Remove this assessment task?")) {
      State.activeCourse.assessments.splice(idx, 1);
      CourseStudioComponent.renderBlueprint();
    }
  },

  updateAssessment(idx, field, val) {
    State.activeCourse.assessments[idx][field] = val;
    CourseStudioComponent.renderBlueprint();
  },

  toggleCLOInAssessment(asmIdx, cloId, isChecked) {
    const asm = State.activeCourse.assessments[asmIdx];
    if (!asm) return;
    asm.clo_allocations = asm.clo_allocations || [];

    if (isChecked) {
      if (!asm.clo_allocations.some(al => al.clo_id === cloId)) {
        asm.clo_allocations.push({ clo_id: cloId, allocated_marks: 5.0 });
      }
    } else {
      asm.clo_allocations = asm.clo_allocations.filter(al => al.clo_id !== cloId);
    }
    CourseStudioComponent.renderBlueprint();
  },

  updateAllocatedMarks(asmIdx, cloId, marks) {
    const asm = State.activeCourse.assessments[asmIdx];
    if (!asm) return;
    const al = (asm.clo_allocations || []).find(x => x.clo_id === cloId);
    if (al) {
      al.allocated_marks = marks;
    }
  },

  recomputeTotalHours() {
    const lec = parseInt(document.getElementById('spec_lecture')?.value) || 0;
    const tut = parseInt(document.getElementById('spec_tutorial')?.value) || 0;
    const lab = parseInt(document.getElementById('spec_lab')?.value) || 0;
    const ind = parseInt(document.getElementById('spec_independent')?.value) || 0;
    const asm = parseInt(document.getElementById('spec_assessment_hours')?.value) || 0;
    const totalEl = document.getElementById('spec_total_hours');
    if (totalEl) {
      totalEl.value = lec + tut + lab + ind + asm;
    }
  },

  // --- SAVE ALL ---
  async save() {
    if (!State.activeCourse) return;

    State.activeCourse.title = document.getElementById('spec_title').value.trim();
    State.activeCourse.academic_year = document.getElementById('spec_year').value;
    State.activeCourse.semester = document.getElementById('spec_semester').value;
    State.activeCourse.credit_hours = parseInt(document.getElementById('spec_credits').value) || 3;
    State.activeCourse.program_name = (document.getElementById('spec_program')?.value || 'B.Sc in Data Science').trim();
    State.activeCourse.course_category = document.getElementById('spec_category')?.value || 'Core';
    State.activeCourse.lecture_hours = parseInt(document.getElementById('spec_lecture').value) || 0;
    State.activeCourse.tutorial_hours = parseInt(document.getElementById('spec_tutorial').value) || 0;
    State.activeCourse.lab_hours = parseInt(document.getElementById('spec_lab').value) || 0;
    State.activeCourse.independent_hours = parseInt(document.getElementById('spec_independent')?.value) || 0;
    State.activeCourse.assessment_hours = parseInt(document.getElementById('spec_assessment_hours')?.value) || 0;
    State.activeCourse.total_notional_hours = parseInt(document.getElementById('spec_total_hours')?.value) || 120;
    State.activeCourse.prerequisites = document.getElementById('spec_prereqs').value.trim();
    State.activeCourse.corequisites = (document.getElementById('spec_coreqs')?.value || 'None').trim();
    State.activeCourse.instructor_name = document.getElementById('spec_instructor').value.trim();
    State.activeCourse.description = document.getElementById('spec_desc').value.trim();
    State.activeCourse.teaching_strategy = (document.getElementById('spec_strategy')?.value || '').trim();
    State.activeCourse.textbooks = (document.getElementById('spec_textbooks')?.value || '').trim();
    State.activeCourse.reference_books = (document.getElementById('spec_references')?.value || '').trim();

    // Save stream for freshman courses
    const streamEl = document.getElementById('spec_stream');
    if (streamEl && !document.getElementById('spec-stream-row')?.classList.contains('hidden')) {
      State.activeCourse.stream = streamEl.value;
    }

    // Always persist course and PLOs locally in localStorage
    try {
      localStorage.setItem(`obe_course_${State.activeCourse.id}`, JSON.stringify(State.activeCourse));
      const cIdx = State.courses.findIndex(c => c.id === State.activeCourse.id);
      if (cIdx >= 0) {
        State.courses[cIdx] = JSON.parse(JSON.stringify(State.activeCourse));
      }
      localStorage.setItem('obe_courses', JSON.stringify(State.courses));
      State.savePLOsLocally();
    } catch (lsErr) {}

    try {
      const data = await API.updateCourse(State.activeCourse.id, State.activeCourse);
      if (data && data.course) {
        State.activeCourse = data.course;
      }
      State.showToast(`✅ Saved ${State.activeCourse.code}: Specs, Chapters, CLOs & Blueprint!`);
    } catch (e) {
      console.warn('Server offline or network unavailable; saved course changes in browser storage:', e);
      State.showToast(`✅ Saved ${State.activeCourse.code}: Specs, Chapters, CLOs & Blueprint!`);
    }
    DossierComponent.render();
  }
};
