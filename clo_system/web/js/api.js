/**
 * api.js
 * Centralized REST API Client for Higher Education OBE Platform
 */

const API_BASE = (window.location.protocol === 'file:' || !window.location.port) 
  ? 'http://127.0.0.1:8000' 
  : '';

const API = {
  // --- Colleges ---
  async getColleges() {
    const res = await fetch(`${API_BASE}/api/v1/colleges`);
    if (!res.ok) throw new Error('Failed to fetch colleges');
    return await res.json();
  },

  async createCollege(payload) {
    const res = await fetch(`${API_BASE}/api/v1/colleges`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create college');
    return await res.json();
  },

  async updateCollege(id, payload) {
    const res = await fetch(`${API_BASE}/api/v1/colleges/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update college');
    return await res.json();
  },

  async deleteCollege(id) {
    const res = await fetch(`${API_BASE}/api/v1/colleges/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete college');
    return await res.json();
  },

  // --- Departments ---
  async getDepartments() {
    const res = await fetch(`${API_BASE}/api/v1/departments`);
    if (!res.ok) throw new Error('Failed to fetch departments');
    return await res.json();
  },

  async createDepartment(payload) {
    const res = await fetch(`${API_BASE}/api/v1/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create department');
    return await res.json();
  },

  async updateDepartment(id, payload) {
    const res = await fetch(`${API_BASE}/api/v1/departments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update department');
    return await res.json();
  },

  async deleteDepartment(id) {
    const res = await fetch(`${API_BASE}/api/v1/departments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete department');
    return await res.json();
  },

  // --- Courses ---
  async getCourses() {
    const res = await fetch(`${API_BASE}/api/v1/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses');
    return await res.json();
  },

  async getCourse(id) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch course ${id}`);
    return await res.json();
  },

  async createCourse(payload) {
    const res = await fetch(`${API_BASE}/api/v1/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create course');
    return await res.json();
  },

  async updateCourse(id, payload) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to update course ${id}`);
    return await res.json();
  },

  async deleteCourse(id) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`Failed to delete course ${id}`);
    return await res.json();
  },

  // --- Program Learning Outcomes (PLOs) ---
  async getPLOs(programId) {
    const url = programId ? `${API_BASE}/api/v1/plos?program_id=${programId}` : `${API_BASE}/api/v1/plos`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch PLOs');
    return await res.json();
  },

  async createPLO(payload) {
    const res = await fetch(`${API_BASE}/api/v1/plos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create PLO');
    }
    return await res.json();
  },

  async updatePLO(id, payload) {
    const res = await fetch(`${API_BASE}/api/v1/plos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update PLO');
    return await res.json();
  },

  async deletePLO(id) {
    const res = await fetch(`${API_BASE}/api/v1/plos/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete PLO');
    return await res.json();
  },

  // --- Staffing, Instructors & Student Batches ---
  async getInstructors(departmentId) {
    const url = departmentId ? `${API_BASE}/api/v1/instructors?department_id=${departmentId}` : `${API_BASE}/api/v1/instructors`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch instructors');
    return await res.json();
  },

  async matchCourseInstructors(courseId) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${courseId}/match-instructors`);
    if (!res.ok) throw new Error('Failed to fetch instructor match recommendations');
    return await res.json();
  },

  async assignCourseInstructor(courseId, instructorId) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${courseId}/assign-instructor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ instructor_id: instructorId })
    });
    if (!res.ok) throw new Error('Failed to assign instructor');
    return await res.json();
  },

  async getCourseRoster(courseId) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${courseId}/roster`);
    if (!res.ok) throw new Error('Failed to fetch course roster');
    return await res.json();
  },

  async getStudents(batch, section, departmentId) {
    let url = `${API_BASE}/api/v1/students?`;
    if (batch) url += `batch=${batch}&`;
    if (section) url += `section=${section}&`;
    if (departmentId) url += `department_id=${departmentId}&`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch students');
    return await res.json();
  },

  async enrollBatchToCourse(courseId, batch, section) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${courseId}/enroll-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ batch, section, academic_period: "2026/2027-S2" })
    });
    if (!res.ok) throw new Error('Failed to enroll batch to course');
    return await res.json();
  },

  async removeEnrollment(courseId, enrollmentId) {
    const res = await fetch(`${API_BASE}/api/v1/courses/${courseId}/enrollments/${enrollmentId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to remove student from course');
    return await res.json();
  },

  // --- Freshman & Placement Engine ---
  async getFreshmanCourses(semester) {
    const q = semester ? `?semester=${encodeURIComponent(semester)}` : '';
    const res = await fetch(`${API_BASE}/api/v1/freshman/courses${q}`);
    if (!res.ok) throw new Error('Failed to fetch freshman courses');
    return await res.json();
  },

  async createFreshmanCourse(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create freshman course');
    }
    return await res.json();
  },

  async parseRoster(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/parse-roster`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to parse roster');
    return await res.json();
  },

  async uploadRosterFile(file, batch = '2015', stream = 'Natural Science', maxCap = 40) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('batch', batch);
    formData.append('stream', stream);
    formData.append('max_students_per_section', maxCap);
    const res = await fetch(`${API_BASE}/api/v1/freshman/upload-roster`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload and parse roster file');
    return await res.json();
  },

  async saveBatch(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/save-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save batch');
    return await res.json();
  },

  async forwardToDepartment(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/forward-to-department`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to forward students to department');
    return await res.json();
  },

  async getFreshmanStudents(params = {}) {
    const sp = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/v1/freshman/students?${sp}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return await res.json();
  },

  async updateFreshmanStudent(id, payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update student');
    return await res.json();
  },

  async deleteFreshmanStudent(id) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/students/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete student');
    return await res.json();
  },

  async getPlacementQuotas(type) {
    const q = type ? `?target_type=${type}` : '';
    const res = await fetch(`${API_BASE}/api/v1/freshman/quotas${q}`);
    if (!res.ok) throw new Error('Failed to fetch quotas');
    return await res.json();
  },

  async updatePlacementQuota(id, payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/quotas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update quota');
    return await res.json();
  },

  async simulateCollegePlacement(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/simulate-college-placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to simulate college placement');
    return await res.json();
  },

  async executeCollegePlacement(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/execute-college-placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to execute college placement');
    return await res.json();
  },

  async simulateDepartmentPlacement(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/simulate-department-placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to simulate department placement');
    return await res.json();
  },

  async executeDepartmentPlacement(payload) {
    const res = await fetch(`${API_BASE}/api/v1/freshman/execute-department-placement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to execute department placement');
    return await res.json();
  },

  getDocxDownloadUrl(id) {
    const base = (window.location.protocol === 'file:' || !window.location.port) ? 'http://127.0.0.1:8000' : '';
    return `${base}/api/v1/courses/${id}/export/docx`;
  }
};

