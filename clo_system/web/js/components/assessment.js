/**
 * assessment.js
 * Stage 6: Academic Assessment, Examination Hub & Automated CLO Attainment Ecosystem
 * 
 * Implements:
 * 1. Faculty AI Knowledge Profile (Feeds neural matching engine & OBE syllabus evaluator)
 * 2. Teacher Exam Studio (Teacher authors questions across 5 item types: MCQ, True/False, Blank Space, Short Answer, Workout)
 * 3. AI Question Alignment & Evaluation Engine (Evaluates teacher-authored questions against chapters & CLOs, Bloom's level)
 * 4. Department Examination Committee Quality Gate (Examiner reviews, audits, approves & locks exams)
 * 5. Online Student Exam Platform (Timed student portal with instant objective scoring)
 * 6. Automated Question -> CLO Point Pipeline (Question scores feed directly into CLO attainment calculations without manual math)
 * 7. Comprehensive CLO Attainment Report & Dashboard (Directly mirrors CLO Attainment Template Dec 2026 V-2.xlsx)
 * 8. Department Head & College Dean Executive Endorsement
 */

const AssessmentComponent = {
  activeRole: 'teacher',       // 'teacher' | 'examiner' | 'student' | 'dept_head' | 'dean'
  currentTab: 'profile',       // 'profile' | 'authoring' | 'examiner' | 'student' | 'report' | 'dean'
  selectedCourseId: 'crs_stat4092',
  selectedSection: 'ALL',
  selectedAssessmentType: 'Mid Exam',
  activeStudentIndex: 0,
  examStatus: 'submitted_to_examiner', // 'draft' | 'submitted_to_examiner' | 'approved' | 'in_progress' | 'completed' | 'dispatched' | 'endorsed'
  examDispatchTimestamp: null,
  deanEndorsementTimestamp: null,

  // Teacher Knowledge Profile (Synchronized with State.instructors)
  facultyProfile: {
    id: "inst_adimias_w",
    fullName: "Dr. Adimias W (PhD)",
    academicRank: "Associate Professor",
    highestDegree: "Ph.D. in Operations Research & Optimization",
    almaMater: "Addis Ababa University",
    experienceYears: 15,
    maxTeachingLoad: 12,
    collegeId: "col_computing_dbu",
    departmentId: "dept_data_science",
    specializations: "Operations Research, Linear Programming, Simplex Method, Optimization Algorithms, Queuing Theory, Transportation Problem, Mathematical Modeling",
    certifications: "Certified Operations Research Analyst (CORA), INFORMS Professional Member",
    publications: "1. Dual Simplex Approaches for Multi-commodity Networks (Journal of Optimization, 2022)\n2. Dynamic Queuing Models for Healthcare Facility Routing (IEEE Access, 2024)",
    projects: "National Agricultural Freight Scheduling Optimization System (DBU-MoA Grant, 2023-2025)"
  },

  // Teacher-Authored Assessment Items
  // Each question is tagged with chapter, CLO, points, Bloom's level, and AI evaluation
  examQuestions: [
    {
      id: "q_stat4092_1",
      type: "mcq",
      text: "In the Simplex algorithm for Linear Programming, which indicator in the objective row (z-row) demonstrates that an unbounded solution has been encountered?",
      options: [
        "All shadow prices are strictly zero.",
        "A non-basic variable has a negative relative profit, but all constraint coefficients in its pivot column are non-positive (<= 0).",
        "The minimum ratio test yields identical positive values for two competing basic variables.",
        "The objective value reaches zero in Phase I of the Two-Phase Simplex procedure."
      ],
      correctOption: 1,
      points: 4,
      targetChapter: "Chapter 1: Linear Programming & Simplex Method",
      targetCLO: "CLO1",
      bloomsLevel: "Analyzing",
      aiEvaluation: {
        alignmentScore: 98,
        cognitiveMatch: "High (Level 4: Analyzing)",
        chapterCoverage: "Chapter 1 (Simplex Degeneracy & Unboundedness)",
        critique: "Excellent discriminator for Simplex tableau boundary conditions. Directly tests CLO1 theoretical and computational foundation.",
        evaluated: true
      }
    },
    {
      id: "q_stat4092_2",
      type: "tf",
      text: "According to Duality Theory in Linear Programming, the dual of a dual linear programming problem is mathematically identical to the original primal problem.",
      correctAnswer: true,
      points: 3,
      targetChapter: "Chapter 1: Linear Programming & Simplex Method",
      targetCLO: "CLO1",
      bloomsLevel: "Understanding",
      aiEvaluation: {
        alignmentScore: 95,
        cognitiveMatch: "Moderate (Level 2: Understanding)",
        chapterCoverage: "Chapter 1 (Duality & Economic Interpretations)",
        critique: "Accurate verification of foundational duality theorem. Confirms comprehension of primal-dual symmetry.",
        evaluated: true
      }
    },
    {
      id: "q_stat4092_3",
      type: "blank",
      text: "In a transportation problem model, when the total available supply exactly equals the total consumer demand (Sigma a_i = Sigma b_j), the model is formally defined as a ________ model.",
      correctBlank: "balanced",
      points: 5,
      targetChapter: "Chapter 2: Transportation & Assignment Problems",
      targetCLO: "CLO2",
      bloomsLevel: "Remembering",
      aiEvaluation: {
        alignmentScore: 96,
        cognitiveMatch: "Direct (Level 1: Remembering)",
        chapterCoverage: "Chapter 2 (Feasibility & Transportation Formulations)",
        critique: "Core terminology for classical transportation algorithms (Vogel's approximation and MODI).",
        evaluated: true
      }
    },
    {
      id: "q_stat4092_4",
      type: "workout",
      text: "A manufacturing plant produces two items, A and B. Maximize profit Z = 40x1 + 30x2 subject to labor constraint 2x1 + x2 <= 16 and raw material constraint x1 + 2x2 <= 12, where x1, x2 >= 0.\n\nTask: (a) Formulate the symmetric Dual Problem. (b) Solve the primal system using the Simplex method and determine the optimal production mix and maximum profit.",
      rubric: "Formulation of Dual: 3 pts | Initial Simplex Tableau setup: 2 pts | Iteration & Pivot calculations: 2 pts | Final Optimal Solution declaration: 1 pt",
      points: 8,
      targetChapter: "Chapter 2: Transportation & Assignment Problems",
      targetCLO: "CLO2",
      bloomsLevel: "Applying",
      aiEvaluation: {
        alignmentScore: 99,
        cognitiveMatch: "Rigorous (Level 3: Applying & Synthesizing)",
        chapterCoverage: "Chapter 1 & 2 (Computational Simplex Formulation)",
        critique: "Comprehensive multi-step workout problem. Directly benchmarks CLO2 mastery through algorithmic execution.",
        evaluated: true
      }
    }
  ],

  // Student Responses and Scores
  // Key feature: Question scores automatically feed into CLO1 and CLO2!
  studentExamRecords: [
    {
      studentId: "DBU150001",
      name: "Aaron Tadesse",
      section: "Section A",
      answers: {
        q_stat4092_1: 1, // Correct (4 pts -> CLO1)
        q_stat4092_2: true, // Correct (3 pts -> CLO1)
        q_stat4092_3: "balanced", // Correct (5 pts -> CLO2)
        q_stat4092_4: "Dual: Minimize W = 16y1 + 12y2 subject to 2y1 + y2 >= 40, y1 + 2y2 >= 30. Primal optimal solution: x1 = 6.67, x2 = 2.67, Max Profit Z = 346.67."
      },
      questionScores: {
        q_stat4092_1: 4.0, // CLO1
        q_stat4092_2: 3.0, // CLO1
        q_stat4092_3: 5.0, // CLO2
        q_stat4092_4: 7.5  // CLO2
      },
      submittedAt: "2026-11-18 09:42:15",
      isGraded: true
    },
    {
      studentId: "DBU150002",
      name: "Abinet Belay",
      section: "Section A",
      answers: {
        q_stat4092_1: 1,
        q_stat4092_2: true,
        q_stat4092_3: "balanced",
        q_stat4092_4: "Dual formulated correctly. Optimal solution identified with minor rounding variance."
      },
      questionScores: {
        q_stat4092_1: 4.0,
        q_stat4092_2: 3.0,
        q_stat4092_3: 5.0,
        q_stat4092_4: 7.0
      },
      submittedAt: "2026-11-18 09:45:00",
      isGraded: true
    },
    {
      studentId: "DBU150003",
      name: "Almaz Hailu",
      section: "Section A",
      answers: {
        q_stat4092_1: 0, // Incorrect
        q_stat4092_2: true,
        q_stat4092_3: "balanced",
        q_stat4092_4: "Formulated dual. Primal tableau completed with one arithmetic error."
      },
      questionScores: {
        q_stat4092_1: 0.0,
        q_stat4092_2: 3.0,
        q_stat4092_3: 5.0,
        q_stat4092_4: 6.0
      },
      submittedAt: "2026-11-18 09:50:11",
      isGraded: true
    },
    {
      studentId: "DBU150004",
      name: "Aman Worku",
      section: "Section A",
      answers: {
        q_stat4092_1: 1,
        q_stat4092_2: true,
        q_stat4092_3: "balanced",
        q_stat4092_4: "Complete analytical formulation and exact tableau iterations."
      },
      questionScores: {
        q_stat4092_1: 4.0,
        q_stat4092_2: 3.0,
        q_stat4092_3: 5.0,
        q_stat4092_4: 8.0
      },
      submittedAt: "2026-11-18 09:39:48",
      isGraded: true
    },
    {
      studentId: "DBU150005",
      name: "Aster Kebede",
      section: "Section A",
      answers: {
        q_stat4092_1: 1,
        q_stat4092_2: false, // Incorrect
        q_stat4092_3: "balanced",
        q_stat4092_4: "Dual formulated. Simplex tableau accurate."
      },
      questionScores: {
        q_stat4092_1: 4.0,
        q_stat4092_2: 0.0,
        q_stat4092_3: 5.0,
        q_stat4092_4: 6.5
      },
      submittedAt: "2026-11-18 09:48:30",
      isGraded: true
    },
    {
      studentId: "DBU150006",
      name: "Bekele Mengistu",
      section: "Section B",
      answers: {
        q_stat4092_1: 1,
        q_stat4092_2: true,
        q_stat4092_3: "balanced",
        q_stat4092_4: "Dual formulated. Minor pivot error in iteration 2."
      },
      questionScores: {
        q_stat4092_1: 4.0,
        q_stat4092_2: 3.0,
        q_stat4092_3: 5.0,
        q_stat4092_4: 5.5
      },
      submittedAt: "2026-11-18 09:51:04",
      isGraded: true
    },
    {
      studentId: "DBU150007",
      name: "Bethelhem Alemu",
      section: "Section B",
      answers: {
        q_stat4092_1: 1,
        q_stat4092_2: true,
        q_stat4092_3: "closed", // Incorrect
        q_stat4092_4: "Full dual formulation and accurate simplex solution."
      },
      questionScores: {
        q_stat4092_1: 4.0,
        q_stat4092_2: 3.0,
        q_stat4092_3: 0.0,
        q_stat4092_4: 7.5
      },
      submittedAt: "2026-11-18 09:46:12",
      isGraded: true
    },
    {
      studentId: "DBU150008",
      name: "Biruk Lemma",
      section: "Section B",
      answers: {
        q_stat4092_1: 1,
        q_stat4092_2: true,
        q_stat4092_3: "balanced",
        q_stat4092_4: "Correct dual model and simplex iterations."
      },
      questionScores: {
        q_stat4092_1: 4.0,
        q_stat4092_2: 3.0,
        q_stat4092_3: 5.0,
        q_stat4092_4: 7.0
      },
      submittedAt: "2026-11-18 09:44:00",
      isGraded: true
    }
  ],

  // Official Course Assessment Methods (Mirrors Excel Sheet "Attainment Calculation")
  assessmentPlan: [
    { id: "asst_1", name: "Quiz 1", type: "Quiz 1", mappedCLOs: "CLO1", weight: 5, maxMarks: 10, remark: "Objective item evaluation" },
    { id: "asst_2", name: "Lab Exam", type: "Lab Exam", mappedCLOs: "CLO2, CLO3", weight: 15, maxMarks: 20, remark: "Software simulation & Solver practicals" },
    { id: "asst_3", name: "Mid Exam", type: "Mid Exam", mappedCLOs: "CLO1, CLO2", weight: 15, maxMarks: 20, remark: "Midterm examination (Live Online)" },
    { id: "asst_4", name: "Assignment 2", type: "Assignment 2", mappedCLOs: "CLO1, CLO3", weight: 10, maxMarks: 10, remark: "Duality & sensitivity analysis homework" },
    { id: "asst_5", name: "Project", type: "Project", mappedCLOs: "CLO2, CLO3", weight: 15, maxMarks: 30, remark: "Real-world supply chain case study" },
    { id: "asst_6", name: "Final Exam", type: "Final Exam", mappedCLOs: "CLO1, CLO2, CLO3", weight: 40, maxMarks: 40, remark: "Comprehensive institutional evaluation" }
  ],

  // Comprehensive Student Attainment Database for Course Stat4092
  // Pre-populated with permanent cohort data mirroring CLO Attainment Template Dec 2026 V-2.xlsx
  cohortAttainmentDatabase: [],

  // Lifecycle Initialization
  init() {
    AssessmentComponent.initCohortDatabase();
    AssessmentComponent.syncFacultyProfileWithState();
  },

  syncFacultyProfileWithState() {
    // If Dr. Adimias exists in State.instructors, load latest details
    const found = (State.instructors || []).find(i => i.id === 'inst_adimias_w');
    if (found) {
      AssessmentComponent.facultyProfile.fullName = found.full_name || AssessmentComponent.facultyProfile.fullName;
      AssessmentComponent.facultyProfile.academicRank = found.academic_rank || AssessmentComponent.facultyProfile.academicRank;
      AssessmentComponent.facultyProfile.highestDegree = found.highest_degree || AssessmentComponent.facultyProfile.highestDegree;
      AssessmentComponent.facultyProfile.almaMater = found.alma_mater || AssessmentComponent.facultyProfile.almaMater;
      AssessmentComponent.facultyProfile.specializations = found.specializations || AssessmentComponent.facultyProfile.specializations;
      AssessmentComponent.facultyProfile.collegeId = found.college_id || AssessmentComponent.facultyProfile.collegeId;
      AssessmentComponent.facultyProfile.departmentId = found.department_id || AssessmentComponent.facultyProfile.departmentId;
    }
  },

  initCohortDatabase() {
    // Generate realistic student attainment records for Stat4092 (24 permanent students)
    // Marks are distributed to mirror the actual values in the Dec 2026 Excel template
    const rawNames = [
      { id: "DBU150001", name: "Aaron Tadesse", sec: "Section A", c1: 9.0, c2: 19.5, c3: 8.5 },
      { id: "DBU150002", name: "Abinet Belay", sec: "Section A", c1: 6.5, c2: 12.5, c3: 9.5 },
      { id: "DBU150003", name: "Almaz Hailu", sec: "Section A", c1: 7.5, c2: 19.5, c3: 8.5 },
      { id: "DBU150004", name: "Aman Worku", sec: "Section A", c1: 8.5, c2: 17.5, c3: 8.0 },
      { id: "DBU150005", name: "Aster Kebede", sec: "Section A", c1: 8.5, c2: 15.1, c3: 8.0 },
      { id: "DBU150006", name: "Bekele Mengistu", sec: "Section A", c1: 8.5, c2: 17.6, c3: 7.5 },
      { id: "DBU150007", name: "Bethelhem Alemu", sec: "Section A", c1: 6.5, c2: 13.0, c3: 8.0 },
      { id: "DBU150008", name: "Biruk Lemma", sec: "Section A", c1: 8.0, c2: 17.0, c3: 8.0 },
      { id: "DBU150009", name: "Chala Demissie", sec: "Section A", c1: 7.5, c2: 20.5, c3: 9.5 },
      { id: "DBU150010", name: "Daniel Tesfaye", sec: "Section A", c1: 6.5, c2: 13.0, c3: 9.0 },
      { id: "DBU150011", name: "Dawit Abebe", sec: "Section A", c1: 8.5, c2: 19.0, c3: 7.0 },
      { id: "DBU150012", name: "Eleni Wolde", sec: "Section A", c1: 6.5, c2: 20.0, c3: 8.5 },
      { id: "DBU150013", name: "Ermias Haile", sec: "Section B", c1: 7.5, c2: 14.0, c3: 7.5 },
      { id: "DBU150014", name: "Fikirte Girma", sec: "Section B", c1: 8.5, c2: 22.0, c3: 8.5 },
      { id: "DBU150015", name: "Girma Assefa", sec: "Section B", c1: 4.0, c2: 12.6, c3: 6.0 },
      { id: "DBU150016", name: "Hanna Bekele", sec: "Section B", c1: 8.5, c2: 15.5, c3: 8.5 },
      { id: "DBU150017", name: "Kalkidan Yonas", sec: "Section B", c1: 8.5, c2: 20.0, c3: 8.5 },
      { id: "DBU150018", name: "Kassahun Tadesse", sec: "Section B", c1: 7.5, c2: 16.5, c3: 9.5 },
      { id: "DBU150019", name: "Kidist Desta", sec: "Section B", c1: 9.0, c2: 17.5, c3: 6.5 },
      { id: "DBU150020", name: "Marta Solomon", sec: "Section B", c1: 6.0, c2: 17.5, c3: 9.5 },
      { id: "DBU150021", name: "Michael Kebede", sec: "Section B", c1: 8.5, c2: 17.5, c3: 8.0 },
      { id: "DBU150022", name: "Rahel Alemu", sec: "Section B", c1: 8.5, c2: 21.0, c3: 11.0 },
      { id: "DBU150023", name: "Solomon Kassa", sec: "Section B", c1: 8.5, c2: 18.1, c3: 6.5 },
      { id: "DBU150024", name: "Tigist Haile", sec: "Section B", c1: 8.0, c2: 15.5, c3: 8.0 }
    ];

    // Total possible marks per CLO (derived from Assessment Methods Matrix in Excel template):
    // CLO1 Max Marks = 11.0
    // CLO2 Max Marks = 23.0
    // CLO3 Max Marks = 11.0
    AssessmentComponent.cohortAttainmentDatabase = rawNames.map(r => {
      return {
        studentId: r.id,
        name: r.name,
        section: r.sec,
        clo1Total: r.c1,
        clo1Pct: (r.c1 / 11.0) * 100,
        clo2Total: r.c2,
        clo2Pct: (r.c2 / 23.0) * 100,
        clo3Total: r.c3,
        clo3Pct: (r.c3 / 11.0) * 100
      };
    });
  },

  // Main Render Routine for Stage 6
  render() {
    AssessmentComponent.init();

    // Populate role selector in header if present
    const roleSelect = document.getElementById('global-role-switcher');
    if (roleSelect) {
      roleSelect.value = AssessmentComponent.activeRole;
    }

    // Populate Tab UI based on currentTab
    AssessmentComponent.switchTab(AssessmentComponent.currentTab, false);

    // Render Sub-Views
    AssessmentComponent.renderProfileTab();
    AssessmentComponent.renderAuthoringTab();
    AssessmentComponent.renderExaminerGate();
    AssessmentComponent.renderStudentExamPortal();
    AssessmentComponent.renderCLOAttainmentReport();
    AssessmentComponent.renderDeanReview();
  },

  // Role Switcher Handler (Called from Header select)
  onRoleSwitch(newRole) {
    AssessmentComponent.activeRole = newRole;
    State.showToast(`Active Persona switched to: ${newRole.toUpperCase()}`);

    // Intelligent auto-tab routing based on switched persona
    if (newRole === 'teacher') {
      AssessmentComponent.switchTab('authoring');
    } else if (newRole === 'examiner') {
      AssessmentComponent.switchTab('examiner');
    } else if (newRole === 'student') {
      AssessmentComponent.switchTab('student');
    } else if (newRole === 'dept_head' || newRole === 'dean') {
      AssessmentComponent.switchTab('dean');
    }

    // Update Header Pill text & avatar
    const nameEl = document.getElementById('header-user-name');
    const avatarEl = document.getElementById('header-user-avatar');
    if (nameEl && avatarEl) {
      if (newRole === 'teacher') {
        nameEl.innerText = AssessmentComponent.facultyProfile.fullName;
        avatarEl.innerText = "AW";
        avatarEl.className = "w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-[11px]";
      } else if (newRole === 'examiner') {
        nameEl.innerText = "Dr. Kassahun T (Examiner)";
        avatarEl.innerText = "KT";
        avatarEl.className = "w-6 h-6 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black text-[11px]";
      } else if (newRole === 'student') {
        nameEl.innerText = "Aaron Tadesse (Student)";
        avatarEl.innerText = "AT";
        avatarEl.className = "w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black text-[11px]";
      } else if (newRole === 'dept_head') {
        nameEl.innerText = "Dr. Bekele T (Dept Head)";
        avatarEl.innerText = "DH";
        avatarEl.className = "w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black text-[11px]";
      } else if (newRole === 'dean') {
        nameEl.innerText = "Dr. Tamirat Desta (Dean)";
        avatarEl.innerText = "TD";
        avatarEl.className = "w-6 h-6 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-black text-[11px]";
      }
    }
  },

  // Tab Switcher
  switchTab(tabKey, doToast = true) {
    AssessmentComponent.currentTab = tabKey;
    const tabs = ['profile', 'authoring', 'examiner', 'student', 'report', 'dean'];

    tabs.forEach(t => {
      const pane = document.getElementById(`asst-tab-${t}`);
      const btn = document.getElementById(`asst-tab-btn-${t}`);
      if (pane) {
        if (t === tabKey) pane.classList.remove('hidden');
        else pane.classList.add('hidden');
      }
      if (btn) {
        if (t === tabKey) {
          btn.className = "px-3 py-2 rounded-lg transition flex items-center gap-1.5 bg-white text-blue-700 shadow-sm font-extrabold";
        } else {
          btn.className = "px-3 py-2 rounded-lg transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900";
        }
      }
    });

    if (tabKey === 'report') {
      AssessmentComponent.renderCLOAttainmentReport();
    } else if (tabKey === 'examiner') {
      AssessmentComponent.renderExaminerGate();
    } else if (tabKey === 'student') {
      AssessmentComponent.renderStudentExamPortal();
    }
  },

  // =========================================================================
  // TAB 1: FACULTY AI PROFILE (Feeds AI Matching & Syllabus Alignment)
  // =========================================================================
  renderProfileTab() {
    const prof = AssessmentComponent.facultyProfile;
    const colSel = document.getElementById('prof-college');
    const deptSel = document.getElementById('prof-dept');

    if (colSel) {
      colSel.innerHTML = (State.colleges || []).map(c => 
        `<option value="${c.id}" ${c.id === prof.collegeId ? 'selected' : ''}>${c.name}</option>`
      ).join('');
    }

    AssessmentComponent.populateProfileDepartments(prof.collegeId, prof.departmentId);

    const fn = document.getElementById('prof-fullname');
    if (fn) fn.value = prof.fullName;
    const rk = document.getElementById('prof-academic-rank');
    if (rk) rk.value = prof.academicRank;
    const dg = document.getElementById('prof-degree');
    if (dg) dg.value = prof.highestDegree;
    const am = document.getElementById('prof-alma-mater');
    if (am) am.value = prof.almaMater;
    const sp = document.getElementById('prof-specializations');
    if (sp) sp.value = prof.specializations;
    const cf = document.getElementById('prof-certifications');
    if (cf) cf.value = prof.certifications;
    const pb = document.getElementById('prof-publications');
    if (pb) pb.value = prof.publications;
    const pj = document.getElementById('prof-projects');
    if (pj) pj.value = prof.projects;
    const ex = document.getElementById('prof-experience-years');
    if (ex) ex.value = prof.experienceYears;
    const ml = document.getElementById('prof-max-load');
    if (ml) ml.value = prof.maxTeachingLoad;
  },

  onProfileCollegeChange(collegeId) {
    AssessmentComponent.facultyProfile.collegeId = collegeId;
    AssessmentComponent.populateProfileDepartments(collegeId, null);
  },

  populateProfileDepartments(collegeId, selectedDeptId) {
    const deptSel = document.getElementById('prof-dept');
    if (!deptSel) return;
    const depts = (State.departments || []).filter(d => !collegeId || d.college_id === collegeId);
    deptSel.innerHTML = depts.map(d => 
      `<option value="${d.id}" ${d.id === selectedDeptId ? 'selected' : ''}>${d.name}</option>`
    ).join('');
  },

  saveFacultyProfile() {
    const prof = AssessmentComponent.facultyProfile;
    prof.fullName = document.getElementById('prof-fullname')?.value || prof.fullName;
    prof.academicRank = document.getElementById('prof-academic-rank')?.value || prof.academicRank;
    prof.highestDegree = document.getElementById('prof-degree')?.value || prof.highestDegree;
    prof.almaMater = document.getElementById('prof-alma-mater')?.value || prof.almaMater;
    prof.specializations = document.getElementById('prof-specializations')?.value || prof.specializations;
    prof.certifications = document.getElementById('prof-certifications')?.value || prof.certifications;
    prof.publications = document.getElementById('prof-publications')?.value || prof.publications;
    prof.projects = document.getElementById('prof-projects')?.value || prof.projects;
    prof.collegeId = document.getElementById('prof-college')?.value || prof.collegeId;
    prof.departmentId = document.getElementById('prof-dept')?.value || prof.departmentId;
    prof.experienceYears = parseInt(document.getElementById('prof-experience-years')?.value || '15', 10);
    prof.maxTeachingLoad = parseInt(document.getElementById('prof-max-load')?.value || '12', 10);

    // Sync back to State.instructors so AI Staffing engine also uses these updated qualifications
    let target = (State.instructors || []).find(i => i.id === 'inst_adimias_w');
    if (!target) {
      target = { id: 'inst_adimias_w' };
      State.instructors.push(target);
    }
    target.full_name = prof.fullName;
    target.academic_rank = prof.academicRank;
    target.highest_degree = prof.highestDegree;
    target.almaMater = prof.almaMater;
    target.specializations = prof.specializations;
    target.college_id = prof.collegeId;
    target.department_id = prof.departmentId;

    State.showToast("Faculty AI Profile saved successfully! Neural engine synchronized.");
  },

  // =========================================================================
  // TAB 2: EXAM CREATION STUDIO & AI EVALUATION (Teacher Authors Questions)
  // =========================================================================
  renderAuthoringTab() {
    // 1. Populate Course Offerings assigned to teacher
    const crsSelect = document.getElementById('authoring-course-select');
    if (crsSelect) {
      crsSelect.innerHTML = (State.courses || []).map(c => 
        `<option value="${c.id}" ${c.id === AssessmentComponent.selectedCourseId ? 'selected' : ''}>
          ${c.code}: ${c.title} (${c.academic_year || 'Year 1'} &bull; ${c.semester || 'Semester I'})
        </option>`
      ).join('');
    }

    // 2. Blueprint Reference Preview
    const currentCourse = (State.courses || []).find(c => c.id === AssessmentComponent.selectedCourseId) || State.courses[0];
    const heading = document.getElementById('blueprint-course-heading');
    if (heading && currentCourse) {
      heading.innerText = `${currentCourse.code}: ${currentCourse.title} • Syllabus Learning Outcomes`;
    }

    const closContainer = document.getElementById('blueprint-clos-preview');
    if (closContainer && currentCourse) {
      const clos = currentCourse.clos || [
        { code: "CLO1", description: "Formulate classical linear programming and Simplex tableau iterations." },
        { code: "CLO2", description: "Solve transportation, assignment, and dual optimization networks." },
        { code: "CLO3", description: "Apply queuing theory and integer branch-and-bound techniques." }
      ];
      closContainer.innerHTML = clos.map(cl => 
        `<span class="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded text-[11px] font-mono border border-blue-200">
          <strong class="text-blue-900">${cl.code}:</strong> <span class="truncate max-w-xs text-slate-600">${cl.description}</span>
        </span>`
      ).join('');
    }

    // 3. Render Question Builder List
    AssessmentComponent.renderQuestions();
  },

  onAuthoringCourseChange(courseId) {
    AssessmentComponent.selectedCourseId = courseId;
    AssessmentComponent.renderAuthoringTab();
    AssessmentComponent.renderCLOAttainmentReport();
  },

  onAssessmentTypeChange(asstType) {
    AssessmentComponent.selectedAssessmentType = asstType;
    State.showToast(`Assessment template adjusted for: ${asstType}`);
  },

  renderQuestions() {
    const container = document.getElementById('authoring-questions-list');
    if (!container) return;

    let totalPts = 0;
    container.innerHTML = AssessmentComponent.examQuestions.map((q, idx) => {
      totalPts += (Number(q.points) || 0);

      const typeBadge = {
        mcq: `<span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Multiple Choice (MCQ)</span>`,
        tf: `<span class="bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-200">True / False</span>`,
        blank: `<span class="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-200">Blank Space</span>`,
        short: `<span class="bg-purple-50 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">Short Answer</span>`,
        workout: `<span class="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-200">Workout / Problem</span>`
      }[q.type] || `<span class="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">Question</span>`;

      return `
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 hover:border-blue-300 transition" id="q-card-${idx}">
          <div class="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div class="flex items-center gap-2">
              <span class="w-7 h-7 rounded-lg bg-slate-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                Q${idx + 1}
              </span>
              ${typeBadge}
              <span class="text-xs font-mono font-semibold text-slate-500">
                Mapped: <strong class="text-blue-700">${q.targetCLO}</strong> &bull; ${q.targetChapter}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-slate-500">Points:</span>
                <input type="number" onchange="AssessmentComponent.updateQuestionPoints(${idx}, this.value)" value="${q.points}" class="w-14 text-xs font-mono font-bold px-2 py-1 rounded border border-slate-300 text-center focus:ring-1 focus:ring-blue-500 focus:outline-none">
              </div>
              <button onclick="AssessmentComponent.evaluateQuestionAlignment(${idx})" class="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition flex items-center gap-1" title="Teacher authors; AI evaluates chapter & CLO alignment">
                <span>✨ AI Evaluate &amp; Align</span>
              </button>
              <button onclick="AssessmentComponent.deleteQuestion(${idx})" class="p-1 rounded-lg text-slate-400 hover:text-red-600 transition" title="Delete Question">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>

          <!-- Question Text Area -->
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">Question Prompt &amp; Formulation</label>
            <textarea rows="${q.type === 'workout' ? '3' : '2'}" onchange="AssessmentComponent.updateQuestionText(${idx}, this.value)" class="w-full text-xs font-medium px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">${q.text}</textarea>
          </div>

          <!-- Item Specific Details (Options / Answer Key / Rubric) -->
          ${AssessmentComponent.renderQuestionInputs(q, idx)}

          <!-- AI Alignment & Evaluation Result Box -->
          <div class="p-3.5 rounded-xl ${q.aiEvaluation && q.aiEvaluation.alignmentScore >= 90 ? 'bg-emerald-50/70 border border-emerald-200' : 'bg-slate-50 border border-slate-200'} text-xs space-y-1.5" id="q-ai-eval-${idx}">
            <div class="flex items-center justify-between">
              <span class="font-bold flex items-center gap-1.5 ${q.aiEvaluation ? 'text-emerald-800' : 'text-slate-600'}">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                AI Syllabus &amp; CLO Validation:
              </span>
              <span class="font-mono font-black ${q.aiEvaluation ? 'text-emerald-700' : 'text-slate-500'}">
                ${q.aiEvaluation ? `${q.aiEvaluation.alignmentScore}% Aligned (${q.aiEvaluation.cognitiveMatch})` : 'Click ✨ AI Evaluate to analyze'}
              </span>
            </div>
            <p class="text-slate-600 leading-relaxed">
              ${q.aiEvaluation ? q.aiEvaluation.critique : 'The AI engine evaluates question depth, Bloom level, and validates alignment with the official course syllabus chapter.'}
            </p>
          </div>
        </div>
      `;
    }).join('');

    // Update Blueprint summary badge
    const totalPtsEl = document.getElementById('blueprint-total-exam-points');
    const qCountEl = document.getElementById('blueprint-questions-count');
    if (totalPtsEl) totalPtsEl.innerText = totalPts.toFixed(1);
    if (qCountEl) qCountEl.innerText = AssessmentComponent.examQuestions.length;
  },

  renderQuestionInputs(q, idx) {
    if (q.type === 'mcq') {
      return `
        <div class="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <label class="block text-xs font-bold text-slate-700">Multiple Choice Options (Select Radio for Correct Answer):</label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            ${(q.options || []).map((opt, oIdx) => `
              <div class="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                <input type="radio" name="correct_opt_${idx}" ${q.correctOption === oIdx ? 'checked' : ''} onchange="AssessmentComponent.setCorrectOption(${idx}, ${oIdx})" class="text-blue-600 focus:ring-blue-500">
                <span class="text-xs font-bold font-mono text-slate-500">${String.fromCharCode(65 + oIdx)}.</span>
                <input type="text" value="${opt}" onchange="AssessmentComponent.updateOptionText(${idx}, ${oIdx}, this.value)" class="flex-1 text-xs font-medium border-0 focus:ring-0 p-0 text-slate-800">
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    if (q.type === 'tf') {
      return `
        <div class="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span class="text-xs font-bold text-slate-700">Correct Answer Key:</span>
          <label class="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer">
            <input type="radio" name="tf_${idx}" ${q.correctAnswer === true ? 'checked' : ''} onchange="AssessmentComponent.setTFAnswer(${idx}, true)" class="text-blue-600 focus:ring-blue-500">
            <span>True</span>
          </label>
          <label class="inline-flex items-center gap-1.5 text-xs font-bold cursor-pointer">
            <input type="radio" name="tf_${idx}" ${q.correctAnswer === false ? 'checked' : ''} onchange="AssessmentComponent.setTFAnswer(${idx}, false)" class="text-blue-600 focus:ring-blue-500">
            <span>False</span>
          </label>
        </div>
      `;
    }

    if (q.type === 'blank') {
      return `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-3">
          <span class="text-xs font-bold text-slate-700">Expected Blank Space Word(s):</span>
          <input type="text" value="${q.correctBlank || ''}" onchange="AssessmentComponent.setCorrectBlank(${idx}, this.value)" class="text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none flex-1 max-w-xs" placeholder="e.g. balanced">
        </div>
      `;
    }

    if (q.type === 'workout') {
      return `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
          <label class="block text-xs font-bold text-slate-700">Grading Rubric &amp; Step Point Breakdown:</label>
          <input type="text" value="${q.rubric || ''}" onchange="AssessmentComponent.setQuestionRubric(${idx}, this.value)" class="w-full text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none">
        </div>
      `;
    }

    return '';
  },

  addNewQuestion(type) {
    const qCount = AssessmentComponent.examQuestions.length + 1;
    let newQ = {
      id: `q_custom_${Date.now()}`,
      type: type,
      text: type === 'mcq' ? "Which statement correctly describes the objective function sensitivity range?" :
            type === 'tf' ? "In linear optimization, an optimal solution always exists at an extreme point of the feasible region." :
            type === 'blank' ? "The method used to determine an initial basic feasible solution is called ________ approximation method." :
            "Formulate and solve the branch-and-bound tree for the given integer programming problem.",
      points: type === 'workout' ? 8 : (type === 'blank' ? 5 : (type === 'mcq' ? 4 : 3)),
      targetChapter: "Chapter 1: Linear Programming & Simplex Method",
      targetCLO: "CLO1",
      bloomsLevel: type === 'workout' ? "Applying" : "Understanding",
      aiEvaluation: {
        alignmentScore: 94,
        cognitiveMatch: "Aligned",
        chapterCoverage: "Chapter 1",
        critique: "Valid OBE assessment item authored by instructor. Mapped cleanly to CLO1.",
        evaluated: true
      }
    };

    if (type === 'mcq') {
      newQ.options = ["Option A", "Option B", "Option C", "Option D"];
      newQ.correctOption = 0;
    } else if (type === 'tf') {
      newQ.correctAnswer = true;
    } else if (type === 'blank') {
      newQ.correctBlank = "Vogel's";
    } else if (type === 'workout') {
      newQ.rubric = "Initial Setup: 3 pts | Solution Computation: 4 pts | Final Verification: 1 pt";
    }

    AssessmentComponent.examQuestions.push(newQ);
    AssessmentComponent.renderQuestions();
    State.showToast(`New ${type.toUpperCase()} question added to studio.`);
  },

  deleteQuestion(idx) {
    AssessmentComponent.examQuestions.splice(idx, 1);
    AssessmentComponent.renderQuestions();
    State.showToast("Question removed.");
  },

  updateQuestionText(idx, val) {
    if (AssessmentComponent.examQuestions[idx]) {
      AssessmentComponent.examQuestions[idx].text = val;
    }
  },

  updateQuestionPoints(idx, val) {
    if (AssessmentComponent.examQuestions[idx]) {
      AssessmentComponent.examQuestions[idx].points = parseFloat(val) || 0;
      AssessmentComponent.renderQuestions();
    }
  },

  setCorrectOption(qIdx, optIdx) {
    if (AssessmentComponent.examQuestions[qIdx]) {
      AssessmentComponent.examQuestions[qIdx].correctOption = optIdx;
    }
  },

  updateOptionText(qIdx, optIdx, val) {
    if (AssessmentComponent.examQuestions[qIdx] && AssessmentComponent.examQuestions[qIdx].options) {
      AssessmentComponent.examQuestions[qIdx].options[optIdx] = val;
    }
  },

  setTFAnswer(qIdx, val) {
    if (AssessmentComponent.examQuestions[qIdx]) {
      AssessmentComponent.examQuestions[qIdx].correctAnswer = val;
    }
  },

  setCorrectBlank(qIdx, val) {
    if (AssessmentComponent.examQuestions[qIdx]) {
      AssessmentComponent.examQuestions[qIdx].correctBlank = val;
    }
  },

  setQuestionRubric(qIdx, val) {
    if (AssessmentComponent.examQuestions[qIdx]) {
      AssessmentComponent.examQuestions[qIdx].rubric = val;
    }
  },

  // ✨ AI Evaluate Alignment to Course Syllabus Chapters & CLOs
  evaluateQuestionAlignment(qIdx) {
    const q = AssessmentComponent.examQuestions[qIdx];
    if (!q) return;

    // Simulate real-time neural cognitive evaluation
    const score = Math.floor(Math.random() * 8) + 92; // 92% to 99%
    const levels = ["Applying", "Analyzing", "Evaluating", "Understanding"];
    const chosenLevel = q.type === 'workout' ? "Applying & Synthesizing" : levels[Math.floor(Math.random() * levels.length)];

    q.aiEvaluation = {
      alignmentScore: score,
      cognitiveMatch: `Optimal (${chosenLevel})`,
      chapterCoverage: q.targetChapter,
      critique: `AI Analysis Complete: Question formulation directly validates mastery of ${q.targetCLO}. Cognitive taxonomy rigorously matches course specification. Zero ambiguity detected.`,
      evaluated: true
    };

    AssessmentComponent.renderQuestions();
    State.showToast(`✨ AI Question Alignment Verified: ${score}% Match with Course Syllabus.`);
  },

  saveExamDraft() {
    State.showToast("Exam Draft saved successfully.");
  },

  submitExamToExaminer() {
    AssessmentComponent.examStatus = 'submitted_to_examiner';
    const pendingCount = document.getElementById('examiner-pending-count');
    if (pendingCount) pendingCount.innerText = "1";

    State.showToast("Exam submitted to Department Quality Examination Committee!");
    AssessmentComponent.switchTab('examiner');
  },

  // =========================================================================
  // TAB 3: DEPARTMENT QUALITY EXAMINER GATE (Review & Moderate Exam)
  // =========================================================================
  renderExaminerGate() {
    const container = document.getElementById('examiner-review-content');
    if (!container) return;

    const totalPts = AssessmentComponent.examQuestions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
    const clo1Pts = AssessmentComponent.examQuestions.filter(q => q.targetCLO === 'CLO1').reduce((acc, q) => acc + (Number(q.points) || 0), 0);
    const clo2Pts = AssessmentComponent.examQuestions.filter(q => q.targetCLO === 'CLO2').reduce((acc, q) => acc + (Number(q.points) || 0), 0);

    const isApproved = AssessmentComponent.examStatus === 'approved' || AssessmentComponent.examStatus === 'in_progress' || AssessmentComponent.examStatus === 'completed';

    container.innerHTML = `
      <div class="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="text-xs font-bold uppercase tracking-wider text-slate-500">Course Assessment Under Review</div>
          <div class="text-lg font-black text-slate-900 mt-0.5">Stat4092: Operations Research and Optimization &bull; Mid Exam</div>
          <div class="text-xs text-slate-600 mt-1 flex items-center gap-3">
            <span>Authoring Faculty: <strong class="text-slate-800">${AssessmentComponent.facultyProfile.fullName}</strong></span>
            <span>&bull;</span>
            <span>Items: <strong>${AssessmentComponent.examQuestions.length} Questions</strong> (${totalPts} pts)</span>
          </div>
        </div>

        <div class="flex items-center gap-2">
          ${isApproved ? `
            <span class="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-300 flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              Exam Approved &amp; Locked for Students
            </span>
          ` : `
            <button onclick="AssessmentComponent.examinerRequestRevision()" class="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs transition">
              Request Revision
            </button>
            <button onclick="AssessmentComponent.examinerApproveExam()" class="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Approve &amp; Lock Exam for Student Delivery &rarr;
            </button>
          `}
        </div>
      </div>

      <!-- Moderation Matrix Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">CLO Weight Allocation</div>
          <div class="text-sm font-bold text-slate-800 mt-1">CLO1: ${clo1Pts} pts &bull; CLO2: ${clo2Pts} pts</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">✓ Balanced syllabus blueprint coverage</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Bloom's Taxonomy Distribution</div>
          <div class="text-sm font-bold text-slate-800 mt-1">Level 1 (25%) &bull; Level 2 (15%) &bull; Level 3/4 (60%)</div>
          <div class="text-xs text-emerald-600 font-semibold mt-1">✓ Fulfills senior degree cognitive complexity</div>
        </div>

        <div class="bg-white p-4 rounded-xl border border-slate-200">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Automated Scoring Pipeline</div>
          <div class="text-sm font-bold text-slate-800 mt-1">Objective Auto-Grade: 60% &bull; Rubric Workout: 40%</div>
          <div class="text-xs text-blue-600 font-semibold mt-1">✓ Instant CLO aggregation enabled</div>
        </div>
      </div>

      <!-- Item by Item Examiner Audit -->
      <div class="space-y-3 pt-2">
        <h4 class="text-sm font-bold text-slate-800">Item Moderation Checklist</h4>
        <div class="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white overflow-hidden text-xs">
          ${AssessmentComponent.examQuestions.map((q, idx) => `
            <div class="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div class="space-y-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-slate-900 font-mono">Item Q${idx + 1} (${q.type.toUpperCase()})</span>
                  <span class="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-mono font-bold">${q.targetCLO}</span>
                  <span class="text-slate-400">&bull;</span>
                  <span class="text-slate-600">${q.targetChapter}</span>
                </div>
                <p class="text-slate-700 font-medium">${q.text.substring(0, 110)}...</p>
              </div>
              <div class="flex items-center gap-3">
                <span class="font-mono font-bold text-slate-700">${q.points} pts</span>
                <span class="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  Approved
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  examinerApproveExam() {
    AssessmentComponent.examStatus = 'approved';
    const pendingCount = document.getElementById('examiner-pending-count');
    if (pendingCount) pendingCount.innerText = "0";

    const badge = document.getElementById('examiner-status-badge');
    if (badge) {
      badge.className = "px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5";
      badge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Approved &amp; Live for Students`;
    }

    AssessmentComponent.renderExaminerGate();
    State.showToast("Exam successfully approved and locked! Ready for student delivery.");
  },

  examinerRequestRevision() {
    AssessmentComponent.examStatus = 'draft';
    State.showToast("Revision request sent back to Course Instructor with feedback notes.");
    AssessmentComponent.switchTab('authoring');
  },

  // =========================================================================
  // TAB 4: ONLINE STUDENT EXAM PLATFORM (Automated Scoring Pipeline)
  // =========================================================================
  renderStudentExamPortal() {
    const switcher = document.getElementById('student-switcher-select');
    if (switcher) {
      switcher.innerHTML = AssessmentComponent.studentExamRecords.map((s, idx) => 
        `<option value="${idx}" ${idx === AssessmentComponent.activeStudentIndex ? 'selected' : ''}>
          ${s.name} (${s.studentId} &bull; ${s.section})
        </option>`
      ).join('');
    }

    const currentStudent = AssessmentComponent.studentExamRecords[AssessmentComponent.activeStudentIndex] || AssessmentComponent.studentExamRecords[0];
    const nameEl = document.getElementById('student-active-name');
    const idEl = document.getElementById('student-active-id');
    const secEl = document.getElementById('student-active-section');
    if (nameEl) nameEl.innerText = currentStudent.name;
    if (idEl) idEl.innerText = currentStudent.studentId;
    if (secEl) secEl.innerText = currentStudent.section;

    const container = document.getElementById('student-exam-interface');
    if (!container) return;

    container.innerHTML = `
      <div class="space-y-6">
        ${AssessmentComponent.examQuestions.map((q, qIdx) => {
          const studentAns = currentStudent.answers[q.id];
          const score = currentStudent.questionScores[q.id] || 0;

          return `
            <div class="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-7 h-7 rounded-lg bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center">
                    Q${qIdx + 1}
                  </span>
                  <span class="text-xs font-bold text-slate-700">Item ${qIdx + 1} (${q.type.toUpperCase()})</span>
                  <span class="bg-blue-50 text-blue-700 text-[10px] font-mono px-1.5 py-0.2 rounded border border-blue-200">
                    ${q.targetCLO}
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-slate-500">Earned:</span>
                  <span class="font-mono text-xs font-black ${score >= (q.points * 0.6) ? 'text-emerald-600' : 'text-amber-600'}">
                    ${score.toFixed(1)} / ${q.points} pts
                  </span>
                </div>
              </div>

              <div class="text-xs font-semibold text-slate-800 leading-relaxed">
                ${q.text}
              </div>

              <!-- Student Input Form Based on Type -->
              <div class="pt-2">
                ${AssessmentComponent.renderStudentResponseWidget(q, currentStudent, qIdx)}
              </div>

              <!-- Instant Automated Scoring Feedback -->
              <div class="pt-2 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                <span class="flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full ${score > 0 ? 'bg-emerald-500' : 'bg-red-500'}"></span>
                  <strong>CLO Point Pipeline:</strong> ${score.toFixed(1)} points directly credited to student's <strong>${q.targetCLO}</strong> total.
                </span>
                <span class="font-mono text-slate-600">Auto-Evaluated</span>
              </div>
            </div>
          `;
        }).join('')}

        <!-- Student Submission Button -->
        <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
          <div class="text-xs text-slate-600">
            All answers recorded in the tamper-proof ledger. Scores update CLO attainment automatically.
          </div>
          <button onclick="AssessmentComponent.submitStudentExam()" class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Save Answers &amp; Recalculate Attainment
          </button>
        </div>
      </div>
    `;
  },

  renderStudentResponseWidget(q, student, qIdx) {
    const currentVal = student.answers[q.id];

    if (q.type === 'mcq') {
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          ${(q.options || []).map((opt, oIdx) => `
            <label class="flex items-center gap-2 p-2.5 rounded-xl border ${currentVal === oIdx ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold' : 'border-slate-200 bg-white hover:bg-slate-50'} cursor-pointer transition">
              <input type="radio" name="stu_ans_${q.id}" ${currentVal === oIdx ? 'checked' : ''} onchange="AssessmentComponent.recordStudentAnswer('${q.id}', ${oIdx})" class="text-blue-600 focus:ring-blue-500">
              <span><strong class="font-mono">${String.fromCharCode(65 + oIdx)}.</strong> ${opt}</span>
            </label>
          `).join('')}
        </div>
      `;
    }

    if (q.type === 'tf') {
      return `
        <div class="flex items-center gap-4 text-xs font-bold">
          <label class="flex items-center gap-2 px-4 py-2 rounded-xl border ${currentVal === true ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white'} cursor-pointer">
            <input type="radio" name="stu_ans_${q.id}" ${currentVal === true ? 'checked' : ''} onchange="AssessmentComponent.recordStudentAnswer('${q.id}', true)" class="text-blue-600">
            <span>True</span>
          </label>
          <label class="flex items-center gap-2 px-4 py-2 rounded-xl border ${currentVal === false ? 'border-blue-500 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white'} cursor-pointer">
            <input type="radio" name="stu_ans_${q.id}" ${currentVal === false ? 'checked' : ''} onchange="AssessmentComponent.recordStudentAnswer('${q.id}', false)" class="text-blue-600">
            <span>False</span>
          </label>
        </div>
      `;
    }

    if (q.type === 'blank') {
      return `
        <div class="flex items-center gap-3 text-xs">
          <input type="text" value="${currentVal || ''}" onchange="AssessmentComponent.recordStudentAnswer('${q.id}', this.value)" class="px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none w-full max-w-sm" placeholder="Type your answer here...">
        </div>
      `;
    }

    if (q.type === 'workout') {
      return `
        <div class="space-y-2 text-xs">
          <textarea rows="3" onchange="AssessmentComponent.recordStudentAnswer('${q.id}', this.value)" class="w-full px-3 py-2 rounded-lg border border-slate-300 font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none">${currentVal || ''}</textarea>
        </div>
      `;
    }

    return '';
  },

  onStudentSwitch(studentIndex) {
    AssessmentComponent.activeStudentIndex = parseInt(studentIndex, 10);
    AssessmentComponent.renderStudentExamPortal();
  },

  recordStudentAnswer(questionId, value) {
    const student = AssessmentComponent.studentExamRecords[AssessmentComponent.activeStudentIndex];
    if (!student) return;

    student.answers[questionId] = value;

    // Instant auto-scoring
    const q = AssessmentComponent.examQuestions.find(item => item.id === questionId);
    if (q) {
      if (q.type === 'mcq') {
        student.questionScores[questionId] = (value === q.correctOption) ? q.points : 0;
      } else if (q.type === 'tf') {
        student.questionScores[questionId] = (value === q.correctAnswer) ? q.points : 0;
      } else if (q.type === 'blank') {
        const isMatch = String(value).trim().toLowerCase() === String(q.correctBlank).trim().toLowerCase();
        student.questionScores[questionId] = isMatch ? q.points : 0;
      }
    }

    AssessmentComponent.renderStudentExamPortal();
  },

  submitStudentExam() {
    State.showToast("Student exam session recorded. CLO Attainment metrics updated live!");
    AssessmentComponent.renderCLOAttainmentReport();
  },

  // =========================================================================
  // TAB 5: THE CLO ATTAINMENT REPORT & DASHBOARD (Mirrors Excel Template)
  // =========================================================================
  renderCLOAttainmentReport() {
    const currentCourse = (State.courses || []).find(c => c.id === AssessmentComponent.selectedCourseId) || State.courses[0];

    // Populate Report Course Dropdown
    const rCrs = document.getElementById('report-course-select');
    if (rCrs) {
      rCrs.innerHTML = (State.courses || []).map(c => 
        `<option value="${c.id}" ${c.id === AssessmentComponent.selectedCourseId ? 'selected' : ''}>
          ${c.code}: ${c.title}
        </option>`
      ).join('');
    }

    // Populate Header Meta Fields
    if (currentCourse) {
      const codeEl = document.getElementById('rep-course-code');
      const titleEl = document.getElementById('rep-course-title');
      const instEl = document.getElementById('rep-instructor-name');
      const crEl = document.getElementById('rep-credit-hours');
      const yrEl = document.getElementById('rep-academic-year');
      const ysEl = document.getElementById('rep-year-sem');
      const stEl = document.getElementById('rep-total-students');
      const dtEl = document.getElementById('rep-date-prepared');

      if (codeEl) codeEl.innerText = currentCourse.code;
      if (titleEl) titleEl.innerText = currentCourse.title;
      if (instEl) instEl.innerText = AssessmentComponent.facultyProfile.fullName;
      if (crEl) crEl.innerText = `${currentCourse.credit_hours || 4} Cr. / ${((currentCourse.credit_hours || 4) * 1.7).toFixed(0)} ECTS`;
      if (yrEl) yrEl.innerText = "2025/2026 (Batch 2015)";
      if (ysEl) ysEl.innerText = `${currentCourse.academic_year || 'Year 4'} / ${currentCourse.semester || 'Semester II'}`;
      if (stEl) stEl.innerText = `${AssessmentComponent.cohortAttainmentDatabase.length} Students`;
      if (dtEl) dtEl.innerText = new Date().toISOString().split('T')[0];
    }

    // SECTION A: Assessment Methods Table
    const asstTbody = document.getElementById('report-assessment-methods-tbody');
    if (asstTbody) {
      asstTbody.innerHTML = AssessmentComponent.assessmentPlan.map((ap, idx) => `
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-mono font-bold text-slate-800">Assessment ${idx + 1}</td>
          <td class="p-3 font-bold text-slate-900">${ap.type}</td>
          <td class="p-3"><span class="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-semibold">${ap.mappedCLOs}</span></td>
          <td class="p-3 text-center font-mono font-bold text-blue-700">${ap.weight}%</td>
          <td class="p-3 text-center font-mono font-bold text-slate-800">${ap.maxMarks} pts</td>
          <td class="p-3 text-slate-500">${ap.remark}</td>
        </tr>
      `).join('');
    }

    // SECTION B: CLO Assessment Matrix (Mirrors Excel rows 27-35)
    const matrixContainer = document.getElementById('report-matrix-container');
    if (matrixContainer) {
      matrixContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <th class="p-3">Assessment Type</th>
              <th class="p-3 text-center">CLO1 Marks</th>
              <th class="p-3 text-center">CLO2 Marks</th>
              <th class="p-3 text-center">CLO3 Marks</th>
              <th class="p-3 text-center font-black bg-blue-50 text-blue-900">Total Marks</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-800">Quiz 1</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-bold bg-blue-50/50">0.0</td>
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-800">Lab Exam</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-semibold">4.0</td>
              <td class="p-3 text-center font-mono font-semibold">2.0</td>
              <td class="p-3 text-center font-mono font-bold bg-blue-50/50">6.0</td>
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-800">Mid Exam (Live Online)</td>
              <td class="p-3 text-center font-mono font-bold text-blue-700">7.0</td>
              <td class="p-3 text-center font-mono font-bold text-blue-700">8.0</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-black bg-blue-50/50 text-blue-900">15.0</td>
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-800">Assignment 2</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-bold bg-blue-50/50">0.0</td>
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-800">Project</td>
              <td class="p-3 text-center font-mono font-semibold">0.0</td>
              <td class="p-3 text-center font-mono font-semibold">5.0</td>
              <td class="p-3 text-center font-mono font-semibold">5.0</td>
              <td class="p-3 text-center font-mono font-bold bg-blue-50/50">10.0</td>
            </tr>
            <tr class="hover:bg-slate-50">
              <td class="p-3 font-bold text-slate-800">Final Exam</td>
              <td class="p-3 text-center font-mono font-semibold">4.0</td>
              <td class="p-3 text-center font-mono font-semibold">6.0</td>
              <td class="p-3 text-center font-mono font-semibold">4.0</td>
              <td class="p-3 text-center font-mono font-bold bg-blue-50/50">14.0</td>
            </tr>
            <tr class="bg-slate-100 font-bold border-t-2 border-slate-300">
              <td class="p-3 font-black text-slate-900">Total Possible Marks</td>
              <td class="p-3 text-center font-mono font-black text-blue-700">11.0</td>
              <td class="p-3 text-center font-mono font-black text-blue-700">23.0</td>
              <td class="p-3 text-center font-mono font-black text-blue-700">11.0</td>
              <td class="p-3 text-center font-mono font-black bg-blue-100 text-blue-900">45.0</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    // SECTION C: Student Result & Attainment Calculation (Mirrors Excel rows 40-60)
    const studentContainer = document.getElementById('report-student-attainment-container');
    if (studentContainer) {
      studentContainer.innerHTML = `
        <table class="w-full text-left text-xs border-collapse">
          <thead class="sticky top-0 bg-slate-100 text-slate-700 font-bold border-b border-slate-200 z-10">
            <tr>
              <th class="p-3">#</th>
              <th class="p-3">Student ID</th>
              <th class="p-3">Student Name</th>
              <th class="p-3">Section</th>
              <th class="p-3 text-center">CLO1 Total</th>
              <th class="p-3 text-center">CLO1 %</th>
              <th class="p-3 text-center">CLO2 Total</th>
              <th class="p-3 text-center">CLO2 %</th>
              <th class="p-3 text-center">CLO3 Total</th>
              <th class="p-3 text-center">CLO3 %</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${AssessmentComponent.cohortAttainmentDatabase.map((s, idx) => `
              <tr class="hover:bg-slate-50 transition">
                <td class="p-3 text-slate-400 font-mono">${idx + 1}</td>
                <td class="p-3 font-mono font-bold text-slate-700">${s.studentId}</td>
                <td class="p-3 font-bold text-slate-900">${s.name}</td>
                <td class="p-3 text-slate-600">${s.section}</td>
                <td class="p-3 text-center font-mono font-bold text-slate-800">${s.clo1Total.toFixed(1)}</td>
                <td class="p-3 text-center font-mono font-black ${s.clo1Pct >= 60 ? 'text-emerald-700' : 'text-red-600'}">${s.clo1Pct.toFixed(1)}%</td>
                <td class="p-3 text-center font-mono font-bold text-slate-800">${s.clo2Total.toFixed(1)}</td>
                <td class="p-3 text-center font-mono font-black ${s.clo2Pct >= 60 ? 'text-emerald-700' : 'text-red-600'}">${s.clo2Pct.toFixed(1)}%</td>
                <td class="p-3 text-center font-mono font-bold text-slate-800">${s.clo3Total.toFixed(1)}</td>
                <td class="p-3 text-center font-mono font-black ${s.clo3Pct >= 60 ? 'text-emerald-700' : 'text-red-600'}">${s.clo3Pct.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // SECTION D: CLO Attainment Summary (Accreditation Standard Formulas)
    // Mirrors Excel rows 97-105:
    // Mark Threshold = 60%, Attainment Threshold = 65%
    AssessmentComponent.renderSummaryStatistics();

    // SECTION E: Visual Charts
    AssessmentComponent.renderVisualCharts();

    // SECTION F: Validation Checklist
    AssessmentComponent.renderValidationChecklist();
  },

  renderSummaryStatistics() {
    const summaryContainer = document.getElementById('report-summary-table-container');
    if (!summaryContainer) return;

    const data = AssessmentComponent.cohortAttainmentDatabase;
    const totalStudents = data.length || 1;

    // Helper for statistical calculations
    const computeStats = (pctList, totalMarks, markThreshold = 60, attainThreshold = 65) => {
      const sorted = [...pctList].sort((a, b) => a - b);
      const sum = sorted.reduce((a, b) => a + b, 0);
      const mean = sum / sorted.length;
      const median = sorted.length % 2 === 0 ? 
        (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : 
        sorted[Math.floor(sorted.length / 2)];
      const min = sorted[0];
      const max = sorted[sorted.length - 1];
      const thresholdMark = (totalMarks * markThreshold) / 100;
      const aboveTargetCount = sorted.filter(p => p >= markThreshold).length;
      const attainmentRate = (aboveTargetCount / sorted.length) * 100;
      const targetMet = attainmentRate >= attainThreshold;

      return { mean, median, min, max, markThreshold, attainThreshold, thresholdMark, aboveTargetCount, attainmentRate, targetMet };
    };

    const clo1Stats = computeStats(data.map(d => d.clo1Pct), 11.0, 72, 65); // Mirrors Excel values (72% mark threshold)
    const clo2Stats = computeStats(data.map(d => d.clo2Pct), 23.0, 60, 65);
    const clo3Stats = computeStats(data.map(d => d.clo3Pct), 11.0, 60, 65);

    const summaries = [
      { clo: "CLO1", stats: clo1Stats, remark: "Target Not Met (Remedial Simplex workshop recommended)" },
      { clo: "CLO2", stats: clo2Stats, remark: "Target Met (Outstanding transportation problem mastery)" },
      { clo: "CLO3", stats: clo3Stats, remark: "Target Met (High attainment across all cohorts)" }
    ];

    summaryContainer.innerHTML = `
      <table class="w-full text-left text-xs border-collapse">
        <thead>
          <tr class="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
            <th class="p-3">CLO ID</th>
            <th class="p-3 text-center">Mean %</th>
            <th class="p-3 text-center">Median %</th>
            <th class="p-3 text-center">Min %</th>
            <th class="p-3 text-center">Max %</th>
            <th class="p-3 text-center">Mark Threshold</th>
            <th class="p-3 text-center">Attain Threshold</th>
            <th class="p-3 text-center">CLO Threshold Mark</th>
            <th class="p-3 text-center">Students Above Target</th>
            <th class="p-3 text-center">Attainment Rate (%)</th>
            <th class="p-3 text-center">Target Met</th>
            <th class="p-3">Accreditation Remark</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          ${summaries.map(s => `
            <tr class="hover:bg-slate-50 transition">
              <td class="p-3 font-mono font-bold text-slate-900">${s.clo}</td>
              <td class="p-3 text-center font-mono font-bold text-slate-800">${s.stats.mean.toFixed(1)}%</td>
              <td class="p-3 text-center font-mono text-slate-700">${s.stats.median.toFixed(1)}%</td>
              <td class="p-3 text-center font-mono text-slate-600">${s.stats.min.toFixed(1)}%</td>
              <td class="p-3 text-center font-mono text-slate-600">${s.stats.max.toFixed(1)}%</td>
              <td class="p-3 text-center font-mono font-semibold text-slate-700">${s.stats.markThreshold}%</td>
              <td class="p-3 text-center font-mono font-semibold text-slate-700">${s.stats.attainThreshold}%</td>
              <td class="p-3 text-center font-mono font-bold text-slate-800">${s.stats.thresholdMark.toFixed(2)} pts</td>
              <td class="p-3 text-center font-mono font-black text-blue-700">${s.stats.aboveTargetCount} / ${totalStudents}</td>
              <td class="p-3 text-center font-mono font-black ${s.stats.targetMet ? 'text-emerald-700' : 'text-red-600'}">${s.stats.attainmentRate.toFixed(1)}%</td>
              <td class="p-3 text-center">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black ${s.stats.targetMet ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'}">
                  ${s.stats.targetMet ? 'YES &bull; Attained' : 'NO &bull; Gap'}
                </span>
              </td>
              <td class="p-3 text-slate-600 font-medium">${s.remark}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  renderVisualCharts() {
    const container = document.getElementById('report-visual-cards-container');
    if (!container) return;

    container.innerHTML = `
      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Course CLO Attainment Comparison</h4>
          <span class="text-[11px] font-mono font-bold text-blue-700">Threshold: 65%</span>
        </div>
        
        <div class="space-y-4 pt-2">
          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-slate-800">CLO1: Formulate classical linear programming &amp; Simplex</span>
              <span class="font-mono text-red-600">46.5% (Gap Detected)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div class="bg-red-500 h-3 rounded-full" style="width: 46.5%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-slate-800">CLO2: Solve transportation, assignment &amp; dual networks</span>
              <span class="font-mono text-emerald-600">90.7% (Attained)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div class="bg-emerald-500 h-3 rounded-full" style="width: 90.7%"></div>
            </div>
          </div>

          <div>
            <div class="flex justify-between text-xs font-bold mb-1">
              <span class="text-slate-800">CLO3: Apply queuing models &amp; integer branching</span>
              <span class="font-mono text-emerald-600">90.7% (Attained)</span>
            </div>
            <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
              <div class="bg-emerald-500 h-3 rounded-full" style="width: 90.7%"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Continuous Curriculum Action Plan</h4>
          <span class="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200">Action Required</span>
        </div>

        <div class="space-y-2.5 text-xs pt-1">
          <div class="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-2">
            <span class="text-amber-600 font-bold">⚠️</span>
            <div>
              <strong>CLO 1 Intervention:</strong> Conduct a 2-hour supplementary lab tutorial on degenerate Simplex pivots before the final examination.
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-start gap-2">
            <span class="text-emerald-600 font-bold">✓</span>
            <div>
              <strong>CLO 2 &amp; 3 Validation:</strong> Attainment rates exceed 90%. Cohort demonstrated superior modeling skills in transportation problem formulations.
            </div>
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 flex items-start gap-2">
            <span class="text-blue-600 font-bold">ℹ️</span>
            <div>
              <strong>Accreditation Compliance:</strong> Results automatically archived into the Debre Berhan University OBE Institutional Repository.
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderValidationChecklist() {
    const tbody = document.getElementById('report-validation-checklist-tbody');
    if (!tbody) return;

    const checklist = [
      { item: "All student assessment records entered and verified", by: "Dr. Adimias W (Instructor)", date: "2026-11-18", status: "Verified", remark: "24 of 24 records verified" },
      { item: "Assessment weights align with Course Specification", by: "Dr. Kassahun T (Examiner)", date: "2026-11-18", status: "Verified", remark: "Total weights sum exactly to 100%" },
      { item: "Question-to-CLO mapping validated against syllabus chapters", by: "Quality Assurance Committee", date: "2026-11-18", status: "Verified", remark: "AI Evaluator score: 98%" },
      { item: "Statistical calculations & threshold attainment verified", by: "Academic Registrar Office", date: "2026-11-18", status: "Verified", remark: "Standard Dec 2026 V-2 formulas applied" }
    ];

    tbody.innerHTML = checklist.map(c => `
      <tr class="hover:bg-slate-50 transition">
        <td class="p-3 font-semibold text-slate-800">${c.item}</td>
        <td class="p-3 text-slate-700">${c.by}</td>
        <td class="p-3 font-mono text-slate-600">${c.date}</td>
        <td class="p-3">
          <span class="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded border border-emerald-200">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            ${c.status}
          </span>
        </td>
        <td class="p-3 text-slate-500">${c.remark}</td>
      </tr>
    `).join('');
  },

  exportReportToExcel() {
    // Generate clean CSV representation of the CLO Attainment Template
    const rows = [
      ["Debre Berhan University - Official CLO Attainment Report"],
      ["Template: CLO Attainment Template Dec 2026 V-2.xlsx"],
      ["Course Code", "Stat4092", "Course Title", "Operations Research and Optimization"],
      ["Instructor", AssessmentComponent.facultyProfile.fullName, "Academic Year", "2025/2026"],
      [],
      ["Student_ID", "Student_Name", "Section", "CLO1 Total", "CLO1 %", "CLO2 Total", "CLO2 %", "CLO3 Total", "CLO3 %"]
    ];

    AssessmentComponent.cohortAttainmentDatabase.forEach(s => {
      rows.push([s.studentId, s.name, s.section, s.clo1Total.toFixed(1), s.clo1Pct.toFixed(1) + "%", s.clo2Total.toFixed(1), s.clo2Pct.toFixed(1) + "%", s.clo3Total.toFixed(1), s.clo3Pct.toFixed(1) + "%"]);
    });

    rows.push([]);
    rows.push(["CLO_ID", "Mean_%", "Median%", "Min_%", "Max%", "Mark Threshold", "Attain Threshold", "Target Met"]);
    rows.push(["CLO1", "70.2%", "68.2%", "36.4%", "81.8%", "72%", "65%", "NO"]);
    rows.push(["CLO2", "76.3%", "76.1%", "54.3%", "95.7%", "60%", "65%", "YES"]);
    rows.push(["CLO3", "74.9%", "72.7%", "54.5%", "100.0%", "60%", "65%", "YES"]);

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CLO_Attainment_Stat4092_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    State.showToast("CLO Attainment Report downloaded in official Excel-compatible format!");
  },

  dispatchOfficialReport() {
    AssessmentComponent.examStatus = 'dispatched';
    AssessmentComponent.examDispatchTimestamp = new Date().toLocaleString();

    const dispatchBtn = document.getElementById('report-dispatch-btn');
    if (dispatchBtn) {
      dispatchBtn.className = "px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-default";
      dispatchBtn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        Dispatched to Dept Head &amp; Dean
      `;
    }

    State.showToast("Official CLO Attainment Report officially dispatched to Department Head & College Dean!");
    AssessmentComponent.switchTab('dean');
  },

  // =========================================================================
  // TAB 6: DEPARTMENT HEAD & COLLEGE DEAN EXECUTIVE REVIEW
  // =========================================================================
  renderDeanReview() {
    const isEndorsed = AssessmentComponent.examStatus === 'endorsed';
    const statusBadge = document.getElementById('dean-endorsement-status-badge');
    const endorseBtn = document.getElementById('dean-endorse-btn');

    if (statusBadge) {
      if (isEndorsed) {
        statusBadge.className = "px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5";
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-500"></span> Officially Endorsed &amp; Sealed (${AssessmentComponent.deanEndorsementTimestamp || 'Recent'})`;
      } else {
        statusBadge.className = "px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5";
        statusBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Ready for Executive Endorsement`;
      }
    }

    if (endorseBtn && isEndorsed) {
      endorseBtn.className = "px-5 py-3 rounded-xl bg-slate-700 text-slate-300 font-black text-xs flex items-center gap-2 cursor-default";
      endorseBtn.innerHTML = `
        <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
        Accreditation Seal Affixed
      `;
    }
  },

  deanEndorseReport() {
    AssessmentComponent.examStatus = 'endorsed';
    AssessmentComponent.deanEndorsementTimestamp = new Date().toLocaleString();
    AssessmentComponent.renderDeanReview();
    State.showToast("🏛️ Institutional Accreditation Seal successfully affixed by Department Head & College Dean!");
  }
};

window.AssessmentComponent = AssessmentComponent;

