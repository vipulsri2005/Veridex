from pathlib import Path
import json
import math
import sys

from PIL import Image, ImageDraw, ImageFont
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / 'assets'
DIAGRAMS = ASSETS / 'diagrams'
SCREENSHOTS = ASSETS / 'screenshots'
DOCX_PATH = ROOT / 'Insurance_Fraud_Detection_Project_Report.docx'
TOC_MAP = ROOT / 'toc_pages.json'

NAVY = '203955'
BLUE = '2F5D7E'
PALE = 'EAF0F5'
PALE2 = 'F4F7F9'
AMBER = 'B66A24'
GRAY = '5B6570'
DARK = '222B35'

TOC_ITEMS = [
    ('1', 'INTRODUCTION', ''), ('2', 'OBJECTIVES', ''),
    ('3', 'HARDWARE AND SOFTWARE REQUIREMENTS', ''),
    ('4', 'SYSTEM ARCHITECTURE AND WORKING', ''),
    ('5', 'FLOWCHART AND BLOCK DIAGRAM', ''),
    ('6', 'MODULE DESCRIPTION', ''), ('7', 'IMPLEMENTATION AND TECHNOLOGIES', ''),
    ('8', 'RESULTS AND OUTPUT', ''), ('9', 'ADVANTAGES AND LIMITATIONS', ''),
    ('10', 'FUTURE SCOPE', ''), ('11', 'CONCLUSION', ''), ('12', 'REFERENCES', ''),
]


def set_run_font(run, size=12, bold=None, color=DARK, italic=None, name='Times New Roman'):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn('w:ascii'), name)
    run._element.get_or_add_rPr().rFonts.set(qn('w:hAnsi'), name)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    return run


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn('w:shd'))
    if shd is None:
        shd = OxmlElement('w:shd')
        tc_pr.append(shd)
    shd.set(qn('w:fill'), fill)


def set_cell_margins(cell, top=90, start=100, bottom=90, end=100):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in('w:tcMar')
    if tc_mar is None:
        tc_mar = OxmlElement('w:tcMar')
        tc_pr.append(tc_mar)
    for m, v in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        node = tc_mar.find(qn(f'w:{m}'))
        if node is None:
            node = OxmlElement(f'w:{m}')
            tc_mar.append(node)
        node.set(qn('w:w'), str(v))
        node.set(qn('w:type'), 'dxa')


def repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement('w:tblHeader')
    tbl_header.set(qn('w:val'), 'true')
    tr_pr.append(tbl_header)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant = OxmlElement('w:cantSplit')
    tr_pr.append(cant)


def add_page_field(paragraph):
    run = paragraph.add_run()
    begin = OxmlElement('w:fldChar')
    begin.set(qn('w:fldCharType'), 'begin')
    instr = OxmlElement('w:instrText')
    instr.set(qn('xml:space'), 'preserve')
    instr.text = ' PAGE '
    separate = OxmlElement('w:fldChar')
    separate.set(qn('w:fldCharType'), 'separate')
    text = OxmlElement('w:t')
    text.text = '1'
    end = OxmlElement('w:fldChar')
    end.set(qn('w:fldCharType'), 'end')
    run._r.extend([begin, instr, separate, text, end])
    set_run_font(run, 9, color=GRAY)


def set_doc_styles(doc):
    sec = doc.sections[0]
    sec.page_width = Inches(8.27)
    sec.page_height = Inches(11.69)
    sec.top_margin = Inches(0.85)
    sec.bottom_margin = Inches(0.85)
    sec.left_margin = Inches(1.0)
    sec.right_margin = Inches(1.0)
    sec.different_first_page_header_footer = True
    styles = doc.styles
    normal = styles['Normal']
    normal.font.name = 'Times New Roman'
    normal._element.rPr.rFonts.set(qn('w:ascii'), 'Times New Roman')
    normal._element.rPr.rFonts.set(qn('w:hAnsi'), 'Times New Roman')
    normal.font.size = Pt(12)
    normal.font.color.rgb = RGBColor.from_string(DARK)
    normal.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    normal.paragraph_format.line_spacing = 1.5
    normal.paragraph_format.space_after = Pt(6)
    for style_name, size, color in [('Title', 22, NAVY), ('Heading 1', 16, NAVY), ('Heading 2', 14, BLUE), ('Heading 3', 12, BLUE)]:
        s = styles[style_name]
        s.font.name = 'Times New Roman'
        s._element.rPr.rFonts.set(qn('w:ascii'), 'Times New Roman')
        s._element.rPr.rFonts.set(qn('w:hAnsi'), 'Times New Roman')
        s.font.size = Pt(size)
        s.font.bold = True
        s.font.color.rgb = RGBColor.from_string(color)
        s.paragraph_format.space_before = Pt(12 if style_name != 'Title' else 0)
        s.paragraph_format.space_after = Pt(7)
        s.paragraph_format.keep_with_next = True
        if style_name != 'Title':
            s.paragraph_format.line_spacing = 1.15
    for nm in ['List Bullet', 'List Number']:
        s = styles[nm]
        s.font.name = 'Times New Roman'
        s.font.size = Pt(12)
        s.paragraph_format.line_spacing = 1.35
        s.paragraph_format.space_after = Pt(3)
    settings = doc.settings._element
    update = OxmlElement('w:updateFields')
    update.set(qn('w:val'), 'true')
    settings.append(update)


def add_header_footer(section, show=True):
    header = section.header
    footer = section.footer
    for p in header.paragraphs:
        p.clear()
    for p in footer.paragraphs:
        p.clear()
    if not show:
        return
    hp = header.paragraphs[0]
    hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    hp.paragraph_format.space_after = Pt(3)
    set_run_font(hp.add_run('INSURANCE FRAUD CLAIM DETECTION SYSTEM'), 8, color=GRAY)
    fp = footer.paragraphs[0]
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    fp.paragraph_format.space_before = Pt(3)
    set_run_font(fp.add_run('Manipal Academy of Higher Education  |  Page '), 9, color=GRAY)
    add_page_field(fp)


def add_text(doc, text, style=None, align=None, before=0, after=6, italic=False, bold_prefix=None):
    p = doc.add_paragraph(style=style)
    if align is not None:
        p.alignment = align
    p.paragraph_format.space_before = Pt(before)
    p.paragraph_format.space_after = Pt(after)
    if bold_prefix and text.startswith(bold_prefix):
        set_run_font(p.add_run(bold_prefix), 12, bold=True)
        set_run_font(p.add_run(text[len(bold_prefix):]), 12, italic=italic)
    else:
        set_run_font(p.add_run(text), 12, italic=italic)
    return p


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f'Heading {level}')
    p.add_run(text)
    return p


def add_bullets(doc, items, numbered=False):
    style = 'List Number' if numbered else 'List Bullet'
    for item in items:
        p = doc.add_paragraph(style=style)
        p.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.first_line_indent = Inches(-0.13)
        set_run_font(p.add_run(item), 11.5)


def add_table(doc, headers, rows, widths=None, font_size=9.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    if widths:
        for col, width in zip(table.columns, widths):
            col.width = Inches(width)
    header = table.rows[0]
    repeat_table_header(header)
    prevent_row_split(header)
    for i, label in enumerate(headers):
        cell = header.cells[i]
        if widths:
            cell.width = Inches(widths[i])
        set_cell_shading(cell, NAVY)
        set_cell_margins(cell)
        cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_after = Pt(0)
        set_run_font(p.add_run(label), font_size, bold=True, color='FFFFFF')
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        prevent_row_split(table.rows[-1])
        for i, value in enumerate(row):
            cell = cells[i]
            if widths:
                cell.width = Inches(widths[i])
            if ridx % 2 == 1:
                set_cell_shading(cell, PALE2)
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            p.paragraph_format.line_spacing = 1.08
            p.paragraph_format.space_after = Pt(0)
            set_run_font(p.add_run(str(value)), font_size, color=DARK)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.keep_with_next = True
    set_run_font(p.add_run(text), 10, bold=True, color=NAVY)
    return p


def add_code(doc, code, caption=None):
    if caption:
        p = doc.add_paragraph()
        p.paragraph_format.keep_with_next = True
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(3)
        set_run_font(p.add_run(caption), 10, bold=True, color=BLUE)
    for line in code.strip('\n').splitlines():
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.18)
        p.paragraph_format.right_indent = Inches(0.18)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.05
        p.paragraph_format.keep_together = True
        pPr = p._p.get_or_add_pPr()
        shd = OxmlElement('w:shd')
        shd.set(qn('w:fill'), 'F1F4F6')
        pPr.append(shd)
        set_run_font(p.add_run(line or ' '), 9, color='304050', name='Consolas')


