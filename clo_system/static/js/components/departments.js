/**
 * departments.js
 * Stage 2: Departments Management Component
 */

const DepartmentsComponent = {
  render() {
    if (!State.selectedCollege) return;

    const heading = document.getElementById('dept-stage-heading');
    if (heading) heading.innerText = `${State.selectedCollege.name} Departments`;

    const sub = document.getElementById('dept-stage-subheading');
    if (sub) sub.innerText = `Select a department to view and design chronological curriculum programs.`;

    const container = document.getElementById('departments-cards-grid');
    if (!container) return;

    const deptList = State.departments.filter(d => d.college_id === State.selectedCollege.id);

    if (deptList.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p class="text-slate-500 text-sm font-semibold">No departments found in this college.</p>
          <button onclick="DepartmentsComponent.openAddModal()" class="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
            + Add Department
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = deptList.map(dept => {
      const courses = State.courses.filter(c => c.department_id === dept.id);
      return `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group" onclick="DepartmentsComponent.selectDepartment('${dept.id}')">
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <div class="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-extrabold text-sm border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition">
                ${dept.name.substring(0, 2).toUpperCase()}
              </div>
              <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                <button onclick="DepartmentsComponent.openEditModal('${dept.id}')" class="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Edit Department">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="DepartmentsComponent.delete('${dept.id}', '${dept.name.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Delete Department">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-extrabold text-slate-900 text-base group-hover:text-indigo-600 transition">${dept.name}</h4>
                ${dept.code ? `<span class="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">${dept.code}</span>` : ''}
              </div>
              <p class="text-xs font-semibold text-slate-500 mt-0.5">Head: ${dept.head_name || dept.head_of_department || 'Department Head'}</p>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span class="bg-indigo-50 text-indigo-700 font-bold px-2.5 py-1 rounded-lg">${courses.length} Courses Cataloged</span>
            <span class="text-indigo-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
              Open Curriculum &rarr;
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectDepartment(deptId) {
    State.selectedDepartment = State.departments.find(d => d.id === deptId);
    App.goToStage('courses');
  },

  openAddModal() {
    document.getElementById('dept_modal_id').value = '';
    document.getElementById('dept_modal_title').innerText = 'Add New Department';
    document.getElementById('dept_modal_name').value = '';
    const codeEl = document.getElementById('dept_modal_code');
    if (codeEl) codeEl.value = '';
    document.getElementById('dept_modal_head').value = '';
    document.getElementById('departmentModal').classList.remove('hidden');
  },

  openEditModal(deptId) {
    const dept = State.departments.find(d => d.id === deptId);
    if (!dept) return;
    document.getElementById('dept_modal_id').value = dept.id;
    document.getElementById('dept_modal_title').innerText = 'Edit Department';
    document.getElementById('dept_modal_name').value = dept.name;
    const codeEl = document.getElementById('dept_modal_code');
    if (codeEl) codeEl.value = dept.code || '';
    document.getElementById('dept_modal_head').value = dept.head_name || dept.head_of_department || '';
    document.getElementById('departmentModal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('departmentModal').classList.add('hidden');
  },

  async submitModal() {
    const deptId = document.getElementById('dept_modal_id').value;
    const name = document.getElementById('dept_modal_name').value.trim();
    const code = (document.getElementById('dept_modal_code')?.value || '').trim().toUpperCase();
    const head = document.getElementById('dept_modal_head').value.trim();

    if (!name) {
      alert('Please enter Department Name.');
      return;
    }

    const payload = {
      name,
      code: code || undefined,
      head_name: head || 'Department Head',
      head_of_department: head || 'Department Head',
      college_id: State.selectedCollege.id
    };

    try {
      if (deptId) {
        await API.updateDepartment(deptId, payload);
        State.showToast('Department updated successfully!');
      } else {
        await API.createDepartment(payload);
        State.showToast('Department created successfully!');
      }
      DepartmentsComponent.closeModal();
      await State.loadAllData();
      DepartmentsComponent.render();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  },

  async delete(deptId, name) {
    if (confirm(`Are you sure you want to delete department "${name}"?`)) {
      try {
        await API.deleteDepartment(deptId);
        State.showToast(`Department "${name}" deleted.`);
        await State.loadAllData();
        DepartmentsComponent.render();
      } catch (e) {
        alert('Delete failed: ' + e.message);
      }
    }
  }
};

