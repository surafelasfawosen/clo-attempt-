const fs = require('fs');
let code = fs.readFileSync('clo_system/static/js/teacher_portal.js', 'utf8');

// 1. Add RBAC properties to TeacherPortal object
const propTarget = '  isAuthenticated: true,\n  uploadedCertificateFile: null,';
const newProps = `  isAuthenticated: true,
  uploadedCertificateFile: null,
  activeRole: 'teacher',
  isForcedPasswordChange: false,

  userAccounts: {
    'DBU-FAC-2015': {
      id: 'DBU-FAC-2015',
      instId: 'inst_adimias_w',
      name: 'Dr. Adimias W (PhD)',
      role: 'teacher',
      roleLabel: 'Course Instructor',
      email: 'adimias.w@dbu.edu.et',
      password: '1234dbu',
      is_first_login: true,
      department: 'Department of Data Science',
      college: 'College of Computing & Technology'
    },
    'DBU-HEAD-DASC': {
      id: 'DBU-HEAD-DASC',
      instId: 'inst_yared_m',
      name: 'Prof. Yared M (PhD)',
      role: 'department_head',
      roleLabel: 'Department Head',
      email: 'head.datascience@dbu.edu.et',
      password: '1234dbu',
      is_first_login: true,
      department: 'Department of Data Science',
      college: 'College of Computing & Technology'
    },
    'DBU-DEAN-COMP': {
      id: 'DBU-DEAN-COMP',
      instId: 'inst_mengistu_a',
      name: 'Dr. Mengistu A (PhD)',
      role: 'dean',
      roleLabel: 'College Dean',
      email: 'dean.computing@dbu.edu.et',
      password: '1234dbu',
      is_first_login: true,
      department: 'College Executive',
      college: 'College of Computing & Technology'
    },
    'DBU-ADMIN-001': {
      id: 'DBU-ADMIN-001',
      instId: 'admin_qa',
      name: 'Academic VP / QA',
      role: 'super_admin',
      roleLabel: 'Super Admin',
      email: 'admin@dbu.edu.et',
      password: '1234dbu',
      is_first_login: true,
      department: 'Senate & Accreditation',
      college: 'Debre Berhan University'
    }
  },
  currentUser: null,

  examModeration: {
    status: 'draft',
    submittedAt: null,
    reviewedBy: null,
    reviewDate: null,
    feedbackNotes: 'Please add 1 more Analyzing level question for Chapter 2 Simplex method to test higher-order thinking.',
    targetAssessment: 'Mid Exam'
  },`;

if (!code.includes(propTarget)) {
  console.error('Could not find propTarget in teacher_portal.js');
  process.exit(1);
}
code = code.replace(propTarget, newProps);

// 2. In init(), load stored accounts and initialize role view
const initTarget = '    TeacherPortal.populateTeacherSwitcher();';
const newInit = `    // Initialize persistent user accounts
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('dbu_obe_accounts');
        if (stored) {
          const parsed = JSON.parse(stored);
          Object.assign(TeacherPortal.userAccounts, parsed);
        }
      }
    } catch (e) {}

    TeacherPortal.currentUser = TeacherPortal.userAccounts['DBU-FAC-2015'];
    TeacherPortal.populateTeacherSwitcher();
    TeacherPortal.updateExamModerationUI();`;

code = code.replace(initTarget, newInit);

// 3. Replace login methods with enterprise RBAC & password change
const oldLoginBlock = `  quickSelectLogin(instId) {
    const sel = document.getElementById('login-faculty-select');
    if (sel) sel.value = instId;
    const emailMap = {
      'inst_adimias_w': 'adimias.w@dbu.edu.et',
      'inst_yared_m': 'yared.m@dbu.edu.et',
      'inst_selamawit_t': 'selamawit.t@dbu.edu.et',
      'inst_almaz_g': 'almaz.g@dbu.edu.et',
      'inst_dawit_a': 'dawit.a@dbu.edu.et'
    };
    const emailInput = document.getElementById('login-email-input');
    if (emailInput) emailInput.value = emailMap[instId] || \`\${instId}@dbu.edu.et\`;
  },

  loginAs(instId) {
    const targetId = instId || document.getElementById('login-faculty-select')?.value || 'inst_adimias_w';
    TeacherPortal.activeTeacherId = targetId;
    TeacherPortal.loadTeacherData(targetId);
    TeacherPortal.closeCourse();
    TeacherPortal.hideLoginScreen();
    TeacherPortal.showToast(\`Welcome back, \${TeacherPortal.profile.fullName}! Authenticated via DBU SSO.\`);
  },

  logout() {
    TeacherPortal.showLoginScreen();
    TeacherPortal.showToast("Signed out of faculty session.");
  },`;