def add_figure(doc, image_path, caption, explanation, width=6.25):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.keep_together = True
    p.add_run().add_picture(str(image_path), width=Inches(width))
    add_caption(doc, caption)
    add_text(doc, explanation, after=8)


def page_break(doc):
    doc.add_page_break()


def add_cover(doc):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(4)
    p.add_run().add_picture(str(ASSETS / 'logo1.png'), width=Inches(4.5))
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(1)
    set_run_font(p.add_run('MANIPAL ACADEMY OF HIGHER EDUCATION'), 16, bold=True, color=NAVY)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(17)
    set_run_font(p.add_run('BENGALURU, INDIA'), 10, color=GRAY)
    p = doc.add_paragraph(style='Title')
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(9)
    p.paragraph_format.keep_together = True
    set_run_font(p.add_run('Insurance Fraud Claim Detection System Using Google Gemini AI'), 21, bold=True, color='111111')
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.left_indent = Inches(0.55)
    p.paragraph_format.right_indent = Inches(0.55)
    p.paragraph_format.space_after = Pt(20)
    p.paragraph_format.line_spacing = 1.25
    set_run_font(p.add_run('A project report submitted in partial fulfilment of the academic requirements for the Bachelor of Technology programme.'), 12, color=DARK)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(7)
    set_run_font(p.add_run('SUBMITTED BY'), 10, bold=True, color=BLUE)
    table = doc.add_table(rows=4, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(1.8)
    table.columns[1].width = Inches(3.4)
    details = [
        ('Student Name', 'Vipul Srivastava'),
        ('Registration Number', '2428010117'),
        ('Section', 'B'),
        ('Project Guide', 'Dr. Manoj Kumar Sharma'),
    ]
    for i, (label, value) in enumerate(details):
        for cell in table.rows[i].cells:
            set_cell_margins(cell, top=90, bottom=90)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        p1, p2 = table.rows[i].cells[0].paragraphs[0], table.rows[i].cells[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p2.alignment = WD_ALIGN_PARAGRAPH.LEFT
        set_run_font(p1.add_run(label), 11, bold=True, color=GRAY)
        set_run_font(p2.add_run(value), 11, bold=(i == 0), color=DARK)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(23)
    p.paragraph_format.space_after = Pt(0)
    set_run_font(p.add_run('Manipal Academy of Higher Education'), 11, bold=True, color=NAVY)


def add_contents(doc, toc_pages=None):
    add_heading(doc, 'INDEX / TABLE OF CONTENTS', 1)
    add_text(doc, 'The page references below correspond to the numbered pages in this report.', after=8)
    rows = []
    for sn, chapter, subsection in TOC_ITEMS:
        key = f'{sn}|{subsection or chapter}'
        pg = (toc_pages or {}).get(key, '00')
        rows.append((sn, chapter.title() if not subsection else '', subsection, str(pg)))
    add_table(doc, ['S. No.', 'Chapter / Section', 'Subsection', 'Page'], rows, [0.62, 2.52, 2.28, 0.55], font_size=8.6)


def add_chapter_title(doc, n, title):
    p = doc.add_paragraph(style='Heading 1')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(13)
    p.add_run(f'{n}. {title.upper()}')


def wrap_text(draw, text, font, max_w):
    words = text.split()
    lines, line = [], ''
    for word in words:
        test = (line + ' ' + word).strip()
        if draw.textbbox((0, 0), test, font=font)[2] <= max_w or not line:
            line = test
        else:
            lines.append(line)
            line = word
    if line:
        lines.append(line)
    return lines


def render_diagram(path, title, nodes, edges, size=(1800, 1050)):
    W, H = size
    im = Image.new('RGB', size, 'white')
    d = ImageDraw.Draw(im)
    font_path = r'C:\Windows\Fonts\arial.ttf'
    bold_path = r'C:\Windows\Fonts\arialbd.ttf'
    title_font = ImageFont.truetype(bold_path, 36)
    node_font = ImageFont.truetype(font_path, 27)
    small_font = ImageFont.truetype(font_path, 21)
    d.text((W // 2, 35), title, fill=f'#{NAVY}', font=title_font, anchor='mt')
    byid = {n['id']: n for n in nodes}

    def center(n):
        return n['x'], n['y']

    def edge_points(a, b):
        x1, y1 = center(a)
        x2, y2 = center(b)
        dx, dy = x2-x1, y2-y1
        if abs(dx) >= abs(dy):
            sgn = 1 if dx >= 0 else -1
            sx, sy = x1 + sgn * (a['w']/2), y1
            tx, ty = x2 - sgn * (b['w']/2), y2
            mid = (sx + tx)/2
            return [(sx, sy), (mid, sy), (mid, ty), (tx, ty)]
        sgn = 1 if dy >= 0 else -1
        sx, sy = x1, y1 + sgn * (a['h']/2)
        tx, ty = x2, y2 - sgn * (b['h']/2)
        mid = (sy + ty)/2
        return [(sx, sy), (sx, mid), (tx, mid), (tx, ty)]

    for e in edges:
        a, b = byid[e[0]], byid[e[1]]
        pts = e[2] if len(e) > 2 and isinstance(e[2], list) else edge_points(a, b)
        d.line(pts, fill=f'#{BLUE}', width=4, joint='curve')
        x1, y1 = pts[-2]
        x2, y2 = pts[-1]
        ang = math.atan2(y2-y1, x2-x1)
        ah = 16
        tri = [(x2, y2), (x2-ah*math.cos(ang-0.45), y2-ah*math.sin(ang-0.45)), (x2-ah*math.cos(ang+0.45), y2-ah*math.sin(ang+0.45))]
        d.polygon(tri, fill=f'#{BLUE}')
        edge_label = e[3] if len(e) > 3 and isinstance(e[3], str) else (e[2] if len(e) > 2 and isinstance(e[2], str) else '')
        if edge_label:
            lx, ly = e[4] if len(e) > 4 else ((x1+x2)//2, (y1+y2)//2)
            label = edge_label
            bb = d.textbbox((0, 0), label, font=small_font)
            d.rounded_rectangle((lx-5, ly-3, lx+bb[2]+6, ly+bb[3]+4), radius=6, fill='white')
            d.text((lx, ly), label, fill=f'#{DARK}', font=small_font)

    for n in nodes:
        x, y, w, h = n['x'], n['y'], n['w'], n['h']
        shape = n.get('shape', 'box')
        if shape == 'diamond':
            d.polygon([(x,y-h//2),(x+w//2,y),(x,y+h//2),(x-w//2,y)], fill=f'#{PALE}', outline=f'#{BLUE}', width=4)
            max_w = int(w * 0.57)
        else:
            d.rounded_rectangle((x-w//2,y-h//2,x+w//2,y+h//2), radius=18, fill=f'#{PALE}', outline=f'#{BLUE}', width=4)
            max_w = w-32
        lines = []
        for raw in n['label'].split('\n'):
            lines.extend(wrap_text(d, raw, node_font, max_w))
        line_h = 34
        ty = y - (len(lines)*line_h)/2
        for line in lines:
            d.text((x, ty), line, fill=f'#{DARK}', font=node_font, anchor='mt', align='center')
            ty += line_h
    im.save(path, dpi=(300,300), optimize=True)


def make_diagrams():
    specs = [
      ('01_system_architecture.png','Browser and Gemini architecture', (1800,1050),
       [
        {'id':'u','label':'User','x':110,'y':510,'w':150,'h':100},
        {'id':'ui','label':'React SPA\nForms and Results','x':340,'y':510,'w':250,'h':125},
        {'id':'v','label':'Client-side\nValidation','x':610,'y':510,'w':220,'h':120},
        {'id':'s','label':'Local heuristic\nservice','x':870,'y':510,'w':240,'h':120},
        {'id':'b','label':'Baseline result\nin React state','x':1125,'y':510,'w':240,'h':120},
        {'id':'k','label':'Gemini key?','x':1390,'y':510,'w':200,'h':140,'shape':'diamond'},
        {'id':'r','label':'ResultCard\nRisk tier and factors','x':1660,'y':330,'w':250,'h':130},
        {'id':'g','label':'Google Gemini API\n2.5 Flash','x':1660,'y':700,'w':250,'h':130},
        {'id':'ls','label':'localStorage\nAPI key only','x':1390,'y':880,'w':220,'h':110},
        {'id':'note','label':'No app backend, claims database,\nor authentication','x':880,'y':880,'w':420,'h':100},
       ],
       [('u','ui'),('ui','v'),('v','s'),('s','b'),('b','k'),('k','r','No'),('k','g','Yes'),('g','r'),('ls','k'),('ui','note')]),
      ('02_application_flowchart.png','Complete application workflow',(1550,1250),
       [
        {'id':'a','label':'Load index.html\nand mount App','x':775,'y':130,'w':300,'h':100},
        {'id':'b','label':'Dashboard: choose\nvehicle or health','x':775,'y':300,'w':330,'h':105},
        {'id':'c','label':'Enter claim in\ncontrolled form','x':775,'y':475,'w':300,'h':100},
        {'id':'d','label':'Valid on submit?','x':775,'y':650,'w':230,'h':140,'shape':'diamond'},
        {'id':'e','label':'Show errors and focus\nfirst invalid field','x':350,'y':650,'w':330,'h':105},
        {'id':'f','label':'analyzeClaim -> local\nbaseline risk result','x':775,'y':850,'w':350,'h':115},
        {'id':'g','label':'Gemini key\nconfigured?','x':775,'y':1035,'w':230,'h':140,'shape':'diamond'},
        {'id':'h','label':'Render baseline\nresult','x':440,'y':1035,'w':260,'h':105},
        {'id':'i','label':'Optional Gemini\nenrichment; score unchanged','x':1170,'y':1035,'w':340,'h':105},
        {'id':'j','label':'ResultCard and\noptional Copilot','x':775,'y':1180,'w':340,'h':100},
       ],
       [('a','b'),('b','c'),('c','d'),('d','e','No'),('e','c'),('d','f','Yes'),('f','g'),('g','h','No'),('g','i','Yes'),('h','j'),('i','j')]),
      ('03_claim_processing_flowchart.png','Local claim risk processing',(1700,1250),
       [
        {'id':'a','label':'Validated claim\n(type and fields)','x':850,'y':110,'w':320,'h':105},
        {'id':'b','label':'Claim type?','x':850,'y':300,'w':220,'h':140,'shape':'diamond'},
        {'id':'c','label':'Car: start at 20; test\nratio, timing/report, tenure,\nseverity/injury, witnesses','x':435,'y':510,'w':470,'h':170},
        {'id':'d','label':'Health: start at 18; test\ninception timing, ratio,\nsegmentation, severity/cost','x':1260,'y':510,'w':470,'h':170},
        {'id':'e','label':'Round and clamp\npercentage-style score','x':850,'y':740,'w':350,'h':110},
        {'id':'f','label':'Score >= 65?','x':850,'y':930,'w':230,'h':140,'shape':'diamond'},
        {'id':'g','label':'HIGH','x':370,'y':930,'w':170,'h':90},
        {'id':'h','label':'35 <= score < 65?','x':850,'y':1090,'w':270,'h':140,'shape':'diamond'},
        {'id':'i','label':'MEDIUM','x':610,'y':1090,'w':180,'h':90},
        {'id':'j','label':'LOW','x':1135,'y':1090,'w':170,'h':90},
       ],
       [('a','b'),('b','c','Car'),('b','d','Health'),('c','e'),('d','e'),('e','f'),('f','g','Yes'),('f','h','No'),('h','i','Yes'),('h','j','No')]),
      ('04_gemini_integration_flowchart.png','Gemini forensic enrichment',(1600,1200),
       [
        {'id':'a','label':'Local baseline is\nalready calculated','x':800,'y':110,'w':330,'h':105},
        {'id':'b','label':'Read API key from\nlocalStorage or env','x':800,'y':290,'w':330,'h':105},
        {'id':'c','label':'Key available?','x':800,'y':465,'w':230,'h':140,'shape':'diamond'},
        {'id':'d','label':'Return baseline only','x':390,'y':465,'w':270,'h':100},
        {'id':'e','label':'Build claim context,\nbaseline and JSON schema','x':800,'y':650,'w':380,'h':110},
        {'id':'f','label':'GoogleGenAI\ngenerateContent','x':800,'y':830,'w':300,'h':105},
        {'id':'g','label':'Parse JSON and check\nsummary + fraud pattern','x':800,'y':1000,'w':360,'h':110},
        {'id':'h','label':'Attach optional text\n(no score change)','x':1250,'y':1000,'w':280,'h':110},
        {'id':'i','label':'Error or unusable JSON:\nreturn null; keep baseline','x':350,'y':1000,'w':360,'h':110},
       ],
       [('a','b'),('b','c'),('c','d','No'),('c','e','Yes'),('e','f'),('f','g'),('g','h','Valid'),('g','i','Invalid')]),
      ('05_data_flow_diagram.png','Level 1 data flow diagram',(1800,1100),
       [
        {'id':'u','label':'User','x':130,'y':520,'w':150,'h':100},
        {'id':'p1','label':'1. Enter claim','x':390,'y':520,'w':235,'h':110},
        {'id':'d1','label':'React state:\nactive claim','x':670,'y':520,'w':250,'h':105},
        {'id':'p2','label':'2. Validate','x':950,'y':520,'w':210,'h':110},
        {'id':'p3','label':'3. Local rule\nevaluation','x':1230,'y':520,'w':250,'h':110},
        {'id':'d2','label':'Baseline result\nin React state','x':1530,'y':520,'w':250,'h':105},
        {'id':'p4','label':'4. Optional AI\nenrichment','x':1530,'y':790,'w':260,'h':110},
        {'id':'g','label':'Gemini API','x':1200,'y':930,'w':220,'h':100},
        {'id':'d3','label':'localStorage:\nAPI key','x':1530,'y':1030,'w':230,'h':90},
        {'id':'p5','label':'5. Render result','x':390,'y':820,'w':260,'h':110},
       ],
       [('u','p1'),('p1','d1'),('d1','p2'),('p2','p3'),('p3','d2'),('d2','p4'),('p4','g'),('g','p4'),('d3','p4'),('d2','p5'),('p5','u')]),
    ]
    for filename, title, size, nodes, edges in specs:
        render_diagram(DIAGRAMS / filename, title, nodes, edges, size)


def add_page_numbering_section(doc):
    section = doc.add_section(WD_SECTION.NEW_PAGE)
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(0.85)
    section.bottom_margin = Inches(0.85)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)
    section.header.is_linked_to_previous = False
    section.footer.is_linked_to_previous = False
    section.different_first_page_header_footer = False
    sect_pr = section._sectPr
    pg = OxmlElement('w:pgNumType')
    pg.set(qn('w:start'), '1')
    sect_pr.append(pg)
    add_header_footer(section, True)
    return section


def build():
    DIAGRAMS.mkdir(parents=True, exist_ok=True)
    make_diagrams()
    toc_pages = json.loads(TOC_MAP.read_text(encoding='utf-8')) if TOC_MAP.exists() else {}
    doc = Document()
    set_doc_styles(doc)
    add_cover(doc)
    add_page_numbering_section(doc)
    add_contents(doc, toc_pages)

    page_break(doc)
    add_chapter_title(doc, 1, 'Introduction')
    add_heading(doc, '1.1 Insurance claim processing', 2)
    add_text(doc, 'Insurance claim processing is the sequence through which an insurer receives a loss report, checks policy coverage and supporting information, estimates the payable amount, and communicates an outcome. Reviewers may compare identity, dates, incident descriptions, policy limits, invoices, and available evidence. This project represents only a small subset of those activities through user-entered fields and local checks; it is not connected to an insurer workflow or source records.')
    add_heading(doc, '1.2 Insurance fraud and the need for review', 2)
    add_text(doc, 'Insurance fraud refers to intentional deception connected with obtaining an insurance benefit or avoiding a legitimate obligation. Examples in the broader field include inflated loss amounts, staged events, falsified bills, and misrepresentation. Fraud can increase investigation costs and losses, but suspicion is not proof. Detection systems therefore help prioritize human review rather than replace evidence gathering, due process, or policy interpretation.')
    add_heading(doc, '1.3 Traditional screening and artificial intelligence', 2)
    add_text(doc, 'Manual review depends on investigator time and the quality of available records. Fixed rules can make repeatable checks easier to explain, but rules can miss new schemes and may flag unusual yet legitimate claims. Statistical machine-learning systems can learn patterns from labeled or unlabeled historical records, but require representative data, evaluation, governance, and monitoring. This project does not implement such a trained model: its baseline is a small set of fixed if/else thresholds in `src/services/prediction.ts` (car evaluator lines 36–175; health evaluator lines 177–297).')
    add_heading(doc, '1.4 Generative AI and Google Gemini', 2)
    add_text(doc, 'Generative AI creates content from an input prompt. A large language model predicts sequences of tokens from learned statistical patterns; it can produce fluent but inaccurate statements. The project optionally uses Google Gemini 2.5 Flash to generate a structured narrative, a fraud-pattern label, inconsistencies, and an SIU checklist. The application requests structured JSON and checks a small number of required values, but the AI output is not independently verified against external evidence.')
    add_heading(doc, '1.5 Project overview', 2)
    add_text(doc, 'The system is a client-side React and TypeScript single-page application. It accepts either a vehicle or health claim, validates selected fields in the browser, calculates a baseline risk score with local heuristics, and optionally sends selected claim data and baseline flags from the browser to Google Gemini. It displays the local risk tier and factors with optional AI text. Gemini does not change the local score or tier. There is no project API server, database, user authentication, or trained fraud model.')

    page_break(doc)
    add_chapter_title(doc, 2, 'Objectives')
    add_text(doc, 'The objectives below describe the implemented scope and are intentionally limited to capabilities supported by the inspected code.')
    add_bullets(doc, [
      'Provide a browser interface for entering automobile and health claim details.',
      'Represent the two claim forms using separate TypeScript interfaces and a discriminated ClaimData union.',
      'Validate required values and selected numeric and date constraints on the client before analysis.',
      'Apply deterministic, transparent heuristic rules to produce a percentage-style score, a LOW/MEDIUM/HIGH tier, recommendation, and triggered-factor explanations.',
      'Offer optional Google Gemini 2.5 Flash analysis that returns structured narrative fields when a key is configured.',
      'Allow an investigator to ask follow-up questions using the Gemini Copilot UI.',
      'Present results and a claim summary in a single-page workflow, while retaining a baseline-only path when Gemini is unavailable.',
      'Provide demo presets for illustrating selected higher- and lower-risk scenarios.'
    ], numbered=True)
    add_heading(doc, '2.1 Objectives not claimed as achieved', 2)
    add_text(doc, 'The project does not train an AI model, verify claims against insurer or public records, store claims in a database, authenticate users, expose a custom backend API, or produce a calibrated fraud probability. Those capabilities would require separate data, infrastructure, evaluation, and governance work.')

    page_break(doc)
    add_chapter_title(doc, 3, 'Hardware and Software Requirements')
    add_heading(doc, '3.1 Hardware requirements', 2)
    add_text(doc, 'The source code does not declare minimum hardware benchmarks. The values below are practical estimates for development and browser use, not measured performance guarantees. The application performs lightweight client-side calculations; an internet connection is needed only for package setup/deployment activities and optional Gemini calls.')
    hardware = [
      ('Processor', 'Modern dual-core CPU or equivalent', 'Recent quad-core CPU or equivalent'),
      ('RAM', '4 GB', '8 GB or more for editor, browser and build tools together'),
      ('Storage', 'At least 2 GB free for dependencies and build artifacts (estimate)', 'At least 5 GB free for development tools and repeated builds'),
      ('Display', '1280 x 720 or larger', '1920 x 1080 or larger for comfortable form review'),
      ('Internet', 'Not required for baseline scoring after assets are loaded; required for setup and Gemini', 'Stable broadband for package installation and optional Gemini requests'),
    ]
    add_caption(doc, 'Table 3.1. Estimated hardware requirements')
    add_table(doc, ['Component', 'Minimum estimate', 'Recommended estimate'], hardware, [1.25, 2.35, 2.55], 9.5)
    add_heading(doc, '3.2 Software requirements', 2)
    software = [
      ('Operating system', 'Windows, macOS or Linux with a supported Node.js environment; Docker image uses Linux Alpine.'),
      ('Languages', 'TypeScript/JavaScript in `src/`; HTML document shell in `index.html`; CSS through Tailwind utilities.'),
      ('Runtime and package manager', 'Node.js 20 in Docker builder; npm scripts and package-lock; bun.lock is also present.'),
      ('Frontend framework', 'React 19 and React DOM for component rendering and browser state.'),
      ('Build and styles', 'Vite 6, `@vitejs/plugin-react`, Tailwind CSS 4 and `@tailwindcss/vite`.'),
      ('UI library', '`lucide-react` for icons.'),
      ('AI API / SDK', '`@google/genai` SDK, calling the Google Gemini API with model string `gemini-2.5-flash`.'),
      ('Other declared packages', '`express`, `dotenv`, `motion`, `autoprefixer`, `esbuild`, `tsx`, and type packages are declared; no Express application server, dotenv loader, or Motion API use was found in the inspected source.'),
      ('Database', 'None implemented. Claim/result data is component state; localStorage is used for the Gemini key only.'),
      ('Web hosting', 'Nginx in the Docker runtime image; `vercel.json` provides a single-page-app rewrite.'),
      ('Development environment', 'Any editor and terminal capable of running the package scripts; no IDE is required by the application.'),
    ]
    add_caption(doc, 'Table 3.2. Software requirements and purpose')
    add_table(doc, ['Category', 'Technology and project purpose'], software, [1.45, 4.7], 9.1)
    add_text(doc, 'The package manifest includes `npm run dev`, `build`, `preview`, `clean`, and `lint`. The `lint` script runs `tsc --noEmit`; it is a TypeScript check rather than an ESLint command. The `clean` script uses `rm -rf`, so it assumes a Unix-like shell if run as written.', italic=True, after=0)

    page_break(doc)
    add_chapter_title(doc, 4, 'System Architecture and Working')
    add_heading(doc, '4.1 System architecture', 2)
    add_text(doc, 'The browser is the application runtime. `src/main.tsx` mounts the React root, `src/App.tsx` controls page navigation, and the form components pass valid claim objects to `src/pages/ClaimAnalysis.tsx`. That page calls `analyzeClaim` in `src/services/prediction.ts`. The local evaluator creates the authoritative baseline result. If a Gemini key is present, `src/services/gemini.ts` sends a request directly from the browser to Google; no Veridex backend mediates the call.')
    add_figure(doc, DIAGRAMS / '01_system_architecture.png', 'Figure 4.1. Browser and Gemini system architecture', 'The diagram shows the client-side boundary, local rule service, optional external Gemini call, and browser storage. The localStorage item is the Gemini API key; no claims database is present. If AI generation is unavailable, the heuristic result remains available.')
    add_heading(doc, '4.2 Component communication', 2)
    add_text(doc, '`App` passes navigation callbacks to `Navbar` and `Dashboard`. The dashboard chooses a claim type, and `ClaimForm` mounts the corresponding form. Each form owns its field state and validator interaction, then submits typed data to `ClaimAnalysis`. The service returns a `PredictionResult`. `ResultCard`, `RiskIndicator`, and `ClaimSummary` render the result; `GeminiCopilot` can initiate separate follow-up requests.')
    add_heading(doc, '4.3 Storage and deployment', 2)
    add_text(doc, 'Claim values and results live in React component state and are not persisted by the application. The API key can be stored in browser localStorage or supplied through Vite environment configuration. `Dockerfile` builds static assets and copies `dist` into Nginx; it does not start Express. `nginx.conf` and `vercel.json` route unknown paths to `index.html` for the SPA.')

    page_break(doc)
    add_chapter_title(doc, 5, 'Flowchart and Block Diagram')
    add_text(doc, 'The following figures summarize the implemented browser workflow. Each Mermaid source file is included alongside the report. The diagrams intentionally omit an application backend and database because neither is implemented.')
    add_heading(doc, '5.1 Overall application architecture', 2)
    add_figure(doc, DIAGRAMS / '01_system_architecture.png', 'Figure 5.1. Overall system block diagram', 'The React client performs validation and heuristic scoring. Gemini is an optional external service used for text enrichment; it does not replace the score.')
    add_heading(doc, '5.2 Complete application flow', 2)
    add_figure(doc, DIAGRAMS / '02_application_flowchart.png', 'Figure 5.2. Complete application flowchart', 'Invalid input remains in the form with visible errors. Valid input produces a baseline result; a configured Gemini key adds optional narrative output.')
    add_heading(doc, '5.3 Insurance claim processing', 2)
    add_figure(doc, DIAGRAMS / '03_claim_processing_flowchart.png', 'Figure 5.3. Insurance claim processing and risk classification', 'Car and health claims follow separate rules and starting scores. The common classification boundaries are below 35 for LOW, 35–64 for MEDIUM, and 65 or more for HIGH after each evaluator clamps its score.')
    add_heading(doc, '5.4 Gemini API integration', 2)
    add_figure(doc, DIAGRAMS / '04_gemini_integration_flowchart.png', 'Figure 5.4. Gemini forensic integration flow', 'The service computes a local baseline first. It then reads the key, prepares the prompt and schema, parses the returned text, and attaches optional fields only when the required summary and pattern are present.')
    add_heading(doc, '5.5 Data flow diagram', 2)
    add_figure(doc, DIAGRAMS / '05_data_flow_diagram.png', 'Figure 5.5. Level 1 data flow diagram', 'Data moves from the user through form state and client validation to the local rules. A configured request sends claim context to Gemini; the response returns to the client and is rendered. No data store for claims is present.')

    page_break(doc)
    add_chapter_title(doc, 6, 'Module Description')
    add_text(doc, 'Table 6.1 summarizes the principal authored modules and the direction of their data flow. Each module is part of `src/` unless a root-level path is shown.')
    modules = [
      ('Application shell', '`App.tsx`, `main.tsx`', 'Page/type selections and browser root', 'Mounts React, owns in-memory navigation, renders shared shell', 'Pages and navigation callbacks'),
      ('Claim pages', '`Dashboard.tsx`, `ClaimAnalysis.tsx`, `About.tsx`', 'Navigation props and claim type', 'Choose entry, coordinate submit/loading/result/error, explain system', 'Form, services, result components'),
      ('Form selector', '`ClaimForm.tsx`', 'Coverage type and submit callbacks', 'Switches car/health component', 'Car or health form'),
      ('Car form', '`CarInsuranceForm.tsx`', 'Vehicle claim field values', 'Controlled inputs, sample presets, validation, submit', 'Validator and ClaimAnalysis'),
      ('Health form', '`HealthInsuranceForm.tsx`', 'Health claim field values', 'Controlled inputs, sample presets, validation, submit', 'Validator and ClaimAnalysis'),
      ('Validation utility', '`utils/validation.ts`', 'Car or health typed object', 'Returns field error map; does not throw or call a server', 'Forms'),
      ('Prediction service', '`services/prediction.ts`', 'Discriminated ClaimData', 'Runs corresponding fixed rules; optionally requests Gemini enrichment', 'Gemini service; ClaimAnalysis'),
      ('Gemini service/key utility', '`services/gemini.ts`, `geminiKey.ts`', 'Claim context, baseline, key, question/history', 'Builds prompts, SDK calls, parses output; resolves key and emits update event', 'Google API; settings modal; Copilot'),
      ('Result presentation', '`ResultCard.tsx`, `RiskIndicator.tsx`, `ClaimSummary.tsx`', 'PredictionResult and submitted claim', 'Shows tier, score, factors, optional narrative, summary and follow-up chat', 'Prediction service and GeminiCopilot'),
      ('Settings and Copilot', '`GeminiSettingsModal.tsx`, `GeminiCopilot.tsx`', 'Key input, connection state, questions and messages', 'Save/test/clear key; send follow-up chat and display replies/errors', 'Key utility and Gemini SDK service'),
      ('Sample data', '`data/sampleData.ts`', 'No external input', 'Exports initial records and higher/lower risk demo presets', 'Forms'),
      ('Build/static hosting', '`vite.config.ts`, `Dockerfile`, `nginx.conf`, `vercel.json`', 'Source files and build output', 'Builds and serves the SPA; rewrites application routes', 'Browser delivery'),
    ]
    add_caption(doc, 'Table 6.1. Major project modules, processing and interactions')
    add_table(doc, ['Module', 'Files', 'Input', 'Processing', 'Output / interaction'], modules, [1.0, 1.15, 1.25, 1.65, 1.2], 8.0)
    add_heading(doc, '6.1 Data types', 2)
    add_text(doc, '`src/types.ts` declares `CarInsuranceClaim`, `HealthInsuranceClaim`, the `ClaimData` discriminated union, `RiskFactor`, `GeminiForensicAnalysis`, and `PredictionResult`. The types support static checking at build time; they do not validate values arriving at runtime. The API output is parsed and cast in `gemini.ts`, with only selected required values checked explicitly.')

    page_break(doc)
    add_chapter_title(doc, 7, 'Implementation and Technologies')
    add_heading(doc, '7.1 Frontend and form data', 2)
    add_text(doc, 'The app uses React function components and hooks. `main.tsx` wraps `<App />` in `StrictMode`. `App.tsx` tracks the selected screen and insurance type. Claim inputs are controlled by React state; change and blur handlers update values and errors. On submit the form marks fields touched, runs the full validator, focuses the first invalid element, and calls the matching callback only when the error object is empty.')
    add_heading(doc, '7.2 Validation', 2)
    add_text(doc, '`validateCarInsuranceClaim` in `src/utils/validation.ts` checks required identity/policy/incident/vehicle fields, selected numeric ranges, nonnegative amounts and vehicle year. `validateHealthInsuranceClaim` checks required fields, age/dependent bounds, date validity and ordering, positive claim amount and duration, and required classification/status values. These are browser-side form checks, not server security controls or insurance coverage validation.')
    add_heading(doc, '7.3 Deterministic risk assessment', 2)
    add_text(doc, 'The vehicle evaluator starts at 20. It adds points for a high claim-to-premium ratio, late incident without a report, recent policy tenure paired with a large loss, and a severity/injury inconsistency. It subtracts points for long tenure and for multiple witnesses with a police report. The health evaluator starts at 18 and adds points for loss soon after inception, a high claim-to-premium ratio, selected watchlist segments, and a high charge under mild severity; preferred-risk segmentation subtracts points. Both paths create a `RiskFactor` for matched conditions.')
    add_caption(doc, 'Table 7.1. Implemented rule conditions')
    rules = [
      ('Car', 'Claim / annual premium > 50', '+26'),
      ('Car', 'Claim / annual premium > 25 and <= 50', '+14'),
      ('Car', 'Incident hour >= 23 or <= 4 AND no police report', '+22'),
      ('Car', 'No police report AND authorities contacted = None (alternate branch)', '+16'),
      ('Car', 'Tenure < 6 months AND claim > $25,000', '+20'),
      ('Car', 'Tenure > 60 months (alternate tenure branch)', '-12, floor 5'),
      ('Car', 'Minor/Trivial Damage AND injury claim > $15,000', '+18'),
      ('Car', 'At least 2 witnesses AND police report available', '-10, floor 5'),
      ('Health', 'Loss 0–14 days after effective date', '+30'),
      ('Health', 'Loss 15–45 days after effective date (alternate timing branch)', '+16'),
      ('Health', 'Claim / premium > 40', '+24'),
      ('Health', 'New Policyholder Watchlist or Tier-1 High Utilization', '+18'),
      ('Health', 'Low Risk Preferred (alternate segmentation branch)', '-12, floor 5'),
      ('Health', 'Severity includes Mild AND claim > $20,000', '+22'),
    ]
    add_table(doc, ['Claim line', 'Coded condition', 'Score adjustment'], rules, [0.95, 4.1, 1.2], 8.7)
    add_text(doc, 'The vehicle score is rounded and clamped to 8–96; the health score to 9–95. Both map <35 to LOW, 35–64 to MEDIUM, and >=65 to HIGH. The `confidenceScore` is generated using `Math.random` (car: 85–96; health: 88–96), and the claim reference suffix is also random. Neither value is a validated confidence estimate or a database-backed unique identifier.', after=7)
    add_code(doc, """const ratio = totalAmount / annualPrem;
if (ratio > 50) {
  riskScore += 26;
  riskFactors.push({
    title: 'Disproportionate Claim vs. Premium',
    description: `Claim amount is over ${Math.round(ratio)}x the annual premium.`,
    impact: 'HIGH',
  });
}""", 'Code excerpt 7.1. Vehicle claim-to-premium rule (adapted excerpt from prediction.ts)')
    add_text(doc, 'This rule is deterministic: identical numeric inputs trigger the same branch. The phrase “probability” in the UI describes the scaled heuristic score; there is no dataset calibration or measured likelihood behind it.')
    add_heading(doc, '7.4 Gemini request construction and response processing', 2)
    add_text(doc, '`generateGeminiForensics` in `src/services/gemini.ts` selects a car- or health-specific subset of fields, serializes it, includes the baseline tier/percentage/rule flags, and asks Gemini to inspect consistency, timing, financial ratios and red flags. It calls `GoogleGenAI.models.generateContent` with `gemini-2.5-flash`, `responseMimeType: application/json`, an object schema, and temperature 0.2. The response text is parsed with `JSON.parse`; if `executiveSummary` or `fraudPattern` is missing, the service returns null. Other arrays default to empty and recommended action defaults to the baseline recommendation.')
    add_code(doc, """const response = await ai.models.generateContent({
  model: GEMINI_MODEL,
  contents: prompt,
  config: {
    responseMimeType: 'application/json',
    responseSchema: { type: Type.OBJECT, properties, required },
    temperature: 0.2,
  },
});""", 'Code excerpt 7.2. Structured Gemini generation configuration (shortened excerpt)')
    add_text(doc, 'The schema asks for an executive summary, pattern, inconsistency list, SIU checklist and recommended action. `ResultCard.tsx` displays the first four, but does not display the Gemini `recommendedAction`; the visible recommendation is the local one. The AI request is enrichment only: baseline risk fields are not recalculated from the response.')
    add_heading(doc, '7.5 API key configuration and security boundary', 2)
    add_text(doc, '`geminiKey.ts` checks localStorage first, then Vite environment fields. The settings modal lets the user save/clear a key and test the connection with a small real Gemini request. A successful test also saves the key. The key is used by browser-side SDK code, so localStorage and Vite-bundled client variables are visible to the browser user and must not be represented as server-protected secrets. The environment naming is inconsistent: the source checks `import.meta.env.GEMINI_API_KEY`, while `vite.config.ts` defines `process.env.GEMINI_API_KEY`; the latter is not the expression read by the utility. Vite exposes `VITE_` variables by default, and those values still become public client code.')
    add_heading(doc, '7.6 Error handling', 2)
    add_text(doc, 'Form validation returns field messages rather than throwing. `ClaimAnalysis` sets loading before awaiting the service, shows a result on success, displays an alert for a thrown analysis error, and clears loading in `finally`. Forensic Gemini errors are caught in `gemini.ts`, logged as warnings and returned as null, preserving the local result. The Copilot catches errors and appends their text as a message. The settings modal exposes testing, success and error states. There is no retry/backoff, request cancellation, comprehensive response validator, or server-side error boundary.')
    add_heading(doc, '7.7 Additional technologies and package use', 2)
    add_text(doc, 'React renders component UI; TypeScript defines compile-time contracts; Vite and its plugins build the SPA; Tailwind utilities provide styling; Lucide React supplies icons; and the Google GenAI SDK calls Gemini. Docker and Nginx serve static build output. Express, dotenv and Motion are listed dependencies but no application imports for those features were found in `src/`. No Python, database driver, ORM or trained model is part of the application.')

    page_break(doc)
    add_chapter_title(doc, 8, 'Results and Output')
    add_text(doc, 'The interface supports a dashboard, separate vehicle and health claim forms, a loading state, a baseline result view, optional Gemini findings and a settings modal. The following two images are genuine user-provided captures of the running local application. They show the system specification page and Gemini configuration UI; no screenshot was supplied for the claim form or result state, so those states are described from the source rather than fabricated.')
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    p.add_run().add_picture(str(SCREENSHOTS / 'system_spec_supplied.png'), width=Inches(6.25))
    add_caption(doc, 'Figure 8.1. System specification page in the local application')
    add_text(doc, 'This capture shows the navigation, system overview, and four-stage explanation. It demonstrates the informational page; it is not a live scoring output or proof of an operational backend.', after=9)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(0)
    p.add_run().add_picture(str(SCREENSHOTS / 'gemini_configuration_supplied.png'), width=Inches(6.25))
    add_caption(doc, 'Figure 8.2. Gemini API configuration modal in the local application')
    add_text(doc, 'The modal indicates whether a key is present and provides key entry, connection testing and save controls. A configured label is based on key presence; only the test button makes a remote verification request.')
    add_heading(doc, '8.1 Expected baseline result fields', 2)
    add_bullets(doc, [
      'A risk tier and percentage-style score calculated by the local evaluator.',
      'A short prediction label and line-specific recommendation.',
      'Rule factors with title, explanation and HIGH/MEDIUM/LOW impact.',
      'A claim reference, timestamp, and a summary of selected submitted values.',
      'Optional Gemini narrative, pattern label, inconsistencies and checklist when the response is usable.',
      'Optional Copilot chat for follow-up questions when a key is configured.'
    ])
    add_text(doc, 'These are source-defined outputs. Scores and confidence-like values are demo values and should not be interpreted as evaluated business results. The app does not publish accuracy, recall, precision, false-positive rate or throughput measurements.', after=0)

    page_break(doc)
    add_chapter_title(doc, 9, 'Advantages and Limitations')
    add_heading(doc, '9.1 Advantages of the implemented prototype', 2)
    add_bullets(doc, [
      'The baseline rules are explicit and easy to trace from inputs to triggered factors.',
      'Separate claim types avoid mixing vehicle and health fields in one form schema.',
      'The baseline path does not depend on Gemini availability.',
      'Gemini output is requested in a constrained JSON structure and is optional.',
      'Sample presets support a quick classroom demonstration.',
      'Static deployment through Nginx or Vercel is straightforward.'
    ])
    add_heading(doc, '9.2 Limitations of the current implementation', 2)
    add_bullets(doc, [
      'No trained ML model or labeled data is included; scoring is a few manually selected threshold rules.',
      'The “fraud probability” is a clamped points score, not a calibrated statistical probability.',
      'The displayed confidence score and claim reference suffix are generated with Math.random.',
      'The heuristic rules use only a subset of the fields collected by the forms.',
      'There is no backend, database, account system, access control, audit trail or insurer data integration.',
      'The Gemini recommendedAction is parsed but is not shown by ResultCard; baseline recommendation remains visible.',
      'Runtime response checks are limited; JSON parsing and two truthy fields do not verify truth or all field types.',
      'A zero annual/premium value passes validation and the scoring code substitutes 1 as denominator, which can inflate a ratio.',
      'Gemini failures are logged and baseline-only output continues; there is no retry or latency/quality measurement.'
    ])
    add_heading(doc, '9.3 AI, privacy and security considerations', 2)
    add_text(doc, 'The browser stores a supplied key in localStorage, where same-origin JavaScript can read it. A build-time client key is also visible in the shipped bundle. In addition, the forensic prompt includes selected customer, policy, incident, vehicle and financial attributes; the Copilot prompt serializes the full claim data object. The app has no consent flow, field redaction, retention policy, authentication or access control. Real personal or health claim data should not be entered into this prototype without an approved privacy/security design. Gemini-generated content may be inaccurate, biased or influenced by untrusted input and requires independent review.')
    add_text(doc, 'The README uses language such as “enterprise-grade” and the metadata advertises server-side Gemini capability. Those descriptions exceed the inspected implementation: the Gemini SDK is called in browser code, and there is no claim server. Package presence alone does not establish runtime use.', italic=True)

    page_break(doc)
    add_chapter_title(doc, 10, 'Future Scope')
    add_text(doc, 'The items in this chapter are proposed enhancements. They are not implemented in the current project.')
    future = [
      ('Protected application backend', 'Move Gemini calls behind authenticated server endpoints and keep provider secrets in server-side secret management.'),
      ('Authentication and authorization', 'Add identity, role-based permissions, least-privilege access, session handling and administrator controls.'),
      ('Privacy controls', 'Minimize/redact data sent to external models; add consent, retention schedules, access logging and a reviewed data-processing policy.'),
      ('Persistence and auditability', 'Use a properly secured database for authorized case records, reviewer decisions and auditable changes.'),
      ('Rule validation and model evaluation', 'Define a lawful labeled dataset, measure false-positive/false-negative costs, evaluate bias and calibrate scores before any operational use.'),
      ('Advanced detection', 'Explore supervised/unsupervised models, graph relationships, historical patterns and document analysis only with suitable governance and evidence.'),
      ('Explainable AI controls', 'Show evidence source and uncertainty, validate generated schema at runtime, surface the Gemini action field, and require human confirmation.'),
      ('Operational reliability', 'Add server-side validation, request timeouts, cancellation, rate limits, retries, monitoring and versioned API contracts.'),
      ('Accessibility and testing', 'Add end-to-end keyboard/screen-reader checks, unit/integration tests and reproducible model/rule test cases.'),
    ]
    add_caption(doc, 'Table 10.1. Proposed future enhancements')
    add_table(doc, ['Area', 'Possible enhancement'], future, [1.65, 4.5], 9.2)

    page_break(doc)
    add_chapter_title(doc, 11, 'Conclusion')
    add_text(doc, 'The Insurance Fraud Claim Detection System Using Google Gemini AI demonstrates a complete browser workflow for entering vehicle and health claims, validating selected fields, applying transparent heuristic checks and presenting a risk-oriented summary. Its local rules are available even when Gemini is not configured. When enabled, Gemini 2.5 Flash receives claim context and baseline flags and may return structured narrative assistance for an investigator.')
    add_text(doc, 'The project’s main technical distinction is the separation between deterministic risk scoring and generative text enrichment. The displayed tier and percentage come from fixed JavaScript conditions; Gemini does not change them. This makes the demo easy to trace, but does not make the scores statistically validated. The application has no custom backend, database, user authentication or secure server-side key boundary, and it should not be used for real claim decisions or sensitive data without substantial engineering and governance work.')
    add_text(doc, 'Within its academic scope, the project illustrates React and TypeScript UI development, client-side validation, rule-based data processing, asynchronous API communication, structured prompts and graceful baseline fallback. A production extension would require protected services, privacy controls, human review, persistent auditability and rigorous evaluation against representative evidence.')

    page_break(doc)
    add_chapter_title(doc, 12, 'References')
    add_text(doc, 'The sources below support descriptions of the external technologies and provide research context. The project-specific implementation statements in this report were checked against the listed repository files.')
    refs = [
      '[1] Google. “Gemini API: Generate content.” Google AI for Developers. https://ai.google.dev/api/generate-content (accessed 1 November 2026).',
      '[2] Google. “Structured outputs.” Gemini API documentation. https://ai.google.dev/gemini-api/docs/structured-output (accessed 1 November 2026).',
      '[3] Google. “Gemini 2.5 Flash.” Google AI for Developers model documentation. https://ai.google.dev/gemini-api/docs/models/gemini-2.5-flash (accessed 1 November 2026).',
      '[4] React. “Managing State.” React Learn documentation. https://react.dev/learn/managing-state (accessed 1 November 2026).',
      '[5] Microsoft. “The TypeScript Handbook.” https://www.typescriptlang.org/docs/handbook/ (accessed 1 November 2026).',
      '[6] Vite. “Env Variables and Modes.” https://vite.dev/guide/env-and-mode (accessed 1 November 2026).',
      '[7] Tailwind CSS. “Installing Tailwind CSS with Vite.” https://tailwindcss.com/docs/installation/using-vite (accessed 1 November 2026).',
      '[8] Node.js. “Node.js Documentation.” https://nodejs.org/docs/latest/api/ (accessed 1 November 2026).',
      '[9] Docker. “Dockerfile reference.” https://docs.docker.com/reference/dockerfile/ (accessed 1 November 2026).',
      '[10] Nginx. “Beginner’s Guide.” https://nginx.org/en/docs/beginners_guide.html (accessed 1 November 2026).',
      '[11] Debener, J., et al. “Detecting insurance fraud using supervised and unsupervised machine learning.” Journal of Risk and Insurance, 90(3), 743–768, 2023. https://doi.org/10.1111/jori.12427.',
      '[12] Schrijver, G., Sarmah, D. K., and El-hajj, M. “Automobile insurance fraud detection using data mining: A systematic literature review.” Intelligent Systems with Applications, 21, 200340, 2024. https://doi.org/10.1016/j.iswa.2024.200340.',
      '[13] Project source code: `src/services/prediction.ts`, `src/services/gemini.ts`, `src/services/geminiKey.ts`, `src/utils/validation.ts`, `src/types.ts`, React pages/components and root build/deployment configuration.'
    ]
    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        p.paragraph_format.space_after = Pt(7)
        p.paragraph_format.line_spacing = 1.15
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        set_run_font(p.add_run(ref), 10.5, color=DARK)

    doc.core_properties.title = 'Insurance Fraud Claim Detection System Using Google Gemini AI'
    doc.core_properties.subject = 'B.Tech project report'
    doc.core_properties.author = 'Vipul Srivastava'
    doc.core_properties.keywords = 'insurance fraud, React, TypeScript, Gemini, heuristic scoring'
    doc.save(DOCX_PATH)
    print(f'Created {DOCX_PATH}')


def update_toc(pdf_path):
    from pypdf import PdfReader
    pdf = PdfReader(str(pdf_path))
    texts = [p.extract_text() or '' for p in pdf.pages]
    mapping = {}
    for sn, chapter, subsection in TOC_ITEMS:
        target = f'{sn}. {chapter}' if not subsection else subsection
        found = None
        for i, text in enumerate(texts[2:], start=2):
            normalized = ' '.join(text.replace('\u00a0',' ').split()).upper()
            if target.upper() in normalized:
                found = max(1, i)  # physical page 1 is the unnumbered cover; TOC page starts at 1
                break
        if found is None:
            print(f'Could not locate TOC heading: {target}', file=sys.stderr)
            continue
        mapping[f'{sn}|{subsection or chapter}'] = str(found)
    TOC_MAP.write_text(json.dumps(mapping, indent=2), encoding='utf-8')
    print(json.dumps(mapping, indent=2))


def build_compact():
    """Build an abbreviated, 10-page-target edition while preserving all 12 chapters."""
    DIAGRAMS.mkdir(parents=True, exist_ok=True)
    make_diagrams()
    doc = Document()
    set_doc_styles(doc)
    # Compact page geometry and paragraph rhythm keep the report readable at 12 pt.
    for sec in doc.sections:
        sec.top_margin = Inches(0.65)
        sec.bottom_margin = Inches(0.65)
        sec.left_margin = Inches(0.75)
        sec.right_margin = Inches(0.75)
    doc.styles['Normal'].paragraph_format.line_spacing = 1.12
    doc.styles['Normal'].paragraph_format.space_after = Pt(3)
    for name, size in [('Heading 1', 15), ('Heading 2', 12)]:
        doc.styles[name].font.size = Pt(size)
        doc.styles[name].paragraph_format.space_before = Pt(6)
        doc.styles[name].paragraph_format.space_after = Pt(3)
        doc.styles[name].paragraph_format.line_spacing = 1.0
    for name in ['List Bullet', 'List Number']:
        doc.styles[name].paragraph_format.line_spacing = 1.0
        doc.styles[name].paragraph_format.space_after = Pt(1)

    add_cover(doc)
    add_page_numbering_section(doc)
    add_heading(doc, 'TABLE OF CONTENTS', 1)
    compact_toc_pages = ['2', '2', '2', '3', '3', '3', '4', '4', '5', '5', '5', '6']
    toc_rows = [(f'{n}.', title.title(), page)
                for (n, title, _), page in zip(TOC_ITEMS, compact_toc_pages)]
    add_table(doc, ['No.', 'Chapter', 'Page'], toc_rows, [0.65, 4.8, 0.65], 10.5)
    page_break(doc)

    def ch(n, title):
        add_chapter_title(doc, n, title)
    def para(text):
        add_text(doc, text, after=3)
    def bullets(items):
        add_bullets(doc, items)
    def fig(path, caption, width=3.0):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        p.add_run().add_picture(str(DIAGRAMS / path), width=Inches(width))
        add_caption(doc, caption)

    ch(1, 'Introduction')
    para('Insurance claim review checks coverage, incident details, submitted amounts and supporting evidence. Fraud may involve staged events, inflated losses or false documents, but an unusual claim is not proof of deception. Automated tools can help prioritize investigation; people must verify evidence and make consequential decisions.')
    para('This project is a client-side React and TypeScript single-page application for vehicle and health claim examples. It validates selected fields, applies fixed local scoring rules and optionally asks Google Gemini 2.5 Flash to produce explanatory text. Gemini is an enrichment step: it does not change the local score or tier. The repository contains no custom API server, claims database, authentication system or trained fraud model.')

    ch(2, 'Objectives')
    bullets(['Accept vehicle and health claim details in separate browser forms.', 'Validate selected required, numeric and date fields before analysis.', 'Calculate a transparent rule-based score, LOW/MEDIUM/HIGH tier and triggered factors.', 'Offer optional structured Gemini narrative and follow-up Copilot assistance.', 'Retain a baseline-only workflow when Gemini is not configured.', 'Demonstrate the workflow with a responsive UI and sample presets.'])
    para('Training a model, checking external records, storing cases and producing calibrated fraud probabilities are outside the implemented scope.')

    ch(3, 'Hardware and Software Requirements')
    add_table(doc, ['Area', 'Practical requirement'], [
      ('Hardware', 'Modern dual-core computer; 4 GB RAM minimum estimate; 1280×720 display; 2 GB free storage estimate.'),
      ('Operating system', 'Windows, macOS or Linux with a supported Node.js environment; Docker image uses Linux Alpine.'),
      ('Application stack', 'React 19, TypeScript, Vite 6, Tailwind CSS 4 and lucide-react.'),
      ('AI integration', 'Optional @google/genai SDK and Google Gemini 2.5 Flash API key; internet required for requests.'),
      ('Build and deployment', 'Node.js 20 in Docker builder; npm scripts; Nginx serves static output; Vercel SPA rewrite is configured.'),
      ('Persistence', 'No database. Claims/results remain in component state; browser localStorage can hold the Gemini key.'),
    ], [1.35, 5.1], 9.3)
    para('Hardware figures are practical estimates, not measured guarantees. The manifest lists Express, dotenv and Motion dependencies, but the inspected source does not implement an Express server or use those packages for the claimed runtime features.')

    ch(4, 'System Architecture and Working')
    para('The browser hosts the entire application. `main.tsx` mounts React; `App.tsx` manages navigation; the dashboard selects a claim type; the matching form validates and submits typed data to `ClaimAnalysis`. The page calls `analyzeClaim` in `src/services/prediction.ts`, which calculates the authoritative local result. If a key is available, browser code in `src/services/gemini.ts` makes a direct request to Google. There is no Veridex backend between the browser and Gemini.')
    para('Vehicle and health scores start at 20 and 18 respectively, apply manually selected thresholds, are clamped to 8–96 and 9–95, then map to LOW (<35), MEDIUM (35–64) or HIGH (≥65). Claim and result state is not persisted. Docker builds static files and Nginx serves them; the Docker image does not start Express.')

    ch(5, 'Flowchart and Block Diagram')
    fig('01_system_architecture.png', 'Figure 1. Browser, local scoring and optional Gemini architecture', 3.0)
    fig('02_application_flowchart.png', 'Figure 2. Claim review flow: validate, score and optionally enrich', 2.7)
    para('The Mermaid definitions for the architecture, application flow, claim scoring, Gemini integration and data flow are supplied as separate `.mmd` files in this report folder.')

    ch(6, 'Module Description')
    add_table(doc, ['Module', 'Responsibility'], [
      ('App and pages', 'Navigation, dashboard, forms, analysis state and system information.'),
      ('Car/health forms', 'Controlled inputs, demo presets, validation feedback and typed submission.'),
      ('Validation utility', 'Returns field-level errors for selected required, range and date checks.'),
      ('Prediction service', 'Applies the separate deterministic vehicle and health rules.'),
      ('Gemini service and key utility', 'Resolves key, builds structured request, parses response and falls back on error.'),
      ('Result/settings/Copilot UI', 'Shows local result and optional AI text; manages key testing and follow-up prompts.'),
    ], [1.8, 4.65], 9.2)

    ch(7, 'Implementation and Technologies')
    para('React function components and hooks manage the interface and form state. TypeScript models the claim variants and results. Vite builds the SPA; Tailwind supplies styles and Lucide React supplies icons. Form validators check input in the browser but are not server security controls or coverage checks.')
    add_table(doc, ['Rule group', 'Implemented examples'], [
      ('Vehicle', 'Claim/premium ratio >50: +26; late incident without police report: +22; recent tenure and large loss: +20; minor damage with high injury claim: +18. Long tenure and multiple witnesses with a report can subtract points.'),
      ('Health', 'Loss within 14 days of policy start: +30; claim/premium ratio >40: +24; selected watchlist segment: +18; mild severity with high claim: +22. Preferred-risk segment can subtract points.'),
    ], [1.0, 5.45], 9.0)
    para('Rules use only a subset of form fields. `confidenceScore` and the reference suffix use `Math.random`; the former is not a validated confidence estimate. A zero premium can pass validation and be replaced by 1 in scoring, inflating the ratio. Gemini receives selected claim data and baseline flags, requests JSON at low temperature, and requires an executive summary and pattern label. Parsing is limited; generated text is not independently verified, and its recommended action is not rendered. The local score remains authoritative.')
    para('The settings utility checks localStorage and Vite environment values, while `vite.config.ts` defines `process.env.GEMINI_API_KEY`; the utility reads `import.meta.env.GEMINI_API_KEY`, so the names are inconsistent. Browser-stored or bundled keys are exposed to browser code and are not server-side secrets.')

    ch(8, 'Results and Output')
    para('The supplied genuine screenshots show the System Spec page and Gemini configuration modal of the running application. They demonstrate informational and settings views, not a scored claim result. The application can display risk tier, percentage-style score, factors, recommendation, claim summary and—when configured—Gemini narrative, pattern, inconsistencies and checklist. No accuracy, precision, recall, false-positive rate or throughput results are claimed because no evaluation dataset or benchmark is included.')
    for filename, caption in [('system_spec.png', 'Figure 3. System specification page'), ('gemini_configuration.png', 'Figure 4. Gemini configuration modal')]:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_after = Pt(0)
        p.add_run().add_picture(str(SCREENSHOTS / filename), width=Inches(4.6))
        add_caption(doc, caption)

    ch(9, 'Advantages and Limitations')
    para('Advantages: the rules and triggered factors are inspectable; the two claim types have separate fields; baseline scoring works without Gemini; the JSON response shape constrains AI output; presets support demonstrations; and static hosting is straightforward.')
    para('Limitations: this is a manually selected heuristic, not trained ML or calibrated probability. There is no backend, database, authentication, access control, audit trail or insurer data integration. Runtime validation of Gemini output is limited; failures have no retry/backoff; some collected fields do not affect scoring. Browser localStorage/build configuration exposes the API key. Prompts send claim information to an external service, with no consent, redaction or retention controls. Do not use real sensitive claims or make operational decisions from this demo without an approved security, privacy and human-review design.')

    ch(10, 'Future Scope')
    bullets(['Move Gemini calls to an authenticated backend and protect provider secrets.', 'Add role-based access, secure case storage, audit history, consent and data minimization.', 'Evaluate rules/models with representative labeled data, calibration, bias checks and documented error costs.', 'Validate all AI fields and evidence, expose uncertainty, add timeouts, limits, monitoring and retries.', 'Add accessibility, automated tests, and human review before any consequential decision.'])

    ch(11, 'Conclusion')
    para('The project demonstrates a browser workflow for entering vehicle or health claims, validating selected fields, applying explainable heuristics and presenting a review-oriented summary. Optional Gemini 2.5 Flash text enriches the explanation while leaving the score unchanged. The separation of local scoring from generated narrative is clear, but the rules and scores have not been empirically validated. This prototype is suitable for an academic demonstration; real use would require secure services, privacy controls, auditable human review and rigorous evaluation.')

    ch(12, 'References')
    refs = [
      '[1] Google AI for Developers. Gemini API: Generate content and structured outputs. https://ai.google.dev/gemini-api/docs (accessed 1 November 2026).',
      '[2] React. Managing State. https://react.dev/learn/managing-state (accessed 1 November 2026).',
      '[3] Microsoft. TypeScript Handbook. https://www.typescriptlang.org/docs/handbook/ (accessed 1 November 2026).',
      '[4] Vite. Env Variables and Modes. https://vite.dev/guide/env-and-mode (accessed 1 November 2026).',
      '[5] Tailwind CSS. Install with Vite. https://tailwindcss.com/docs/installation/using-vite (accessed 1 November 2026).',
      '[6] Docker. Dockerfile reference. https://docs.docker.com/reference/dockerfile/ (accessed 1 November 2026).',
      '[7] Nginx. Beginner’s Guide. https://nginx.org/en/docs/beginners_guide.html (accessed 1 November 2026).',
      '[8] Debener et al. Detecting insurance fraud using supervised and unsupervised machine learning. Journal of Risk and Insurance, 90(3), 2023. https://doi.org/10.1111/jori.12427.',
      '[9] Schrijver et al. Automobile insurance fraud detection using data mining: a systematic literature review. Intelligent Systems with Applications, 21, 2024. https://doi.org/10.1016/j.iswa.2024.200340.',
      '[10] Project source: `src/services/prediction.ts`, `gemini.ts`, `geminiKey.ts`, `utils/validation.ts`, `src/types.ts`, components and root deployment configuration.',
    ]
    for ref in refs:
        p = doc.add_paragraph()
        p.paragraph_format.left_indent = Inches(0.2)
        p.paragraph_format.first_line_indent = Inches(-0.2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.0
        set_run_font(p.add_run(ref), 9.5, color=DARK)

    doc.core_properties.title = 'Insurance Fraud Claim Detection System Using Google Gemini AI'
    doc.core_properties.subject = 'Condensed B.Tech project report'
    doc.core_properties.author = 'Vipul Srivastava'
    doc.core_properties.keywords = 'insurance fraud, React, TypeScript, Gemini, heuristic scoring'
    doc.save(DOCX_PATH)
    print(f'Created compact report: {DOCX_PATH}')


if __name__ == '__main__':
    if len(sys.argv) == 3 and sys.argv[1] == '--update-toc':
        update_toc(Path(sys.argv[2]))
    elif len(sys.argv) == 2 and sys.argv[1] == '--compact':
        build_compact()
    else:
        build()
