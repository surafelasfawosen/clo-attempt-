/**
 * colleges.js
 * Stage 1: Colleges Management Component
 */

const CollegesComponent = {
  render() {
    const container = document.getElementById('colleges-cards-grid');
    if (!container) return;

    if (!State.colleges || State.colleges.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200">
          <p class="text-slate-500 text-sm font-semibold">No colleges registered yet.</p>
          <button onclick="CollegesComponent.openAddModal()" class="mt-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition">
            + Register First College
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = State.colleges.map(col => {
      const depts = State.departments.filter(d => d.college_id === col.id);
      const isFreshman = col.id === 'col_freshman_dbu' || col.is_freshman_college === 1 || (col.name && col.name.toLowerCase().includes('freshman'));

      if (isFreshman) {
        return `
          <div class="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/40 p-6 rounded-2xl border-2 border-blue-400/80 shadow-md hover:border-blue-600 hover:shadow-lg transition cursor-pointer flex flex-col justify-between group relative overflow-hidden" onclick="CollegesComponent.selectCollege('${col.id}')">
            <div class="absolute top-0 right-0 bg-gradient-to-l from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-xs">
              Foundation Courses Studio
            </div>
            <div class="space-y-3 pt-1">
              <div class="flex justify-between items-start">
                <div class="h-12 w-12 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                  FS
                </div>
              </div>

              <div>
                <h4 class="font-extrabold text-slate-900 text-lg group-hover:text-blue-700 transition flex items-center gap-2">
                  ${col.name}
                </h4>
                <p class="text-xs font-semibold text-slate-500 mt-0.5">Dean: ${col.dean_name || 'Dr. Girma Abebe'}</p>
                <p class="text-xs text-slate-600 mt-2 font-medium leading-relaxed">
                  University foundation common courses for Year 1 (Semester I &amp; II). Direct curriculum and course syllabus management without departments.
                </p>
              </div>
            </div>

            <div class="pt-4 mt-4 border-t border-blue-200/60 flex justify-between items-center text-xs">
              <span class="bg-blue-100/80 text-blue-800 font-bold px-3 py-1 rounded-lg">Foundation &bull; No Departments</span>
              <span class="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 group-hover:bg-blue-700 transition shadow-xs">
                Explore Common Courses &rarr;
              </span>
            </div>
          </div>
        `;
      }

      return `
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group" onclick="CollegesComponent.selectCollege('${col.id}')">
          <div class="space-y-3">
            <div class="flex justify-between items-start">
              <div class="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-sm border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition">
                ${col.name.substring(0, 2).toUpperCase()}
              </div>
              <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                <button onclick="CollegesComponent.openEditModal('${col.id}')" class="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Edit College">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                </button>
                <button onclick="CollegesComponent.delete('${col.id}', '${col.name.replace(/'/g, "\\'")}')" class="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-slate-100 transition" title="Delete College">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                </button>
              </div>
            </div>

            <div>
              <h4 class="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition">${col.name}</h4>
              <p class="text-xs font-semibold text-slate-500 mt-0.5">Dean: ${col.dean_name || 'Academic Dean'}</p>
            </div>
          </div>

          <div class="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span class="bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">${depts.length} Departments</span>
            <span class="text-blue-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition">
              Explore &rarr;
            </span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectCollege(colId) {
    State.selectedCollege = State.colleges.find(c => c.id === colId);
    State.selectedDepartment = null;

    const isFreshman = State.selectedCollege && (
      State.selectedCollege.id === 'col_freshman_dbu' || 
      State.selectedCollege.is_freshman_college === 1 || 
      (State.selectedCollege.name && State.selectedCollege.name.toLowerCase().includes('freshman'))
    );

    if (isFreshman) {
      App.goToStage('freshman-hub');
    } else {
      App.goToStage('departments');
    }
  },

  openAddModal() {
    document.getElementById('college_modal_id').value = '';
    document.getElementById('college_modal_title').innerText = 'Add New College';
    document.getElementById('college_modal_name').value = '';
    document.getElementById('college_modal_dean').value = '';
    document.getElementById('college_modal_univ').value = 'Debre Berhan University';
    document.getElementById('collegeModal').classList.remove('hidden');
  },

  openEditModal(colId) {
    const col = State.colleges.find(c => c.id === colId);
    if (!col) return;
    document.getElementById('college_modal_id').value = col.id;
    document.getElementById('college_modal_title').innerText = 'Edit College';
    document.getElementById('college_modal_name').value = col.name;
    document.getElementById('college_modal_dean').value = col.dean_name || '';
    document.getElementById('college_modal_univ').value = col.university_name || 'Debre Berhan University';
    document.getElementById('collegeModal').classList.remove('hidden');
  },

  closeModal() {
    document.getElementById('collegeModal').classList.add('hidden');
  },

  async submitModal() {
    const colId = document.getElementById('college_modal_id').value;
    const name = document.getElementById('college_modal_name').value.trim();
    const dean = document.getElementById('college_modal_dean').value.trim();
    const univ = document.getElementById('college_modal_univ').value.trim();

    if (!name) {
      alert('Please enter College Name.');
      return;
    }

    const payload = { name, dean_name: dean, university_name: univ };

    try {
      if (colId) {
        await API.updateCollege(colId, payload);
        State.showToast('College updated successfully!');
      } else {
        await API.createCollege(payload);
        State.showToast('College created successfully!');
      }
      CollegesComponent.closeModal();
      await State.loadAllData();
      CollegesComponent.render();
    } catch (e) {
      alert('Save failed: ' + e.message);
    }
  },

  async delete(colId, name) {
    if (confirm(`Are you sure you want to delete college "${name}" and all associated departments?`)) {
      try {
        await API.deleteCollege(colId);
        State.showToast(`College "${name}" deleted.`);
        await State.loadAllData();
        CollegesComponent.render();
      } catch (e) {
        alert('Delete failed: ' + e.message);
      }
    }
  }
};

window.CollegesComponent = CollegesComponent;