const newLoginBlock = `  quickSelectLogin(instId) {
    const sel = document.getElementById('login-faculty-select');
    if (sel) sel.value = instId;
    const emailMap = {
      'inst_adimias_w': 'DBU-FAC-2015',
      'inst_yared_m': 'DBU-HEAD-DASC',
      'inst_selamawit_t': 'DBU-FAC-2015',
      'inst_almaz_g': 'DBU-HEAD-DASC',
      'inst_dawit_a': 'DBU-DEAN-COMP'
    };
    const emailInput = document.getElementById('login-email-input');
    const pwdInput = document.getElementById('login-password-input');
    if (emailInput) emailInput.value = emailMap[instId] || 'DBU-FAC-2015';
    if (pwdInput) pwdInput.value = '1234dbu';
  },

  quickSelectAccount(accKey) {
    const acc = TeacherPortal.userAccounts[accKey];
    if (!acc) return;
    const emailInput = document.getElementById('login-email-input');
    const pwdInput = document.getElementById('login-password-input');
    if (emailInput) emailInput.value = acc.id;
    if (pwdInput) pwdInput.value = acc.password || '1234dbu';
    TeacherPortal.selectedLoginAccountKey = accKey;
  },

  loginAs(instId) {
    const emailInput = document.getElementById('login-email-input');
    const pwdInput = document.getElementById('login-password-input');
    const errEl = document.getElementById('login-error-msg');
    if (errEl) errEl.classList.add('hidden');

    const inputVal = (emailInput?.value || '').trim();
    const pwdVal = (pwdInput?.value || '').trim();

    // Match by ID, Email, or instId
    let acc = Object.values(TeacherPortal.userAccounts).find(a => 
      a.id.toLowerCase() === inputVal.toLowerCase() || 
      a.email.toLowerCase() === inputVal.toLowerCase() ||
      a.instId === instId
    );

    if (!acc) {
      acc = Object.values(TeacherPortal.userAccounts).find(a => a.instId === instId) || TeacherPortal.userAccounts['DBU-FAC-2015'];
    }

    // Check password if entered
    if (pwdVal && acc.password && pwdVal !== acc.password) {
      if (errEl) {
        errEl.innerText = "Invalid credentials. Default initial password is: 1234dbu";
        errEl.classList.remove('hidden');
      }
      return;
    }

    TeacherPortal.currentUser = acc;
    TeacherPortal.activeRole = acc.role;
    TeacherPortal.activeTeacherId = acc.instId || 'inst_adimias_w';
    TeacherPortal.loadTeacherData(TeacherPortal.activeTeacherId);
    TeacherPortal.closeCourse();
    TeacherPortal.hideLoginScreen();

    // Check if First-Time Login (Enforce mandatory password change)
    if (acc.is_first_login) {
      TeacherPortal.openPasswordModal(true);
    } else {
      TeacherPortal.switchToRoleView(acc.role);
      TeacherPortal.showToast(\`Welcome back, \${acc.name}! Logged in as \${acc.roleLabel}.\`);
    }
  },

  logout() {
    TeacherPortal.showLoginScreen();
    TeacherPortal.showToast("Signed out of university session.");
  },

  // =========================================================================
  // PASSWORD MANAGEMENT & FIRST-TIME LOGIN ENFORCEMENT
  // =========================================================================
  openPasswordModal(isForced = false) {
    const modal = document.getElementById('modal-change-password');
    const alertBox = document.getElementById('pwd-first-login-alert');
    const closeBtn = document.getElementById('pwd-modal-close-btn');
    const cancelBtn = document.getElementById('pwd-cancel-btn');
    const errEl = document.getElementById('pwd-error-msg');
    const curInput = document.getElementById('pwd-input-current');
    const newInput = document.getElementById('pwd-input-new');
    const confInput = document.getElementById('pwd-input-confirm');

    if (errEl) errEl.classList.add('hidden');
    if (newInput) newInput.value = '';
    if (confInput) confInput.value = '';

    const acc = TeacherPortal.currentUser || TeacherPortal.userAccounts['DBU-FAC-2015'];
    if (curInput) curInput.value = acc ? acc.password : '1234dbu';

    TeacherPortal.isForcedPasswordChange = isForced;
    if (isForced) {
      if (alertBox) alertBox.classList.remove('hidden');
      if (closeBtn) closeBtn.classList.add('hidden');
      if (cancelBtn) cancelBtn.classList.add('hidden');
    } else {
      if (alertBox) alertBox.classList.add('hidden');
      if (closeBtn) closeBtn.classList.remove('hidden');
      if (cancelBtn) cancelBtn.classList.remove('hidden');
    }

    if (modal) modal.classList.remove('hidden');
  },

  closePasswordModal() {
    if (TeacherPortal.isForcedPasswordChange) return;
    const modal = document.getElementById('modal-change-password');
    if (modal) modal.classList.add('hidden');
  },

  submitPasswordChange() {
    const curVal = document.getElementById('pwd-input-current')?.value;
    const newVal = document.getElementById('pwd-input-new')?.value;
    const confVal = document.getElementById('pwd-input-confirm')?.value;
    const errEl = document.getElementById('pwd-error-msg');

    const acc = TeacherPortal.currentUser || TeacherPortal.userAccounts['DBU-FAC-2015'];

    if (curVal !== acc.password) {
      if (errEl) {
        errEl.innerText = "Current password does not match.";
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (!newVal || newVal.length < 6) {
      if (errEl) {
        errEl.innerText = "New password must be at least 6 characters long.";
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (newVal === '1234dbu') {
      if (errEl) {
        errEl.innerText = "Please choose a personal password different from the initial default (1234dbu).";
        errEl.classList.remove('hidden');
      }
      return;
    }
    if (newVal !== confVal) {
      if (errEl) {
        errEl.innerText = "New passwords do not match. Please re-enter.";
        errEl.classList.remove('hidden');
      }
      return;
    }

    acc.password = newVal;
    acc.is_first_login = false;
    TeacherPortal.isForcedPasswordChange = false;

    // Persist in localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('dbu_obe_accounts', JSON.stringify(TeacherPortal.userAccounts));
      }
    } catch (e) {}

    const modal = document.getElementById('modal-change-password');
    if (modal) modal.classList.add('hidden');

    TeacherPortal.switchToRoleView(acc.role);
    TeacherPortal.showToast("✓ Password successfully updated and secured! Welcome to your DBU OBE workspace.");
  },

  // =========================================================================
  // ENTERPRISE ROLE-BASED ACCESS CONTROL (RBAC) NAVIGATION
  // =========================================================================
  onRoleAccountSwitch(accId) {
    const acc = TeacherPortal.userAccounts[accId];
    if (!acc) return;
    TeacherPortal.currentUser = acc;
    TeacherPortal.activeRole = acc.role;
    TeacherPortal.activeTeacherId = acc.instId || 'inst_adimias_w';
    TeacherPortal.loadTeacherData(TeacherPortal.activeTeacherId);
    TeacherPortal.closeCourse();
    TeacherPortal.switchToRoleView(acc.role);
    TeacherPortal.showToast(\`Switched account to: \${acc.name} (\${acc.roleLabel})\`);
  },

  switchToRoleView(role) {
    TeacherPortal.activeRole = role;

    const teacherHome = document.getElementById('teacher-course-selection-view');
    const teacherCourse = document.getElementById('teacher-course-workspace');
    const deptView = document.getElementById('depthead-dashboard-view');
    const deanView = document.getElementById('dean-dashboard-view');
    const rolePill = document.getElementById('header-active-role-pill');
    const accountSelect = document.getElementById('teacher-account-select');

    if (accountSelect && TeacherPortal.currentUser) {
      accountSelect.value = TeacherPortal.currentUser.id;
    }

    if (role === 'department_head') {
      if (deptView) deptView.classList.remove('hidden');
      if (deanView) deanView.classList.add('hidden');
      if (teacherHome) teacherHome.classList.add('hidden');
      if (teacherCourse) teacherCourse.classList.add('hidden');
      if (rolePill) {
        rolePill.innerText = 'Department Head';
        rolePill.className = 'hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200';
      }
    } else if (role === 'dean') {
      if (deanView) deanView.classList.remove('hidden');
      if (deptView) deptView.classList.add('hidden');
      if (teacherHome) teacherHome.classList.add('hidden');
      if (teacherCourse) teacherCourse.classList.add('hidden');
      if (rolePill) {
        rolePill.innerText = 'College Dean';
        rolePill.className = 'hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200';
      }
    } else if (role === 'super_admin') {
      if (deanView) deanView.classList.remove('hidden');
      if (deptView) deptView.classList.add('hidden');
      if (teacherHome) teacherHome.classList.add('hidden');
      if (teacherCourse) teacherCourse.classList.add('hidden');
      if (rolePill) {
        rolePill.innerText = 'Super Admin';
        rolePill.className = 'hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200';
      }
    } else {
      // Teacher role
      if (teacherHome) teacherHome.classList.remove('hidden');
      if (deptView) deptView.classList.add('hidden');
      if (deanView) deanView.classList.add('hidden');
      if (rolePill) {
        rolePill.innerText = 'Instructor';
        rolePill.className = 'hidden sm:inline-flex items-center px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200';
      }
    }

    TeacherPortal.updateExamModerationUI();
  },

  // =========================================================================
  // EXAM MODERATION & REVIEW PIPELINE (Send for Review & Send Back Loop)
  // =========================================================================
  submitExamForModeration() {
    TeacherPortal.examModeration.status = 'pending_review';
    TeacherPortal.examModeration.submittedAt = new Date().toLocaleDateString();
    TeacherPortal.updateExamModerationUI();
    TeacherPortal.showToast("✓ Exam paper submitted for Department Moderation Committee review.");
  },

  approveExamPaper() {
    TeacherPortal.examModeration.status = 'approved';
    TeacherPortal.examModeration.reviewedBy = 'Prof. Yared M (PhD)';
    TeacherPortal.examModeration.reviewDate = new Date().toLocaleDateString();
    TeacherPortal.updateExamModerationUI();
    TeacherPortal.showToast("✓ Exam officially APPROVED by Department Head. Certified for classroom testing.");
  },

  openExamRevisionModal() {
    const modal = document.getElementById('modal-exam-revision-feedback');
    const notesInput = document.getElementById('exam-revision-notes-input');
    if (notesInput) notesInput.value = TeacherPortal.examModeration.feedbackNotes || '';
    if (modal) modal.classList.remove('hidden');
  },

  closeExamRevisionModal() {
    const modal = document.getElementById('modal-exam-revision-feedback');
    if (modal) modal.classList.add('hidden');
  },

  confirmSendExamBack() {
    const notes = document.getElementById('exam-revision-notes-input')?.value;
    TeacherPortal.examModeration.status = 'revision_requested';
    TeacherPortal.examModeration.feedbackNotes = notes || 'Please balance cognitive question depth to align with course syllabus.';
    TeacherPortal.closeExamRevisionModal();
    TeacherPortal.updateExamModerationUI();
    TeacherPortal.showToast("Exam returned to instructor with department revision instructions.");
  },

  updateExamModerationUI() {
    const badge = document.getElementById('exam-moderation-badge');
    const desc = document.getElementById('exam-moderation-desc');
    const btnSubmit = document.getElementById('btn-submit-exam-moderation');
    const btnApprove = document.getElementById('btn-dept-approve-exam');
    const btnRevision = document.getElementById('btn-dept-request-revision');
    const deptCardStatus = document.getElementById('dept-exam-card-status');
    const deptPendingStat = document.getElementById('dept-stat-pending-exams');
    const deptRevisionLog = document.getElementById('dept-revision-log');

    const status = TeacherPortal.examModeration.status;
    const isDeptHead = TeacherPortal.activeRole === 'department_head';

    if (status === 'approved') {
      if (badge) {
        badge.innerText = '✓ Approved by Department Head';
        badge.className = 'font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-300';
      }
      if (desc) desc.innerText = \`Verified by \${TeacherPortal.examModeration.reviewedBy || 'Department Head'} • 100% Outcome Mapped & Certified for Classroom Assessment.\`;
      if (btnSubmit) btnSubmit.classList.add('hidden');
      if (btnApprove) btnApprove.classList.add('hidden');
      if (btnRevision) btnRevision.classList.add('hidden');
      if (deptCardStatus) {
        deptCardStatus.innerText = '✓ Approved (Certified)';
        deptCardStatus.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200';
      }
      if (deptPendingStat) deptPendingStat.innerText = '0 Pending Review';
    } else if (status === 'revision_requested') {
      if (badge) {
        badge.innerText = 'Revision Requested';
        badge.className = 'font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-amber-100 text-amber-900 border border-amber-300';
      }
      if (desc) desc.innerHTML = \`<span class="font-bold text-amber-800">Department Feedback:</span> \${TeacherPortal.examModeration.feedbackNotes}\`;
      if (btnSubmit) {
        btnSubmit.classList.remove('hidden');
        btnSubmit.innerHTML = \`<span>Edit &amp; Resubmit for Review &rarr;</span>\`;
      }
      if (btnApprove) btnApprove.classList.add('hidden');
      if (btnRevision) btnRevision.classList.add('hidden');
      if (deptCardStatus) {
        deptCardStatus.innerText = 'Revision Requested';
        deptCardStatus.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300';
      }
      if (deptPendingStat) deptPendingStat.innerText = '1 In Revision';
      if (deptRevisionLog) {
        deptRevisionLog.classList.remove('hidden');
        deptRevisionLog.innerHTML = \`<strong>Sent to Dr. Adimias:</strong> \${TeacherPortal.examModeration.feedbackNotes}\`;
      }
    } else if (status === 'pending_review') {
      if (badge) {
        badge.innerText = 'Pending Department Moderation';
        badge.className = 'font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 border border-blue-300 animate-pulse';
      }
      if (desc) desc.innerText = 'Submitted to Prof. Yared M (Dept Head) for syllabus alignment & cognitive depth vetting.';
      if (btnSubmit) btnSubmit.classList.add('hidden');

      if (isDeptHead) {
        if (btnApprove) btnApprove.classList.remove('hidden');
        if (btnRevision) btnRevision.classList.remove('hidden');
      } else {
        if (btnApprove) btnApprove.classList.add('hidden');
        if (btnRevision) btnRevision.classList.add('hidden');
      }
      if (deptCardStatus) {
        deptCardStatus.innerText = 'Pending Department Review';
        deptCardStatus.className = 'text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200';
      }
      if (deptPendingStat) deptPendingStat.innerText = '1 Pending Review';
    } else {
      // Draft
      if (badge) {
        badge.innerText = 'Draft (Not Submitted)';
        badge.className = 'font-mono font-bold px-2 py-0.5 rounded text-[10px] bg-slate-200 text-slate-800';
      }
      if (desc) desc.innerText = 'Author exam questions mapped to CLOs, then submit for official Department vetting.';
      if (btnSubmit) {
        btnSubmit.classList.remove('hidden');
        btnSubmit.innerHTML = \`<span>Submit for Department Review</span>\`;
      }
      if (btnApprove) btnApprove.classList.add('hidden');
      if (btnRevision) btnRevision.classList.add('hidden');
    }
  },

  dispatchToCollegeDean() {
    TeacherPortal.showToast("✓ Department Attainment Package vetted & forwarded to College Dean.");
  },

  exportCollegeAccreditationPDF() {
    TeacherPortal.showToast("✓ College Accreditation Dossier exported (HERQA / MoE Compliant).");
  },

  signAccreditationPackage() {
    TeacherPortal.showToast("✓ College Dean Digital Signature affixed. Certified for Higher Education Senate.");
  },`;

if (!code.includes(oldLoginBlock)) {
  console.error('Could not find oldLoginBlock in teacher_portal.js');
  process.exit(1);
}
code = code.replace(oldLoginBlock, newLoginBlock);

fs.writeFileSync('clo_system/static/js/teacher_portal.js', code);
console.log('Successfully added enterprise RBAC, password security & moderation to teacher_portal.js!');

