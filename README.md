# EduPulse AI — Intelligent Student Feedback Emotion & Topic Analytics

An enterprise-grade **Full-Stack AI Analytics SaaS Platform** for **Student Feedback Emotion Detection & Unsupervised Topic Modeling**, featuring a **React + Vite + TypeScript + Tailwind CSS** frontend and a **Python Flask + Scikit-Learn / Neural NLP** backend.

---

## 1. Technology Stack

### Frontend (`http://localhost:5173`)
- **Framework**: React 18 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS (`#090B14` dark-first AI SaaS theme, glassmorphism, custom scrollbars, responsive layout)
- **Data Visualization**: Recharts (Donut charts, horizontal & grouped Bar charts) + HTML5 Canvas (Interactive 2D Semantic Embedding Scatter Plot with Zoom, Pan & Hover Tooltips)
- **Animations**: Framer Motion (`framer-motion`)
- **Icons**: Lucide React (`lucide-react`)
- **API Client**: Centralized Axios service (`src/services/api.ts`)

### Backend (`http://127.0.0.1:5000`)
- **API Server**: Python Flask + Flask-CORS (`backend/app.py`)
- **NLP & ML Engine**: `StudentFeedbackNLPEngine` (`backend/nlp_engine.py`)
  1. **5-Stage NLP Preprocessing Pipeline**: Contraction expansion, regex noise pruning, tokenization, **negation-aware stopword filtering** (retaining `not, never, zero, without`), morphological lemmatization, and bigram extraction.
  2. **4 Emotion Detection Models**:
     - Affective Lexicon with 2-token context valence shifters
     - Sublinear TF-IDF + Calibrated `LinearSVC`
     - Character 3–5 N-Gram + 120D `TruncatedSVD` + `MLPClassifier` ($128 \times 64$ ReLU Neural Network)
     - Weighted Hybrid Emotion Ensemble (`45% Neural MLP + 40% LinearSVC + 15% Lexicon`)
  3. **3 Unsupervised Topic Modeling Algorithms**:
     - **LDA** (*Latent Dirichlet Allocation*)
     - **NMF** (*Non-Negative Matrix Factorization*)
     - **BERTopic-Style Semantic Clustering** (*Dense SVD Embeddings + Cosine K-Means + Class-Based TF-IDF `c-TF-IDF`*)
  4. **Pedagogical Recommendation Engine**: Automated faculty intervention recommendations mapped to `(Topic × Emotion)` pairs.

---

## 2. Project Directory Structure

```text
NLP project/
├── backend/
│   ├── app.py                        # Flask REST API Server (Port 5000)
│   ├── nlp_engine.py                 # Core NLP Preprocessing, Emotion & Topic Models
│   └── data_generator.py             # Synthetic 620-record Student Feedback Generator
├── data/
│   └── student_feedback_dataset.csv  # 620 Verified Student Evaluations
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/               # Sidebar.tsx, Topbar.tsx, DashboardLayout.tsx
│   │   │   ├── analyzer/             # FeedbackInput, PreprocessingTimeline, EmotionResults, ModelComparison, RecommendationCard
│   │   │   └── dashboard/            # KPICard, EmotionChart, TopicChart, EmotionHeatmap
│   │   ├── pages/                    # Overview, Analyzer, Dashboard, TopicModeling, Benchmarks, BatchStudio, SettingsPage
│   │   ├── services/
│   │   │   └── api.ts                # Centralized Axios client
│   │   ├── types/
│   │   │   └── nlp.ts                # TypeScript interfaces matching Flask JSON schemas
│   │   ├── utils/
│   │   │   └── constants.ts          # Color palettes, badges & presets
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── notebooks/
│   └── Student_Feedback_NLP_Experiments.ipynb
└── requirements.txt
```

---

## 3. Setup & Execution Instructions

### Step 1 — Start the Python Flask Backend (`http://127.0.0.1:5000`)

Open a terminal in the project root (`c:\Users\piyus\Desktop\NLP project`) and run:

```powershell
python backend/app.py
```

The backend will load the 620-document corpus, calibrate all 4 emotion models and 3 topic models, and listen on `http://127.0.0.1:5000`.

### Step 2 — Start the React + Vite Frontend (`http://localhost:5173`)

Open a second terminal in the `frontend` directory and run:

```powershell
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.
*(Note: You can also build the production bundle with `npm run build`, which outputs to `frontend/dist` and is automatically served by Flask on `http://127.0.0.1:5000` as well!)*
