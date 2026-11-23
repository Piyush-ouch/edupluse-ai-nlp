"""
Generates a 16:9 Widescreen University Engineering Poster (PNG + PDF)
containing all 14 required evaluation sections (1. Project Overview through 14. Conclusion)
in a clean, formal academic layout (LaTeX / IEEE conference poster style).
"""

import os
import shutil
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PNG_PATH = os.path.join(BASE_DIR, "EduPulse_NLP_Project_Poster_16x9.png")
PDF_PATH = os.path.join(BASE_DIR, "EduPulse_NLP_Project_Poster_16x9.pdf")
MAIN_PNG_PATH = os.path.join(BASE_DIR, "EduPulse_NLP_Project_Poster.png")
MAIN_PDF_PATH = os.path.join(BASE_DIR, "EduPulse_NLP_Project_Poster.pdf")
ARTIFACT_PNG = r"C:\Users\piyus\.gemini\antigravity\brain\2c38de55-64ce-4842-a43e-7329456cce2a\EduPulse_NLP_Project_Poster_16x9.png"


def draw_section_card(ax, x, y, w, h, title, header_h=0.028):
    """Draws a classic academic poster card with a navy header bar and thin gray border."""
    # Card body
    body = patches.Rectangle(
        (x, y),
        w,
        h,
        facecolor="#ffffff",
        edgecolor="#cbd5e1",
        linewidth=1.1,
        zorder=2,
    )
    ax.add_patch(body)

    # Navy Header Bar
    header = patches.Rectangle(
        (x, y + h - header_h),
        w,
        header_h,
        facecolor="#1b365d",
        edgecolor="#1b365d",
        linewidth=1.0,
        zorder=3,
    )
    ax.add_patch(header)

    # Accent left tab on header
    accent = patches.Rectangle(
        (x, y + h - header_h),
        0.004,
        header_h,
        facecolor="#d97706",
        edgecolor="none",
        zorder=4,
    )
    ax.add_patch(accent)

    ax.text(
        x + 0.009,
        y + h - header_h / 2.0,
        title,
        fontsize=9.2,
        fontweight="bold",
        color="#ffffff",
        ha="left",
        va="center",
        zorder=5,
    )
    return y + h - header_h - 0.010


def draw_lines(ax, x, y_start, lines, line_gap=0.0165, fontsize=7.3):
    """Draws an array of (type, text) tuples inside a section card."""
    y = y_start
    for kind, txt in lines:
        if kind == "bold":
            ax.text(
                x,
                y,
                txt,
                fontsize=fontsize + 0.2,
                fontweight="bold",
                color="#0f172a",
                ha="left",
                va="top",
                zorder=5,
            )
            y -= line_gap * 1.02
        elif kind == "bullet":
            ax.text(
                x + 0.003,
                y,
                f"•  {txt}",
                fontsize=fontsize,
                color="#1e293b",
                ha="left",
                va="top",
                zorder=5,
            )
            y -= line_gap
        elif kind == "sub":
            ax.text(
                x + 0.011,
                y,
                txt,
                fontsize=fontsize - 0.2,
                color="#334155",
                ha="left",
                va="top",
                zorder=5,
            )
            y -= line_gap * 0.94
        elif kind == "num":
            ax.text(
                x + 0.003,
                y,
                txt,
                fontsize=fontsize,
                color="#1e293b",
                ha="left",
                va="top",
                zorder=5,
            )
            y -= line_gap
        else:
            ax.text(
                x,
                y,
                txt,
                fontsize=fontsize,
                color="#1e293b",
                ha="left",
                va="top",
                zorder=5,
            )
            y -= line_gap * 0.96
    return y


