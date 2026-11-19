const fs = require('fs');
let code = fs.readFileSync('clo_system/static/js/teacher_portal.js', 'utf8');

// 1. Load clean roster
const cleanRoster = JSON.parse(fs.readFileSync('scratch/clean_roster.json', 'utf8'));
const rosterStr = '  studentRoster: [\n' + cleanRoster.map(s => '    ' + JSON.stringify(s)).join(',\n') + '\n  ],';

// Replace studentRoster
const rosterRegex = /  studentRoster: \[[\s\S]*?\n  \],/;
if (!rosterRegex.test(code)) {
  console.error('Could not find studentRoster regex match');
  process.exit(1);
}
code = code.replace(rosterRegex, rosterStr);

// 2. Update calculateStudentTotals
const oldCalcStart = '  calculateStudentTotals(s) {';
const oldCalcEnd = '  onCellMarkChange(studentId, asst, cloIdx, val) {';

const newCalc = `  calculateStudentTotals(s) {
    if (!s.mid_clos) s.mid_clos = [0,0,0,0,0,0,0,0];
    if (!s.lab_clos) s.lab_clos = [0,0,0,0,0,0,0,0];
    if (!s.proj_clos) s.proj_clos = [0,0,0,0,0,0,0,0];
    if (!s.final_clos) s.final_clos = [0,0,0,0,0,0,0,0];

    // Mid Exam: Sum of mapped CLO 1 and CLO 2
    s.mid = Number(((Number(s.mid_clos[0]) || 0) + (Number(s.mid_clos[1]) || 0)).toFixed(1));

    // Lab Exam: Sum of mapped CLO 2, 3, 4, 5, 6
    s.lab = Number(((Number(s.lab_clos[1]) || 0) + (Number(s.lab_clos[2]) || 0) + (Number(s.lab_clos[3]) || 0) + (Number(s.lab_clos[4]) || 0) + (Number(s.lab_clos[5]) || 0)).toFixed(1));

    // Project: Sum of mapped CLO 2, 3, 4, 5, 6
    s.project = Number(((Number(s.proj_clos[1]) || 0) + (Number(s.proj_clos[2]) || 0) + (Number(s.proj_clos[3]) || 0) + (Number(s.proj_clos[4]) || 0) + (Number(s.proj_clos[5]) || 0)).toFixed(1));

    // Final Exam: Sum of mapped CLO 1, 2, 3, 4, 5, 6
    s.final = Number(((Number(s.final_clos[0]) || 0) + (Number(s.final_clos[1]) || 0) + (Number(s.final_clos[2]) || 0) + (Number(s.final_clos[3]) || 0) + (Number(s.final_clos[4]) || 0) + (Number(s.final_clos[5]) || 0)).toFixed(1));

    // Backward compatibility keys
    s.mid_c1 = s.mid_clos[0] || 0;
    s.mid_c2 = s.mid_clos[1] || 0;

    // Total Continuous Assessment (Mid 15% + Lab 15% + Project 30% = 60%)
    s.totalAssessment = Number((s.mid + s.lab + s.project).toFixed(1));

    // Overall Total Mark (Continuous Asst 60% + Final Exam 40% = 100%)
    s.totalMark = Number((s.totalAssessment + s.final).toFixed(1));

    s.grade = TeacherPortal.getGradeLetter(s.totalMark);
    s.status = s.totalMark >= 50 ? 'Passed' : 'At Risk';

    // Proportional CLO mapping aligned with Course Assessment Matrix (Dec 2026 Excel)
    // CLO1 (11 max) = Mid (CLO1) + Final (CLO1)
    // CLO2 (23 max) = Mid (CLO2) + Lab (CLO2) + Proj (CLO2) + Final (CLO2)
    // CLO3 (11 max) = Lab (CLO3) + Proj (CLO3) + Final (CLO3)
    s.c1 = Math.min(11.0, Number(((s.mid_clos[0] || 0) + (s.final_clos[0] || 0)).toFixed(1)));
    s.c2 = Math.min(23.0, Number(((s.mid_clos[1] || 0) + (s.lab_clos[1] || 0) + (s.proj_clos[1] || 0) + (s.final_clos[1] || 0)).toFixed(1)));
    s.c3 = Math.min(11.0, Number(((s.lab_clos[2] || 0) + (s.proj_clos[2] || 0) + (s.final_clos[2] || 0)).toFixed(1)));
  },

  `;

const idxStart = code.indexOf(oldCalcStart);
const idxEnd = code.indexOf(oldCalcEnd);
if (idxStart === -1 || idxEnd === -1) {
  console.error('Could not locate calculateStudentTotals block');
  process.exit(1);
}

code = code.slice(0, idxStart) + newCalc + code.slice(idxEnd);

