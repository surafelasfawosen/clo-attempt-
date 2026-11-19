/**
 * courses.js
 * Stage 3: Chronological Courses Timeline Component
 */

const CoursesComponent = {
  render() {
    if (!State.selectedDepartment) return;

    const heading = document.getElementById('courses-stage-heading');
    if (heading) heading.innerText = `${State.selectedDepartment.name} Curriculum`;

    const container = document.getElementById('courses-chronological-list');
    if (!container) return;

    const deptCourses = State.courses.filter(c => c.department_id === State.selectedDepartment.id);

    const years = ["Year 1", "Year 2", "Year 3", "Year 4"];
    const filteredYears = State.selectedYearFilter === 'ALL' ? years : [State.selectedYearFilter];

    const yearBadges = {
      "Year 1": { label: "1st Year", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
      "Year 2": { label: "2nd Year", color: "bg-sky-100 text-sky-800 border-sky-200" },
      "Year 3": { label: "3rd Year", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
      "Year 4": { label: "4th Year", color: "bg-amber-100 text-amber-800 border-amber-200" }
    };

    container.innerHTML = filteredYears.map(yr => {
      let yrCourses = deptCourses.filter(c => c.academic_year === yr);
      if (State.selectedSemFilter !== 'ALL') {
        yrCourses = yrCourses.filter(c => c.semester === State.selectedSemFilter);
      }

      const sem1 = yrCourses.filter(c => c.semester === 'Semester I');
      const sem2 = yrCourses.filter(c => c.semester === 'Semester II');

      const renderSemesterBlock = (semTitle, list) => {
        if (list.length === 0) return '';
        return `
          <div class="space-y-3 pt-2">
            <div class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-slate-400"></span>
              <span>${semTitle}</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${list.map(c => `
                <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between" onclick="CourseStudioComponent.open('${c.id}', 'view')">
                  <div class="space-y-2.5">
                    <div class="flex justify-between items-start">
                      <span class="bg-blue-50 text-blue-700 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-blue-200">${c.code}</span>
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-slate-400">${c.credit_hours} Credits</span>
                        <button onclick="event.stopPropagation(); CoursesComponent.deleteCourse('${c.id}', '${c.code}')" class="text-slate-300 hover:text-red-600 p-1" title="Delete Course">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>
                    <h4 class="font-extrabold text-slate-900 text-base leading-snug">${c.title}</h4>
                    <p class="text-sm text-slate-600 line-clamp-2 leading-relaxed">${c.description || 'No description provided.'}</p>
                  </div>

                  <div class="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div class="flex items-center gap-2">
                      <span class="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200 text-xs">${(c.chapters || []).length} Chapters</span>
                      <span class="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200 text-xs">${(c.clos || []).length} CLOs</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button onclick="event.stopPropagation(); CourseStudioComponent.open('${c.id}', 'view')" class="text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition">
                        <span>View Syllabus &rarr;</span>
                      </button>
                      <button onclick="event.stopPropagation(); CourseStudioComponent.open('${c.id}', 'edit', 'spec')" class="text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-bold transition">
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `;
      };

      const bInfo = yearBadges[yr] || { label: yr, color: "bg-slate-200 text-slate-700" };

      if (yrCourses.length === 0) {
        return `
          <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <span class="${bInfo.color} text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">${bInfo.label}</span>
            <div class="text-slate-400 text-xs italic py-2">No courses scheduled for this academic year yet.</div>
          </div>
        `;
      }

      return `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div class="flex justify-between items-center border-b pb-3">
            <div class="flex items-center gap-3">
              <span class="${bInfo.color} text-xs font-black px-3 py-1 rounded-full border uppercase tracking-wider">${bInfo.label}</span>
              <span class="text-xs font-bold text-slate-400">${yrCourses.length} Courses Offered</span>
            </div>
          </div>

          ${renderSemesterBlock('Semester I', sem1)}
          ${renderSemesterBlock('Semester II', sem2)}
        </div>
      `;
    }).join('');
  },

  setYearFilter(yr) {
    State.selectedYearFilter = yr;
    ['ALL', 'Year 1', 'Year 2', 'Year 3', 'Year 4'].forEach(y => {
      const btn = document.getElementById(`filter-btn-yr-${y.replace(' ', '')}`);
      if (btn) {
        if (y === yr) {
          btn.className = 'text-xs font-bold px-3 py-1 rounded-lg bg-blue-600 text-white shadow-sm';
        } else {
          btn.className = 'text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200';
        }
      }
    });
    CoursesComponent.render();
  },

  setSemFilter(sem) {
    State.selectedSemFilter = sem;
    ['ALL', 'Semester I', 'Semester II'].forEach(s => {
      const btn = document.getElementById(`filter-btn-sem-${s.replace(' ', '')}`);
      if (btn) {
        if (s === sem) {
          btn.className = 'text-xs font-bold px-3 py-1 rounded-lg bg-indigo-600 text-white shadow-sm';
        } else {
          btn.className = 'text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200';
        }
      }
    });
    CoursesComponent.render();
  },

  openAddModal() {
    document.getElementById('course_modal_code').value = '';
    document.getElementById('course_modal_title').value = '';
    document.getElementById('course_modal_credits').value = 3;
    document.getElementById('course_modal_prereqs').value = '';
    document.getElementById('course_modal_desc').value = '';
    document.getElementById('courseModal').classList.remove('hidden');
  },

  closeAddModal() {
    document.getElementById('courseModal').classList.add('hidden');
  },

  fillTemplate(type) {
    if (type === 'ML') {
      document.getElementById('course_modal_code').value = 'DaSc3021';
      document.getElementById('course_modal_title').value = 'Machine Learning & Pattern Recognition';
      document.getElementById('course_modal_year').value = 'Year 3';
      document.getElementById('course_modal_sem').value = 'Semester I';
      document.getElementById('course_modal_credits').value = 4;
      document.getElementById('course_modal_prereqs').value = 'Linear Algebra, Calculus, Python';
      document.getElementById('course_modal_desc').value = 'Supervised, unsupervised, and deep learning paradigms with practical Python pipelines.';
    } else {
      document.getElementById('course_modal_code').value = 'Stat4092';
      document.getElementById('course_modal_title').value = 'Operations Research and Optimization';
      document.getElementById('course_modal_year').value = 'Year 4';
      document.getElementById('course_modal_sem').value = 'Semester II';
      document.getElementById('course_modal_credits').value = 3;
      document.getElementById('course_modal_prereqs').value = 'Calculus, Linear Algebra, Python';
      document.getElementById('course_modal_desc').value = 'Linear programming, simplex method, transportation problem, queuing theory, and game theory.';
    }
  },

  async submitAddModal() {
    const code = document.getElementById('course_modal_code').value.trim();
    const title = document.getElementById('course_modal_title').value.trim();
    if (!code || !title) {
      alert('Please fill course code and title.');
      return;
    }

    const newId = `course_${code.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const payload = {
      id: newId,
      code,
      title,
      department_id: State.selectedDepartment.id,
      academic_year: document.getElementById('course_modal_year').value,
      semester: document.getElementById('course_modal_sem').value,
      credit_hours: parseInt(document.getElementById('course_modal_credits').value) || 3,
      lecture_hours: 40,
      lab_hours: 20,
      tutorial_hours: 15,
      prerequisites: document.getElementById('course_modal_prereqs').value,
      description: document.getElementById('course_modal_desc').value,
      instructor_name: "Academic Staff",
      clos: [
        {
          id: `${newId}_clo_1`,
          code: "CLO1",
          description: `Formulate fundamental concepts and theoretical foundations of ${title}.`,
          blooms_level: "Understanding",
          passing_score_pct: 60.0,
          target_attainment_pct: 70.0
        },
        {
          id: `${newId}_clo_2`,
          code: "CLO2",
          description: `Apply computational techniques to model and solve practical problems in ${title}.`,
          blooms_level: "Applying",
          passing_score_pct: 60.0,
          target_attainment_pct: 70.0
        }
      ],
      chapters: [
        {
          id: `${newId}_ch_1`,
          chapter_number: 1,
          title: "Chapter 1: Foundational Principles",
          content: "Overview of basic concepts, mathematical formulations, and operational scope.",
          mapped_clos: "CLO1",
          teaching_methods: "Lecture, Tutorial"
        },
        {
          id: `${newId}_ch_2`,
          chapter_number: 2,
          title: "Chapter 2: Methods & Algorithms",
          content: "Standard algorithmic solutions, step-by-step implementations, and problem sets.",
          mapped_clos: "CLO2",
          teaching_methods: "Lecture, Practical Lab"
        }
      ],
      assessments: [
        {
          id: `${newId}_asm_1`,
          name: "Continuous Assessment (Assignments & Quizzes)",
          assessment_type: "Assignment",
          total_marks: 30.0,
          course_weight_pct: 30.0,
          clo_allocations: [{ clo_id: `${newId}_clo_1`, allocated_marks: 30.0 }]
        },
        {
          id: `${newId}_asm_2`,
          name: "Final Summative Examination",
          assessment_type: "Final_Exam",
          total_marks: 70.0,
          course_weight_pct: 70.0,
          clo_allocations: [{ clo_id: `${newId}_clo_2`, allocated_marks: 70.0 }]
        }
      ]
    };

    try {
      await API.createCourse(payload);
      CoursesComponent.closeAddModal();
      State.showToast(`Course ${code} created with chapters, CLOs & blueprint!`);
      await State.loadAllData();
      CoursesComponent.render();
      CourseStudioComponent.open(newId, 'edit', 'spec');
    } catch (e) {
      alert('Error: ' + e.message);
    }
  },

  async deleteCourse(courseId, code) {
    if (confirm(`Are you sure you want to delete course ${code}?`)) {
      try {
        await API.deleteCourse(courseId);
        State.showToast(`Course ${code} deleted.`);
        await State.loadAllData();
        CoursesComponent.render();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  }
};

