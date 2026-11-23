"""
Generates a High-Resolution Print-Ready Academic Research Poster (PNG + PDF)
for EduPulse AI — Student Feedback Emotion Detection & Topic Modeling,
modeled directly on the Brookhaven / Oak Ridge National Lab NLP Poster layout.
"""

import os
import shutil
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PNG_PATH = os.path.join(BASE_DIR, "EduPulse_NLP_Project_Poster.png")
PDF_PATH = os.path.join(BASE_DIR, "EduPulse_NLP_Project_Poster.pdf")
ARTIFACT_PNG = r"C:\Users\piyus\.gemini\antigravity\brain\2c38de55-64ce-4842-a43e-7329456cce2a\EduPulse_NLP_Project_Poster.png"


def draw_box(ax, x, y, w, h, facecolor="#ffffff", edgecolor="#0f172a", lw=1.2, rx=0.007):
    box = FancyBboxPatch(
        (x, y),
        w,
        h,
        boxstyle=f"round,pad=0,rounding_size={rx}",
        facecolor=facecolor,
        edgecolor=edgecolor,
        linewidth=lw,
        zorder=3,
    )
    ax.add_patch(box)
    return box


def draw_section_header(ax, x_center, y, title):
    ax.text(
        x_center,
        y,
        title,
        fontsize=11.5,
        fontweight="bold",
        color="#0f172a",
        ha="center",
        va="top",
        zorder=5,
    )
    half_len = len(title) * 0.0036
    ax.plot(
        [x_center - half_len, x_center + half_len],
        [y - 0.0145, y - 0.0145],
        color="#0f172a",
        lw=1.1,
        zorder=5,
    )


def draw_bullets(ax, x, y_start, heading, items, line_gap=0.014, font_size=7.3):
    y = y_start
    if heading:
        ax.text(
            x,
            y,
            heading,
            fontsize=8.2,
            fontweight="bold",
            color="#0f172a",
            ha="left",
            va="top",
            zorder=5,
        )
        y -= line_gap * 1.05
    for item in items:
        ax.text(
            x + 0.006,
            y,
            f"•  {item}",
            fontsize=font_size,
            color="#1e293b",
            ha="left",
            va="top",
            zorder=5,
        )
        y -= line_gap
    return y - 0.0035