// 3. Update mode === 'project' in renderResultsTable to remove CLO 7
code = code.replace(
  '<th class="p-3 text-center w-20 border-l border-blue-200">CLO 6 (%)</th>\n                <th class="p-3 text-center w-20 border-l border-blue-200">CLO 7 (%)</th>',
  '<th class="p-3 text-center w-20 border-l border-blue-200">CLO 6 (%)</th>'
);
code = code.replace(
  '<tr><td colspan="12" class="p-8 text-center text-slate-400 font-medium">No students found.</td></tr>',
  '<tr><td colspan="11" class="p-8 text-center text-slate-400 font-medium">No students found.</td></tr>'
);
code = code.replace(
  '${[1, 2, 3, 4, 5, 6].map(cIdx => `\n                      <td class="p-2 text-center bg-blue-50/30 border-l border-blue-100">\n                        <input type="number" step="0.5" min="0" max="30" value="${s.proj_clos[cIdx]}"',
  '${[1, 2, 3, 4, 5].map(cIdx => `\n                      <td class="p-2 text-center bg-blue-50/30 border-l border-blue-100">\n                        <input type="number" step="0.5" min="0" max="30" value="${s.proj_clos[cIdx]}"'
);

// 4. Update mode === 'final' in renderResultsTable to remove CLO 7 & 8
code = code.replace(
  '${[1, 2, 3, 4, 5, 6, 7, 8].map(cNum => `\n                  <th class="p-3 text-center w-20 border-l border-yellow-200">CLO ${cNum} (%)</th>\n                `).join(\'\')}',
  '${[1, 2, 3, 4, 5, 6].map(cNum => `\n                  <th class="p-3 text-center w-20 border-l border-yellow-200">CLO ${cNum} (%)</th>\n                `).join(\'\')}'
);
code = code.replace(
  '<tr><td colspan="14" class="p-8 text-center text-slate-400 font-medium">No students found.</td></tr>',
  '<tr><td colspan="12" class="p-8 text-center text-slate-400 font-medium">No students found.</td></tr>'
);
code = code.replace(
  '${[0, 1, 2, 3, 4, 5, 6, 7].map(cIdx => `\n                      <td class="p-2 text-center bg-yellow-50/30 border-l border-yellow-100">\n                        <input type="number" step="0.5" min="0" max="40" value="${s.final_clos[cIdx]}"',
  '${[0, 1, 2, 3, 4, 5].map(cIdx => `\n                      <td class="p-2 text-center bg-yellow-50/30 border-l border-yellow-100">\n                        <input type="number" step="0.5" min="0" max="40" value="${s.final_clos[cIdx]}"'
);

// 5. Update mode === 'full' in renderResultsTable to remove CLO 7
code = code.replace(
  '<!-- Project [30%] (CLO2..CLO7 only) -->\n              <th colspan="7" style="background-color: #BDD7EE;" class="p-2 border border-slate-300 text-slate-900 font-black tracking-wide text-xs">',
  '<!-- Project [30%] (CLO2..CLO6 only) -->\n              <th colspan="6" style="background-color: #BDD7EE;" class="p-2 border border-slate-300 text-slate-900 font-black tracking-wide text-xs">'
);
code = code.replace(
  '<!-- Final Exam [40%] (CLO1..CLO7 only) -->\n              <th colspan="8" style="background-color: #FFD966;" class="p-2 border border-slate-300 text-slate-900 font-black tracking-wide text-xs">',
  '<!-- Final Exam [40%] (CLO1..CLO6 only) -->\n              <th colspan="7" style="background-color: #FFD966;" class="p-2 border border-slate-300 text-slate-900 font-black tracking-wide text-xs">'
);
code = code.replace(
  '<th style="background-color: #BDD7EE;" class="p-1 border border-slate-300 min-w-[46px]">CLO 6(%)</th>\n              <th style="background-color: #BDD7EE;" class="p-1 border border-slate-300 min-w-[46px]">CLO 7(%)</th>',
  '<th style="background-color: #BDD7EE;" class="p-1 border border-slate-300 min-w-[46px]">CLO 6(%)</th>'
);
code = code.replace(
  '<th style="background-color: #FFD966;" class="p-1 border border-slate-300 min-w-[46px]">CLO 6(%)</th>\n              <th style="background-color: #FFD966;" class="p-1 border border-slate-300 min-w-[46px]">CLO 7(%)</th>',
  '<th style="background-color: #FFD966;" class="p-1 border border-slate-300 min-w-[46px]">CLO 6(%)</th>'
);
code = code.replace(
  '${[1, 2, 3, 4, 5, 6].map(cIdx => `\n                    <td class="p-0.5 border border-slate-200 bg-blue-50/15">\n                      <input type="number" step="0.5" min="0" max="30" value="${s.proj_clos[cIdx]}"',
  '${[1, 2, 3, 4, 5].map(cIdx => `\n                    <td class="p-0.5 border border-slate-200 bg-blue-50/15">\n                      <input type="number" step="0.5" min="0" max="30" value="${s.proj_clos[cIdx]}"'
);
code = code.replace(
  '${[0, 1, 2, 3, 4, 5, 6].map(cIdx => `\n                    <td class="p-0.5 border border-slate-200 bg-yellow-50/15">\n                      <input type="number" step="0.5" min="0" max="40" value="${s.final_clos[cIdx]}"',
  '${[0, 1, 2, 3, 4, 5].map(cIdx => `\n                    <td class="p-0.5 border border-slate-200 bg-yellow-50/15">\n                      <input type="number" step="0.5" min="0" max="40" value="${s.final_clos[cIdx]}"'
);

