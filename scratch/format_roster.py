import openpyxl, json

wb = openpyxl.load_workbook('CLO Attainment Template Dec 2026 V-2.xlsx', data_only=True)
ws = wb['Student Result']

names = [
    ('DBU150001', 'Aaron Tadesse', 'M', 'Section A'),
    ('DBU150002', 'Abinet Belay', 'M', 'Section A'),
    ('DBU150003', 'Almaz Hailu', 'F', 'Section A'),
    ('DBU150004', 'Aman Worku', 'M', 'Section A'),
    ('DBU150005', 'Aster Kebede', 'F', 'Section A'),
    ('DBU150006', 'Bekele Mengistu', 'M', 'Section A'),
    ('DBU150007', 'Bethelhem Alemu', 'F', 'Section A'),
    ('DBU150008', 'Biruk Lemma', 'M', 'Section A'),
    ('DBU150009', 'Chala Demissie', 'M', 'Section A'),
    ('DBU150010', 'Daniel Tesfaye', 'M', 'Section A'),
    ('DBU150011', 'Dawit Abebe', 'M', 'Section A'),
    ('DBU150012', 'Eleni Wolde', 'F', 'Section A'),
    ('DBU150013', 'Ermias Haile', 'M', 'Section B'),
    ('DBU150014', 'Fikirte Girma', 'F', 'Section B'),
    ('DBU150015', 'Girma Assefa', 'M', 'Section B'),
    ('DBU150016', 'Hanna Bekele', 'F', 'Section B'),
    ('DBU150017', 'Kalkidan Yonas', 'F', 'Section B'),
    ('DBU150018', 'Kassahun Tadesse', 'M', 'Section B'),
    ('DBU150019', 'Kidist Desta', 'F', 'Section B'),
    ('DBU150020', 'Marta Solomon', 'F', 'Section B'),
    ('DBU150021', 'Michael Kebede', 'M', 'Section B'),
    ('DBU150022', 'Rahel Alemu', 'F', 'Section B'),
    ('DBU150023', 'Solomon Kassa', 'M', 'Section B'),
    ('DBU150024', 'Tigist Haile', 'F', 'Section B'),
]

orig_clos = [
    (9.0, 19.5, 8.5), (6.5, 12.5, 9.5), (7.5, 19.5, 8.5), (8.5, 17.5, 8.0),
    (8.5, 15.1, 8.0), (8.5, 17.6, 7.5), (6.5, 13.0, 8.0), (8.0, 17.0, 8.0),
    (7.5, 20.5, 9.5), (6.5, 13.0, 9.0), (8.5, 19.0, 7.0), (6.5, 20.0, 8.5),
    (7.5, 14.0, 7.5), (8.5, 22.0, 8.5), (4.0, 12.6, 6.0), (8.5, 15.5, 8.5),
    (8.5, 20.0, 8.5), (7.5, 16.5, 9.5), (9.0, 17.5, 6.5), (6.0, 17.5, 9.5),
    (8.5, 17.5, 8.0), (8.5, 21.0, 11.0), (8.5, 18.1, 6.5), (8.0, 15.5, 8.0)
]

def get_grade(tm):
    if tm >= 90: return 'A+'
    if tm >= 85: return 'A'
    if tm >= 80: return 'A-'
    if tm >= 75: return 'B+'
    if tm >= 70: return 'B'
    if tm >= 65: return 'B-'
    if tm >= 60: return 'C+'
    if tm >= 50: return 'C'
    return 'F'

lines = []
for i, (sid, name, sex, sec) in enumerate(names):
    r = 8 + i
    mid_vals = [float(ws.cell(row=r, column=c).value or 0) for c in range(4, 12)]
    mid_tot = float(ws.cell(row=r, column=12).value or sum(mid_vals))
    lab_vals = [float(ws.cell(row=r, column=c).value or 0) for c in range(13, 21)]
    lab_tot = float(ws.cell(row=r, column=21).value or sum(lab_vals))
    proj_vals = [float(ws.cell(row=r, column=c).value or 0) for c in range(22, 30)]
    proj_tot = float(ws.cell(row=r, column=30).value or sum(proj_vals))
    final_vals = [float(ws.cell(row=r, column=c).value or 0) for c in range(31, 39)]
    final_tot = float(ws.cell(row=r, column=39).value or sum(final_vals))
    
    tot_asst = round(mid_tot + lab_tot + proj_tot, 1)
    tot_mark = round(tot_asst + final_tot, 1)
    grade = get_grade(tot_mark)
    c1, c2, c3 = orig_clos[i]
    
    line = f'    {{ id: "{sid}", name: "{name}", sex: "{sex}", section: "{sec}", stream: "Natural Science / DS", mid_c1: {mid_vals[0]}, mid_c2: {mid_vals[1]}, mid_clos: {json.dumps(mid_vals)}, mid: {mid_tot}, lab_clos: {json.dumps(lab_vals)}, lab: {lab_tot}, proj_clos: {json.dumps(proj_vals)}, project: {proj_tot}, final_clos: {json.dumps(final_vals)}, final: {final_tot}, totalAssessment: {tot_asst}, totalMark: {tot_mark}, grade: "{grade}", status: "Passed", c1: {c1}, c2: {c2}, c3: {c3} }}'
    lines.append(line)

with open('scratch/roster_js.txt', 'w', encoding='utf-8') as f:
    f.write(',\n'.join(lines))
print('Done!')