def build_poster():
    fig = plt.figure(figsize=(11, 14.6), dpi=240, facecolor="#ffffff")
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    # =========================================================================
    # 1. TOP HEADER BANNER
    # =========================================================================
    header_rect = patches.Rectangle(
        (0, 0.904), 1.0, 0.096, facecolor="#b8cce4", edgecolor="#8ea9db", lw=1.5, zorder=2
    )
    ax.add_patch(header_rect)

    # Decorative grid squares on top-right
    for gx in range(4):
        for gy in range(4):
            sq = patches.Rectangle(
                (0.79 + gx * 0.013, 0.914 + gy * 0.017),
                0.009,
                0.012,
                facecolor="none",
                edgecolor="#ffffff",
                lw=0.9,
                alpha=0.45,
                zorder=3,
            )
            ax.add_patch(sq)

    # Left & Right institutional badges
    draw_box(ax, 0.015, 0.936, 0.112, 0.048, facecolor="#e0f2fe", edgecolor="#0284c7", lw=1.1, rx=0.005)
    ax.text(0.071, 0.967, "DEPT. OF CSE & AI", fontsize=7.2, fontweight="bold", color="#0369a1", ha="center", va="center", zorder=5)
    ax.text(0.071, 0.949, "NLP RESEARCH LAB", fontsize=6.6, fontweight="bold", color="#0f172a", ha="center", va="center", zorder=5)

    draw_box(ax, 0.873, 0.936, 0.112, 0.048, facecolor="#f0fdf4", edgecolor="#16a34a", lw=1.1, rx=0.005)
    ax.text(0.929, 0.967, "EDUPULSE AI", fontsize=7.8, fontweight="bold", color="#15803d", ha="center", va="center", zorder=5)
    ax.text(0.929, 0.949, "CO1–CO4 RUBRIC", fontsize=6.6, fontweight="bold", color="#0f172a", ha="center", va="center", zorder=5)

    # Main Title & Authors
    ax.text(
        0.5,
        0.980,
        "Applying Natural Language Processing (NLP) techniques on student",
        fontsize=13.4,
        fontweight="bold",
        color="#0f172a",
        ha="center",
        va="top",
        zorder=5,
    )
    ax.text(
        0.5,
        0.958,
        "course feedback to automate emotion detection and topic modeling",
        fontsize=13.4,
        fontweight="bold",
        color="#0f172a",
        ha="center",
        va="top",
        zorder=5,
    )
    ax.text(
        0.5,
        0.934,
        "Piyush¹, NLP Project Team¹, Faculty Mentor²",
        fontsize=9.8,
        fontweight="bold",
        color="#0f172a",
        ha="center",
        va="top",
        zorder=5,
    )
    ax.text(
        0.5,
        0.916,
        "¹Department of Computer Science & Engineering,  ²Natural Language Processing & Affective Computing Division",
        fontsize=8.2,
        color="#1e293b",
        ha="center",
        va="top",
        zorder=5,
    )

    # =========================================================================
    # 2. ROW 1: LEFT = Student Feedback Mining | CENTER = Architecture | RIGHT = Affective Computing
    # =========================================================================
    draw_section_header(ax, 0.17, 0.888, "Student Feedback Mining with NLP")

    y = 0.862
    y = draw_bullets(ax, 0.018, y, "Evaluation volume growing rapidly", [
        "Thousands of student reviews & voice comments per term",
    ])
    y = draw_bullets(ax, 0.018, y, "Traditional star ratings & keyword search are limiting", [
        "Numeric star ratings hide specific course bottlenecks",
        "Standard stopword lists strip negations ('not clear')",
        "Misses contrastive clauses ('good concept, but too long')",
    ])
    y = draw_bullets(ax, 0.018, y, "Natural Language Processing (CO1 & CO2)", [
        "Captures negation context, valence shifters & semantics",
        "Hybrid ensemble: Lexicon + LinearSVC + Neural MLP",
    ])

    # Center Row 1: Topic x Emotion Heatmap + Neural SVD-MLP Block Diagram (Vaswani style)
    draw_box(ax, 0.340, 0.742, 0.108, 0.122, facecolor="#f8fafc", edgecolor="#334155", lw=1.1, rx=0.004)
    ax.text(0.394, 0.854, "Topic × Emotion", fontsize=6.4, fontweight="bold", ha="center", va="center", zorder=5)
    hm_colors = [
        ["#22c55e", "#4ade80", "#fecaca", "#fef08a", "#c4b5fd", "#e2e8f0"],
        ["#4ade80", "#16a34a", "#fca5a5", "#fef3c7", "#a78bfa", "#cbd5e1"],
        ["#dcfce7", "#bbf7d0", "#ef4444", "#f59e0b", "#8b5cf6", "#f1f5f9"],
        ["#dcfce7", "#dcfce7", "#f87171", "#d97706", "#ddd6fe", "#e2e8f0"],
        ["#bbf7d0", "#86efac", "#dc2626", "#fbbf24", "#7c3aed", "#f1f5f9"],
        ["#22c55e", "#15803d", "#fca5a5", "#fef08a", "#c4b5fd", "#cbd5e1"],
    ]
    for r in range(6):
        for c in range(6):
            rect = patches.Rectangle(
                (0.349 + c * 0.015, 0.831 - r * 0.0135),
                0.014,
                0.0125,
                facecolor=hm_colors[r][c],
                edgecolor="#ffffff",
                lw=0.35,
                zorder=4,
            )
            ax.add_patch(rect)
    ax.text(0.394, 0.750, "6 Topics × 6 Emotions", fontsize=5.8, color="#475569", ha="center", va="center", zorder=5)

    # Architecture Block Diagram
    draw_box(ax, 0.456, 0.715, 0.182, 0.166, facecolor="#f8fafc", edgecolor="#475569", lw=1.1, rx=0.005)
    ax.text(0.547, 0.871, "EduPulse Hybrid NLP Architecture", fontsize=6.6, fontweight="bold", color="#0f172a", ha="center", va="center", zorder=5)

    draw_box(ax, 0.476, 0.842, 0.142, 0.018, facecolor="#dcfce7", edgecolor="#16a34a", lw=0.9, rx=0.003)
    ax.text(0.547, 0.851, "Soft-Voting Fusion (96.52% F1)", fontsize=5.8, fontweight="bold", ha="center", va="center", zorder=5)

    # Left sub-stack (LinearSVC) & Right sub-stack (Neural MLP)
    draw_box(ax, 0.464, 0.772, 0.079, 0.062, facecolor="#f1f5f9", edgecolor="#64748b", lw=0.8, rx=0.003)
    draw_box(ax, 0.468, 0.812, 0.071, 0.016, facecolor="#fef08a", edgecolor="#ca8a04", lw=0.7, rx=0.002)
    ax.text(0.5035, 0.820, "Platt LinearSVC", fontsize=5.4, fontweight="bold", ha="center", va="center", zorder=5)
    draw_box(ax, 0.468, 0.780, 0.071, 0.025, facecolor="#fed7aa", edgecolor="#ea580c", lw=0.7, rx=0.002)
    ax.text(0.5035, 0.7925, "Sublinear TF-IDF\n(Word + Bigram)", fontsize=5.1, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.551, 0.772, 0.079, 0.062, facecolor="#f1f5f9", edgecolor="#64748b", lw=0.8, rx=0.003)
    draw_box(ax, 0.555, 0.812, 0.071, 0.016, facecolor="#bae6fd", edgecolor="#0284c7", lw=0.7, rx=0.002)
    ax.text(0.5905, 0.820, "ReLU MLP (64×32)", fontsize=5.4, fontweight="bold", ha="center", va="center", zorder=5)
    draw_box(ax, 0.555, 0.780, 0.071, 0.025, facecolor="#fde047", edgecolor="#ca8a04", lw=0.7, rx=0.002)
    ax.text(0.5905, 0.7925, "Char 3-5 N-Gram\n+ 64D SVD + L2", fontsize=5.1, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.468, 0.742, 0.158, 0.020, facecolor="#fbcfe8", edgecolor="#db2777", lw=0.8, rx=0.003)
    ax.text(0.547, 0.752, "5-Stage Negation-Aware Lemmas + Lexicon", fontsize=5.5, fontweight="bold", ha="center", va="center", zorder=5)
    ax.text(0.547, 0.725, "Inputs: Text  |  Batch CSV  |  16kHz Voice WAV", fontsize=5.4, color="#334155", ha="center", va="center", zorder=5)

    # Highlighted Token Callout Box under Center Diagram
    draw_box(ax, 0.340, 0.652, 0.298, 0.052, facecolor="#f8fafc", edgecolor="#cbd5e1", lw=0.9, rx=0.004)
    ax.text(0.347, 0.695, "Negation Preservation – Contrastive Pivot – Excess Modifier", fontsize=6.4, fontweight="bold", color="#0284c7", ha="left", va="top", zorder=5)
    ax.text(0.347, 0.681, "E = 0.965 • 5-stage token trace in Live NLP Analyzer (FB-1042)", fontsize=5.8, color="#64748b", ha="left", va="top", zorder=5)
    ax.text(0.347, 0.666, "“Good concept [JOY], BUT [2.25×] lecture was TOO LONG [BOREDOM]”", fontsize=6.1, fontweight="bold", color="#b45309", ha="left", va="top", zorder=5)

    # Right Row 1: Affective Computing in Higher Education + 2D Cluster Box
    draw_section_header(ax, 0.818, 0.888, "Affective Computing in Higher Education")
    yr = 0.862
    yr = draw_bullets(ax, 0.655, yr, "Multi-dimensional course feedback", [
        "Spans pedagogy, rubrics, labs & deadlines",
    ])
    yr = draw_bullets(ax, 0.655, yr, "6 Fine-Grained Academic Emotions", [
        "Positive: Joy, Appreciation / Gratitude",
        "Constructive: Confusion, Boredom",
        "Critical: Frustration / Anger, Anxiety",
    ])

    # 2D Semantic Cluster Visual Box on far right of Row 1
    draw_box(ax, 0.892, 0.745, 0.092, 0.115, facecolor="#090b14", edgecolor="#64748b", lw=1.0, rx=0.005)
    ax.text(0.938, 0.851, "2D SVD Clusters", fontsize=5.6, fontweight="bold", color="#e2e8f0", ha="center", va="center", zorder=5)
    cluster_pts = [
        (0.912, 0.822, "#a78bfa"), (0.922, 0.828, "#a78bfa"), (0.916, 0.814, "#a78bfa"),
        (0.958, 0.824, "#4ade80"), (0.966, 0.816, "#4ade80"), (0.954, 0.812, "#4ade80"),
        (0.915, 0.785, "#f87171"), (0.925, 0.790, "#f87171"), (0.920, 0.778, "#f87171"),
        (0.960, 0.786, "#fbbf24"), (0.968, 0.779, "#fbbf24"), (0.955, 0.775, "#fbbf24"),
        (0.938, 0.762, "#22d3ee"), (0.946, 0.766, "#22d3ee"),
    ]
    for px, py, pcol in cluster_pts:
        c_dot = patches.Circle((px, py), 0.0038, facecolor=pcol, edgecolor="none", zorder=6)
        ax.add_patch(c_dot)
    ax.text(0.938, 0.751, "c-TF-IDF: 0.933", fontsize=5.3, color="#94a3b8", ha="center", va="center", zorder=5)

    yr = draw_bullets(ax, 0.655, 0.735, "Crucial research questions addressed", [
        "Which topics trigger Anxiety vs. Confusion?",
        "How do LDA, NMF & c-TF-IDF compare?",
        "What measures should subject teachers take?",
    ])

    # =========================================================================
    # 3. ROW 2: LEFT = Dataset + Tech Badges + Baseline | RIGHT = NLP Pipeline Flowchart + Tables
    # =========================================================================
    draw_section_header(ax, 0.19, 0.630, "Student Feedback & Audio Dataset")
    yd = 0.604
    yd = draw_bullets(ax, 0.018, yd, "Multi-course labeled evaluation corpus (CO1)", [
        "620 verified feedback records across 6 subjects",
        "CS301 NLP, CS302 ML, CS405 DL, CS204, EC201, MA202",
        "Stratified 78% Train (483) / 22% Test (137 docs)",
    ])
    yd = draw_bullets(ax, 0.018, yd, "Multi-modal ingestion & speech streams", [
        "Ingests text, bulk CSVs & 16kHz PCM WAV voice audio",
    ])

    # Tech stack badges (2x3 grid)
    badges = [
        ("Python 3.12", "Flask REST API", "#1d4ed8"),
        ("scikit-learn", "SVM • MLP • SVD", "#ea580c"),
        ("React + Vite", "TypeScript SaaS", "#0284c7"),
        ("c-TF-IDF", "LDA • NMF • BERTopic", "#7c3aed"),
        ("WebAudio ASR", "16kHz PCM Speech", "#059669"),
        ("CO1 – CO4", "30-Mark Rubric", "#dc2626"),
    ]
    for idx, (b_title, b_sub, b_col) in enumerate(badges):
        bx = 0.020 + (idx % 3) * 0.118
        by = 0.452 - (idx // 3) * 0.042
        draw_box(ax, bx, by, 0.108, 0.035, facecolor="#f8fafc", edgecolor="#cbd5e1", lw=0.9, rx=0.004)
        ax.text(bx + 0.054, by + 0.022, b_title, fontsize=7.4, fontweight="bold", color=b_col, ha="center", va="center", zorder=5)
        ax.text(bx + 0.054, by + 0.009, b_sub, fontsize=5.9, color="#475569", ha="center", va="center", zorder=5)

    # Baseline Methods Section on Left
    draw_section_header(ax, 0.19, 0.394, "Baseline & Classical NLP Methods")
    yb = 0.368
    yb = draw_bullets(ax, 0.018, yb, "Rule-Based Affective Lexicon & Valence Shifters", [
        "Domain emotion lexicon with 2-token negation flip",
        "Contrastive pivot ('but' -> 2.25×) & excess rules",
    ])
    yb = draw_bullets(ax, 0.018, yb, "Statistical Vectorization & Linear Classifiers", [
        "Sublinear Word+Bigram TF-IDF + Platt LinearSVC",
        "Probabilistic LDA & Frobenius NMF decomposition",
    ])

    # Right Row 2: NLP Model Development Pipeline Flowchart + Benchmark Tables
    draw_section_header(ax, 0.685, 0.630, "NLP Model Development Pipeline")

    # Pipeline Boxes (1-2-3-4 numbered diagram)
    draw_box(ax, 0.395, 0.555, 0.112, 0.040, facecolor="#ffffff", edgecolor="#0f172a", lw=1.3)
    ax.text(0.451, 0.575, "5-Stage NLP\nPreprocessing", fontsize=7.2, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.395, 0.488, 0.112, 0.040, facecolor="#ffffff", edgecolor="#0f172a", lw=1.3)
    ax.text(0.451, 0.508, "Domain-Tuned\nEmotion Models", fontsize=7.2, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.395, 0.420, 0.112, 0.040, facecolor="#ffffff", edgecolor="#0f172a", lw=1.3)
    ax.text(0.451, 0.440, "Unsupervised\nTopic Models", fontsize=7.2, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.550, 0.550, 0.120, 0.048, facecolor="#f8fafc", edgecolor="#0f172a", lw=1.3)
    ax.text(0.610, 0.574, "Student Corpus\n620 Docs + CSV\n+ 16kHz Voice WAV", fontsize=6.8, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.550, 0.480, 0.120, 0.042, facecolor="#f8fafc", edgecolor="#0f172a", lw=1.3)
    ax.text(0.610, 0.501, "TF-IDF, Subword\n& 64D SVD Vectors", fontsize=6.8, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.692, 0.480, 0.112, 0.042, facecolor="#ffffff", edgecolor="#0f172a", lw=1.3)
    ax.text(0.748, 0.501, "Valence Lexicon\n& Cloud Speech ASR", fontsize=6.6, fontweight="bold", ha="center", va="center", zorder=5)

    draw_box(ax, 0.620, 0.410, 0.145, 0.046, facecolor="#f0fdf4", edgecolor="#15803d", lw=1.4)
    ax.text(0.6925, 0.433, "Pedagogical Action\n& Analytics Service\n(Flask + React UI)", fontsize=6.8, fontweight="bold", color="#0f172a", ha="center", va="center", zorder=5)

    arrow_kw = dict(arrowstyle="->", color="#0f172a", lw=1.3, zorder=4)
    ax.annotate("", xy=(0.451, 0.528), xytext=(0.451, 0.555), arrowprops=arrow_kw)
    ax.annotate("", xy=(0.451, 0.460), xytext=(0.451, 0.488), arrowprops=arrow_kw)
    ax.annotate("", xy=(0.507, 0.515), xytext=(0.550, 0.565), arrowprops=arrow_kw)
    ax.annotate("", xy=(0.610, 0.522), xytext=(0.610, 0.550), arrowprops=arrow_kw)
    ax.annotate("", xy=(0.507, 0.445), xytext=(0.550, 0.492), arrowprops=arrow_kw)
    ax.annotate("", xy=(0.620, 0.432), xytext=(0.507, 0.438), arrowprops=arrow_kw)

    for num, cx, cy in [("1", 0.528, 0.542), ("2", 0.626, 0.536), ("3", 0.528, 0.470), ("4", 0.564, 0.435)]:
        circ = patches.Circle((cx, cy), 0.010, facecolor="#ffffff", edgecolor="#0f172a", lw=1.1, zorder=6)
        ax.add_patch(circ)
        ax.text(cx, cy, num, fontsize=6.8, fontweight="bold", ha="center", va="center", zorder=7)

    # Right bullets beside flowchart
    yp = 0.598
    yp = draw_bullets(ax, 0.815, yp, "Tiered NLP Approach", [
        "1. Expand clitics & keep negations",
        "2. Extract TF-IDF & 64D SVD",
        "3. Emotion & Topic Clustering",
        "4. Subject Teacher Action Plan",
    ], line_gap=0.014, font_size=6.7)
    yp = draw_bullets(ax, 0.815, yp, "Automated Annotation", [
        "Batch CSV & Voice ASR studio",
        "Export annotated evaluations",
    ], line_gap=0.014, font_size=6.7)

    # Benchmark Results Tables under Pipeline (Table 1 & Table 2)
    draw_box(ax, 0.395, 0.285, 0.310, 0.108, facecolor="#f8fafc", edgecolor="#cbd5e1", lw=0.9, rx=0.004)
    ax.text(0.402, 0.385, "Table 1: Emotion Detection Benchmarks (Held-Out Test, N=137)", fontsize=6.5, fontweight="bold", color="#0284c7", ha="left", va="top", zorder=5)
    t1_rows = [
        ("Model Architecture", "Acc.", "Prec.", "Rec.", "F1"),
        ("Affective Lexicon (Valence)", "82.5%", "85.1%", "83.9%", "84.4%"),
        ("Deep Neural MLP (64D SVD)", "93.4%", "93.6%", "93.3%", "93.4%"),
        ("Classical ML (LinearSVC)", "94.9%", "95.6%", "95.2%", "95.4%"),
        ("Hybrid Ensemble (Best)", "96.4%", "96.7%", "96.4%", "96.5%"),
    ]
    for r_idx, row in enumerate(t1_rows):
        ry = 0.366 - r_idx * 0.0175
        weight = "bold" if r_idx in (0, 4) else "normal"
        col = "#15803d" if r_idx == 4 else "#0f172a"
        ax.text(0.402, ry, row[0], fontsize=6.0, fontweight=weight, color=col, ha="left", va="top", zorder=5)
        ax.text(0.580, ry, row[1], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)
        ax.text(0.618, ry, row[2], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)
        ax.text(0.656, ry, row[3], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)
        ax.text(0.696, ry, row[4], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)

    draw_box(ax, 0.715, 0.285, 0.268, 0.108, facecolor="#f8fafc", edgecolor="#cbd5e1", lw=0.9, rx=0.004)
    ax.text(0.722, 0.385, "Table 2: Topic Models (K=6 Topics)", fontsize=6.5, fontweight="bold", color="#0284c7", ha="left", va="top", zorder=5)
    t2_rows = [
        ("Topic Algorithm", "Coher.", "Diver.", "Silh."),
        ("LDA (Dirichlet Priors)", "0.732", "93.3%", "0.184"),
        ("NMF (Frobenius TF-IDF)", "0.954", "100%", "0.296"),
        ("BERTopic (SVD+c-TF-IDF)", "0.933", "96.7%", "0.412"),
    ]
    for r_idx, row in enumerate(t2_rows):
        ry = 0.366 - r_idx * 0.0205
        weight = "bold" if r_idx in (0, 3) else "normal"
        col = "#4f46e5" if r_idx == 3 else "#0f172a"
        ax.text(0.722, ry, row[0], fontsize=6.0, fontweight=weight, color=col, ha="left", va="top", zorder=5)
        ax.text(0.888, ry, row[1], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)
        ax.text(0.932, ry, row[2], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)
        ax.text(0.974, ry, row[3], fontsize=6.0, fontweight=weight, color=col, ha="right", va="top", zorder=5)

    # =========================================================================
    # 4. ROW 3: BOTTOM LEFT = New NLP and AI Approaches | BOTTOM RIGHT = Impact & Ongoing Work
    # =========================================================================
    draw_section_header(ax, 0.33, 0.262, "New NLP and AI Approaches (CO3 & CO4)")

    # Mini Dashboard UI Mockup Box on Bottom-Left
    draw_box(ax, 0.018, 0.055, 0.282, 0.182, facecolor="#ffffff", edgecolor="#64748b", lw=1.1, rx=0.005)
    top_ui = patches.Rectangle((0.018, 0.219), 0.282, 0.018, facecolor="#0f172a", zorder=4)
    ax.add_patch(top_ui)
    ax.text(0.025, 0.228, "EduPulse AI • Live NLP & Voice Studio", fontsize=6.3, fontweight="bold", color="#ffffff", ha="left", va="center", zorder=5)
    ax.text(0.294, 0.228, "● API Online", fontsize=6.1, fontweight="bold", color="#4ade80", ha="right", va="center", zorder=5)

    draw_box(ax, 0.025, 0.145, 0.268, 0.066, facecolor="#f8fafc", edgecolor="#cbd5e1", lw=0.7, rx=0.003)
    ax.text(0.031, 0.203, "CS405 – Deep Learning (Workload & Deadlines)", fontsize=6.1, fontweight="bold", color="#0284c7", ha="left", va="top", zorder=5)
    ax.text(0.031, 0.188, "“Assigning three heavy coding projects and a midterm", fontsize=5.8, color="#334155", ha="left", va="top", zorder=5)
    ax.text(0.031, 0.176, "in the same week causes severe exam anxiety.”", fontsize=5.8, color="#334155", ha="left", va="top", zorder=5)
    ax.text(0.031, 0.158, "Detected Emotion: Anxiety / Stress (96.7%)", fontsize=6.0, fontweight="bold", color="#d97706", ha="left", va="top", zorder=5)

    draw_box(ax, 0.025, 0.065, 0.268, 0.072, facecolor="#f0fdf4", edgecolor="#86efac", lw=0.8, rx=0.003)
    ax.text(0.031, 0.129, "Automated Subject-Wise Teacher Directive (CO4):", fontsize=6.1, fontweight="bold", color="#15803d", ha="left", va="top", zorder=5)
    ax.text(0.031, 0.114, "• Coordinate cross-course deadline calendar before exams", fontsize=5.7, color="#1e293b", ha="left", va="top", zorder=5)
    ax.text(0.031, 0.100, "• Split monolithic projects into bi-weekly milestones", fontsize=5.7, color="#1e293b", ha="left", va="top", zorder=5)
    ax.text(0.031, 0.086, "• Grant 2–3 flexible slip days to prevent student burnout", fontsize=5.7, color="#1e293b", ha="left", va="top", zorder=5)

    # Middle column bullets under New NLP and AI Approaches
    yn = 0.236
    yn = draw_bullets(ax, 0.314, yn, "Subword Neural & Hybrid Emotion Classification", [
        "Char 3–5 N-Gram + 64D SVD + ReLU MLP (64×32)",
        "Adaptive soft-voting ensemble achieves 96.52% F1",
    ])
    yn = draw_bullets(ax, 0.314, yn, "BERTopic-Style Semantic Clustering (c-TF-IDF)", [
        "32D L2-normalized SVD vectors + Cosine K-Means",
        "Class-based TF-IDF: w_{t,c} = tf_{t,c} · log(1 + A/tf_t)",
    ])
    yn = draw_bullets(ax, 0.314, yn, "Voice Recognition & Subject Teacher Planner", [
        "16kHz PCM WAV WebAudio + Google Cloud ASR",
        "Synthesizes subject-wise faculty action plans",
    ])

    # Bottom Right: Impact and Ongoing Work
    draw_section_header(ax, 0.825, 0.262, "Impact and Ongoing Work")
    yi = 0.236
    yi = draw_bullets(ax, 0.665, yi, "Actionable intelligence for higher education", [
        "Transforms reviews & voice audio into action plans",
        "Pinpoints bottlenecks via 6×6 Topic×Emotion matrix",
    ])
    yi = draw_bullets(ax, 0.665, yi, "Unified Full-Stack SaaS Platform (7 Modules)", [
        "Live NLP Analyzer, Voice Studio, Analytics Dashboard,",
        "Topic Lab, Model Benchmarks & Batch CSV Studio",
    ])

    ax.text(0.825, 0.086, "edupulse-ai-nlp.onrender.com", fontsize=11.5, fontweight="bold", color="#0284c7", ha="center", va="top", zorder=5)
    ax.text(0.825, 0.066, "(Full-Stack React + Flask NLP Cloud Deployment)", fontsize=7.8, fontweight="bold", color="#334155", ha="center", va="top", zorder=5)

    # =========================================================================
    # 5. BOTTOM FOOTER BANNER
    # =========================================================================
    footer_rect = patches.Rectangle((0, 0), 1.0, 0.042, facecolor="#2e1065", edgecolor="none", zorder=2)
    ax.add_patch(footer_rect)
    ax.text(
        0.5,
        0.021,
        "INTELLIGENT ACADEMIC NLP & AFFECTIVE COMPUTING INITIATIVE",
        fontsize=17.5,
        fontweight="bold",
        color="#ffffff",
        alpha=0.24,
        ha="center",
        va="center",
        zorder=4,
    )

    fig.savefig(PNG_PATH, dpi=240)
    fig.savefig(PDF_PATH)
    plt.close(fig)

    if os.path.exists(os.path.dirname(ARTIFACT_PNG)):
        shutil.copyfile(PNG_PATH, ARTIFACT_PNG)
    print(f"Saved high-res PNG poster: {PNG_PATH}")
    print(f"Saved print-ready PDF poster: {PDF_PATH}")


if __name__ == "__main__":
    build_poster()