// 6. Update exportMarkSheetCSV
const oldCsvHeaders = `    const headers = [
      "Student ID", "Student Name", "Sex", "Section",
      "Mid CLO1(%)", "Mid CLO2(%)", "Mid CLO3(%)", "Mid CLO4(%)", "Mid CLO5(%)", "Mid CLO6(%)", "Mid CLO7(%)", "Mid CLO8(%)", "Mid Total [15%]",
      "Lab CLO1(%)", "Lab CLO2(%)", "Lab CLO3(%)", "Lab CLO4(%)", "Lab CLO5(%)", "Lab CLO6(%)", "Lab CLO7(%)", "Lab CLO8(%)", "Lab Total [15%]",
      "Proj CLO1(%)", "Proj CLO2(%)", "Proj CLO3(%)", "Proj CLO4(%)", "Proj CLO5(%)", "Proj CLO6(%)", "Proj CLO7(%)", "Proj CLO8(%)", "Project Total [30%]",
      "Final CLO1(%)", "Final CLO2(%)", "Final CLO3(%)", "Final CLO4(%)", "Final CLO5(%)", "Final CLO6(%)", "Final CLO7(%)", "Final CLO8(%)", "Final Total [40%]",
      "Total Assessment [60%]", "Total Mark [100%]", "Letter Grade", "Status"
    ];

    const rows = [headers];

    list.forEach(s => {
      const row = [
        s.id, \`"\${s.name}"\`, s.sex, s.section,
        ...(s.mid_clos || [0,0,0,0,0,0,0,0]), s.mid.toFixed(1),
        ...(s.lab_clos || [0,0,0,0,0,0,0,0]), s.lab.toFixed(1),
        ...(s.proj_clos || [0,0,0,0,0,0,0,0]), s.project.toFixed(1),
        ...(s.final_clos || [0,0,0,0,0,0,0,0]), s.final.toFixed(1),
        s.totalAssessment.toFixed(1), s.totalMark.toFixed(1), s.grade, s.status
      ];
      rows.push(row);
    });`;

const newCsvHeaders = `    const headers = [
      "Student ID", "Student Name", "Sex", "Section",
      "Mid CLO1(%)", "Mid CLO2(%)", "Mid Total [15%]",
      "Lab CLO2(%)", "Lab CLO3(%)", "Lab CLO4(%)", "Lab CLO5(%)", "Lab CLO6(%)", "Lab Total [15%]",
      "Proj CLO2(%)", "Proj CLO3(%)", "Proj CLO4(%)", "Proj CLO5(%)", "Proj CLO6(%)", "Project Total [30%]",
      "Final CLO1(%)", "Final CLO2(%)", "Final CLO3(%)", "Final CLO4(%)", "Final CLO5(%)", "Final CLO6(%)", "Final Total [40%]",
      "Total Assessment [60%]", "Total Mark [100%]", "Letter Grade", "Status"
    ];

    const rows = [headers];

    list.forEach(s => {
      const row = [
        s.id, \`"\${s.name}"\`, s.sex, s.section,
        s.mid_clos[0], s.mid_clos[1], s.mid.toFixed(1),
        s.lab_clos[1], s.lab_clos[2], s.lab_clos[3], s.lab_clos[4], s.lab_clos[5], s.lab.toFixed(1),
        s.proj_clos[1], s.proj_clos[2], s.proj_clos[3], s.proj_clos[4], s.proj_clos[5], s.project.toFixed(1),
        s.final_clos[0], s.final_clos[1], s.final_clos[2], s.final_clos[3], s.final_clos[4], s.final_clos[5], s.final.toFixed(1),
        s.totalAssessment.toFixed(1), s.totalMark.toFixed(1), s.grade, s.status
      ];
      rows.push(row);
    });`;

if (code.includes(oldCsvHeaders)) {
  code = code.replace(oldCsvHeaders, newCsvHeaders);
} else {
  console.warn('oldCsvHeaders exact match not found; skipping CSV rewrite');
}

fs.writeFileSync('clo_system/static/js/teacher_portal.js', code);
console.log('Successfully updated teacher_portal.js!');

