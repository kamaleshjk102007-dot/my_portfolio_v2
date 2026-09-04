from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)


OUTPUT = r"D:\mkm\output\pdf\Kamalesh-J-Resume.pdf"

PAGE_W, PAGE_H = A4
MARGIN_X = 16 * mm
MARGIN_Y = 14 * mm
RED = colors.HexColor("#ef203b")
RED_DARK = colors.HexColor("#8d1025")
INK = colors.HexColor("#171317")
MUTED = colors.HexColor("#625b62")
RULE = colors.HexColor("#ddd5d8")
SOFT = colors.HexColor("#f6f1f2")


def draw_page(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(INK)
    canvas.rect(0, PAGE_H - 8 * mm, PAGE_W, 8 * mm, fill=1, stroke=0)
    canvas.setFillColor(RED)
    canvas.rect(0, PAGE_H - 8 * mm, 58 * mm, 8 * mm, fill=1, stroke=0)
    canvas.setStrokeColor(RULE)
    canvas.setLineWidth(0.6)
    canvas.line(MARGIN_X, 11 * mm, PAGE_W - MARGIN_X, 11 * mm)
    canvas.setFont("Helvetica", 7.5)
    canvas.setFillColor(MUTED)
    canvas.drawString(MARGIN_X, 7 * mm, "KAMALESH J  /  AI & DATA SCIENCE")
    canvas.drawRightString(PAGE_W - MARGIN_X, 7 * mm, f"PAGE {doc.page}")
    canvas.restoreState()


doc = BaseDocTemplate(
    OUTPUT,
    pagesize=A4,
    leftMargin=MARGIN_X,
    rightMargin=MARGIN_X,
    topMargin=15 * mm,
    bottomMargin=15 * mm,
    title="Kamalesh J - Resume",
    author="Kamalesh J",
)
frame = Frame(
    doc.leftMargin,
    doc.bottomMargin,
    doc.width,
    doc.height,
    leftPadding=0,
    rightPadding=0,
    topPadding=0,
    bottomPadding=0,
)
doc.addPageTemplates(PageTemplate(id="resume", frames=[frame], onPage=draw_page))

styles = getSampleStyleSheet()
name_style = ParagraphStyle(
    "Name",
    parent=styles["Title"],
    fontName="Helvetica-Bold",
    fontSize=28,
    leading=29,
    textColor=INK,
    spaceAfter=2 * mm,
)
role_style = ParagraphStyle(
    "Role",
    parent=styles["Normal"],
    fontName="Helvetica-Bold",
    fontSize=9,
    leading=12,
    textColor=RED,
    tracking=1.2,
    uppercase=True,
)
section_style = ParagraphStyle(
    "Section",
    parent=styles["Heading2"],
    fontName="Helvetica-Bold",
    fontSize=10,
    leading=12,
    textColor=RED_DARK,
    spaceBefore=2.7 * mm,
    spaceAfter=1.6 * mm,
    borderPadding=(0, 0, 1.2 * mm, 0),
    borderWidth=0,
)
body_style = ParagraphStyle(
    "Body",
    parent=styles["BodyText"],
    fontName="Helvetica",
    fontSize=8.2,
    leading=11.2,
    textColor=INK,
    spaceAfter=1.4 * mm,
)
small_style = ParagraphStyle(
    "Small",
    parent=body_style,
    fontSize=7.6,
    leading=10,
    textColor=MUTED,
)
item_title = ParagraphStyle(
    "ItemTitle",
    parent=body_style,
    fontName="Helvetica-Bold",
    fontSize=8.7,
    leading=11,
    spaceAfter=0.5 * mm,
)
date_style = ParagraphStyle(
    "Date",
    parent=small_style,
    alignment=TA_RIGHT,
    fontName="Helvetica-Bold",
    textColor=RED_DARK,
)
tag_style = ParagraphStyle(
    "Tag",
    parent=small_style,
    fontName="Helvetica-Bold",
    textColor=INK,
)


def section(title):
    return Table(
        [[Paragraph(title.upper(), section_style)]],
        colWidths=[doc.width],
        style=TableStyle([
            ("LINEBELOW", (0, 0), (-1, -1), 0.8, RED),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1.2 * mm),
        ]),
    )


def dated_item(title, date, description):
    table = Table(
        [[Paragraph(title, item_title), Paragraph(date, date_style)]],
        colWidths=[doc.width * 0.73, doc.width * 0.27],
        style=TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 0),
            ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ("TOPPADDING", (0, 0), (-1, -1), 0),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
        ]),
    )
    return [table, Paragraph(description, small_style)]


