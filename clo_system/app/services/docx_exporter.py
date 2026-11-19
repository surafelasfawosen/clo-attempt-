"""
app/services/docx_exporter.py
Generates official Microsoft Word (.docx) syllabus documents
matching the exact structure, tables, and styling of SQC ad.docx for Debre Berhan University.
"""

import io
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    """Sets internal cell padding in dxa (1 pt = 20 dxa)."""
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_cell_background(cell, fill_hex):
    """Sets background color of a cell."""
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def generate_course_docx(course, department=None, college=None, db=None) -> io.BytesIO:
    doc = docx.Document()

    # Page setup - 0.75 in margins
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    univ_name = "DEBRE BERHAN UNIVERSITY"
    college_name = college.name.upper() if college else "COLLEGE OF COMPUTING"
    dept_name = department.name.upper() if department else "DEPARTMENT OF DATA SCIENCE"

    # Default styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(10)
    normal_style.font.color.rgb = RGBColor(30, 41, 59)

    # -------------------------------------------------------------
    # TABLE 1: Institutional Header & Course Specifications
    # (Matches Table 1 in SQC ad.docx)
    # -------------------------------------------------------------
    table1 = doc.add_table(rows=11, cols=2)
    table1.style = 'Table Grid'
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Row 0: Merged Institutional Title Banner
    cell_0_0 = table1.cell(0, 0)
    cell_0_1 = table1.cell(0, 1)
    cell_0_0.merge(cell_0_1)
    set_cell_background(cell_0_0, "F1F5F9")
    set_cell_margins(cell_0_0, top=140, bottom=140, left=160, right=160)
    p0 = cell_0_0.paragraphs[0]
    p0.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r0 = p0.add_run(f"{univ_name}\n{college_name}\n{dept_name}\nCourse Syllabus")
    r0.bold = True
    r0.font.size = Pt(11)
    r0.font.color.rgb = RGBColor(15, 23, 42)

    prog_name = getattr(course, 'program_name', None) or "B.Sc in Data Science"
    cat_name = getattr(course, 'course_category', None) or "Core"
    ind_hrs = getattr(course, 'independent_hours', None)
    ind_hrs_val = f"{ind_hrs if ind_hrs is not None else 30} Hours"
    asm_hrs = getattr(course, 'assessment_hours', None)
    asm_hrs_val = f"{asm_hrs if asm_hrs is not None else 15} Hours"
    total_hrs = str(getattr(course, 'total_notional_hours', None) or 120)
    coreq_val = getattr(course, 'corequisites', None) or "None"

    # Key metadata rows
    meta_rows = [
        ("Program", prog_name),
        ("Name of Course:", course.title),
        ("Course Code:", course.code),
        ("Year/Semester", f"{course.academic_year}, {course.semester}"),
        ("CP(ECTS)", f"{course.credit_hours}({course.credit_hours + 2})"),
        ("Study Hours:", f"{course.lecture_hours or 40} Hours (Lecture), {course.lab_hours or 20} Hours (Lab), {course.tutorial_hours or 15} Hours (Tutorial)"),
        ("Independent Hours", ind_hrs_val),
        ("Assessment hours", asm_hrs_val),
        ("Total Notional Hours", total_hrs),
        ("Category", cat_name)
    ]

    for idx, (label, val) in enumerate(meta_rows, start=1):
        c_left = table1.cell(idx, 0)
        c_right = table1.cell(idx, 1)
        c_left.width = Inches(2.3)
        c_right.width = Inches(4.7)
        set_cell_margins(c_left, top=80, bottom=80, left=120, right=120)
        set_cell_margins(c_right, top=80, bottom=80, left=120, right=120)
        
        pl = c_left.paragraphs[0]
        rl = pl.add_run(label)
        rl.bold = True
        rl.font.size = Pt(10)
        
        pr = c_right.paragraphs[0]
        rr = pr.add_run(str(val))
        rr.font.size = Pt(10)

    # Space
    doc.add_paragraph()

    # -------------------------------------------------------------
    # TABLE 2: Pre-requisite & Co-requisite (Matches Table 2 in SQC)
    # -------------------------------------------------------------
    table2 = doc.add_table(rows=2, cols=2)
    table2.style = 'Table Grid'
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER

    prereq_rows = [
        ("Pre-requisite", course.prerequisites or "Basic knowledge of calculus, linear algebra, python"),
        ("Co-requisite", coreq_val)
    ]
    for idx, (lbl, val) in enumerate(prereq_rows):
        cl = table2.cell(idx, 0)
        cr = table2.cell(idx, 1)
        cl.width = Inches(2.3)
        cr.width = Inches(4.7)
        set_cell_margins(cl, top=80, bottom=80, left=120, right=120)
        set_cell_margins(cr, top=80, bottom=80, left=120, right=120)

        pl = cl.paragraphs[0]
        rl = pl.add_run(lbl)
        rl.bold = True
        rl.font.size = Pt(10)

        pr = cr.paragraphs[0]
        rr = pr.add_run(val)
        rr.font.size = Pt(10)

    # Space
    doc.add_paragraph()

    # -------------------------------------------------------------
    # TABLE 3: Academic Staff & Course Description (Matches Table 3)
    # -------------------------------------------------------------
    table3 = doc.add_table(rows=2, cols=2)
    table3.style = 'Table Grid'
    table3.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Row 0: Staff
    c_s_lbl = table3.cell(0, 0)
    c_s_val = table3.cell(0, 1)
    c_s_lbl.width = Inches(2.3)
    c_s_val.width = Inches(4.7)
    set_cell_margins(c_s_lbl, top=80, bottom=80, left=120, right=120)
    set_cell_margins(c_s_val, top=80, bottom=80, left=120, right=120)
    p_staff_l = c_s_lbl.paragraphs[0]
    r_staff_l = p_staff_l.add_run("Name(s) of academic staff:")
    r_staff_l.bold = True
    r_staff_l.font.size = Pt(10)
    p_staff_v = c_s_val.paragraphs[0]
    r_staff_v = p_staff_v.add_run(course.instructor_name or "Adimias W(PhD)")
    r_staff_v.font.size = Pt(10)

    # Row 1: Course Description (Merged across columns)
    c_desc_0 = table3.cell(1, 0)
    c_desc_1 = table3.cell(1, 1)
    c_desc_0.merge(c_desc_1)
    set_cell_margins(c_desc_0, top=100, bottom=100, left=120, right=120)
    p_desc = c_desc_0.paragraphs[0]
    p_desc.paragraph_format.line_spacing = 1.15
    r_desc_lbl = p_desc.add_run("Course description:\n")
    r_desc_lbl.bold = True
    r_desc_lbl.font.size = Pt(10)
    r_desc_txt = p_desc.add_run(course.description or "This course provides a comprehensive introduction to Operations Research (OR) and optimization techniques within the context of Data Science. Students will learn how to formulate and solve complex decision-making problems, optimize processes, and apply mathematical models to real-world data-driven scenarios. The course covers: Linear programming (Algebraic and Simplex methods); Sensitivity analysis; Duality theory in linear programming; Transportation problem; Queuing Theory; Game Theory; Introduction to Classical Optimization Techniques.")
    r_desc_txt.font.size = Pt(10)

    # Space
    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION: Course Learning Outcomes (CLO)
    # (Matches exact text and headings in SQC ad.docx)
    # -------------------------------------------------------------
    p_clo_hdr = doc.add_paragraph()
    r_clo_hdr = p_clo_hdr.add_run("Course Learning Outcomes (CLO)")
    r_clo_hdr.bold = True
    r_clo_hdr.font.size = Pt(11)
    r_clo_hdr.font.color.rgb = RGBColor(15, 23, 42)

    p_clo_intro = doc.add_paragraph()
    r_clo_intro = p_clo_intro.add_run("At the end of the course, the students will be able to:")
    r_clo_intro.italic = True
    r_clo_intro.font.size = Pt(10)

    clos = course.clos or []
    for clo in clos:
        p_item = doc.add_paragraph()
        p_item.paragraph_format.left_indent = Inches(0.25)
        p_item.paragraph_format.line_spacing = 1.1
        r_code = p_item.add_run(f"{clo.code}: ")
        r_code.bold = True
        r_code.font.size = Pt(10)
        r_text = p_item.add_run(f"{clo.description}")
        r_text.font.size = Pt(10)

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION: Mapping CLO to PO and Assessment Method
    # (Matches Table 4 in SQC ad.docx)
    # -------------------------------------------------------------
    p_map_hdr = doc.add_paragraph()
    r_map_hdr = p_map_hdr.add_run("Mapping CLO to PO and Assessment Method")
    r_map_hdr.bold = True
    r_map_hdr.font.size = Pt(11)

    table4_header_p = p_map_hdr

    # Retrieve all PLOs dynamically from DB
    plos = []
    if db:
        from app.models.curriculum import PLO
        import re
        db_plos = db.query(PLO).all()
        def natural_sort_key(p):
            digits = re.findall(r'\d+', p.code)
            return int(digits[0]) if digits else 999
        plos = sorted(db_plos, key=natural_sort_key)

    if not plos:
        # Fallback to standard PLO1 to PLO6 if DB not supplied
        class DummyPLO:
            def __init__(self, id, code):
                self.id = id
                self.code = code
        plos = [DummyPLO(f"plo{i}", f"PLO{i}") for i in range(1, 7)]

    num_plos = len(plos)
    total_cols = 1 + num_plos + 1

    table4 = doc.add_table(rows=2 + len(clos), cols=total_cols)
    table4.style = 'Table Grid'
    table4.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Row 0 Header
    c_m_clo = table4.cell(0, 0)
    c_m_clo.paragraphs[0].add_run("CLO").bold = True
    c_m_plo_start = table4.cell(0, 1)
    c_m_plo_end = table4.cell(0, num_plos)
    c_m_plo_start.merge(c_m_plo_end)
    p_plo_hdr = c_m_plo_start.paragraphs[0]
    p_plo_hdr.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_plo_hdr.add_run("Program Learning Outcomes (PLO)").bold = True

    c_m_asm = table4.cell(0, total_cols - 1)
    c_m_asm.paragraphs[0].add_run("Assessment Methods").bold = True

    # Row 1 Subheaders
    table4.cell(1, 0).paragraphs[0].add_run("CLO").bold = True
    for pl_idx, p_item in enumerate(plos):
        c_sub = table4.cell(1, 1 + pl_idx)
        p_sub = c_sub.paragraphs[0]
        p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sub.add_run(p_item.code).bold = True
    table4.cell(1, total_cols - 1).paragraphs[0].add_run("").bold = True

    # Shading on headers
    for r_idx in (0, 1):
        for c_idx in range(total_cols):
            cell = table4.cell(r_idx, c_idx)
            set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=60, bottom=60, left=50, right=50)

    # Data Rows per CLO
    assessments = course.assessments or []
    import re
    def normalize_str(val):
        return re.sub(r'[^a-z0-9]', '', str(val or '').lower())

    for idx, clo in enumerate(clos):
        row_idx = 2 + idx
        c_code = table4.cell(row_idx, 0)
        c_code.paragraphs[0].add_run(clo.code).bold = True
        set_cell_margins(c_code, top=60, bottom=60, left=60, right=60)

        # PLO checkmarks from database mapping
        mapped_plos = [normalize_str(getattr(m, 'plo_id', m)) for m in (clo.plo_mappings or [])]
        def has_plo(p_obj):
            p_id = normalize_str(getattr(p_obj, 'id', p_obj))
            p_code = normalize_str(getattr(p_obj, 'code', p_obj))
            return any(p_id in m or p_code in m or m in p_id or m in p_code for m in mapped_plos)

        for pl_idx, p_item in enumerate(plos):
            c_plo = table4.cell(row_idx, 1 + pl_idx)
            set_cell_margins(c_plo, top=60, bottom=60, left=30, right=30)
            p = c_plo.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            if has_plo(p_item):
                p.add_run("✓")

        # Specific assessment methods text (SQC Table 4)
        asm_str = getattr(clo, 'assessment_methods', None)
        if not asm_str or not asm_str.strip():
            tested_asms = []
            for a in assessments:
                if a.clo_allocations:
                    if any(al.clo_id == clo.id for al in a.clo_allocations):
                        tested_asms.append(a.name)
                else:
                    tested_asms.append(a.name)
            if not tested_asms:
                tested_asms = ["Assignment", "Mid-Exam", "Final Exam"]
            asm_str = ", ".join(dict.fromkeys(tested_asms))

        c_asm = table4.cell(row_idx, total_cols - 1)
        set_cell_margins(c_asm, top=60, bottom=60, left=70, right=70)
        c_asm.paragraphs[0].add_run(asm_str.strip())

    # Strategy note
    p_strat = doc.add_paragraph()
    p_strat.paragraph_format.line_spacing = 1.15
    r_strat_lbl = p_strat.add_run("Teaching/Learning Strategy: ")
    r_strat_lbl.bold = True
    strat_text = getattr(course, 'teaching_strategy', None) or "The main teaching method will be Lecture, Problem-based learning (PBL), Lab sessions, individual and group assignments, and cooperative learning supported by tutorial sessions. The students will be expected to perform presentations and self-learning exercises on operations research."
    p_strat.add_run(strat_text)

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION: Course Content and CLO Mapping and Teaching Methods
    # (Matches Table 5 in SQC ad.docx)
    # -------------------------------------------------------------
    p_cnt_hdr = doc.add_paragraph()
    r_cnt_hdr = p_cnt_hdr.add_run("Course Content and CLO Mapping and Teaching Methods")
    r_cnt_hdr.bold = True
    r_cnt_hdr.font.size = Pt(11)

    chapters = course.chapters or []
    table5 = doc.add_table(rows=1 + len(chapters), cols=3)
    table5.style = 'Table Grid'
    table5.alignment = WD_TABLE_ALIGNMENT.CENTER

    # Header Row (Exact match to Table 5 in SQC ad.docx)
    h_col0 = table5.cell(0, 0)
    h_col1 = table5.cell(0, 1)
    h_col2 = table5.cell(0, 2)
    h_col0.width = Inches(4.3)
    h_col1.width = Inches(0.8)
    h_col2.width = Inches(1.9)

    h_col0.paragraphs[0].add_run("Course Content").bold = True
    h_col1.paragraphs[0].add_run("CLO").bold = True
    h_col1.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    h_col2.paragraphs[0].add_run("Teaching Methods").bold = True

    for c in (h_col0, h_col1, h_col2):
        set_cell_background(c, "F8FAFC")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)

    # Chapter Rows
    for idx, ch in enumerate(chapters):
        r_idx = 1 + idx
        c_content = table5.cell(r_idx, 0)
        c_clo = table5.cell(r_idx, 1)
        c_method = table5.cell(r_idx, 2)
        c_content.width = Inches(4.3)
        c_clo.width = Inches(0.8)
        c_method.width = Inches(1.9)

        for cell in (c_content, c_clo, c_method):
            set_cell_margins(cell, top=80, bottom=80, left=100, right=100)

        # Chapter Title and Content (Clean "Chapter X: Title")
        p_c = c_content.paragraphs[0]
        p_c.paragraph_format.line_spacing = 1.15

        ch_num = ch.chapter_number or (idx + 1)
        clean_title = ch.title or f"Chapter {ch_num}"
        if not clean_title.lower().startswith("chapter"):
            clean_title = f"Chapter {ch_num}: {clean_title}"

        r_ch_title = p_c.add_run(f"{clean_title}\n")
        r_ch_title.bold = True
        r_ch_title.font.size = Pt(10)

        r_ch_content = p_c.add_run(ch.content or "")
        r_ch_content.font.size = Pt(9.5)

        # CLO column
        p_clo = c_clo.paragraphs[0]
        p_clo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        clean_clo_code = (ch.mapped_clos or f"CLO{ch_num}").replace("CLO", "").strip()
        p_clo.add_run(clean_clo_code or str(ch_num)).bold = True

        # Teaching Methods column
        p_m = c_method.paragraphs[0]
        p_m.add_run(ch.teaching_methods or "Lecture, Tutorial").font.size = Pt(9.5)

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION: Assessment Summary
    # (Matches Table 6 in SQC ad.docx)
    # -------------------------------------------------------------
    p_asm_hdr = doc.add_paragraph()
    r_asm_hdr = p_asm_hdr.add_run("Assessment Summary")
    r_asm_hdr.bold = True
    r_asm_hdr.font.size = Pt(11)

    table6 = doc.add_table(rows=1 + len(assessments), cols=4)
    table6.style = 'Table Grid'
    table6.alignment = WD_TABLE_ALIGNMENT.CENTER

    headers6 = ["S. No", "Assessment Task", "Value/ Mark", "CLO"]
    col_widths6 = [Inches(0.8), Inches(3.2), Inches(1.4), Inches(1.6)]
    for c_idx, h_text in enumerate(headers6):
        c = table6.cell(0, c_idx)
        c.width = col_widths6[c_idx]
        set_cell_background(c, "F8FAFC")
        set_cell_margins(c, top=80, bottom=80, left=100, right=100)
        p = c.paragraphs[0]
        if c_idx in (0, 2, 3):
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.add_run(h_text).bold = True

    for idx, asm in enumerate(assessments):
        r_idx = 1 + idx
        c_sno = table6.cell(r_idx, 0)
        c_name = table6.cell(r_idx, 1)
        c_val = table6.cell(r_idx, 2)
        c_clos = table6.cell(r_idx, 3)

        for ci, cell in enumerate((c_sno, c_name, c_val, c_clos)):
            cell.width = col_widths6[ci]
            set_cell_margins(cell, top=70, bottom=70, left=100, right=100)

        # S. No
        p_sno = c_sno.paragraphs[0]
        p_sno.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sno.add_run(str(idx + 1))

        # Assessment Task
        c_name.paragraphs[0].add_run(asm.name).bold = True

        # Value/ Mark
        p_val = c_val.paragraphs[0]
        p_val.alignment = WD_ALIGN_PARAGRAPH.CENTER
        r_v = p_val.add_run(f"{asm.course_weight_pct:g}%")
        r_v.bold = True

        # Mapped CLOs
        p_cl = c_clos.paragraphs[0]
        p_cl.alignment = WD_ALIGN_PARAGRAPH.CENTER
        if asm.clo_allocations:
            clo_list = []
            for al in asm.clo_allocations:
                # Find matching CLO code
                matched = next((x for x in clos if x.id == al.clo_id), None)
                code_str = (matched.code if matched else al.clo_id).replace("CLO", "").strip()
                clo_list.append(code_str)
            p_cl.add_run(", ".join(clo_list) or "1, 2, 3")
        else:
            p_cl.add_run("1, 2, 3, 4")

    doc.add_paragraph()

    # -------------------------------------------------------------
    # SECTION: Text Books and Reference
    # (Matches Text Books and Reference in SQC ad.docx)
    # -------------------------------------------------------------
    p_ref_hdr = doc.add_paragraph()
    r_ref_hdr = p_ref_hdr.add_run("Text Books and Reference")
    r_ref_hdr.bold = True
    r_ref_hdr.font.size = Pt(11)

    p_tb_lbl = doc.add_paragraph()
    p_tb_lbl.add_run("Textbooks").bold = True
    tb_text = getattr(course, 'textbooks', None) or "Taha, H.A. (2006). Operations Research: An Introduction (8th edition). Prentice-Hall, India, New Delhi."
    for line in [l.strip() for l in tb_text.splitlines() if l.strip()]:
        p_tb = doc.add_paragraph()
        p_tb.paragraph_format.left_indent = Inches(0.2)
        p_tb.add_run(line)

    p_rf_lbl = doc.add_paragraph()
    p_rf_lbl.add_run("References").bold = True
    ref_text = getattr(course, 'reference_books', None)
    if ref_text and ref_text.strip():
        refs = [l.strip() for l in ref_text.splitlines() if l.strip()]
    else:
        refs = [
            "Carter, M.W. and Price, C.C. (2000). Operations Research: A Practical Introduction CRC.",
            "Ravindran, A., Phillips, D.T. and Solberg, J.J. (1987). Operations Research: Principles and Practice. (2nd edition). Wiley.",
            "ND Vohra, Quantitative Techniques in Management, Tata McGraw Hill, 4th Edition, 2011.",
            "J. K. Sharma, Operations Research Theory and Applications, Macmillan, 5th Edition, 2012.",
            "Hiller F.S, Liberman G.J, Introduction to Operations Research, 10th Edition McGraw Hill, 2017.",
            "Ravindran A., Philip D.T., and Solberg J.J., Operations Research, John Wiley, 2nd Edition 2007."
        ]
    for ref in refs:
        p_rf = doc.add_paragraph()
        p_rf.paragraph_format.left_indent = Inches(0.2)
        p_rf.add_run(ref)

    # Save to BytesIO stream
    output_stream = io.BytesIO()
    doc.save(output_stream)
    output_stream.seek(0)
    return output_stream

