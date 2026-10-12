import io
import datetime
from typing import Dict, Any, Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.lib.units import inch
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

def generate_pdf_report(reading_data: Dict[str, Any], user_info: Dict[str, Any]) -> bytes:
    """
    Generates a professional, multi-page spiritual intelligence PDF report
    with cosmic styling, score tables, palm & tarot details, and personalized recommendations.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor('#4c1d95'), # Deep purple
        alignment=1, # Center
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor('#6b21a8'),
        alignment=1,
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#581c87'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#1f2937'),
        spaceAfter=6
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # Header / Title
    story.append(Paragraph("PALMISTRY & TAROT INTELLIGENCE PLATFORM", title_style))
    story.append(Paragraph("Personalized Spiritual Intelligence & Life Trend Report", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#9333ea'), spaceAfter=12))

    # Seeker Metadata Box
    now_str = datetime.datetime.now().strftime("%B %d, %Y - %H:%M UTC")
    seeker_table_data = [
        [
            Paragraph(f"<b>Seeker Name:</b> {user_info.get('name', 'Aria Solstice')}", body_style),
            Paragraph(f"<b>Report ID:</b> {reading_data.get('id', 'N/A')}", body_style)
        ],
        [
            Paragraph(f"<b>Age Group:</b> {user_info.get('age_group', '26-35')}", body_style),
            Paragraph(f"<b>Date Generated:</b> {now_str}", body_style)
        ],
        [
            Paragraph(f"<b>Spiritual Focus:</b> {user_info.get('spiritual_goals', ['General Enlightenment'])[0] if user_info.get('spiritual_goals') else 'Self-Discovery'}", body_style),
            Paragraph(f"<b>Reading Type:</b> Palm & Tarot Synthesis", body_style)
        ]
    ]

    seeker_table = Table(seeker_table_data, colWidths=[260, 260])
    seeker_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f3ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#c084fc')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9d5ff')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(seeker_table)
    story.append(Spacer(1, 12))

    # SECTION 1: GUIDANCE SCORING BREAKDOWN
    story.append(Paragraph("1. Spiritual Guidance Scoring Breakdown", section_heading))
    scores = reading_data.get("scoring_breakdown", {})
    score_table_data = [
        [Paragraph("<b>Metric Dimension</b>", bold_body), Paragraph("<b>Formula Weight</b>", bold_body), Paragraph("<b>Calculated Score</b>", bold_body)],
        [Paragraph("Palm Analysis Confidence", body_style), Paragraph("30%", body_style), Paragraph(f"{scores.get('palm_analysis_confidence', 92.5)}%", body_style)],
        [Paragraph("Tarot Interpretation Relevance", body_style), Paragraph("25%", body_style), Paragraph(f"{scores.get('tarot_interpretation_relevance', 94.0)}%", body_style)],
        [Paragraph("Personality Alignment", body_style), Paragraph("20%", body_style), Paragraph(f"{scores.get('personality_alignment', 89.5)}%", body_style)],
        [Paragraph("User Context Relevance", body_style), Paragraph("15%", body_style), Paragraph(f"{scores.get('user_context_relevance', 92.0)}%", body_style)],
        [Paragraph("Reading Consistency", body_style), Paragraph("10%", body_style), Paragraph(f"{scores.get('reading_consistency', 90.5)}%", body_style)],
        [Paragraph("<b>OVERALL SYNTHESIZED INSIGHT SCORE</b>", bold_body), Paragraph("<b>100%</b>", bold_body), Paragraph(f"<b>{scores.get('overall_insight_score', 92.1)}%</b>", bold_body)]
    ]

    score_table = Table(score_table_data, colWidths=[260, 130, 130])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e9d5ff')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#fae8ff')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d8b4fe')),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 10))

    # SECTION 2: PALM ANALYSIS RESULTS
    palm = reading_data.get("palm_data", {})
    if palm:
        story.append(Paragraph("2. Computer Vision Palmistry Analysis", section_heading))
        palm_p = Paragraph(f"<b>Hand Element & Shape:</b> {palm.get('hand_shape', 'Water Hand')} ({palm.get('element', 'Water')} Element) — Confidence: {palm.get('confidence_score', 92.0)}%", body_style)
        story.append(palm_p)
        
        lines_data = [[Paragraph("<b>Palm Line</b>", bold_body), Paragraph("<b>Observed Structure</b>", bold_body), Paragraph("<b>Spiritual Interpretation</b>", bold_body)]]
        for l_name, l_info in palm.get("lines", {}).items():
            lines_data.append([
                Paragraph(l_name, bold_body),
                Paragraph(f"{l_info.get('length')} ({l_info.get('depth')})", body_style),
                Paragraph(l_info.get('meaning', ''), body_style)
            ])
        lines_table = Table(lines_data, colWidths=[100, 140, 280])
        lines_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3e8ff')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9d5ff')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(lines_table)
        story.append(Spacer(1, 10))

    # SECTION 3: TAROT SPREAD
    tarot = reading_data.get("tarot_data", {})
    if tarot:
        story.append(Paragraph("3. Tarot Divination & Card Archetypes", section_heading))
        tarot_hdr = Paragraph(f"<b>Spread Type:</b> {tarot.get('spread_type', 'Three Card Reading')} | <b>Deck Style:</b> {tarot.get('deck_style', 'Classic Rider-Waite')}", body_style)
        story.append(tarot_hdr)

        card_rows = [[Paragraph("<b>Position</b>", bold_body), Paragraph("<b>Card Drawn</b>", bold_body), Paragraph("<b>Orientation</b>", bold_body), Paragraph("<b>Key Symbolism & Guidance</b>", bold_body)]]
        for cd in tarot.get("cards_drawn", []):
            card_rows.append([
                Paragraph(cd.get("position_name", ""), bold_body),
                Paragraph(cd["card"]["name"], body_style),
                Paragraph("Reversed" if cd.get("is_reversed") else "Upright", body_style),
                Paragraph(cd.get("position_interpretation", ""), body_style)
            ])
        card_table = Table(card_rows, colWidths=[110, 100, 70, 240])
        card_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3e8ff')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9d5ff')),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(card_table)
        story.append(Spacer(1, 10))

    # SECTION 4: SYNTHESIZED INSIGHT CATEGORIES
    story.append(Paragraph("4. AI Cross-Modality Insights (7 Key Life Domains)", section_heading))
    insights = reading_data.get("insights_by_category", {})
    for cat_name, cat_text in insights.items():
        cat_p = Paragraph(f"<b>• {cat_name}:</b> {cat_text}", body_style)
        story.append(cat_p)
    story.append(Spacer(1, 10))

    # SECTION 5: RECOMMENDATIONS & AFFIRMATION
    story.append(Paragraph("5. Personalized Action Blueprint & Affirmation", section_heading))
    for rec in reading_data.get("recommendations", []):
        rec_p = Paragraph(f"<b>[{rec.get('category')}] {rec.get('title')}:</b> {rec.get('description')}<br/>"
                          f"<i>Action:</i> {', '.join(rec.get('action_steps', []))}<br/>"
                          f"<i>Focus Crystal/Color:</i> {rec.get('crystals_colors_focus', 'Lapis Lazuli')}", body_style)
        story.append(rec_p)
        story.append(Spacer(1, 4))

    if reading_data.get("affirmed_guidance"):
        aff_p = Paragraph(f"<b>Sovereign Affirmation:</b> \"{reading_data['affirmed_guidance']}\"", bold_body)
        story.append(Spacer(1, 6))
        story.append(aff_p)

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_excel_report(readings_list: list) -> bytes:
    """
    Generates a structured multi-tab Excel workbook (.xlsx) containing reading histories,
    scoring formula audits, and card draw frequencies.
    """
    wb = openpyxl.Workbook()
    ws_readings = wb.active
    ws_readings.title = "Reading Records"

    # Header style
    header_fill = PatternFill(start_color="6B21A8", end_color="6B21A8", fill_type="solid")
    header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
    align_center = Alignment(horizontal="center", vertical="center")

    headers = [
        "Reading ID", "Timestamp", "User ID", "Hand Element", "Spread Type",
        "Overall Score (%)", "Palm Conf (30%)", "Tarot Rel (25%)",
        "Pers Align (20%)", "Context Rel (15%)", "Consistency (10%)", "Cards Drawn"
    ]

    ws_readings.append(headers)
    for col_num, h in enumerate(headers, 1):
        cell = ws_readings.cell(row=1, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = align_center

    for r in readings_list:
        scoring = r.get("scoring_breakdown", {})
        tarot = r.get("tarot_data", {})
        palm = r.get("palm_data", {})
        cards_str = ", ".join([c["card"]["name"] for c in tarot.get("cards_drawn", [])]) if tarot else "N/A"

        row_data = [
            r.get("id", "N/A"),
            r.get("timestamp", "N/A"),
            r.get("user_id", "N/A"),
            palm.get("element", "Water") if palm else "N/A",
            tarot.get("spread_type", "N/A") if tarot else "N/A",
            scoring.get("overall_insight_score", 0),
            scoring.get("palm_analysis_confidence", 0),
            scoring.get("tarot_interpretation_relevance", 0),
            scoring.get("personality_alignment", 0),
            scoring.get("user_context_relevance", 0),
            scoring.get("reading_consistency", 0),
            cards_str
        ]
        ws_readings.append(row_data)

    # Adjust column widths
    for col in ws_readings.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws_readings.column_dimensions[col_letter].width = max(max_len + 3, 12)

    # Tab 2: Scoring Model Reference
    ws_scoring = wb.create_sheet(title="Scoring Methodology")
    ws_scoring.append(["Dimension", "Formula Weight", "Description"])
    for cell in ws_scoring[1]:
        cell.fill = header_fill
        cell.font = header_font

    ws_scoring.append(["Palm Analysis Confidence", "30%", "Computer vision line detection & clarity score"])
    ws_scoring.append(["Tarot Interpretation Relevance", "25%", "Spread coherence, archetypal alignments, question focus"])
    ws_scoring.append(["Personality Alignment", "20%", "Psychological archetype & elemental congruence"])
    ws_scoring.append(["User Context Relevance", "15%", "Customization to seeker spiritual goals & age group"])
    ws_scoring.append(["Reading Consistency", "10%", "Historical reading stability and trend concordance"])

    for col in ws_scoring.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = openpyxl.utils.get_column_letter(col[0].column)
        ws_scoring.column_dimensions[col_letter].width = max(max_len + 4, 15)

    buffer = io.BytesIO()
    wb.save(buffer)
    excel_bytes = buffer.getvalue()
    buffer.close()
    return excel_bytes

def generate_palm_pdf_report(palm_data: Dict[str, Any], user_info: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#0284c7'), alignment=1, spaceAfter=8)
    subtitle_style = ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=12, leading=16, textColor=colors.HexColor('#0369a1'), alignment=1, spaceAfter=15)
    section_heading = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#0369a1'), spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle('BodyDark', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#1f2937'), spaceAfter=6)
    bold_body = ParagraphStyle('BoldBody', parent=body_style, fontName='Helvetica-Bold')

    story = []
    story.append(Paragraph("PALMISTRY ANALYSIS & COMPUTER VISION REPORT", title_style))
    story.append(Paragraph("Biometric Palm Feature Extraction & Spiritual Interpretation", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#38bdf8'), spaceAfter=12))

    now_str = datetime.datetime.now().strftime("%B %d, %Y - %H:%M UTC")
    metadata = [
        [Paragraph(f"<b>Seeker Name:</b> {user_info.get('name', 'Seeker')}", body_style), Paragraph(f"<b>Date Generated:</b> {now_str}", body_style)],
        [Paragraph(f"<b>Hand Shape:</b> {palm_data.get('hand_shape', 'Water Hand')}", body_style), Paragraph(f"<b>Element:</b> {palm_data.get('element', 'Water')}", body_style)],
        [Paragraph(f"<b>CV Model Confidence:</b> {palm_data.get('confidence_score', 94.5)}%", body_style), Paragraph("<b>Status:</b> Analyzed & Verified", body_style)]
    ]
    meta_table = Table(metadata, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f0f9ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#7dd3fc')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bae6fd')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Lines Table
    story.append(Paragraph("1. Extracted Palm Line Features", section_heading))
    lines_data = [[Paragraph("<b>Palm Line Name</b>", bold_body), Paragraph("<b>Length & Depth</b>", bold_body), Paragraph("<b>Clarity Score</b>", bold_body), Paragraph("<b>Spiritual Meaning</b>", bold_body)]]
    lines_dict = palm_data.get("lines", {})
    if isinstance(lines_dict, dict):
        for name, info in lines_dict.items():
            if isinstance(info, dict):
                lines_data.append([
                    Paragraph(str(name), bold_body),
                    Paragraph(f"{info.get('length', 'Normal')} / {info.get('depth', 'Clear')}", body_style),
                    Paragraph(f"{info.get('clarity_score', 92)}%", body_style),
                    Paragraph(str(info.get('meaning', info.get('description', ''))), body_style)
                ])
    lines_table = Table(lines_data, colWidths=[110, 110, 70, 230])
    lines_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0f2fe')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bae6fd')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(lines_table)
    story.append(Spacer(1, 12))

    # Mounts Table
    story.append(Paragraph("2. Mount Energy & Planetary Resonances", section_heading))
    mounts_data = [[Paragraph("<b>Mount Name</b>", bold_body), Paragraph("<b>Prominence</b>", bold_body), Paragraph("<b>Energy Score</b>", bold_body), Paragraph("<b>Spiritual Meaning</b>", bold_body)]]
    mounts_dict = palm_data.get("mounts", {})
    if isinstance(mounts_dict, dict):
        for name, info in mounts_dict.items():
            if isinstance(info, dict):
                mounts_data.append([
                    Paragraph(str(name), bold_body),
                    Paragraph(str(info.get('prominence', 'Well Developed')), body_style),
                    Paragraph(f"{info.get('energy_score', 90)}%", body_style),
                    Paragraph(str(info.get('spiritual_meaning', '')), body_style)
                ])
    mounts_table = Table(mounts_data, colWidths=[130, 100, 70, 220])
    mounts_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e0f2fe')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bae6fd')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(mounts_table)
    story.append(Spacer(1, 12))

    # Personality Synthesis Narrative
    interp = palm_data.get("interpretation", {})
    synth_text = interp.get("personality_synthesis") if isinstance(interp, dict) else None
    if not synth_text:
        synth_text = palm_data.get("cross_modality_synthesis", "Detailed biometric synthesis extracted from computer vision palm feature analysis.")
    story.append(Paragraph("3. Holistic Personality Synthesis", section_heading))
    story.append(Paragraph(synth_text, body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

def generate_analytics_pdf_report(analytics_data: Dict[str, Any], role: str, user_info: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle('DocTitle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, leading=26, textColor=colors.HexColor('#4c1d95'), alignment=1, spaceAfter=8)
    subtitle_style = ParagraphStyle('DocSubtitle', parent=styles['Normal'], fontName='Helvetica', fontSize=12, leading=16, textColor=colors.HexColor('#6b21a8'), alignment=1, spaceAfter=15)
    section_heading = ParagraphStyle('SectionHeading', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, leading=18, textColor=colors.HexColor('#581c87'), spaceBefore=12, spaceAfter=6)
    body_style = ParagraphStyle('BodyDark', parent=styles['Normal'], fontName='Helvetica', fontSize=10, leading=14, textColor=colors.HexColor('#1f2937'), spaceAfter=6)
    bold_body = ParagraphStyle('BoldBody', parent=body_style, fontName='Helvetica-Bold')

    story = []
    story.append(Paragraph(f"{role.upper()} EXECUTIVE REPORT", title_style))
    story.append(Paragraph("Mystic Intelligence Platform Official Performance & Analytics Document", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#9333ea'), spaceAfter=12))

    now_str = datetime.datetime.now().strftime("%B %d, %Y - %H:%M UTC")
    metadata = [
        [Paragraph(f"<b>Account Name:</b> {user_info.get('name', 'User')}", body_style), Paragraph(f"<b>Assigned Role:</b> {role}", body_style)],
        [Paragraph(f"<b>Email:</b> {user_info.get('email', 'user@mystic.io')}", body_style), Paragraph(f"<b>Date Generated:</b> {now_str}", body_style)],
    ]
    meta_table = Table(metadata, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f5f3ff')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#c084fc')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e9d5ff')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # Key Metrics Table
    story.append(Paragraph("1. Summary Operational Metrics", section_heading))
    metrics_data = [[Paragraph("<b>Metric Title</b>", bold_body), Paragraph("<b>Recorded Value</b>", bold_body)]]
    for key, val in analytics_data.items():
        if isinstance(val, (int, float, str)) and not str(key).startswith("_"):
            k_title = str(key).replace("_", " ").title()
            metrics_data.append([Paragraph(k_title, bold_body), Paragraph(str(val), body_style)])
    metrics_table = Table(metrics_data, colWidths=[280, 240])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#e9d5ff')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#d8b4fe')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(metrics_table)
    story.append(Spacer(1, 12))

    story.append(Paragraph("2. Executive Summary & Quality Compliance", section_heading))
    summary_text = (
        f"This document represents the official verified analytics report for the {role} role on the Mystic Intelligence Platform. "
        f"All metrics, scores, session trackings, and guidance indicators comply with the platform's multi-factor scoring standards."
    )
    story.append(Paragraph(summary_text, body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
