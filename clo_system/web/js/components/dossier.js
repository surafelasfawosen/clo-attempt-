/**
 * dossier.js
 * Official University Syllabus Dossier Component
 * Matches the exact styling, tables, and structure of SQC ad.docx for Debre Berhan University.
 * Strictly Chapter. Direct Download Word (.docx / .doc) & Print.
 */

const DossierComponent = {
  getAvailablePLOs() {
    const pList = (State.plos && State.plos.length > 0) ? [...State.plos] : [
      { id: 'plo1', code: 'PLO1', title: 'Computing & Mathematical Foundations' },
      { id: 'plo2', code: 'PLO2', title: 'Problem Analysis & Optimization' },
      { id: 'plo3', code: 'PLO3', title: 'Design & Implementation' },
      { id: 'plo4', code: 'PLO4', title: 'Modern Tool Usage & Modeling' },
      { id: 'plo5', code: 'PLO5', title: 'Communication & Teamwork' },
      { id: 'plo6', code: 'PLO6', title: 'Professional Ethics & Governance' }
    ];
    return pList.sort((a, b) => {
      const numA = parseInt((a.code || '').replace(/\D/g, '')) || 0;
      const numB = parseInt((b.code || '').replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  },

  render() {
    const doc = document.getElementById('printable-syllabus-document');
    const c = State.activeCourse;
    if (!doc || !c) return;

    const clos = c.clos || [];
    const chapters = c.chapters || [];
    const asms = c.assessments || [];
    const collegeName = (State.selectedCollege ? State.selectedCollege.name : 'College of Computing').toUpperCase();
    const deptName = (State.selectedDepartment ? State.selectedDepartment.name : 'Department of Data Science').toUpperCase();

    const programName = c.program_name || 'B.Sc in Data Science';
    const categoryName = c.course_category || 'Core';
    const independentHrs = (c.independent_hours !== undefined && c.independent_hours !== null) ? c.independent_hours : 30;
    const assessmentHrs = (c.assessment_hours !== undefined && c.assessment_hours !== null) ? c.assessment_hours : 15;
    const totalHrs = c.total_notional_hours || ((c.lecture_hours || 40) + (c.lab_hours || 20) + (c.tutorial_hours || 15) + independentHrs + assessmentHrs);
    const coreqs = c.corequisites || 'None';
    const teachingStrategy = c.teaching_strategy || 'The main teaching method will be Lecture, Problem-based learning (PBL), Lab sessions, individual and group assignments, and cooperative learning supported by tutorial sessions. The students will be expected to perform presentations and self-learning exercises on operations research.';

    const rawTb = (c.textbooks && c.textbooks.trim()) 
      ? c.textbooks.split('\n').map(t => t.trim()).filter(Boolean)
      : ['Taha, H.A. (2006). Operations Research: An Introduction (8th edition). Prentice-Hall, India, New Delhi.'];
    const tbHtml = rawTb.map(t => `<p class="pl-4 text-slate-800 leading-relaxed">${t}</p>`).join('');

    const defaultRefs = [
      "Carter, M.W. and Price, C.C. (2000). Operations Research: A Practical Introduction CRC.",
      "Ravindran, A., Phillips, D.T. and Solberg, J.J. (1987). Operations Research: Principles and Practice. (2nd edition). Wiley.",
      "ND Vohra, Quantitative Techniques in Management, Tata McGraw Hill, 4th Edition, 2011.",
      "J. K. Sharma, Operations Research Theory and Applications, Macmillan, 5th Edition, 2012.",
      "Hiller F.S, Liberman G.J, Introduction to Operations Research, 10th Edition McGraw Hill, 2017.",
      "Ravindran A., Philip D.T., and Solberg J.J., Operations Research, John Wiley, 2nd Edition 2007."
    ];
    const rawRefs = (c.reference_books && c.reference_books.trim()) 
      ? c.reference_books.split('\n').map(r => r.trim()).filter(Boolean)
      : defaultRefs;
    const refHtml = `<ul class="pl-8 list-disc space-y-0.5 text-slate-800">${rawRefs.map(r => `<li>${r}</li>`).join('')}</ul>`;

    // -----------------------------------------------------------------
    // TABLE 4: MAPPING CLO TO PLO & ASSESSMENT METHODS
    // -----------------------------------------------------------------
    const activePlos = DossierComponent.getAvailablePLOs();
    const normalizeStr = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

    const cloMappingRows = clos.map((clo, idx) => {
      // Find assessment instruments testing this CLO
      const testedAsms = [];
      asms.forEach(a => {
        if (a.clo_allocations && a.clo_allocations.length > 0) {
          if (a.clo_allocations.some(al => al.clo_id === clo.id)) {
            testedAsms.push(a.name);
          }
        } else {
          testedAsms.push(a.name);
        }
      });
      const asmString = (clo.assessment_methods && clo.assessment_methods.trim())
        ? clo.assessment_methods.trim()
        : ([...new Set(testedAsms)].join(', ') || 'Assignment, Mid-Exam, Final Exam');

      const mappedPlos = (clo.plo_mappings || []).map(m => normalizeStr(m.plo_id || m.code || m));
      const hasPlo = (target) => {
        const t = normalizeStr(target);
        return mappedPlos.some(p => p === t || p.includes(t) || t.includes(p));
      };

      const ploCells = activePlos.map(p => {
        const isChecked = hasPlo(p.id) || hasPlo(p.code);
        return `<td class="p-2 text-center border-r border-slate-400 text-sm font-bold text-slate-900">${isChecked ? '✓' : ''}</td>`;
      }).join('');

      return `
        <tr class="border border-slate-400">
          <td class="p-2 font-bold text-center border-r border-slate-400 font-mono text-sm">${clo.code}</td>
          ${ploCells}
          <td class="p-2 text-sm text-slate-800 font-medium leading-relaxed">${asmString}</td>
        </tr>
      `;
    }).join('');

    // -----------------------------------------------------------------
    // TABLE 5: COURSE CONTENT, CLO MAPPING & TEACHING METHODS
    // (Exact match to Table 5 in SQC ad.docx)
    // -----------------------------------------------------------------
    const chaptersRows = chapters.map((ch, idx) => {
      const chNum = ch.chapter_number || (idx + 1);
      let title = ch.title || `Chapter ${chNum}`;
      if (!title.toLowerCase().startsWith('chapter')) {
        title = `Chapter ${chNum}: ${title}`;
      }

      const rawTopics = (ch.content || '').split(/[;\n\r]+/).map(t => t.trim()).filter(Boolean);
      const formattedTopics = rawTopics.length > 1
        ? `<ul class="space-y-1 list-disc pl-4 text-slate-800 text-sm">${rawTopics.map(t => `<li class="leading-relaxed">${t}</li>`).join('')}</ul>`
        : `<p class="text-slate-800 text-sm leading-relaxed">${ch.content || ''}</p>`;

      const cleanClo = (ch.mapped_clos || `${chNum}`).replace(/CLO/i, '').trim() || `${chNum}`;

      return `
        <tr class="border border-slate-400 align-top">
          <td class="p-3 border-r border-slate-400">
            <div class="font-black text-slate-900 text-sm mb-1.5">${title}</div>
            <div class="text-slate-700 text-sm leading-relaxed">${formattedTopics}</div>
          </td>
          <td class="p-3 text-center border-r border-slate-400 font-bold text-slate-900 text-sm font-mono w-20">
            ${cleanClo}
          </td>
          <td class="p-3 text-slate-800 text-sm font-medium w-64 leading-relaxed">
            ${ch.teaching_methods || 'Lecture, Tutorial'}
          </td>
        </tr>
      `;
    }).join('');

    // -----------------------------------------------------------------
    // TABLE 6: ASSESSMENT SUMMARY
    // (Exact match to Table 6 in SQC ad.docx)
    // -----------------------------------------------------------------
    const asmsRows = asms.map((a, idx) => {
      let cloNums = '1, 2, 3, 4';
      if (a.clo_allocations && a.clo_allocations.length > 0) {
        const mappedCodes = a.clo_allocations.map(al => {
          const match = clos.find(x => x.id === al.clo_id);
          const rawCode = match ? match.code : al.clo_id;
          return rawCode.replace(/CLO/i, '').trim();
        });
        cloNums = [...new Set(mappedCodes)].join(', ') || `${idx + 1}`;
      } else if (idx === 0) {
        cloNums = '1, 2, 3, 4';
      } else if (idx === 1) {
        cloNums = '1, 5';
      } else if (idx === 2) {
        cloNums = '1, 2, 3';
      } else if (idx === 3) {
        cloNums = '2, 3, 4, 5, 6';
      }

      return `
        <tr class="border border-slate-400 text-sm">
          <td class="p-2.5 text-center border-r border-slate-400 font-bold">${idx + 1}</td>
          <td class="p-2.5 border-r border-slate-400 font-bold text-slate-900">${a.name}</td>
          <td class="p-2.5 text-center border-r border-slate-400 font-bold text-slate-900">${a.course_weight_pct}%</td>
          <td class="p-2.5 text-center font-bold text-slate-800 font-mono">${cloNums}</td>
        </tr>
      `;
    }).join('');

    // -----------------------------------------------------------------
    // ASSEMBLE FULL DOCUMENT (SQC AD.DOCX STRUCTURE)
    // -----------------------------------------------------------------
    doc.innerHTML = `
      <div class="space-y-6 text-slate-900 font-serif leading-normal">
        
        <!-- ========================================================= -->
        <!-- TABLE 1: INSTITUTIONAL HEADER & COURSE DETAILS            -->
        <!-- ========================================================= -->
        <table class="w-full border-collapse border border-slate-400 text-sm">
          <tbody>
            <!-- Banner -->
            <tr class="border-b border-slate-400 bg-slate-50">
              <td colspan="2" class="p-4 text-center">
                <div class="font-black text-base tracking-wider uppercase">DEBRE BERHAN UNIVERSITY</div>
                <div class="font-extrabold text-sm tracking-wide uppercase mt-0.5">${collegeName}</div>
                <div class="font-bold text-xs tracking-wide uppercase text-slate-700 mt-0.5">${deptName}</div>
                <div class="font-bold text-xs uppercase tracking-widest text-slate-600 mt-1">Course Syllabus</div>
              </td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 w-64 bg-slate-50/60">Program</td>
              <td class="p-2.5 font-semibold">${programName}</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Name of Course:</td>
              <td class="p-2.5 font-extrabold text-slate-900">${c.title}</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Course Code:</td>
              <td class="p-2.5 font-bold font-mono text-blue-800">${c.code}</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Year/Semester</td>
              <td class="p-2.5">${c.academic_year}, ${c.semester}</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">CP(ECTS)</td>
              <td class="p-2.5 font-mono font-bold">${c.credit_hours}(${c.credit_hours + 2})</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Study Hours:</td>
              <td class="p-2.5">${c.lecture_hours || 40} Hours (Lecture), ${c.lab_hours || 20} Hours (Lab), ${c.tutorial_hours || 15} Hours (Tutorial)</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Independent Hours</td>
              <td class="p-2.5">${independentHrs} Hours</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Assessment hours</td>
              <td class="p-2.5">${assessmentHrs} Hours</td>
            </tr>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Total Notional Hours</td>
              <td class="p-2.5 font-bold">${totalHrs}</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Category</td>
              <td class="p-2.5 font-bold">${categoryName}</td>
            </tr>
          </tbody>
        </table>

        <!-- ========================================================= -->
        <!-- TABLE 2: PRE-REQUISITE & CO-REQUISITE                     -->
        <!-- ========================================================= -->
        <table class="w-full border-collapse border border-slate-400 text-sm">
          <tbody>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 w-64 bg-slate-50/60">Pre-requisite</td>
              <td class="p-2.5 font-medium">${c.prerequisites || 'Basic knowledge of calculus, linear algebra, python'}</td>
            </tr>
            <tr>
              <td class="p-2.5 font-bold border-r border-slate-400 bg-slate-50/60">Co-requisite</td>
              <td class="p-2.5 text-slate-700">${coreqs}</td>
            </tr>
          </tbody>
        </table>

        <!-- ========================================================= -->
        <!-- TABLE 3: STAFF & COURSE DESCRIPTION                       -->
        <!-- ========================================================= -->
        <table class="w-full border-collapse border border-slate-400 text-sm">
          <tbody>
            <tr class="border-b border-slate-400">
              <td class="p-2.5 font-bold border-r border-slate-400 w-64 bg-slate-50/60">Name(s) of academic staff:</td>
              <td class="p-2.5 font-bold">${c.instructor_name || 'Adimias W(PhD)'}</td>
            </tr>
            <tr>
              <td colspan="2" class="p-3 leading-relaxed">
                <span class="font-bold block mb-1">Course description</span>
                <p class="text-slate-800 text-sm leading-relaxed text-justify">${c.description || 'This course provides a comprehensive introduction to Operations Research (OR) and optimization techniques within the context of Data Science. Students will learn how to formulate and solve complex decision-making problems, optimize processes, and apply mathematical models to real-world data-driven scenarios.'}</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- ========================================================= -->
        <!-- COURSE LEARNING OUTCOMES (CLO)                            -->
        <!-- ========================================================= -->
        <div class="space-y-2 pt-2">
          <h4 class="font-bold text-base text-slate-900">Course Learning Outcomes (CLO)</h4>
          <p class="text-sm italic text-slate-700">At the end of the course, the students will be able to:</p>
          <div class="space-y-1.5 pl-2 text-sm">
            ${clos.map(clo => `
              <div class="flex items-start gap-2">
                <span class="font-bold font-mono text-blue-900 whitespace-nowrap">${clo.code}:</span>
                <span class="text-slate-800">${clo.description}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- ========================================================= -->
        <!-- TABLE 4: MAPPING CLO TO PO AND ASSESSMENT METHOD          -->
        <!-- ========================================================= -->
        <div class="space-y-2 pt-2">
          <h4 class="font-bold text-base text-slate-900">Mapping CLO to PO and Assessment Method</h4>
          <table class="w-full border-collapse border border-slate-400 text-sm">
            <thead>
              <tr class="border-b border-slate-400 bg-slate-50">
                <th rowspan="2" class="p-2 border-r border-slate-400 font-bold text-center w-20">CLO</th>
                <th colspan="${activePlos.length}" class="p-2 border-r border-slate-400 font-bold text-center">Program Learning Outcomes (PLO)</th>
                <th rowspan="2" class="p-2 font-bold text-left">Assessment Methods</th>
              </tr>
              <tr class="border-b border-slate-400 bg-slate-50">
                ${activePlos.map(p => `<th class="p-1 border-r border-slate-400 font-bold text-center w-12 text-xs" title="${(p.title || p.code).replace(/"/g, '&quot;')}">${p.code}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${cloMappingRows}
            </tbody>
          </table>
          <p class="text-xs leading-relaxed text-slate-700 pt-1">
            <span class="font-bold">Teaching/Learning Strategy:</span> ${teachingStrategy}
          </p>
        </div>

        <!-- ========================================================= -->
        <!-- TABLE 5: COURSE CONTENT, CLO MAPPING & TEACHING METHODS   -->
        <!-- (EXACT MATCH TO SQC AD.DOCX TABLE 5)                      -->
        <!-- ========================================================= -->
        <div class="space-y-2 pt-2">
          <h4 class="font-bold text-base text-slate-900">Course Content and CLO Mapping and Teaching Methods</h4>
          <table class="w-full border-collapse border border-slate-400 text-sm">
            <thead>
              <tr class="border-b border-slate-400 bg-slate-50">
                <th class="p-2.5 border-r border-slate-400 font-bold text-left">Course Content</th>
                <th class="p-2.5 border-r border-slate-400 font-bold text-center w-20">CLO</th>
                <th class="p-2.5 font-bold text-left w-64">Teaching Methods</th>
              </tr>
            </thead>
            <tbody>
              ${chaptersRows}
            </tbody>
          </table>
        </div>

        <!-- ========================================================= -->
        <!-- TABLE 6: ASSESSMENT SUMMARY                               -->
        <!-- ========================================================= -->
        <div class="space-y-2 pt-2">
          <h4 class="font-bold text-base text-slate-900">Assessment Summary</h4>
          <table class="w-full border-collapse border border-slate-400 text-sm">
            <thead>
              <tr class="border-b border-slate-400 bg-slate-50">
                <th class="p-2 border-r border-slate-400 font-bold text-center w-16">S. No</th>
                <th class="p-2 border-r border-slate-400 font-bold text-left">Assessment Task</th>
                <th class="p-2 border-r border-slate-400 font-bold text-center w-28">Value/ Mark</th>
                <th class="p-2 font-bold text-center w-36">CLO</th>
              </tr>
            </thead>
            <tbody>
              ${asmsRows}
            </tbody>
          </table>
        </div>

        <!-- ========================================================= -->
        <!-- TEXT BOOKS AND REFERENCE                                  -->
        <!-- ========================================================= -->
        <div class="space-y-2 pt-2 border-t border-slate-300">
          <h4 class="font-bold text-base text-slate-900">Text Books and Reference</h4>
          <div class="text-sm space-y-1">
            <div class="font-bold text-slate-900">Textbooks</div>
            ${tbHtml}
          </div>
          <div class="text-sm space-y-1 pt-1">
            <div class="font-bold text-slate-900">References</div>
            ${refHtml}
          </div>
        </div>

      </div>
    `;
  },

  print() {
    DossierComponent.render();
    window.print();
  },

  async downloadDocx() {
    if (!State.activeCourse) return;
    const c = State.activeCourse;
    State.showToast("📄 Preparing Microsoft Word syllabus for download...");

    // 1. Attempt to fetch genuine binary .docx from backend API
    try {
      const downloadUrl = API.getDocxDownloadUrl(c.id);
      const res = await fetch(downloadUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = blobUrl;
        a.download = `${c.code}_Official_Syllabus.docx`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(blobUrl);
        }, 3000);
        State.showToast("✅ Microsoft Word (.docx) downloaded successfully!");
        return;
      }
    } catch (e) {
      console.warn("Backend .docx endpoint unreachable or blocked, using instant client-side Word generator...", e);
    }

    // 2. Client-side Word Document Generator Fallback (Guaranteed to download in all environments)
    DossierComponent.exportClientWordDocument(c);
  },

  exportClientWordDocument(c) {
    const clos = c.clos || [];
    const chapters = c.chapters || [];
    const asms = c.assessments || [];
    const collegeName = (State.selectedCollege ? State.selectedCollege.name : 'College of Computing').toUpperCase();
    const deptName = (State.selectedDepartment ? State.selectedDepartment.name : 'Department of Data Science').toUpperCase();

    const programName = c.program_name || 'B.Sc in Data Science';
    const categoryName = c.course_category || 'Core';
    const independentHrs = (c.independent_hours !== undefined && c.independent_hours !== null) ? c.independent_hours : 30;
    const assessmentHrs = (c.assessment_hours !== undefined && c.assessment_hours !== null) ? c.assessment_hours : 15;
    const totalHrs = c.total_notional_hours || ((c.lecture_hours || 40) + (c.lab_hours || 20) + (c.tutorial_hours || 15) + independentHrs + assessmentHrs);
    const coreqs = c.corequisites || 'None';
    const teachingStrategy = c.teaching_strategy || 'The main teaching method will be Lecture, Problem-based learning (PBL), Lab sessions, individual and group assignments, and cooperative learning supported by tutorial sessions. The students will be expected to perform presentations and self-learning exercises on operations research.';

    const rawTb = (c.textbooks && c.textbooks.trim()) 
      ? c.textbooks.split('\n').map(t => t.trim()).filter(Boolean)
      : ['Taha, H.A. (2006). Operations Research: An Introduction (8th edition). Prentice-Hall, India, New Delhi.'];
    const tbHtml = rawTb.map(t => `<p class="pl-4 text-slate-800 leading-relaxed">${t}</p>`).join('');

    const defaultRefs = [
      "Carter, M.W. and Price, C.C. (2000). Operations Research: A Practical Introduction CRC.",
      "Ravindran, A., Phillips, D.T. and Solberg, J.J. (1987). Operations Research: Principles and Practice. (2nd edition). Wiley.",
      "ND Vohra, Quantitative Techniques in Management, Tata McGraw Hill, 4th Edition, 2011.",
      "J. K. Sharma, Operations Research Theory and Applications, Macmillan, 5th Edition, 2012.",
      "Hiller F.S, Liberman G.J, Introduction to Operations Research, 10th Edition McGraw Hill, 2017.",
      "Ravindran A., Philip D.T., and Solberg J.J., Operations Research, John Wiley, 2nd Edition 2007."
    ];
    const rawRefs = (c.reference_books && c.reference_books.trim()) 
      ? c.reference_books.split('\n').map(r => r.trim()).filter(Boolean)
      : defaultRefs;
    const refHtml = `<ul class="pl-8 list-disc space-y-0.5 text-slate-800">${rawRefs.map(r => `<li>${r}</li>`).join('')}</ul>`;

    // Table 4 mapping rows
    const activePlosDoc = DossierComponent.getAvailablePLOs();
    const normalizeStrDoc = s => (s || '').toString().toLowerCase().replace(/[^a-z0-9]/g, '');

    const cloMapRows = clos.map((clo, idx) => {
      const testedAsms = [];
      asms.forEach(a => {
        if (a.clo_allocations && a.clo_allocations.length > 0) {
          if (a.clo_allocations.some(al => al.clo_id === clo.id)) testedAsms.push(a.name);
        } else {
          testedAsms.push(a.name);
        }
      });
      const asmStr = (clo.assessment_methods && clo.assessment_methods.trim())
        ? clo.assessment_methods.trim()
        : ([...new Set(testedAsms)].join(', ') || 'Assignment, Mid-Exam, Final Exam');

      const mappedPlos = (clo.plo_mappings || []).map(m => normalizeStrDoc(m.plo_id || m.code || m));
      const hasPlo = (target) => {
        const t = normalizeStrDoc(target);
        return mappedPlos.some(p => p === t || p.includes(t) || t.includes(p));
      };

      const ploCells = activePlosDoc.map(p => {
        const isChecked = hasPlo(p.id) || hasPlo(p.code);
        return `<td align="center">${isChecked ? '&#10003;' : ''}</td>`;
      }).join('');

      return `
        <tr>
          <td align="center" style="font-weight:bold;">${clo.code}</td>
          ${ploCells}
          <td>${asmStr}</td>
        </tr>
      `;
    }).join('');

    // Table 5 chapter rows
    const chapterRows = chapters.map((ch, idx) => {
      const num = ch.chapter_number || (idx + 1);
      let title = ch.title || `Chapter ${num}`;
      if (!title.toLowerCase().startsWith('chapter')) {
        title = `Chapter ${num}: ${title}`;
      }
      const rawTopics = (ch.content || '').split(/[;\n\r]+/).map(t => t.trim()).filter(Boolean);
      const topicsHtml = rawTopics.length > 1
        ? `<ul>${rawTopics.map(t => `<li>${t}</li>`).join('')}</ul>`
        : `<p>${ch.content || ''}</p>`;
      const cleanClo = (ch.mapped_clos || `${num}`).replace(/CLO/i, '').trim() || `${num}`;

      return `
        <tr>
          <td>
            <b>${title}</b>
            <div>${topicsHtml}</div>
          </td>
          <td align="center" style="font-weight:bold;">${cleanClo}</td>
          <td>${ch.teaching_methods || 'Lecture, Tutorial'}</td>
        </tr>
      `;
    }).join('');

    // Table 6 assessment rows
    const asmRows = asms.map((a, idx) => {
      let cloNums = '1, 2, 3, 4';
      if (a.clo_allocations && a.clo_allocations.length > 0) {
        const mappedCodes = a.clo_allocations.map(al => {
          const match = clos.find(x => x.id === al.clo_id);
          const rawCode = match ? match.code : al.clo_id;
          return rawCode.replace(/CLO/i, '').trim();
        });
        cloNums = [...new Set(mappedCodes)].join(', ') || `${idx + 1}`;
      } else if (idx === 0) cloNums = '1, 2, 3, 4';
      else if (idx === 1) cloNums = '1, 5';
      else if (idx === 2) cloNums = '1, 2, 3';
      else if (idx === 3) cloNums = '2, 3, 4, 5, 6';

      return `
        <tr>
          <td align="center">${idx + 1}</td>
          <td><b>${a.name}</b></td>
          <td align="center"><b>${a.course_weight_pct}%</b></td>
          <td align="center">${cloNums}</td>
        </tr>
      `;
    }).join('');

    const wordContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${c.code} Syllabus</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page { size: 8.5in 11.0in; margin: 0.75in; }
    body { font-family: 'Calibri', Arial, sans-serif; font-size: 10pt; color: #000000; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; }
    th, td { border: 1pt solid #000000; padding: 5pt 6pt; font-size: 9.5pt; vertical-align: top; }
    th { background-color: #f1f5f9; font-weight: bold; }
    .header-banner { text-align: center; font-weight: bold; background-color: #f8fafc; padding: 8pt; }
    h3, h4 { font-size: 11pt; font-weight: bold; margin-top: 12pt; margin-bottom: 4pt; }
    p { margin: 2pt 0; }
    ul { margin: 3pt 0 3pt 18pt; padding: 0; }
    li { margin-bottom: 2pt; }
  </style>
</head>
<body>
  <table>
    <tr>
      <td colspan="2" class="header-banner">
        <div style="font-size: 12pt; font-weight: bold;">DEBRE BERHAN UNIVERSITY</div>
        <div style="font-size: 11pt; font-weight: bold;">${collegeName}</div>
        <div style="font-size: 10pt; font-weight: bold;">${deptName}</div>
        <div style="font-size: 10.5pt; font-weight: bold; margin-top: 4pt;">Course Syllabus</div>
      </td>
    </tr>
    <tr><td width="30%"><b>Program</b></td><td>${programName}</td></tr>
    <tr><td><b>Name of Course:</b></td><td><b>${c.title}</b></td></tr>
    <tr><td><b>Course Code:</b></td><td><b>${c.code}</b></td></tr>
    <tr><td><b>Year/Semester</b></td><td>${c.academic_year}, ${c.semester}</td></tr>
    <tr><td><b>CP(ECTS)</b></td><td>${c.credit_hours}(${c.credit_hours + 2})</td></tr>
    <tr><td><b>Study Hours:</b></td><td>${c.lecture_hours || 40} Hours (Lecture), ${c.lab_hours || 20} Hours (Lab), ${c.tutorial_hours || 15} Hours (Tutorial)</td></tr>
    <tr><td><b>Independent Hours</b></td><td>${independentHrs} Hours</td></tr>
    <tr><td><b>Assessment hours</b></td><td>${assessmentHrs} Hours</td></tr>
    <tr><td><b>Total Notional Hours</b></td><td>${totalHrs}</td></tr>
    <tr><td><b>Category</b></td><td>${categoryName}</td></tr>
  </table>

  <table>
    <tr><td width="30%"><b>Pre-requisite</b></td><td>${c.prerequisites || 'Basic knowledge of calculus, linear algebra, python'}</td></tr>
    <tr><td><b>Co-requisite</b></td><td>${coreqs}</td></tr>
  </table>

  <table>
    <tr><td width="30%"><b>Name(s) of academic staff:</b></td><td><b>${c.instructor_name || 'Adimias W(PhD)'}</b></td></tr>
    <tr><td colspan="2"><b>Course description:</b><br>${c.description || 'This course provides a comprehensive introduction to Operations Research (OR) and optimization techniques within the context of Data Science.'}</td></tr>
  </table>

  <h4>Course Learning Outcomes (CLO)</h4>
  <p><i>At the end of the course, the students will be able to:</i></p>
  ${clos.map(clo => `<p><b>${clo.code}:</b> ${clo.description}</p>`).join('')}

  <h4>Mapping CLO to PO and Assessment Method</h4>
  <table>
    <tr bgcolor="#f8fafc">
      <th rowspan="2">CLO</th>
      <th colspan="${activePlosDoc.length}">Program Learning Outcomes (PLO)</th>
      <th rowspan="2">Assessment Methods</th>
    </tr>
    <tr bgcolor="#f8fafc">
      ${activePlosDoc.map(p => `<th>${p.code}</th>`).join('')}
    </tr>
    ${cloMapRows}
  </table>
  <p><b>Teaching/Learning Strategy:</b> ${teachingStrategy}</p>

  <h4>Course Content and CLO Mapping and Teaching Methods</h4>
  <table>
    <tr bgcolor="#f8fafc">
      <th width="60%">Course Content</th>
      <th width="12%">CLO</th>
      <th width="28%">Teaching Methods</th>
    </tr>
    ${chapterRows}
  </table>

  <h4>Assessment Summary</h4>
  <table>
    <tr bgcolor="#f8fafc">
      <th width="10%">S. No</th>
      <th width="50%">Assessment Task</th>
      <th width="20%">Value/ Mark</th>
      <th width="20%">CLO</th>
    </tr>
    ${asmRows}
  </table>

  <h4>Text Books and Reference</h4>
  <p><b>Textbooks</b></p>
  ${rawTb.map(t => `<p style="margin-left: 15pt;">${t}</p>`).join('')}
  <p><b>References</b></p>
  <ul>
    ${rawRefs.map(r => `<li>${r}</li>`).join('')}
  </ul>
</body>
</html>
    `;

    const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword;charset=utf-8' });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = `${c.code}_Official_Syllabus.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    }, 3000);
    State.showToast("✅ Microsoft Word syllabus downloaded successfully!");
  }
};
