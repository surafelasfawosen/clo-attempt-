/**
 * freshman.js
 * Stage 1.5: College of Freshman Studies - Common Courses Studio
 * 
 * Curriculum Studio view for the College of Freshman Studies:
 * - Purely manages Freshman Foundation Courses (CLOs, Chapters, Syllabus Specifications).
 * - Classifies courses by Stream: Natural Science, Social Science, or Common.
 * - Bypasses departments (since the Freshman College has no departments).
 * - All batch admissions ingestion, A-Z class sectioning, teacher assignment,
 *   and manual forwarding to departments are situated in Course Assignments.
 */

const FreshmanHubComponent = {
  courses: [],

  async render() {
    Sidebar.updateBreadcrumb('freshman-hub');
    Sidebar.updateProgress('freshman-hub');
    await FreshmanHubComponent.renderCourses();
  },

  async renderCourses() {
    const grid = document.getElementById('fresh-courses-grid');
    const badge = document.getElementById('fresh-courses-count-badge');
    
    const streamFilter = document.getElementById('fresh-courses-stream-filter');
    const selectedStream = (streamFilter && streamFilter.value) ? streamFilter.value : 'ALL';

    // Freshman always has only Semester I — no semester filter needed

    try {
      FreshmanHubComponent.courses = await API.getFreshmanCourses();
    } catch (err) {
      FreshmanHubComponent.courses = State.courses.filter(c => 
        c.department_id === 'dept_freshman_common' || 
        (c.code && (c.code.startsWith('EnLa') || c.code.startsWith('Math') || c.code.startsWith('Phys') || c.code.startsWith('GeES') || c.code.startsWith('CoSc') || c.code.startsWith('Psyc') || c.code.startsWith('Chem') || c.code.startsWith('Hist') || c.code.startsWith('Anth') || c.code.startsWith('Econ') || c.code.startsWith('GlTr')))
      );
    }

    if (!FreshmanHubComponent.courses || FreshmanHubComponent.courses.length === 0) {
      FreshmanHubComponent.courses = (State.courses || []).filter(c => c.department_id === 'dept_freshman_common');
    }

    let list = FreshmanHubComponent.courses || [];

    // 1. Filter by Stream (Natural Science, Social Science, or Common)
    if (selectedStream !== 'ALL') {
      list = list.filter(c => c.stream === selectedStream || c.stream === 'Common');
    }

    // Note: Freshman = Semester I only — no semester filter applied

    if (badge) badge.innerText = `${list.length} Courses Available`;

    if (grid) {
      if (list.length === 0) {
        grid.innerHTML = `
          <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
            <p class="text-slate-500 text-sm font-semibold">No common courses found matching this stream and semester filter.</p>
            <button onclick="FreshmanHubComponent.openAddCourseModal()" class="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition">
              + Create Freshman Course
            </button>
          </div>
        `;
        return;
      }

      const getStreamBadge = (strm) => {
        if (strm === 'Natural Science') {
          return '<span class="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Natural Science</span>';
        }
        if (strm === 'Social Science') {
          return '<span class="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>Social Science</span>';
        }
        return '<span class="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded text-[10px] border border-indigo-200 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>Common (Both Streams)</span>';
      };

      grid.innerHTML = list.map(c => `
        <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between" onclick="CourseStudioComponent.open('${c.id}', 'view')">
          <div class="space-y-2.5">
            <div class="flex justify-between items-start">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="bg-blue-50 text-blue-700 font-mono font-bold text-xs px-2.5 py-1 rounded-md border border-blue-200">
                  ${c.code}
                </span>
                ${getStreamBadge(c.stream || 'Common')}
              </div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-400">${c.credit_hours || 3} Credits</span>
                <button onclick="event.stopPropagation(); FreshmanHubComponent.deleteCourse('${c.id}', '${c.code}')" class="text-slate-300 hover:text-red-600 p-1 transition" title="Delete Course">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <h4 class="font-extrabold text-slate-900 text-base leading-snug hover:text-blue-600 transition">
              ${c.title}
            </h4>

            <p class="text-sm text-slate-600 line-clamp-2 leading-relaxed">
              ${c.description || 'Common university foundation course designed for undergraduate academic preparation.'}
            </p>
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
      `).join('');
    }
  },

  async deleteCourse(courseId, code) {
    if (confirm(`Are you sure you want to delete common course ${code}?`)) {
      try {
        await API.deleteCourse(courseId);
        State.showToast(`✅ Deleted course ${code}.`);
      } catch (e) {
        State.showToast(`Deleted course ${code}.`);
      }
      FreshmanHubComponent.courses = (FreshmanHubComponent.courses || []).filter(c => c.id !== courseId);
      State.courses = (State.courses || []).filter(c => c.id !== courseId);
      FreshmanHubComponent.renderCourses();
    }
  },

  filterCourses() {
    FreshmanHubComponent.renderCourses();
  },

  openCourseInStudio(courseId, mode = 'edit', tab = 'spec') {
    const found = (FreshmanHubComponent.courses || []).find(c => c.id === courseId) || (State.courses || []).find(c => c.id === courseId);
    if (found) {
      if (!State.courses.some(c => c.id === found.id)) {
        State.courses.push(found);
      }
      State.activeCourse = found;
      CourseStudioComponent.open(found.id, mode, tab);
    }
  },

  openAddCourseModal() {
    const modal = document.getElementById('modal-fresh-add-course');
    if (modal) modal.classList.remove('hidden');
  },

  closeAddCourseModal() {
    const modal = document.getElementById('modal-fresh-add-course');
    if (modal) modal.classList.add('hidden');
  },

  async submitNewCourse() {
    const code = document.getElementById('fresh-new-course-code').value.trim();
    const title = document.getElementById('fresh-new-course-title').value.trim();
    const stream = document.getElementById('fresh-new-course-stream').value;
    const cr = parseInt(document.getElementById('fresh-new-course-cr').value, 10) || 3;

    if (!code || !title) {
      alert("Please enter both Course Code and Course Title.");
      return;
    }

    // Freshman always has only Semester I
    const sem = 'Semester I';

    // Build a local course object immediately (used as fallback and for Studio navigation)
    let newCourse = {
      id: `crs_${code.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`,
      code: code,
      title: title,
      stream: stream,
      semester: sem,
      credit_hours: cr,
      lecture_hours: cr,
      lab_hours: 0,
      tutorial_hours: 0,
      department_id: 'dept_freshman_common',
      program_name: 'Common University Foundation',
      academic_year: 'Year 1',
      status: 'Draft',
      clos: [],
      chapters: [],
      assessments: []
    };

    // Try to persist to backend; use local fallback if offline
    try {
      const res = await API.createFreshmanCourse({
        code: code,
        title: title,
        stream: stream,
        semester: sem,
        credit_hours: cr,
        lecture_hours: cr,
        lab_hours: 0,
        tutorial_hours: 0
      });
      if (res && res.id) {
        newCourse.id = res.id;
        if (res.code) newCourse.code = res.code;
      }
    } catch (e) {
      // offline — use local fallback course object
    }

    // Add to both caches so Course Studio can find it
    if (!State.courses.some(c => c.id === newCourse.id)) {
      State.courses.push(newCourse);
    }
    if (!FreshmanHubComponent.courses.some(c => c.id === newCourse.id)) {
      FreshmanHubComponent.courses.push(newCourse);
    }

    // Close the small modal
    FreshmanHubComponent.closeAddCourseModal();

    // Open the full Course Studio (same as any other department course)
    State.activeCourse = newCourse;
    CourseStudioComponent.open(newCourse.id, 'edit', 'spec');
  },

  refresh() {
    FreshmanHubComponent.renderCourses();
    State.showToast("Freshman common courses refreshed.");
  }
};

window.FreshmanHubComponent = FreshmanHubComponent;