def build_16x9_poster():
    # Exact 16:9 Widescreen Aspect Ratio (16 inches x 9 inches at 240 DPI = 3840 x 2160 4K)
    fig = plt.figure(figsize=(16, 9), dpi=240, facecolor="#eef2f6")
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")

    # Background Canvas
    bg = patches.Rectangle((0, 0), 1, 1, facecolor="#eef2f6", edgecolor="none", zorder=0)
    ax.add_patch(bg)

    # =========================================================================
    # TOP ACADEMIC HEADER BANNER (y = 0.895 to 1.000)
    # =========================================================================
    header_bg = patches.Rectangle((0, 0.895), 1.0, 0.105, facecolor="#1b365d", edgecolor="none", zorder=2)
    ax.add_patch(header_bg)
    header_rule = patches.Rectangle((0, 0.891), 1.0, 0.004, facecolor="#d97706", edgecolor="none", zorder=3)
    ax.add_patch(header_rule)

    # Left & Right Academic Info Boxes in Header
    left_box = patches.Rectangle((0.012, 0.910), 0.125, 0.075, facecolor="#152a4a", edgecolor="#475569", lw=1.0, zorder=3)
    ax.add_patch(left_box)
    ax.text(0.0745, 0.963, "COURSE PROJECT", fontsize=7.8, fontweight="bold", color="#fbbf24", ha="center", va="center", zorder=5)
    ax.text(0.0745, 0.944, "Natural Language", fontsize=8.0, fontweight="bold", color="#ffffff", ha="center", va="center", zorder=5)
    ax.text(0.0745, 0.927, "Processing (NLP)", fontsize=8.0, fontweight="bold", color="#ffffff", ha="center", va="center", zorder=5)

    right_box = patches.Rectangle((0.863, 0.910), 0.125, 0.075, facecolor="#152a4a", edgecolor="#475569", lw=1.0, zorder=3)
    ax.add_patch(right_box)
    ax.text(0.9255, 0.963, "RUBRIC MAPPING", fontsize=7.8, fontweight="bold", color="#fbbf24", ha="center", va="center", zorder=5)
    ax.text(0.9255, 0.944, "Course Outcomes:", fontsize=7.8, color="#e2e8f0", ha="center", va="center", zorder=5)
    ax.text(0.9255, 0.927, "CO1 • CO2 • CO3 • CO4", fontsize=8.0, fontweight="bold", color="#4ade80", ha="center", va="center", zorder=5)

    ax.text(
        0.5,
        0.978,
        "STUDENT FEEDBACK EMOTION DETECTION AND TOPIC MODELING USING NATURAL LANGUAGE PROCESSING",
        fontsize=14.2,
        fontweight="bold",
        color="#ffffff",
        ha="center",
        va="top",
        zorder=5,
    )
    ax.text(
        0.5,
        0.949,
        "A Multi-Paradigm Comparison of Classical Statistical ML, Deep Subword Neural Networks, and Unsupervised Topic Discovery",
        fontsize=9.8,
        color="#cbd5e1",
        ha="center",
        va="top",
        zorder=5,
    )
    ax.text(
        0.5,
        0.923,
        "Submitted by: Piyush   |   Department of Computer Science & Engineering   |   Academic Year: 2026–2027",
        fontsize=9.0,
        fontweight="bold",
        color="#fbbf24",
        ha="center",
        va="top",
        zorder=5,
    )

    # 4 Column X-coordinates
    c1_x, c2_x, c3_x, c4_x = 0.010, 0.256, 0.502, 0.748
    col_w = 0.238

    # =========================================================================
    # COLUMN 1: 1. Project Overview | 2. Problem Statement | 3. Objectives | 4. Literature Review
    # =========================================================================

    # 1. Project Overview
    y1 = draw_section_card(ax, c1_x, 0.715, col_w, 0.166, "1. Project Overview")
    draw_lines(ax, c1_x + 0.008, y1, [
        ("text", "Higher education institutions collect thousands of unstructured course"),
        ("text", "evaluations every semester. Traditional numeric ratings fail to capture"),
        ("text", "students' underlying emotional states or specific curriculum bottlenecks."),
        ("bold", "Project Scope:"),
        ("bullet", "Classifies free-text, batch CSVs, and spoken audio feedback into"),
        ("sub", "6 Academic Emotions and 6 Core Pedagogical Topics."),
        ("bullet", "Benchmarks rule-based lexicons, calibrated LinearSVC, and subword"),
        ("sub", "Neural MLPs against LDA, NMF, and BERTopic c-TF-IDF clustering."),
    ], line_gap=0.0152, fontsize=7.1)

    # 2. Problem Statement
    y2 = draw_section_card(ax, c1_x, 0.528, col_w, 0.177, "2. Problem Statement")
    draw_lines(ax, c1_x + 0.008, y2, [
        ("bold", "Existing Challenges:"),
        ("bullet", "Coarse Polarity Bias: Binary sentiment (Positive/Negative) cannot"),
        ("sub", "distinguish student Anxiety from Frustration, Confusion, or Boredom."),
        ("bullet", "Negation Loss: Standard NLP stop-word lists strip 'not' and 'never',"),
        ("sub", "inverting negated phrases (e.g., 'not clear' becomes 'clear')."),
        ("bullet", "Contrastive Clauses: Mixed reviews ('good concept, but too long')"),
        ("sub", "mislead bag-of-words classifiers toward majority-class priors."),
        ("bold", "Research Gap: No unified framework linking unsupervised topics,"),
        ("text", "fine-grained emotions, and subject-wise teacher action plans."),
    ], line_gap=0.0148, fontsize=7.0)

    # 3. Objectives
    y3 = draw_section_card(ax, c1_x, 0.358, col_w, 0.160, "3. Objectives")
    draw_lines(ax, c1_x + 0.008, y3, [
        ("num", "1. Design a 5-stage negation-preserving NLP preprocessing pipeline"),
        ("sub", "with contraction expansion, lemmatization, and n-gram extraction."),
        ("num", "2. Implement and evaluate 4 emotion detection paradigms across"),
        ("sub", "6 academic affective states (Joy, Gratitude, Frustration, Anxiety,"),
        ("sub", "Confusion, Boredom) plus multi-modal 16kHz PCM speech recognition."),
        ("num", "3. Benchmark 3 unsupervised topic models (LDA, NMF, c-TF-IDF)."),
        ("num", "4. Synthesize automated, subject-wise pedagogical action plans."),
    ], line_gap=0.0155, fontsize=7.0)

    # 4. Literature Review
    y4 = draw_section_card(ax, c1_x, 0.036, col_w, 0.312, "4. Literature Review")
    draw_lines(ax, c1_x + 0.008, y4, [
        ("bold", "Prior Work & Identified Limitations:"),
        ("bullet", "Blei et al. (2003) – Latent Dirichlet Allocation (LDA):"),
        ("sub", "Generative bag-of-words topic model; struggles with short, sparse"),
        ("sub", "student comments and exhibits high word overlap across topics."),
        ("bullet", "Lee & Seung (1999) – Non-Negative Matrix Factorization (NMF):"),
        ("sub", "Linear-algebraic TF-IDF decomposition; yields sharp topics but"),
        ("sub", "lacks dense contextual subword similarity representations."),
        ("bullet", "Hutto & Gilbert (2014) – VADER Rule-Based Sentiment:"),
        ("sub", "Handles valence shifters well, but restricted to 1D polarity"),
        ("sub", "rather than multi-class academic emotions (Confusion vs. Anxiety)."),
        ("bullet", "Grootendorst (2022) – BERTopic (Embeddings + c-TF-IDF):"),
        ("sub", "Class-based TF-IDF over semantic clusters; requires adaptation"),
        ("sub", "to cross-tabulate discovered topics with fine-grained emotions."),
        ("bold", "Our Contribution: Combines valence-shifted lexicons, LinearSVC,"),
        ("text", "and subword SVD+MLP with c-TF-IDF topic-emotion co-occurrence."),
    ], line_gap=0.0150, fontsize=6.95)

    # =========================================================================
    # COLUMN 2: 5. Dataset | 6. NLP Preprocessing | 7. Methodology
    # =========================================================================

    # 5. Dataset
    y5 = draw_section_card(ax, c2_x, 0.628, col_w, 0.253, "5. Dataset")
    draw_lines(ax, c2_x + 0.008, y5, [
        ("bullet", "Corpus Size & Split: N = 620 multi-course student evaluations"),
        ("sub", "(Stratified 78% Train = 483 docs | 22% Held-Out Test = 137 docs)."),
        ("bullet", "Academic Subjects (6): CS301 (NLP), CS302 (ML), CS405 (DL),"),
        ("sub", "CS204 (DBMS), EC201 (DSP), and MA202 (Probability & Statistics)."),
        ("bullet", "Additional Test Sets: 36-row & 12-row batch CSV validation files."),
    ], line_gap=0.0148, fontsize=7.0)

    # Mini Horizontal Bar Chart of Emotion & Topic Distribution inside Section 5
    ax.text(c2_x + 0.008, 0.728, "Corpus Emotion Class Distribution (N = 620):", fontsize=7.0, fontweight="bold", color="#1b365d", zorder=5)
    emo_bars = [
        ("Gratitude", 130, "#0284c7"),
        ("Joy / Satisf.", 127, "#16a34a"),
        ("Frustration", 120, "#dc2626"),
        ("Confusion", 112, "#7c3aed"),
        ("Anxiety", 79, "#d97706"),
        ("Boredom", 52, "#64748b"),
    ]
    for idx, (lbl, cnt, col) in enumerate(emo_bars):
        by = 0.708 - idx * 0.0128
        ax.text(c2_x + 0.010, by, lbl, fontsize=6.3, color="#1e293b", ha="left", va="center", zorder=5)
        bar_w = (cnt / 140.0) * 0.135
        rect = patches.Rectangle((c2_x + 0.068, by - 0.004), bar_w, 0.008, facecolor=col, edgecolor="none", zorder=4)
        ax.add_patch(rect)
        ax.text(c2_x + 0.072 + bar_w, by, f"{cnt}", fontsize=6.2, fontweight="bold", color="#0f172a", ha="left", va="center", zorder=5)

    # 6. NLP Preprocessing
    y6 = draw_section_card(ax, c2_x, 0.358, col_w, 0.260, "6. NLP Preprocessing")
    # 5-Stage Horizontal Pipeline Boxes
    stages = [
        ("Stage 1", "Clitic Expand\n& Lowercase"),
        ("Stage 2", "Regex Clean\n& Tokenize"),
        ("Stage 3", "Negation-Safe\nStopwords"),
        ("Stage 4", "Morphological\nLemmatize"),
        ("Stage 5", "Bigrams &\nSVD Vectors"),
    ]
    for s_idx, (st_num, st_lbl) in enumerate(stages):
        sx = c2_x + 0.007 + s_idx * 0.0455
        sy = 0.542
        sbox = FancyBboxPatch((sx, sy), 0.041, 0.036, boxstyle="round,pad=0,rounding_size=0.003", facecolor="#f1f5f9", edgecolor="#1b365d", lw=0.9, zorder=4)
        ax.add_patch(sbox)
        ax.text(sx + 0.0205, sy + 0.027, st_num, fontsize=5.8, fontweight="bold", color="#0284c7", ha="center", va="center", zorder=5)
        ax.text(sx + 0.0205, sy + 0.012, st_lbl, fontsize=5.2, color="#0f172a", ha="center", va="center", zorder=5)
        if s_idx < 4:
            ax.annotate("", xy=(sx + 0.0455, sy + 0.018), xytext=(sx + 0.041, sy + 0.018), arrowprops=dict(arrowstyle="->", color="#1b365d", lw=0.9, zorder=5))

    draw_lines(ax, c2_x + 0.008, 0.528, [
        ("bullet", "Contraction & Elongation Normalization: Expands 'didn't' -> 'did not'"),
        ("sub", "and collapses expressive repetitions ('goood' -> 'good')."),
        ("bullet", "Negation-Preserving Stop-Word Removal: Retains valence shifters"),
        ("sub", "('not', 'no', 'never', 'zero', 'without', 'hardly') during filtering."),
        ("bullet", "Vectorization & Dense Embeddings:"),
        ("sub", "1. CountVectorizer (1,200 BoW features, unigrams + bigrams)."),
        ("sub", "2. Sublinear TF-IDF: (1 + log tf) * (log((1+N)/(1+df)) + 1) (3.5k dim)."),
        ("sub", "3. Subword Char N-Grams (char_wb, n=3..5) + 64D TruncatedSVD + L2."),
    ], line_gap=0.0150, fontsize=6.95)

    # 7. Methodology
    y7 = draw_section_card(ax, c2_x, 0.036, col_w, 0.312, "7. Methodology")
    draw_lines(ax, c2_x + 0.008, y7, [
        ("bold", "A. Multi-Paradigm Emotion Classification Algorithms:"),
        ("num", "1. Affective Lexicon + Valence Shifters: 2-token lookbehind negation"),
        ("sub", "inversion, degree boosters ('very', 'too'), and contrastive discourse"),
        ("sub", "pivot weighting ('but', 'however' -> 0.40x pre / 2.25x post-clause)."),
        ("num", "2. Calibrated LinearSVC: Support Vector Machine with balanced class"),
        ("sub", "weights and 3-fold Platt scaling (CalibratedClassifierCV)."),
        ("num", "3. Deep Subword Neural MLP: Two-layer ReLU feedforward network"),
        ("sub", "(64 x 32 neurons, Adam optimizer, alpha=0.005) on 64D SVD vectors."),
        ("num", "4. Adaptive Hybrid Ensemble: Weighted probability soft-voting:"),
        ("sub", "P_ens(e) = w_nn * P_MLP(e) + w_svm * P_SVM(e) + w_lex * P_Lex(e)."),
        ("bold", "B. Unsupervised Topic Modeling Algorithms (K = 6 Topics):"),
        ("bullet", "LDA: Variational Bayes with Dirichlet priors (alpha=0.15, beta=0.05)."),
        ("bullet", "NMF: Frobenius norm matrix decomposition (V ≈ W * H, NNDSVDA init)."),
        ("bullet", "BERTopic-Style Clustering: 32D SVD + Cosine K-Means + Class-Based"),
        ("sub", "TF-IDF:  w_{t,c} = tf_{t,c} * log(1 + A / tf_t)."),
    ], line_gap=0.0150, fontsize=6.95)

    # =========================================================================
    # COLUMN 3: 8. System Architecture | 9. Implementation | 10. Experimental Setup
    # =========================================================================

    # 8. System Architecture
    y8 = draw_section_card(ax, c3_x, 0.545, col_w, 0.336, "8. System Architecture")

    # Clean 4-Layer Engineering Block Diagram (Input -> Processing -> Models -> Output)
    # Layer 1: Input Layer
    l1 = FancyBboxPatch((c3_x + 0.012, 0.790), col_w - 0.024, 0.044, boxstyle="round,pad=0,rounding_size=0.004", facecolor="#f8fafc", edgecolor="#0284c7", lw=1.1, zorder=4)
    ax.add_patch(l1)
    ax.text(c3_x + col_w / 2, 0.822, "1. MULTI-MODAL INPUT LAYER", fontsize=6.8, fontweight="bold", color="#0284c7", ha="center", va="center", zorder=5)
    ax.text(c3_x + col_w / 2, 0.803, "Live Text Stream   |   Batch CSV / TXT Files   |   16kHz PCM WAV Voice Audio", fontsize=6.3, color="#0f172a", ha="center", va="center", zorder=5)

    ax.annotate("", xy=(c3_x + col_w / 2, 0.768), xytext=(c3_x + col_w / 2, 0.790), arrowprops=dict(arrowstyle="->", color="#1b365d", lw=1.3, zorder=5))

    # Layer 2: Processing & Vectorization Layer
    l2 = FancyBboxPatch((c3_x + 0.012, 0.716), col_w - 0.024, 0.050, boxstyle="round,pad=0,rounding_size=0.004", facecolor="#f8fafc", edgecolor="#1b365d", lw=1.1, zorder=4)
    ax.add_patch(l2)
    ax.text(c3_x + col_w / 2, 0.754, "2. NLP PREPROCESSING & VECTORIZATION LAYER", fontsize=6.8, fontweight="bold", color="#1b365d", ha="center", va="center", zorder=5)
    ax.text(c3_x + col_w / 2, 0.738, "Google Cloud ASR & Auto-Gain  ->  5-Stage Negation-Safe Lemmatizer", fontsize=6.1, color="#1e293b", ha="center", va="center", zorder=5)
    ax.text(c3_x + col_w / 2, 0.725, "BoW CountMatrix (1.2k)   |   Sublinear TF-IDF (3.5k)   |   Char N-Gram + 64D SVD", fontsize=6.0, color="#334155", ha="center", va="center", zorder=5)

    ax.annotate("", xy=(c3_x + 0.065, 0.694), xytext=(c3_x + 0.065, 0.716), arrowprops=dict(arrowstyle="->", color="#1b365d", lw=1.3, zorder=5))
    ax.annotate("", xy=(c3_x + col_w - 0.065, 0.694), xytext=(c3_x + col_w - 0.065, 0.716), arrowprops=dict(arrowstyle="->", color="#1b365d", lw=1.3, zorder=5))

    # Layer 3: Dual Model Layer (Left = Emotion Ensemble, Right = Topic Discovery)
    l3_left = FancyBboxPatch((c3_x + 0.012, 0.624), 0.103, 0.068, boxstyle="round,pad=0,rounding_size=0.004", facecolor="#fefce8", edgecolor="#d97706", lw=1.1, zorder=4)
    ax.add_patch(l3_left)
    ax.text(c3_x + 0.0635, 0.683, "3A. EMOTION ENGINE", fontsize=6.3, fontweight="bold", color="#b45309", ha="center", va="center", zorder=5)
    ax.text(c3_x + 0.0635, 0.672, "• Valence Lexicon\n• Platt LinearSVC\n• Subword ReLU MLP\n• Hybrid Ensemble", fontsize=5.6, color="#0f172a", ha="center", va="top", zorder=5)

    l3_right = FancyBboxPatch((c3_x + 0.123, 0.624), 0.103, 0.068, boxstyle="round,pad=0,rounding_size=0.004", facecolor="#f5f3ff", edgecolor="#7c3aed", lw=1.1, zorder=4)
    ax.add_patch(l3_right)
    ax.text(c3_x + 0.1745, 0.683, "3B. TOPIC ENGINE", fontsize=6.3, fontweight="bold", color="#6d28d9", ha="center", va="center", zorder=5)
    ax.text(c3_x + 0.1745, 0.672, "• Probabilistic LDA\n• Frobenius NMF\n• SVD + K-Means\n• Class c-TF-IDF", fontsize=5.6, color="#0f172a", ha="center", va="top", zorder=5)

    ax.annotate("", xy=(c3_x + 0.065, 0.604), xytext=(c3_x + 0.065, 0.626), arrowprops=dict(arrowstyle="->", color="#1b365d", lw=1.3, zorder=5))
    ax.annotate("", xy=(c3_x + col_w - 0.065, 0.604), xytext=(c3_x + col_w - 0.065, 0.626), arrowprops=dict(arrowstyle="->", color="#1b365d", lw=1.3, zorder=5))

    # Layer 4: Output Layer
    l4 = FancyBboxPatch((c3_x + 0.012, 0.556), col_w - 0.024, 0.046, boxstyle="round,pad=0,rounding_size=0.004", facecolor="#f0fdf4", edgecolor="#15803d", lw=1.1, zorder=4)
    ax.add_patch(l4)
    ax.text(c3_x + col_w / 2, 0.590, "4. ANALYTICS & PEDAGOGICAL OUTPUT LAYER (REACT + FLASK)", fontsize=6.5, fontweight="bold", color="#15803d", ha="center", va="center", zorder=5)
    ax.text(c3_x + col_w / 2, 0.575, "6×6 Topic×Emotion Heatmap  |  2D SVD Cluster Map  |  Subject Teacher Action Plan", fontsize=5.9, color="#0f172a", ha="center", va="center", zorder=5)

    # 9. Implementation
    y9 = draw_section_card(ax, c3_x, 0.295, col_w, 0.240, "9. Implementation")
    draw_lines(ax, c3_x + 0.008, y9, [
        ("bold", "Programming Languages & Core Frameworks:"),
        ("bullet", "Backend: Python 3.12, Flask 3.1 REST API, Flask-CORS, Gunicorn WSGI."),
        ("bullet", "Frontend: TypeScript, React 18, Vite 6, Tailwind CSS, Framer Motion."),
        ("bold", "Machine Learning & NLP Libraries:"),
        ("bullet", "Scikit-Learn 1.9 (TfidfVectorizer, CountVectorizer, LinearSVC,"),
        ("sub", "CalibratedClassifierCV, MLPClassifier, LatentDirichletAllocation,"),
        ("sub", "NMF, TruncatedSVD, KMeans), NumPy, SciPy, Pandas."),
        ("bold", "Speech Processing & Visualization Tools:"),
        ("bullet", "SpeechRecognition 3.14 (Google Cloud Web Speech ASR), Browser"),
        ("sub", "WebAudio API (16kHz 16-bit Mono PCM WAV Encoder), Recharts & Canvas."),
    ], line_gap=0.0150, fontsize=6.95)

    # 10. Experimental Setup
    y10 = draw_section_card(ax, c3_x, 0.036, col_w, 0.249, "10. Experimental Setup")
    draw_lines(ax, c3_x + 0.008, y10, [
        ("bold", "Environment & Validation Protocol:"),
        ("bullet", "Hardware / Cloud: Local Windows 11 Workstation & Render Cloud Linux"),
        ("sub", "Container (Single-threaded OpenBLAS optimization for low-latency CPU)."),
        ("bullet", "Validation Split: Stratified 78% Train (483) / 22% Held-Out Test (137)"),
        ("sub", "with fixed random_state=42 for deterministic reproducibility."),
        ("bold", "Evaluation Metrics Computed:"),
        ("bullet", "Classification: Accuracy, Macro Precision, Macro Recall, Macro F1,"),
        ("sub", "Weighted F1, Per-Class Support, and 6×6 Multi-Class Confusion Matrix."),
        ("bullet", "Topic Quality: Normalized UMass Coherence C_UMass, Topic Diversity"),
        ("sub", "(% unique top-10 keywords), and Latent Cluster Silhouette Score."),
    ], line_gap=0.0150, fontsize=6.95)

    # =========================================================================
    # COLUMN 4: 11. Results & Analysis | 12. Key Highlights | 13. Applications | 14. Conclusion
    # =========================================================================

    # 11. Results & Analysis
    y11 = draw_section_card(ax, c4_x, 0.535, col_w, 0.346, "11. Results & Analysis")

    # Table 1: Emotion Classification Results
    ax.text(c4_x + 0.008, y11, "Table 1: Emotion Classification Performance (Held-Out Test Set, N = 137)", fontsize=6.8, fontweight="bold", color="#1b365d", ha="left", va="top", zorder=5)
    t1_y = y11 - 0.016
    headers_t1 = [("Algorithm / Model", 0.008, "left"), ("Acc.", 0.142, "right"), ("Prec.", 0.172, "right"), ("Rec.", 0.200, "right"), ("Macro F1", 0.232, "right")]
    t1_bg = patches.Rectangle((c4_x + 0.006, t1_y - 0.013), col_w - 0.012, 0.015, facecolor="#e2e8f0", edgecolor="none", zorder=3)
    ax.add_patch(t1_bg)
    for h_txt, h_dx, h_align in headers_t1:
        ax.text(c4_x + h_dx, t1_y - 0.005, h_txt, fontsize=6.1, fontweight="bold", color="#0f172a", ha=h_align, va="center", zorder=5)

    rows_t1 = [
        ("Affective Lexicon (Valence)", "82.48%", "85.12%", "83.90%", "84.40%", False),
        ("Deep Neural MLP (64D SVD)", "93.43%", "93.58%", "93.29%", "93.40%", False),
        ("Classical ML (LinearSVC)", "94.89%", "95.62%", "95.18%", "95.35%", False),
        ("Hybrid Ensemble (Proposed)", "96.35%", "96.68%", "96.41%", "96.52%", True),
    ]
    for r_idx, (m_name, acc, prec, rec, f1, is_best) in enumerate(rows_t1):
        ry = t1_y - 0.023 - r_idx * 0.016
        if is_best:
            hl = patches.Rectangle((c4_x + 0.006, ry - 0.007), col_w - 0.012, 0.015, facecolor="#dcfce7", edgecolor="#86efac", lw=0.6, zorder=3)
            ax.add_patch(hl)
        fw = "bold" if is_best else "normal"
        fc = "#15803d" if is_best else "#1e293b"
        ax.text(c4_x + 0.008, ry, m_name, fontsize=6.1, fontweight=fw, color=fc, ha="left", va="center", zorder=5)
        ax.text(c4_x + 0.142, ry, acc, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)
        ax.text(c4_x + 0.172, ry, prec, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)
        ax.text(c4_x + 0.200, ry, rec, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)
        ax.text(c4_x + 0.232, ry, f1, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)

    # Table 2: Unsupervised Topic Modeling Results
    t2_top = t1_y - 0.095
    ax.text(c4_x + 0.008, t2_top, "Table 2: Unsupervised Topic Modeling Comparison (K = 6 Topics)", fontsize=6.8, fontweight="bold", color="#1b365d", ha="left", va="top", zorder=5)
    t2_y = t2_top - 0.016
    t2_bg = patches.Rectangle((c4_x + 0.006, t2_y - 0.013), col_w - 0.012, 0.015, facecolor="#e2e8f0", edgecolor="none", zorder=3)
    ax.add_patch(t2_bg)
    headers_t2 = [("Topic Modeling Algorithm", 0.008, "left"), ("Coherence", 0.155, "right"), ("Diversity", 0.194, "right"), ("Silhouette", 0.232, "right")]
    for h_txt, h_dx, h_align in headers_t2:
        ax.text(c4_x + h_dx, t2_y - 0.005, h_txt, fontsize=6.1, fontweight="bold", color="#0f172a", ha=h_align, va="center", zorder=5)

    rows_t2 = [
        ("Latent Dirichlet Allocation (LDA)", "0.732", "93.3%", "0.184", False),
        ("Non-Negative Matrix Fact. (NMF)", "0.954", "100.0%", "0.296", False),
        ("BERTopic-Style (SVD + c-TF-IDF)", "0.933", "96.7%", "0.412", True),
    ]
    for r_idx, (t_name, coh, div, sil, is_top) in enumerate(rows_t2):
        ry = t2_y - 0.023 - r_idx * 0.016
        if is_top:
            hl = patches.Rectangle((c4_x + 0.006, ry - 0.007), col_w - 0.012, 0.015, facecolor="#e0e7ff", edgecolor="#a5b4fc", lw=0.6, zorder=3)
            ax.add_patch(hl)
        fw = "bold" if is_top else "normal"
        fc = "#1d4ed8" if is_top else "#1e293b"
        ax.text(c4_x + 0.008, ry, t_name, fontsize=6.1, fontweight=fw, color=fc, ha="left", va="center", zorder=5)
        ax.text(c4_x + 0.155, ry, coh, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)
        ax.text(c4_x + 0.194, ry, div, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)
        ax.text(c4_x + 0.232, ry, sil, fontsize=6.1, fontweight=fw, color=fc, ha="right", va="center", zorder=5)

    draw_lines(ax, c4_x + 0.008, t2_y - 0.076, [
        ("bullet", "Analysis: The Hybrid Ensemble outperforms standalone models by +1.17%"),
        ("sub", "Macro F1. NMF achieves highest lexical diversity (100%), while"),
        ("sub", "BERTopic c-TF-IDF achieves the highest cluster separation (0.412)."),
    ], line_gap=0.0142, fontsize=6.8)

    # 12. Key Highlights
    y12 = draw_section_card(ax, c4_x, 0.368, col_w, 0.157, "12. Key Highlights")
    draw_lines(ax, c4_x + 0.008, y12, [
        ("bullet", "96.52% Macro F1-Score across 6 nuanced academic emotion classes."),
        ("bullet", "Contrastive & Negation Resilience: Properly classifies mixed reviews"),
        ("sub", "with 'not', 'never', 'but', and excess patterns ('too long/fast')."),
        ("bullet", "Lossless 16kHz PCM WAV Speech Studio: Browser WebAudio encoding"),
        ("sub", "enables accurate voice sentiment analysis without external ffmpeg."),
        ("bullet", "Automated Subject-Wise Teacher Action Plans from batch CSV uploads."),
    ], line_gap=0.0148, fontsize=6.95)

    # 13. Applications
    y13 = draw_section_card(ax, c4_x, 0.202, col_w, 0.156, "13. Applications")
    draw_lines(ax, c4_x + 0.008, y13, [
        ("bullet", "University Quality Assurance (IQAC): Automated end-of-semester and"),
        ("sub", "mid-semester course evaluation auditing across departments."),
        ("bullet", "MOOC & EdTech Platforms: Real-time detection of learner Confusion"),
        ("sub", "and Anxiety in discussion forums to reduce student dropout rates."),
        ("bullet", "Voice-Accessible Feedback Kiosks: Inclusive spoken evaluation"),
        ("sub", "collection for students via microphone & audio file uploads."),
    ], line_gap=0.0148, fontsize=6.95)

    # 14. Conclusion
    y14 = draw_section_card(ax, c4_x, 0.036, col_w, 0.156, "14. Conclusion")
    draw_lines(ax, c4_x + 0.008, y14, [
        ("bullet", "Combining rule-based affective valence shifters with calibrated"),
        ("sub", "LinearSVC and subword Neural MLPs resolves the bias-variance"),
        ("sub", "tradeoff on both formal and conversational student evaluations."),
        ("bullet", "Cross-tabulating c-TF-IDF / NMF topics against 6 emotions pinpoints"),
        ("sub", "actionable pedagogical bottlenecks (e.g., Workload × Anxiety) and"),
        ("sub", "translates unstructured text/speech into concrete faculty measures."),
    ], line_gap=0.0148, fontsize=6.95)

    # =========================================================================
    # BOTTOM ACADEMIC FOOTER STRIP (y = 0.000 to 0.028)
    # =========================================================================
    footer_bg = patches.Rectangle((0, 0), 1.0, 0.028, facecolor="#1b365d", edgecolor="none", zorder=2)
    ax.add_patch(footer_bg)
    ax.text(
        0.015,
        0.014,
        "Natural Language Processing (NLP) Course Project Demonstration  •  Full-Stack Implementation: Python Flask + Scikit-Learn + React TypeScript",
        fontsize=7.5,
        color="#cbd5e1",
        ha="left",
        va="center",
        zorder=5,
    )
    ax.text(
        0.985,
        0.014,
        "Live Deployment: edupulse-ai-nlp.onrender.com",
        fontsize=7.8,
        fontweight="bold",
        color="#fbbf24",
        ha="right",
        va="center",
        zorder=5,
    )

    fig.savefig(PNG_PATH, dpi=240)
    fig.savefig(PDF_PATH)
    fig.savefig(MAIN_PNG_PATH, dpi=240)
    fig.savefig(MAIN_PDF_PATH)
    plt.close(fig)

    if os.path.exists(os.path.dirname(ARTIFACT_PNG)):
        shutil.copyfile(PNG_PATH, ARTIFACT_PNG)
    print(f"Saved 16:9 PNG poster: {PNG_PATH}")
    print(f"Saved 16:9 PDF poster: {PDF_PATH}")


if __name__ == "__main__":
    build_16x9_poster()