story = []
header = Table(
    [[
        [Paragraph("KAMALESH J", name_style), Paragraph("AI & DATA SCIENCE STUDENT", role_style)],
        Paragraph("Madurai, Tamil Nadu<br/><font color='#625b62'>Portfolio resume</font>", ParagraphStyle("Contact", parent=small_style, alignment=TA_RIGHT, leading=11)),
    ]],
    colWidths=[doc.width * 0.68, doc.width * 0.32],
    style=TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "BOTTOM"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2 * mm),
        ("LINEBELOW", (0, 0), (-1, -1), 1.4, INK),
    ]),
)
story.extend([header, Spacer(1, 3 * mm)])

story.extend([
    section("Profile"),
    Spacer(1, 1 * mm),
    Paragraph(
        "Third-year Artificial Intelligence and Data Science student focused on building practical AI, machine-learning, computer-vision, software, and analytics solutions. Curious, hands-on, and comfortable taking ideas from experimentation through implementation and continuous improvement.",
        body_style,
    ),
    section("Education"),
    Spacer(1, 1 * mm),
])
story.extend(dated_item(
    "B.Tech - Artificial Intelligence and Data Science",
    "2024 - Present",
    "Sri Shakthi Institute of Engineering and Technology, Coimbatore, Tamil Nadu. Current year: Third Year.",
))

story.extend([section("Experience"), Spacer(1, 1 * mm)])
story.extend(dated_item(
    "Data Analytics Intern - Thiranex",
    "Jun 2026 - Jul 2026",
    "Prepared and cleaned data, developed interactive dashboards, analyzed business datasets, created visual reports, and identified actionable insights using Python, Power BI, and Microsoft Excel.",
))

story.extend([section("Selected Projects"), Spacer(1, 1 * mm)])
projects = [
    ("ShopFloor AI", "AI-powered workforce and production-management platform covering employee tracking, sales-order management, timers, analytics, automated reporting, voice assistance, and offline synchronization."),
    ("EDITH", "Extensible multi-agent assistant that routes tasks to specialized agents and supports automation, plugins, voice interaction, self-healing workflows, and multiple AI providers."),
    ("SentinelEye V1", "Online exam-monitoring prototype using YOLOv8 and webcam processing to detect suspicious objects and behaviours with sustained-violation alerts."),
    ("Customer Segmentation Dashboard", "K-Means and Power BI solution grouping customers into actionable segments for retention and targeted marketing decisions."),
]
for title, desc in projects:
    story.append(Paragraph(f"<b>{title}</b>  -  {desc}", body_style))

story.extend([section("Technical Skills"), Spacer(1, 1 * mm)])
skills_data = [
    [Paragraph("Programming", tag_style), Paragraph("Python, SQL, JavaScript, Dart", small_style)],
    [Paragraph("AI / ML", tag_style), Paragraph("Machine Learning, Computer Vision, YOLOv8, Gemini, Groq, OpenRouter", small_style)],
    [Paragraph("Development", tag_style), Paragraph("React, Flutter, Node.js, full-stack application development", small_style)],
    [Paragraph("Data", tag_style), Paragraph("Power BI, Microsoft Excel, data cleaning, visualization, analytics", small_style)],
    [Paragraph("Databases", tag_style), Paragraph("MongoDB, SQLite", small_style)],
]
skills_table = Table(skills_data, colWidths=[34 * mm, doc.width - 34 * mm])
skills_table.setStyle(TableStyle([
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BACKGROUND", (0, 0), (0, -1), SOFT),
    ("LINEBELOW", (0, 0), (-1, -2), 0.35, RULE),
    ("LEFTPADDING", (0, 0), (-1, -1), 2.2 * mm),
    ("RIGHTPADDING", (0, 0), (-1, -1), 2.2 * mm),
    ("TOPPADDING", (0, 0), (-1, -1), 1.4 * mm),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.4 * mm),
]))
story.append(skills_table)

story.extend([section("Certifications"), Spacer(1, 1 * mm)])
story.append(Paragraph(
    "<b>AI - Machine Learning Engineer</b> - Skill India / Reliance Foundation",
    body_style,
))
story.append(Paragraph(
    "<b>Microsoft Excel Productivity &amp; Data Analysis</b> - Sri Shakthi Institute of Engineering and Technology",
    body_style,
))

story.extend([section("Highlights"), Spacer(1, 1 * mm)])
highlights = Table(
    [[
        Paragraph("<b>8+</b><br/>Completed projects", small_style),
        Paragraph("<b>15+</b><br/>Certificates", small_style),
        Paragraph("<b>10+</b><br/>Workshops", small_style),
        Paragraph("<b>30+</b><br/>Technical skills", small_style),
    ]],
    colWidths=[doc.width / 4] * 4,
    style=TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), SOFT),
        ("BOX", (0, 0), (-1, -1), 0.6, RULE),
        ("INNERGRID", (0, 0), (-1, -1), 0.6, RULE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3 * mm),
        ("TOPPADDING", (0, 0), (-1, -1), 2.2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.2 * mm),
    ]),
)
story.append(highlights)

doc.build(story)
print(OUTPUT)
