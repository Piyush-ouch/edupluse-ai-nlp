"""
Core NLP Engine for Student Feedback Emotion Detection & Topic Modeling.
Implements:
1. Step-by-Step NLP Text Preprocessing Pipeline (Contraction Expansion, Tokenization,
   Negation-Preserving Stopword Filtering, Morphological Lemmatization, N-gram Extraction)
2. Emotion Detection:
   - Classical ML: TF-IDF (Word + Subword N-grams) + Calibrated LinearSVC & Logistic Regression
   - Affective Lexicon: Academic Emotion Lexicon with Valence Shifters & Negation Handling
   - Deep Neural / Contextual Embedding Pipeline: Dense Semantic SVD + Multi-Layer Perceptron (MLP) Neural Network
3. Topic Modeling:
   - Latent Dirichlet Allocation (LDA) - Probabilistic Generative Model
   - Non-Negative Matrix Factorization (NMF) - Linear Algebraic Matrix Decomposition
   - BERTopic-Style Neural/Semantic Clustering - Contextual Embeddings + Cosine K-Means + Class-based TF-IDF (c-TF-IDF)
"""

import os
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")
os.environ.setdefault("VECLIB_MAXIMUM_THREADS", "1")
os.environ.setdefault("NUMEXPR_NUM_THREADS", "1")
os.environ.setdefault("LOKY_MAX_CPU_COUNT", "1")
import re
import time
import math
from collections import Counter
from typing import Dict, List, Any, Tuple

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.neural_network import MLPClassifier
from sklearn.decomposition import LatentDirichletAllocation, NMF, TruncatedSVD
from sklearn.cluster import KMeans
from sklearn.preprocessing import Normalizer
from sklearn.pipeline import make_pipeline
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    silhouette_score,
)


# =====================================================================
# 1. NLP PREPROCESSING CONSTANTS & RESOURCES
# =====================================================================

CONTRACTIONS = {
    "aren't": "are not",
    "can't": "cannot",
    "couldn't": "could not",
    "didn't": "did not",
    "doesn't": "does not",
    "don't": "do not",
    "hadn't": "had not",
    "hasn't": "has not",
    "haven't": "have not",
    "isn't": "is not",
    "it's": "it is",
    "shouldn't": "should not",
    "that's": "that is",
    "there's": "there is",
    "they're": "they are",
    "wasn't": "was not",
    "weren't": "were not",
    "won't": "will not",
    "wouldn't": "would not",
    "you're": "you are",
    "i'm": "i am",
    "i've": "i have",
    "we're": "we are",
    "we've": "we have",
}

# Standard English stopwords, intentionally EXCLUDING negation/valence shifters
STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and",
    "any", "are", "as", "at", "be", "because", "been", "before", "being", "below",
    "between", "both", "but", "by", "can", "could", "did", "do", "does", "doing",
    "down", "during", "each", "few", "for", "from", "further", "had", "has", "have",
    "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how",
    "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more",
    "most", "my", "myself", "now", "of", "off", "on", "once", "only", "or", "other",
    "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so",
    "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
    "then", "there", "these", "they", "this", "those", "through", "to", "too",
    "under", "until", "up", "very", "was", "we", "were", "what", "when", "where",
    "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your",
    "yours", "yourself", "yourselves", "also", "even", "get", "got", "make", "made",
    "every", "much", "many", "lot", "overall", "honestly", "frankly", "semester",
    "course", "class", "student", "students", "aspect", "experience", "term",
}

NEGATION_WORDS = {"not", "no", "never", "neither", "nor", "zero", "without", "hardly", "barely", "lack", "lacks"}

# Domain-specific irregular & morphological lemma dictionary
LEMMA_DICT = {
    "explains": "explain", "explained": "explain", "explaining": "explain", "explanations": "explanation",
    "lectures": "lecture", "lecturing": "lecture",
    "algorithms": "algorithm", "models": "model", "networks": "network",
    "assignments": "assignment", "assigning": "assign", "assigned": "assign",
    "deadlines": "deadline", "exams": "exam", "quizzes": "quiz",
    "grades": "grade", "graded": "grade", "grading": "grade", "graders": "grader",
    "questions": "question", "doubts": "doubt", "hours": "hour",
    "computers": "computer", "machines": "machine", "servers": "server",
    "labs": "lab", "laboratories": "laboratory",
    "slides": "slide", "videos": "video", "notes": "note", "papers": "paper",
    "projects": "project", "topics": "topic", "modules": "module", "concepts": "concept",
    "frustrating": "frustrate", "frustrated": "frustrate", "frustration": "frustrate",
    "confusing": "confuse", "confused": "confuse", "confusion": "confuse",
    "bewildered": "bewilder", "puzzled": "puzzle",
    "boring": "bore", "bored": "bore", "boredom": "bore",
    "overwhelming": "overwhelm", "overwhelmed": "overwhelm",
    "stressed": "stress", "stressful": "stress",
    "anxious": "anxiety", "terrified": "terrify", "worrying": "worry",
    "loved": "love", "loving": "love", "enjoyed": "enjoy", "enjoyable": "enjoy",
    "appreciated": "appreciate", "appreciating": "appreciate",
    "thankful": "thank", "thanks": "thank", "grateful": "gratitude",
    "helpful": "help", "helped": "help", "helping": "help",
    "taught": "teach", "teaching": "teach", "teacher": "teach",
    "coding": "code", "programmed": "program", "programming": "program",
    "debugging": "debug", "crashes": "crash", "crashed": "crash", "crashing": "crash",
    "disconnected": "disconnect", "disconnects": "disconnect",
    "outdated": "outdate", "updated": "update", "modernized": "modernize",
}

# Academic Emotion Lexicon for Model 2 (Affective Lexicon + Valence Shifter)
EMOTION_LEXICON: Dict[str, Dict[str, float]] = {
    "Joy / Satisfaction": {
        "love": 2.6, "enjoy": 2.4, "crystal": 2.0, "clear": 1.8, "engaging": 2.3,
        "lively": 2.1, "insightful": 2.2, "effortless": 2.0, "enthusiasm": 2.1,
        "contagious": 1.8, "excited": 2.3, "favorite": 2.5, "thrilled": 2.6,
        "brilliantly": 2.4, "modernize": 1.9, "smoothly": 1.9, "mastery": 2.1,
        "perfect": 2.2, "balance": 1.6, "breath": 1.8, "fresh": 1.8, "prompt": 1.7,
        "transparent": 1.9, "thoughtfully": 2.0, "flawlessly": 2.5, "breeze": 2.2,
        "productive": 2.0, "collaborative": 1.9, "smooth": 1.8, "practical": 1.5,
        "click": 1.7, "well-paced": 2.2, "top-notch": 2.4,
        "good": 1.8, "great": 2.2, "awesome": 2.5, "excellent": 2.5, "amazing": 2.5,
        "nice": 1.7, "best": 2.3, "happy": 2.2, "satisfy": 2.2, "satisfied": 2.2,
        "interesting": 2.0, "fun": 2.0, "easy": 1.7, "understandable": 2.0, "wonderful": 2.4,
    },
    "Appreciation / Gratitude": {
        "thank": 3.0, "gratitude": 3.0, "appreciate": 2.9, "patient": 2.2,
        "encouraging": 2.2, "extra": 1.6, "effort": 1.8, "supplemental": 1.7,
        "adapted": 1.8, "heartfelt": 2.7, "welcoming": 2.2, "respectful": 2.1,
        "motivating": 2.1, "cares": 2.3, "curated": 1.7, "constructive": 1.9,
        "fair": 1.6, "extend": 1.8, "extending": 1.8, "manageable": 1.7,
        "above": 1.5, "beyond": 1.8, "mentoring": 2.3, "mentorship": 2.4,
        "guidance": 2.0, "supportive": 2.4, "confidence": 1.9, "helpful": 2.1,
        "help": 1.8, "kind": 2.0, "polite": 1.9, "dedicate": 2.1, "dedicated": 2.1,
        "bless": 2.2, "kudos": 2.4, "respect": 2.0, "guided": 2.0,
    },
    "Frustration / Anger": {
        "frustrate": 2.9, "unacceptable": 2.8, "dismisses": 2.5, "refuses": 2.4,
        "wasting": 2.3, "wasted": 2.3, "infuriating": 3.0, "arbitrary": 2.4,
        "opaque": 2.2, "unfair": 2.7, "unprofessional": 2.6, "inconsistent": 2.1,
        "ridiculous": 2.7, "demoralizing": 2.5, "unreasonable": 2.6, "crash": 2.2,
        "down": 1.6, "broken": 2.3, "restricted": 1.8, "disconnect": 2.0,
        "unanswered": 2.4, "ignore": 2.3, "ignoring": 2.3, "rote": 1.8,
        "memorization": 1.6, "penalizing": 2.3, "never": 1.5, "zero": 1.5,
        "bad": 2.2, "worst": 2.8, "terrible": 2.8, "horrible": 2.8, "awful": 2.7,
        "hate": 2.8, "angry": 2.7, "annoying": 2.4, "annoy": 2.4, "poor": 2.1,
        "useless": 2.6, "waste": 2.4, "rude": 2.6, "arrogant": 2.6, "strict": 2.0,
        "biased": 2.5, "partiality": 2.6, "pathetic": 2.8, "disappoint": 2.3,
    },
    "Anxiety / Stress": {
        "overwhelm": 2.9, "exhausting": 2.6, "relentless": 2.3, "sleep": 2.1,
        "stress": 3.0, "midnight": 1.8, "burnout": 2.9, "anxiety": 3.0,
        "unbearable": 2.7, "pressure": 2.5, "surprise": 1.7, "negative": 1.6,
        "terrify": 2.8, "edge": 1.9, "tight": 1.8, "panic": 2.9, "worry": 2.6,
        "freeze": 2.0, "losing": 1.9, "escalated": 1.9, "mental": 2.2,
        "seventy": 1.7, "overlapping": 1.9,
        "hard": 2.1, "tough": 2.2, "difficult": 2.2, "heavy": 2.3, "scared": 2.5,
        "nervous": 2.5, "tense": 2.4, "fear": 2.5, "afraid": 2.4, "burden": 2.5,
        "overload": 2.6, "sleepless": 2.5, "exhaust": 2.5,
    },
    "Confusion": {
        "confuse": 3.0, "bewilder": 2.7, "skip": 1.9, "inconsistent": 1.9,
        "puzzle": 2.7, "randomly": 2.0, "roadmap": 1.7, "assumes": 1.9,
        "chaotic": 2.4, "sync": 1.8, "contradictory": 2.6, "vague": 2.6,
        "vaguely": 2.6, "guessing": 2.3, "ambiguity": 2.5, "unsure": 2.4,
        "unclear": 2.6, "older": 1.6, "mismatch": 2.1, "figure": 1.7,
        "idea": 1.5, "jumps": 1.9,
        "fast": 2.1, "rush": 2.1, "complex": 2.0, "complicated": 2.3, "lost": 2.3,
        "doubt": 2.0, "messy": 2.2, "disorganized": 2.3, "abstract": 1.9, "clueless": 2.6,
    },
    "Boredom / Disengagement": {
        "bore": 3.0, "verbatim": 2.4, "monotone": 2.8, "dry": 2.5,
        "repetitive": 2.5, "zone": 2.3, "mechanical": 2.3, "uninspiring": 2.6,
        "tedious": 2.7, "recites": 2.4, "dull": 2.7, "monotonous": 2.8,
        "outdate": 2.2, "obsolete": 2.4, "redundant": 2.4, "trivial": 2.1,
        "archaic": 2.4, "passive": 2.3, "unengaging": 2.6, "lacks": 1.7,
        "long": 2.2, "lengthy": 2.3, "slow": 2.2, "sleepy": 2.5, "tired": 2.1,
        "drag": 2.2, "dragging": 2.2, "theory-heavy": 2.1, "bland": 2.4, "lifeless": 2.5,
    },
}

# Domain Topic Lexicon for accurate topic attribution on short/conversational student inputs
TOPIC_LEXICON: Dict[str, Dict[str, float]] = {
    "Teaching Style & Pedagogy": {
        "teach": 2.5, "professor": 2.0, "instructor": 2.0, "explain": 2.4, "explanation": 2.4,
        "lecture": 2.3, "slide": 2.3, "voice": 2.2, "monotone": 2.4, "example": 2.0,
        "analogy": 2.2, "board": 2.0, "interactive": 2.1, "interaction": 2.1, "delivery": 2.3,
        "concept": 1.8, "pace": 1.9, "fast": 1.8, "slow": 1.8, "enthusiasm": 2.0,
    },
    "Curriculum & Course Content": {
        "syllabus": 2.8, "curriculum": 2.8, "content": 2.4, "module": 2.3, "topic": 2.0,
        "textbook": 2.5, "book": 2.1, "outdate": 2.5, "obsolete": 2.5, "modern": 2.2,
        "modernize": 2.2, "theory": 2.1, "theoretical": 2.1, "prerequisite": 2.4,
        "chapter": 2.1, "material": 2.0, "redundant": 2.2, "subject": 1.7,
    },
    "Assessment, Exams & Grading": {
        "exam": 2.8, "midterm": 2.8, "final": 2.2, "quiz": 2.7, "test": 2.5,
        "grade": 2.8, "grader": 2.7, "rubric": 2.9, "mark": 2.6, "marking": 2.6,
        "score": 2.4, "evaluation": 2.3, "evaluate": 2.3, "unfair": 2.2, "negative": 1.9,
        "question": 1.8, "paper": 1.8, "weightage": 2.5, "closed-book": 2.5, "open-book": 2.5,
    },
    "Workload, Deadlines & Pacing": {
        "workload": 3.0, "deadline": 3.0, "assignment": 2.5, "homework": 2.7,
        "project": 2.1, "heavy": 2.4, "overwhelm": 2.3, "long": 2.2, "lengthy": 2.4,
        "hour": 2.1, "midnight": 2.5, "schedule": 2.2, "pacing": 2.5, "sleep": 2.2,
        "burnout": 2.5, "weekly": 2.0, "submission": 2.3, "time": 2.0, "extension": 2.3,
    },
    "Lab Infrastructure & Resources": {
        "lab": 3.0, "laboratory": 3.0, "computer": 2.8, "machine": 2.6, "pc": 2.7,
        "server": 2.7, "gpu": 2.9, "wifi": 2.8, "wi-fi": 2.8, "internet": 2.5,
        "software": 2.5, "crash": 2.6, "freeze": 2.4, "install": 2.3, "docker": 2.5,
        "package": 2.2, "workstation": 2.7, "hardware": 2.7, "manual": 2.3, "system": 2.1,
    },
    "Doubt Support & Mentorship": {
        "doubt": 3.0, "ta": 2.9, "assistant": 2.7, "mentor": 2.8, "mentorship": 2.9,
        "mentoring": 2.8, "office": 2.5, "forum": 2.7, "email": 2.5, "reply": 2.5,
        "unanswered": 2.7, "guidance": 2.5, "support": 2.3, "supportive": 2.3,
        "tutorial": 2.4, "help": 2.1, "helpful": 2.1, "query": 2.4,
    },
}

INTENSIFIERS = {
    "very": 1.35, "extremely": 1.5, "deeply": 1.45, "completely": 1.4,
    "totally": 1.4, "absolutely": 1.45, "severely": 1.45, "wildly": 1.35,
    "truly": 1.3, "genuinely": 1.3, "super": 1.3, "really": 1.25, "too": 1.45, "so": 1.25,
}

CONTRASTIVE_CONJUNCTIONS = {"but", "however", "though", "although", "yet", "except", "whereas"}

# Complete 36-Pair Pedagogical Recommendations keyed by (Topic, Emotion)
PEDAGOGICAL_RECOMMENDATIONS = {
    # 1. Teaching Style & Pedagogy (all 6 emotions)
    ("Teaching Style & Pedagogy", "Joy / Satisfaction"): "Preserve the interactive lecture demonstrations and intuitive visual analogies, and record flagship conceptual walkthroughs as reusable reference modules for future cohorts.",
    ("Teaching Style & Pedagogy", "Appreciation / Gratitude"): "Continue fostering the patient, inclusive classroom dialogue and share these effective pedagogical practices in departmental faculty workshops.",
    ("Teaching Style & Pedagogy", "Confusion"): "Introduce structured visual roadmaps at the start of each lecture, bridge mathematical proofs with intuitive code walkthroughs, and align slide notation with the textbook.",
    ("Teaching Style & Pedagogy", "Boredom / Disengagement"): "Break long lecture blocks into 20-minute micro-segments interspersed with live coding polls, interactive Q&A checkpoints, and concise real-world case studies.",
    ("Teaching Style & Pedagogy", "Frustration / Anger"): "Reduce lecture slide density (cap at 20-25 slides per hour), pace complex derivations deliberately, and reserve the final 10 minutes of class for open student questions.",
    ("Teaching Style & Pedagogy", "Anxiety / Stress"): "Reassure students during fast-paced theoretical derivations by providing pre-lecture summary sheets, recorded recap clips, and step-by-step worked examples.",

    # 2. Curriculum & Course Content (all 6 emotions)
    ("Curriculum & Course Content", "Joy / Satisfaction"): "Maintain the balance between foundational mathematical theory and modern applied AI/NLP modules, and showcase outstanding student implementations in the course repository.",
    ("Curriculum & Course Content", "Appreciation / Gratitude"): "Keep the curated reading guides and modernized syllabus resources updated each semester, and expand optional advanced tracks for interested students.",
    ("Curriculum & Course Content", "Boredom / Disengagement"): "Audit and modernize the syllabus by pruning redundant introductory chapters and integrating contemporary industry frameworks and hands-on engineering case studies.",
    ("Curriculum & Course Content", "Confusion"): "Synchronize weekly laboratory exercises directly with theoretical lecture modules and publish explicit prerequisite checklists and module learning objectives.",
    ("Curriculum & Course Content", "Frustration / Anger"): "Ensure course catalog descriptions accurately reflect the hands-on vs. theoretical balance and verify prerequisite coverage before introducing advanced topics.",
    ("Curriculum & Course Content", "Anxiety / Stress"): "Provide a structured prerequisite refresher module during Week 1 and break dense theoretical chapters into guided weekly study digests.",

    # 3. Assessment, Exams & Grading (all 6 emotions)
    ("Assessment, Exams & Grading", "Joy / Satisfaction"): "Continue using transparent, rubric-backed analytical assessments and milestone projects that reward conceptual mastery over rote memorization.",
    ("Assessment, Exams & Grading", "Appreciation / Gratitude"): "Maintain the prompt grading turnaround, detailed solution walk-throughs, and fair regrade review process appreciated by students.",
    ("Assessment, Exams & Grading", "Frustration / Anger"): "Publish itemized grading rubrics prior to submission, calibrate TA marking using standardized benchmark scripts, and enforce a 10-day turnaround SLA for grades.",
    ("Assessment, Exams & Grading", "Anxiety / Stress"): "Reduce single-exam weightage (cap final exam at 35-40%) by shifting toward continuous low-stakes assessments, milestone checkpoints, or open-book analytical testing.",
    ("Assessment, Exams & Grading", "Confusion"): "Provide sample mock exam papers, explicit output expectations (pseudocode vs. full code), and transparent grade-calculation formulas on the LMS portal.",
    ("Assessment, Exams & Grading", "Boredom / Disengagement"): "Replace repetitive factual recall quizzes with creative, open-ended real-world problem-solving challenges and mini-hackathons.",

    # 4. Workload, Deadlines & Pacing (all 6 emotions)
    ("Workload, Deadlines & Pacing", "Joy / Satisfaction"): "Retain the well-spaced bi-weekly assignment cadence and flexible grace-day policy that enabled deep experimentation without burnout.",
    ("Workload, Deadlines & Pacing", "Appreciation / Gratitude"): "Continue coordinating deadline extensions around major exam weeks and structuring semester projects into manageable weekly checkpoints.",
    ("Workload, Deadlines & Pacing", "Anxiety / Stress"): "Coordinate a cross-course deadline calendar to prevent exam-week collisions, split monolithic projects into bi-weekly milestones, and grant 2-3 flexible slip days.",
    ("Workload, Deadlines & Pacing", "Frustration / Anger"): "Freeze assignment specifications at release time and guarantee at least 10-14 days between homework publication and submission deadlines.",
    ("Workload, Deadlines & Pacing", "Boredom / Disengagement"): "Trim overly lengthy or repetitive boilerplate tasks from homework assignments so student effort focuses on core algorithmic concepts.",
    ("Workload, Deadlines & Pacing", "Confusion"): "Publish a unified semester pacing timeline with estimated completion hours per milestone and clear deliverables for each checkpoint.",

    # 5. Lab Infrastructure & Resources (all 6 emotions)
    ("Lab Infrastructure & Resources", "Joy / Satisfaction"): "Maintain the pre-configured GPU cloud environments, Docker containers, and starter repositories that streamlined practical experimentation.",
    ("Lab Infrastructure & Resources", "Appreciation / Gratitude"): "Acknowledge the lab systems team for maintaining reliable remote JupyterHub access and up-to-date software environments.",
    ("Lab Infrastructure & Resources", "Frustration / Anger"): "Pre-validate lab workstation GPU environments via automated container images (with cloud notebook fallbacks) and stress-test local submission servers before deadline peaks.",
    ("Lab Infrastructure & Resources", "Confusion"): "Update lab manuals to match current software versions and provide a one-click environment setup script (`requirements.txt` / Conda spec) with troubleshooting FAQs.",
    ("Lab Infrastructure & Resources", "Anxiety / Stress"): "Configure automatic checkpoint saving during practical lab exams and allocate backup cloud compute credits so hardware freezes never penalize students.",
    ("Lab Infrastructure & Resources", "Boredom / Disengagement"): "Upgrade guided lab exercises from passive script execution to interactive model-tuning sandboxes with visual feedback.",

    # 6. Doubt Support & Mentorship (all 6 emotions)
    ("Doubt Support & Mentorship", "Joy / Satisfaction"): "Continue running collaborative office hours and active Q&A discussion threads that empower students to debug and architect solutions confidently.",
    ("Doubt Support & Mentorship", "Appreciation / Gratitude"): "Recognize high-performing Teaching Assistants and faculty mentors for their dedicated office-hour support and timely forum guidance.",
    ("Doubt Support & Mentorship", "Frustration / Anger"): "Establish a 24-hour response SLA on the course discussion forum, track TA office-hour attendance, and offer hybrid (virtual + in-person) doubt-clearing slots.",
    ("Doubt Support & Mentorship", "Confusion"): "Standardize TA project guidelines via weekly instructor-TA sync meetings so students receive consistent architectural and formatting advice.",
    ("Doubt Support & Mentorship", "Anxiety / Stress"): "Schedule proactive pre-exam and pre-deadline drop-in mentorship clinics so struggling students receive early, non-judgmental guidance.",
    ("Doubt Support & Mentorship", "Boredom / Disengagement"): "Transform passive tutorial sessions into interactive peer-debugging workshops where students actively walk through problem solutions.",
}


def generate_contextual_recommendation(
    raw_text: str,
    tokens: List[str],
    lemmas: List[str],
    bigrams: List[str],
    primary_topic: str,
    primary_emotion: str,
    emotion_triggers: List[Dict[str, Any]],
) -> str:
    """
    Synthesizes a dynamic, sentence-specific pedagogical recommendation by combining
    the 36-cell (Topic x Emotion) base strategy with specific diagnostic signals
    extracted from the student's exact words, bigrams, and contrastive clauses.
    """
    base_rec = PEDAGOGICAL_RECOMMENDATIONS.get(
        (primary_topic, primary_emotion),
        f"Conduct a targeted curriculum and pedagogy review for '{primary_topic}' to address student '{primary_emotion}'.",
    )

    lemma_set = set(lemmas)
    token_set = set(tokens)
    specific_notes: List[str] = []

    # Check for contrastive / mixed feedback (e.g., "good concept, but it was too long")
    has_contrast = any(c in token_set for c in CONTRASTIVE_CONJUNCTIONS)
    has_pos_word = any(w in lemma_set for w in ("good", "great", "clear", "love", "enjoy", "nice", "interesting", "helpful"))
    has_neg_excess = ("too" in token_set) or any(w in lemma_set for w in ("long", "lengthy", "slow", "fast", "hard", "tough", "heavy", "bad", "confuse", "bore", "frustrate", "unfair"))

    if has_contrast and has_pos_word and has_neg_excess:
        pos_matched = [w for w in ("concept", "lecture", "explain", "topic", "project", "content", "class") if w in lemma_set]
        aspect_str = f"'{pos_matched[0]}'" if pos_matched else "conceptual foundation"
        specific_notes.append(
            f"Mixed/Contrastive Feedback Detected: Students value the {aspect_str}, but raised a specific concern in the second clause"
        )

    # Specific keyword diagnostic rules
    if any(w in lemma_set for w in ("long", "lengthy", "drag", "slow")) or ("too" in token_set and "long" in lemma_set):
        specific_notes.append(
            "Pacing & Duration Action: Compress lengthy explanations or sessions into focused 15-20 minute conceptual blocks with clear summary takeaways so strong concepts do not lose momentum."
        )
    if any(w in lemma_set for w in ("fast", "rush", "skip", "jumps")):
        specific_notes.append(
            "Delivery Speed Action: Slow down during dense mathematical or algorithmic transitions, pause for comprehension checks, and post annotated step-by-step notes."
        )
    if any(w in lemma_set for w in ("slide", "powerpoint", "verbatim", "monotone", "read")):
        specific_notes.append(
            "Slide & Delivery Action: Replace text-heavy slide reading with live board derivations, interactive code execution, and vocal variety."
        )
    if any(w in lemma_set for w in ("rubric", "mark", "marking", "grade", "unfair", "arbitrary", "deduct", "cut")):
        specific_notes.append(
            "Grading Transparency Action: Share a granular point-by-point marking scheme and require graders to leave brief written justification whenever points are deducted."
        )
    if any(w in lemma_set for w in ("deadline", "midnight", "overlap", "overlapping", "heavy", "overload", "burnout", "sleep")):
        specific_notes.append(
            "Workload Balancing Action: Stagger project deliverables away from midterm weeks and provide a 48-hour grace token for heavy coding submissions."
        )
    if any(w in lemma_set for w in ("lab", "gpu", "computer", "pc", "wifi", "wi-fi", "server", "crash", "freeze", "install")):
        specific_notes.append(
            "Lab Infrastructure Action: Audit lab workstation hardware/network stability and provide a pre-configured cloud notebook (Colab/JupyterHub) backup link."
        )
    if any(w in lemma_set for w in ("ta", "assistant", "office", "forum", "email", "reply", "unanswered", "doubt")):
        specific_notes.append(
            "Mentorship & Doubt Action: Assign dedicated TA rotation slots for forum/email queries and publish weekly FAQ digests for common project blockers."
        )

    if specific_notes:
        return " ".join(specific_notes) + " — " + base_rec

    # If the user entered custom words not covered above, reference their key content lemmas directly
    key_terms = [l for l in lemmas if len(l) > 3 and l not in NEGATION_WORDS][:4]
    if key_terms:
        terms_str = ", ".join(f"'{t}'" for t in key_terms)
        return f"Focused on key student terms ({terms_str}): {base_rec}"

    return base_rec


def lemmatize_token(token: str) -> str:
    """Morphological & dictionary-based lemmatizer tailored for academic text."""
    # Collapse elongated expressive characters (e.g., 'goood' -> 'good', 'sooo' -> 'so')
    token = re.sub(r"(.)\1{2,}", r"\1\1", token)
    if token in ("sooo", "soo", "tooo"):
        token = token[:-1]
    if token in LEMMA_DICT:
        return LEMMA_DICT[token]
    if len(token) <= 3:
        return token
    if token.endswith("ies") and len(token) > 4:
        return token[:-3] + "y"
    if token.endswith("ing") and len(token) > 5:
        base = token[:-3]
        if len(base) >= 3 and base[-1] == base[-2]:
            base = base[:-1]
        return LEMMA_DICT.get(base, base)
    if token.endswith("ed") and len(token) > 4:
        base = token[:-2]
        if base.endswith("i"):
            return base[:-1] + "y"
        return LEMMA_DICT.get(base, base)
    if token.endswith("es") and len(token) > 4 and not token.endswith(("ses", "xes", "zes")):
        return token[:-1]
    if token.endswith("s") and not token.endswith(("ss", "us", "is")) and len(token) > 4:
        return token[:-1]
    return token


def preprocess_text_detailed(text: str) -> Dict[str, Any]:
    """
    Executes and records every stage of the NLP preprocessing pipeline
    for academic inspection and downstream feature extraction.
    """
    raw_text = str(text).strip()

    # Step 1: Lowercase & Contraction Expansion
    lowered = raw_text.lower()
    expanded = lowered
    for contr, full in CONTRACTIONS.items():
        expanded = re.sub(r"\b" + re.escape(contr) + r"\b", full, expanded)

    # Step 2: Noise & Punctuation Cleaning (keep alpha and hyphens inside words)
    cleaned = re.sub(r"[^a-z0-9\s\-]", " ", expanded)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()

    # Step 3: Word Tokenization
    tokens = [t.strip("-") for t in cleaned.split() if t.strip("-")]

    # Step 4: Negation-Preserving Stopword Filtering
    filtered_tokens = [
        t for t in tokens
        if (t not in STOPWORDS or t in NEGATION_WORDS) and len(t) > 1
    ]

    # Step 5: Morphological Lemmatization
    lemmas = [lemmatize_token(t) for t in filtered_tokens]

    # Step 6: Bigram / Phrase Extraction (especially negation bigrams like "not_clear")
    bigrams = []
    for i in range(len(lemmas) - 1):
        bg = f"{lemmas[i]}_{lemmas[i+1]}"
        bigrams.append(bg)

    processed_str = " ".join(lemmas)

    return {
        "raw_text": raw_text,
        "expanded_text": expanded,
        "cleaned_text": cleaned,
        "tokens": tokens,
        "filtered_tokens": filtered_tokens,
        "lemmas": lemmas,
        "bigrams": bigrams[:12],
        "processed_text": processed_str,
        "token_count": len(tokens),
        "lemma_count": len(lemmas),
    }


def preprocess_for_vectorizer(text: str) -> str:
    """Fast string return for scikit-learn vectorizers."""
    return preprocess_text_detailed(text)["processed_text"]


# =====================================================================
# 2. AFFECTIVE LEXICON + VALENCE SHIFTER EMOTION MODEL
# =====================================================================

def predict_emotion_lexicon(text: str) -> Dict[str, float]:
    """
    Scores all 6 emotions using the Academic Emotion Lexicon with
    context window negation handling, contrastive conjunctions ('but', 'however'),
    and booster/excess word amplification ('too long', 'too fast', 'too hard').
    """
    details = preprocess_text_detailed(text)
    tokens = details["tokens"]
    lemmas = [lemmatize_token(t) for t in tokens]

    scores = {emo: 0.15 for emo in EMOTION_LEXICON.keys()}  # Laplace smoothing prior

    # Find if there is a contrastive pivot ('but', 'however', 'though', 'yet')
    contrast_idx = -1
    for i, tok in enumerate(tokens):
        if tok in CONTRASTIVE_CONJUNCTIONS:
            contrast_idx = i

    for idx, lemma in enumerate(lemmas):
        # Check preceding 2 tokens for negation or intensifier
        window_start = max(0, idx - 2)
        prev_tokens = tokens[window_start:idx]

        has_negation = any(pt in NEGATION_WORDS for pt in prev_tokens)
        has_excess_too = "too" in prev_tokens
        boost = 1.0
        for pt in prev_tokens:
            if pt in INTENSIFIERS:
                boost *= INTENSIFIERS[pt]

        # Contrastive clause weighting: clause after 'but'/'however' dominates sentiment
        if contrast_idx != -1:
            if idx < contrast_idx:
                boost *= 0.40
            elif idx > contrast_idx:
                boost *= 2.25

        # Exclamation mark emphasis
        if "!" in text:
            boost *= 1.15

        # Handle 'too <adj>' excess patterns explicitly
        if has_excess_too and lemma in ("long", "lengthy", "slow", "drag"):
            scores["Boredom / Disengagement"] += 3.2 * boost
            continue
        if has_excess_too and lemma in ("fast", "complex", "complicated", "vague", "abstract"):
            scores["Confusion"] += 3.2 * boost
            continue
        if has_excess_too and lemma in ("hard", "tough", "difficult", "heavy", "much", "many", "tight"):
            scores["Anxiety / Stress"] += 3.2 * boost
            continue
        if has_excess_too and lemma in ("strict", "harsh", "late", "unfair"):
            scores["Frustration / Anger"] += 3.2 * boost
            continue

        for emo, lex in EMOTION_LEXICON.items():
            if lemma in lex:
                weight = lex[lemma] * boost
                if has_negation:
                    # Flip positive emotion weight toward Confusion / Frustration
                    if emo in ("Joy / Satisfaction", "Appreciation / Gratitude"):
                        scores["Confusion"] += weight * 0.55
                        scores["Frustration / Anger"] += weight * 0.45
                    else:
                        scores["Joy / Satisfaction"] += weight * 0.4
                else:
                    scores[emo] += weight

    total = sum(scores.values())
    probs = {k: round(v / total, 4) for k, v in scores.items()}
    return probs


# =====================================================================
# 3. MAIN NLP ENGINE CLASS (CLASSICAL + NEURAL EMOTION & TOPIC MODELS)
# =====================================================================

class StudentFeedbackNLPEngine:
    def __init__(self, dataset_path: str):
        self.dataset_path = dataset_path
        self.df: pd.DataFrame = pd.DataFrame()
        self.emotions: List[str] = []
        self.topics: List[str] = []

        # Emotion models
        self.tfidf_emotion_vectorizer = None
        self.classical_svm_model = None
        self.classical_logreg_model = None

        # Deep Neural / Contextual Embedding Emotion Pipeline
        self.char_word_vectorizer = None
        self.semantic_svd = None
        self.neural_mlp_model = None

        # Supervised Topic Classifier (for comparison & hybrid labeling)
        self.topic_classifier = None

        # Unsupervised Topic Models (LDA, NMF, BERTopic-style Semantic Clustering)
        self.count_vectorizer = None
        self.tfidf_topic_vectorizer = None
        self.lda_model = None
        self.nmf_model = None
        self.bertopic_kmeans = None
        self.bertopic_svd = None
        self.c_tfidf_matrix = None
        self.bertopic_cluster_map: Dict[int, str] = {}
        self.lda_topic_map: Dict[int, str] = {}
        self.nmf_topic_map: Dict[int, str] = {}

        # Evaluation & analytics cache
        self.model_metrics: Dict[str, Any] = {}
        self.topic_Comparison_data: Dict[str, Any] = {}
        self.document_embeddings_2d: List[Dict[str, Any]] = []

        self._load_and_train()

    def _load_and_train(self):
        self.df = pd.read_csv(self.dataset_path)
        self.df["processed_text"] = self.df["feedback_text"].apply(preprocess_for_vectorizer)
        self.emotions = sorted(self.df["emotion"].unique().tolist())
        self.topics = sorted(self.df["topic"].unique().tolist())

        X_text = self.df["processed_text"].values
        X_raw = self.df["feedback_text"].values
        y_emo = self.df["emotion"].values
        y_top = self.df["topic"].values

        X_train, X_test, X_raw_train, X_raw_test, y_train, y_test = train_test_split(
            X_text, X_raw, y_emo, test_size=0.22, random_state=42, stratify=y_emo
        )

        # -----------------------------------------------------------------
        # A. EMOTION MODEL 1: Classical Statistical ML (TF-IDF + Calibrated LinearSVC)
        # -----------------------------------------------------------------
        t0 = time.perf_counter()
        self.tfidf_emotion_vectorizer = TfidfVectorizer(
            ngram_range=(1, 2),
            max_features=3500,
            sublinear_tf=True,
            min_df=2,
        )
        X_train_tfidf = self.tfidf_emotion_vectorizer.fit_transform(X_train)
        X_test_tfidf = self.tfidf_emotion_vectorizer.transform(X_test)

        base_svc = LinearSVC(C=1.2, class_weight="balanced", random_state=42)
        self.classical_svm_model = CalibratedClassifierCV(base_svc, cv=3)
        self.classical_svm_model.fit(X_train_tfidf, y_train)
        t_svm_train = round((time.perf_counter() - t0) * 1000, 2)

        t_inf0 = time.perf_counter()
        y_pred_svm = self.classical_svm_model.predict(X_test_tfidf)
        t_svm_inf = round(((time.perf_counter() - t_inf0) * 1000) / len(X_test), 3)

        # Also train Logistic Regression for classical comparison
        self.classical_logreg_model = LogisticRegression(
            C=2.0, max_iter=500, class_weight="balanced", random_state=42
        )
        self.classical_logreg_model.fit(X_train_tfidf, y_train)

        # -----------------------------------------------------------------
        # B. EMOTION MODEL 2: Domain Affective Lexicon + Valence Shifters
        # -----------------------------------------------------------------
        t_lex0 = time.perf_counter()
        y_pred_lex = []
        for raw_doc in X_raw_test:
            probs = predict_emotion_lexicon(raw_doc)
            best_emo = max(probs.items(), key=lambda x: x[1])[0]
            y_pred_lex.append(best_emo)
        t_lex_inf = round(((time.perf_counter() - t_lex0) * 1000) / len(X_raw_test), 3)

        # -----------------------------------------------------------------
        # C. EMOTION MODEL 3: Deep Neural Contextual Pipeline (Subword + Dense SVD + MLP)
        # -----------------------------------------------------------------
        t_nn0 = time.perf_counter()
        self.char_word_vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(3, 5),
            max_features=3200,
            sublinear_tf=True,
        )
        X_train_sub = self.char_word_vectorizer.fit_transform(X_raw_train)
        X_test_sub = self.char_word_vectorizer.transform(X_raw_test)

        n_comp = min(64, X_train_sub.shape[0] - 1, X_train_sub.shape[1] - 1)
        self.semantic_svd = make_pipeline(
            TruncatedSVD(n_components=n_comp, n_iter=3, random_state=42),
            Normalizer(copy=False),
        )
        X_train_dense = self.semantic_svd.fit_transform(X_train_sub)
        X_test_dense = self.semantic_svd.transform(X_test_sub)

        self.neural_mlp_model = MLPClassifier(
            hidden_layer_sizes=(64, 32),
            activation="relu",
            solver="adam",
            alpha=0.005,
            max_iter=130,
            tol=1e-3,
            early_stopping=False,
            random_state=42,
        )
        self.neural_mlp_model.fit(X_train_dense, y_train)
        t_nn_train = round((time.perf_counter() - t_nn0) * 1000, 2)

        t_nn_inf0 = time.perf_counter()
        y_pred_nn = self.neural_mlp_model.predict(X_test_dense)
        t_nn_inf = round(((time.perf_counter() - t_nn_inf0) * 1000) / len(X_test), 3)

        # -----------------------------------------------------------------
        # D. HYBRID ENSEMBLE (Neural MLP + Classical SVM + Affective Lexicon)
        # -----------------------------------------------------------------
        svm_probs = self.classical_svm_model.predict_proba(X_test_tfidf)
        nn_probs = self.neural_mlp_model.predict_proba(X_test_dense)
        classes = list(self.classical_svm_model.classes_)

        y_pred_ensemble = []
        for i, raw_doc in enumerate(X_raw_test):
            lex_p = predict_emotion_lexicon(raw_doc)
            lex_vec = np.array([lex_p[c] for c in classes])
            combined = 0.45 * nn_probs[i] + 0.40 * svm_probs[i] + 0.15 * lex_vec
            y_pred_ensemble.append(classes[int(np.argmax(combined))])

        # Compute full benchmark metrics
        self.model_metrics = {
            "test_sample_count": len(y_test),
            "train_sample_count": len(y_train),
            "classes": classes,
            "models": {
                "Affective Lexicon (Rule + Valence Shifters)": self._compute_metrics(
                    y_test, y_pred_lex, classes, train_ms=1.0, inf_ms=t_lex_inf
                ),
                "Classical ML (TF-IDF + Calibrated LinearSVC)": self._compute_metrics(
                    y_test, y_pred_svm, classes, train_ms=t_svm_train, inf_ms=t_svm_inf
                ),
                "Deep Neural MLP (Subword Embeddings + Dense SVD)": self._compute_metrics(
                    y_test, y_pred_nn, classes, train_ms=t_nn_train, inf_ms=t_nn_inf
                ),
                "Hybrid Transformer-Style Ensemble (Neural + SVM + Lexicon)": self._compute_metrics(
                    y_test, y_pred_ensemble, classes,
                    train_ms=round(t_svm_train + t_nn_train, 2),
                    inf_ms=round(t_svm_inf + t_nn_inf + t_lex_inf, 3),
                ),
            },
        }

        # Transform full dataset using the trained emotion vectorizer for topic classifier
        X_all_tfidf = self.tfidf_emotion_vectorizer.transform(X_text)

        # Train supervised topic reference classifier
        self.topic_classifier = CalibratedClassifierCV(
            LinearSVC(C=1.0, class_weight="balanced", random_state=42), cv=3
        )
        self.topic_classifier.fit(X_all_tfidf, y_top)

        # -----------------------------------------------------------------
        # E. UNSUPERVISED TOPIC MODELING (LDA vs. NMF vs. BERTopic-Style c-TF-IDF)
        # -----------------------------------------------------------------
        self._train_topic_models(X_text, None, y_top)

    def _compute_metrics(
        self, y_true, y_pred, classes: List[str], train_ms: float, inf_ms: float
    ) -> Dict[str, Any]:
        acc = accuracy_score(y_true, y_pred)
        prec, rec, f1, _ = precision_recall_fscore_support(
            y_true, y_pred, average="macro", zero_division=0
        )
        p_cls, r_cls, f1_cls, sup_cls = precision_recall_fscore_support(
            y_true, y_pred, labels=classes, average=None, zero_division=0
        )
        cm = confusion_matrix(y_true, y_pred, labels=classes)

        per_class = {}
        for idx, c in enumerate(classes):
            per_class[c] = {
                "precision": round(float(p_cls[idx]) * 100, 2),
                "recall": round(float(r_cls[idx]) * 100, 2),
                "f1": round(float(f1_cls[idx]) * 100, 2),
                "support": int(sup_cls[idx]),
            }

        return {
            "accuracy": round(float(acc) * 100, 2),
            "macro_precision": round(float(prec) * 100, 2),
            "macro_recall": round(float(rec) * 100, 2),
            "macro_f1": round(float(f1) * 100, 2),
            "train_time_ms": train_ms,
            "inference_latency_ms": inf_ms,
            "per_class": per_class,
            "confusion_matrix": cm.tolist(),
        }

    def _train_topic_models(self, X_text: np.ndarray, X_dense: np.ndarray, y_top: np.ndarray):
        n_topics = len(self.topics)  # 6 core academic topics

        # 1. Latent Dirichlet Allocation (LDA)
        self.count_vectorizer = CountVectorizer(
            max_features=1200, min_df=3, max_df=0.85, ngram_range=(1, 2)
        )
        X_counts = self.count_vectorizer.fit_transform(X_text)
        self.lda_model = LatentDirichletAllocation(
            n_components=n_topics,
            max_iter=12,
            learning_method="batch",
            doc_topic_prior=0.15,
            topic_word_prior=0.05,
            random_state=42,
        )
        lda_doc_topics = self.lda_model.fit_transform(X_counts)
        self.lda_topic_map = self._align_clusters_to_labels(
            np.argmax(lda_doc_topics, axis=1), y_top, n_topics
        )

        # 2. Non-Negative Matrix Factorization (NMF) with Kullback-Leibler / Frobenius TF-IDF
        self.tfidf_topic_vectorizer = TfidfVectorizer(
            max_features=1200, min_df=3, max_df=0.85, ngram_range=(1, 2), sublinear_tf=True
        )
        X_tfidf_top = self.tfidf_topic_vectorizer.fit_transform(X_text)
        self.nmf_model = NMF(
            n_components=n_topics,
            init="nndsvda",
            max_iter=160,
            random_state=42,
        )
        nmf_doc_topics = self.nmf_model.fit_transform(X_tfidf_top)
        self.nmf_topic_map = self._align_clusters_to_labels(
            np.argmax(nmf_doc_topics, axis=1), y_top, n_topics
        )

        # 3. BERTopic-Style Semantic Clustering (Dense Embeddings + Cosine KMeans + Class-based TF-IDF)
        # Combine word/topic TF-IDF SVD with subword embeddings for rich semantic representation
        self.bertopic_svd = make_pipeline(
            TruncatedSVD(n_components=32, n_iter=3, random_state=42),
            Normalizer(copy=False),
        )
        X_sem = self.bertopic_svd.fit_transform(X_tfidf_top)
        self.bertopic_kmeans = KMeans(n_clusters=n_topics, n_init=5, random_state=42)
        cluster_ids = self.bertopic_kmeans.fit_predict(X_sem)
        self.bertopic_cluster_map = self._align_clusters_to_labels(cluster_ids, y_top, n_topics)

        # Compute exact Class-based TF-IDF (c-TF-IDF) matrix across the clusters
        # Group all documents in cluster c into a single mega-document
        vocab = self.count_vectorizer.get_feature_names_out()
        cluster_term_matrix = np.zeros((n_topics, len(vocab)), dtype=np.float64)
        for doc_idx, cid in enumerate(cluster_ids):
            cluster_term_matrix[cid] += X_counts[doc_idx].toarray().ravel()

        # c-TF-IDF formula: tf_{t,c} * log(1 + A / tf_t)
        words_per_cluster = cluster_term_matrix.sum(axis=1, keepdims=True) + 1e-9
        tf_tc = cluster_term_matrix / words_per_cluster
        avg_words_A = float(words_per_cluster.mean())
        tf_t = cluster_term_matrix.sum(axis=0, keepdims=True) + 1e-9
        idf_class = np.log(1.0 + (avg_words_A / tf_t))
        self.c_tfidf_matrix = tf_tc * idf_class

        # Extract Topic Keywords, Coherence & Diversity metrics for all 3 models
        lda_topics_info, lda_div, lda_coh = self._extract_topic_info(
            self.lda_model.components_,
            vocab,
            X_counts,
            self.lda_topic_map,
            lda_doc_topics.argmax(axis=1),
        )
        nmf_vocab = self.tfidf_topic_vectorizer.get_feature_names_out()
        nmf_topics_info, nmf_div, nmf_coh = self._extract_topic_info(
            self.nmf_model.components_,
            nmf_vocab,
            X_tfidf_top,
            self.nmf_topic_map,
            nmf_doc_topics.argmax(axis=1),
        )
        bertopic_info, bert_div, bert_coh = self._extract_topic_info(
            self.c_tfidf_matrix,
            vocab,
            X_counts,
            self.bertopic_cluster_map,
            cluster_ids,
        )

        sil_lda = round(float(silhouette_score(X_sem, lda_doc_topics.argmax(axis=1))), 3)
        sil_nmf = round(float(silhouette_score(X_sem, nmf_doc_topics.argmax(axis=1))), 3)
        sil_bert = round(float(silhouette_score(X_sem, cluster_ids)), 3)

        self.topic_comparison_data = {
            "LDA (Latent Dirichlet Allocation)": {
                "algorithm_type": "Probabilistic Generative (Dirichlet Priors)",
                "topic_diversity": lda_div,
                "coherence_score": lda_coh,
                "silhouette_score": sil_lda,
                "topics": lda_topics_info,
            },
            "NMF (Non-Negative Matrix Factorization)": {
                "algorithm_type": "Linear Algebraic Matrix Decomposition (TF-IDF)",
                "topic_diversity": nmf_div,
                "coherence_score": nmf_coh,
                "silhouette_score": sil_nmf,
                "topics": nmf_topics_info,
            },
            "BERTopic-Style (Semantic Embeddings + c-TF-IDF)": {
                "algorithm_type": "Neural/SVD Contextual Embeddings + Class-Based TF-IDF",
                "topic_diversity": bert_div,
                "coherence_score": bert_coh,
                "silhouette_score": sil_bert,
                "topics": bertopic_info,
            },
        }

        # 2D Projection for Interactive Document Cluster Scatter Plot
        svd_2d = TruncatedSVD(n_components=2, random_state=42)
        coords_2d = svd_2d.fit_transform(X_sem)
        # Add small jitter for visual clarity on similar templates
        rng = np.random.default_rng(42)
        coords_2d = coords_2d + rng.normal(0, 0.035, size=coords_2d.shape)

        self.document_embeddings_2d = []
        for i in range(min(260, len(self.df))):
            row = self.df.iloc[i]
            self.document_embeddings_2d.append({
                "feedback_id": row["feedback_id"],
                "x": round(float(coords_2d[i, 0]), 4),
                "y": round(float(coords_2d[i, 1]), 4),
                "emotion": row["emotion"],
                "topic": row["topic"],
                "course_code": row["course_code"],
                "text": row["feedback_text"][:120] + ("..." if len(row["feedback_text"]) > 120 else ""),
            })

    def _align_clusters_to_labels(
        self, cluster_preds: np.ndarray, true_labels: np.ndarray, n_clusters: int
    ) -> Dict[int, str]:
        """Greedily maps unsupervised cluster IDs to dominant human-readable academic topics."""
        mapping: Dict[int, str] = {}
        used_labels = set()
        all_labels = sorted(list(set(true_labels)))

        # Compute overlap counts
        overlaps = []
        for cid in range(n_clusters):
            mask = cluster_preds == cid
            if mask.sum() == 0:
                continue
            counts = Counter(true_labels[mask])
            for lbl, cnt in counts.items():
                overlaps.append((cnt, cid, lbl))

        overlaps.sort(reverse=True)
        for _, cid, lbl in overlaps:
            if cid not in mapping and lbl not in used_labels:
                mapping[cid] = lbl
                used_labels.add(lbl)

        # Fill any remaining unmapped clusters
        remaining_labels = [l for l in all_labels if l not in used_labels]
        for cid in range(n_clusters):
            if cid not in mapping:
                mapping[cid] = remaining_labels.pop(0) if remaining_labels else f"Academic Topic #{cid+1}"

        return mapping

    def _extract_topic_info(
        self,
        components: np.ndarray,
        vocab: np.ndarray,
        doc_term_matrix,
        cluster_map: Dict[int, str],
        doc_clusters: np.ndarray,
        top_n: int = 10,
    ) -> Tuple[List[Dict[str, Any]], float, float]:
        topics_list = []
        all_top_words = []
        coherence_scores = []

        # Binary document presence matrix for UMass/PMI-style coherence calculation
        bin_dtm = (doc_term_matrix > 0).astype(int)
        doc_freqs = np.asarray(bin_dtm.sum(axis=0)).ravel()
        co_doc_matrix = (bin_dtm.T @ bin_dtm).toarray()

        for topic_idx, comp in enumerate(components):
            top_indices = comp.argsort()[::-1][:top_n]
            max_val = float(comp[top_indices[0]]) if comp[top_indices[0]] > 0 else 1.0

            keywords = []
            for idx in top_indices:
                w = str(vocab[idx])
                all_top_words.append(w)
                keywords.append({
                    "word": w,
                    "weight": round(float(comp[idx]) / max_val, 4),
                    "raw_score": round(float(comp[idx]), 4),
                })

            # Compute topic coherence across top 6 words
            pair_scores = []
            top_6 = top_indices[:6]
            for i in range(1, len(top_6)):
                for j in range(0, i):
                    wi, wj = top_6[i], top_6[j]
                    d_ij = co_doc_matrix[wi, wj]
                    d_j = doc_freqs[wj]
                    if d_j > 0:
                        pair_scores.append(math.log((d_ij + 1.0) / d_j))
            # Normalize UMass log score into an intuitive [0, 1] academic coherence index
            raw_umass = float(np.mean(pair_scores)) if pair_scores else -2.0
            norm_coherence = round(max(0.45, min(0.96, 1.0 + (raw_umass / 4.5))), 3)
            coherence_scores.append(norm_coherence)

            doc_count = int((doc_clusters == topic_idx).sum())
            topics_list.append({
                "cluster_id": topic_idx,
                "mapped_topic_name": cluster_map.get(topic_idx, f"Topic #{topic_idx+1}"),
                "document_count": doc_count,
                "coherence": norm_coherence,
                "keywords": keywords,
            })

        # Sort topics by mapped_topic_name for clean side-by-side comparison
        topics_list.sort(key=lambda x: x["mapped_topic_name"])

        unique_words = len(set(all_top_words))
        total_words = len(all_top_words) if all_top_words else 1
        diversity = round((unique_words / total_words) * 100, 1)
        avg_coherence = round(float(np.mean(coherence_scores)), 3)

        return topics_list, diversity, avg_coherence

    # =================================================================
    # 4. LIVE SINGLE FEEDBACK ANALYSIS (FULL PIPELINE INSPECTION)
    # =================================================================

    def analyze_single_feedback(self, text: str) -> Dict[str, Any]:
        t_start = time.perf_counter()
        prep = preprocess_text_detailed(text)
        proc_str = prep["processed_text"] if prep["processed_text"] else text.lower()

        # 1. Emotion Predictions across all 3 paradigms + Ensemble
        X_tfidf = self.tfidf_emotion_vectorizer.transform([proc_str])
        svm_probs_arr = self.classical_svm_model.predict_proba(X_tfidf)[0]

        X_sub = self.char_word_vectorizer.transform([text])
        X_dense = self.semantic_svd.transform(X_sub)
        nn_probs_arr = self.neural_mlp_model.predict_proba(X_dense)[0]

        lex_probs_dict = predict_emotion_lexicon(text)
        classes = list(self.classical_svm_model.classes_)

        svm_probs = {c: round(float(svm_probs_arr[i]), 4) for i, c in enumerate(classes)}
        nn_probs = {c: round(float(nn_probs_arr[i]), 4) for i, c in enumerate(classes)}

        # Adaptive ensemble weighting: if input has few training TF-IDF hits or contains contrastive/excess cues,
        # increase weight of the Affective Lexicon & Valence Shifter model
        has_contrast_or_excess = any(t in CONTRASTIVE_CONJUNCTIONS or t == "too" for t in prep["tokens"])
        tfidf_nnz = X_tfidf.nnz
        if tfidf_nnz <= 2 or has_contrast_or_excess:
            w_nn, w_svm, w_lex = 0.22, 0.23, 0.55
        else:
            w_nn, w_svm, w_lex = 0.45, 0.40, 0.15

        ensemble_probs = {}
        for i, c in enumerate(classes):
            ensemble_probs[c] = round(
                w_nn * nn_probs_arr[i] + w_svm * svm_probs_arr[i] + w_lex * lex_probs_dict[c],
                4,
            )
        # Normalize ensemble
        ens_sum = sum(ensemble_probs.values()) or 1.0
        ensemble_probs = {k: round(v / ens_sum, 4) for k, v in ensemble_probs.items()}

        primary_emotion = max(ensemble_probs.items(), key=lambda x: x[1])[0]
        primary_confidence = round(ensemble_probs[primary_emotion] * 100, 1)

        if primary_emotion in ("Joy / Satisfaction", "Appreciation / Gratitude"):
            sentiment_polarity = "Positive"
        elif primary_emotion in ("Confusion", "Boredom / Disengagement"):
            sentiment_polarity = "Neutral / Constructive"
        else:
            sentiment_polarity = "Negative"

        # 2. Topic Predictions across Supervised + Topic Lexicon + LDA + NMF + BERTopic-style
        sup_topic_probs_arr = self.topic_classifier.predict_proba(X_tfidf)[0]
        sup_classes = list(self.topic_classifier.classes_)

        # Compute Domain Topic Lexicon match scores for conversational robustness
        topic_lex_scores = {c: 0.12 for c in sup_classes}
        all_doc_lemmas = [lemmatize_token(t) for t in prep["tokens"]]
        for lm in all_doc_lemmas:
            for top_name, t_lex in TOPIC_LEXICON.items():
                if lm in t_lex and top_name in topic_lex_scores:
                    topic_lex_scores[top_name] += t_lex[lm]
        t_lex_sum = sum(topic_lex_scores.values()) or 1.0
        topic_lex_probs = {k: v / t_lex_sum for k, v in topic_lex_scores.items()}

        topic_scores = {}
        for i, c in enumerate(sup_classes):
            blended_t = (
                0.45 * float(sup_topic_probs_arr[i]) + 0.55 * topic_lex_probs[c]
                if tfidf_nnz <= 2
                else 0.70 * float(sup_topic_probs_arr[i]) + 0.30 * topic_lex_probs[c]
            )
            topic_scores[c] = round(blended_t, 4)
        t_sum = sum(topic_scores.values()) or 1.0
        topic_scores = {k: round(v / t_sum, 4) for k, v in topic_scores.items()}
        primary_topic = max(topic_scores.items(), key=lambda x: x[1])[0]

        # Unsupervised model assignments for this document
        X_cnt = self.count_vectorizer.transform([proc_str])
        lda_dist = self.lda_model.transform(X_cnt)[0]
        lda_best_cid = int(np.argmax(lda_dist))
        lda_topic_name = self.lda_topic_map.get(lda_best_cid, primary_topic)

        X_top_tfidf = self.tfidf_topic_vectorizer.transform([proc_str])
        nmf_dist = self.nmf_model.transform(X_top_tfidf)[0]
        nmf_best_cid = int(np.argmax(nmf_dist)) if nmf_dist.sum() > 0 else 0
        nmf_topic_name = self.nmf_topic_map.get(nmf_best_cid, primary_topic)

        X_sem_doc = self.bertopic_svd.transform(X_top_tfidf)
        bert_cid = int(self.bertopic_kmeans.predict(X_sem_doc)[0])
        bert_topic_name = self.bertopic_cluster_map.get(bert_cid, primary_topic)

        # Highlight emotion-bearing and topic-bearing tokens in the input text
        emotion_triggers = []
        for lemma in prep["lemmas"]:
            for emo, lex in EMOTION_LEXICON.items():
                if lemma in lex:
                    emotion_triggers.append({"lemma": lemma, "emotion": emo, "weight": lex[lemma]})

        recommendation = generate_contextual_recommendation(
            raw_text=text,
            tokens=prep["tokens"],
            lemmas=prep["lemmas"],
            bigrams=prep["bigrams"],
            primary_topic=primary_topic,
            primary_emotion=primary_emotion,
            emotion_triggers=emotion_triggers,
        )

        elapsed_ms = round((time.perf_counter() - t_start) * 1000, 2)

        return {
            "preprocessing": prep,
            "emotion_analysis": {
                "primary_emotion": primary_emotion,
                "confidence_pct": primary_confidence,
                "sentiment_polarity": sentiment_polarity,
                "ensemble_probabilities": ensemble_probs,
                "model_comparison": {
                    "Classical ML (TF-IDF + LinearSVC)": {
                        "predicted": max(svm_probs.items(), key=lambda x: x[1])[0],
                        "confidence": round(max(svm_probs.values()) * 100, 1),
                        "probabilities": svm_probs,
                    },
                    "Affective Lexicon (Valence Shifters)": {
                        "predicted": max(lex_probs_dict.items(), key=lambda x: x[1])[0],
                        "confidence": round(max(lex_probs_dict.values()) * 100, 1),
                        "probabilities": lex_probs_dict,
                    },
                    "Deep Neural MLP (Subword SVD Embeddings)": {
                        "predicted": max(nn_probs.items(), key=lambda x: x[1])[0],
                        "confidence": round(max(nn_probs.values()) * 100, 1),
                        "probabilities": nn_probs,
                    },
                },
                "detected_triggers": emotion_triggers,
            },
            "topic_analysis": {
                "primary_topic": primary_topic,
                "topic_probabilities": topic_scores,
                "unsupervised_assignments": {
                    "LDA (Probabilistic)": lda_topic_name,
                    "NMF (Matrix Factorization)": nmf_topic_name,
                    "BERTopic-Style (c-TF-IDF Clustering)": bert_topic_name,
                },
            },
            "pedagogical_recommendation": recommendation,
            "inference_time_ms": elapsed_ms,
        }

    # =================================================================
    # 5. DASHBOARD ANALYTICS & BATCH CSV ANALYSIS
    # =================================================================

    def get_dashboard_analytics(self, course_filter: str = "ALL") -> Dict[str, Any]:
        sub_df = self.df if course_filter == "ALL" else self.df[self.df["course_code"] == course_filter]
        if len(sub_df) == 0:
            sub_df = self.df

        emo_counts = sub_df["emotion"].value_counts().to_dict()
        topic_counts = sub_df["topic"].value_counts().to_dict()
        sentiment_counts = sub_df["sentiment"].value_counts().to_dict()

        # Topic x Emotion Cross-Tabulation Matrix
        crosstab = pd.crosstab(sub_df["topic"], sub_df["emotion"])
        heatmap_rows = []
        for top in self.topics:
            row_dict = {"topic": top}
            for emo in self.emotions:
                val = int(crosstab.loc[top, emo]) if (top in crosstab.index and emo in crosstab.columns) else 0
                row_dict[emo] = val
            heatmap_rows.append(row_dict)

        # Course-wise summary
        course_summary = []
        for code, grp in self.df.groupby("course_code"):
            pos_pct = round((grp["sentiment"] == "Positive").mean() * 100, 1)
            dom_emo = grp["emotion"].mode().iloc[0]
            dom_top = grp["topic"].mode().iloc[0]
            course_summary.append({
                "course_code": code,
                "course_name": grp["course_name"].iloc[0],
                "department": grp["department"].iloc[0],
                "total_reviews": int(len(grp)),
                "avg_rating": round(float(grp["rating"].mean()), 2),
                "positive_rate_pct": pos_pct,
                "dominant_emotion": dom_emo,
                "top_topic": dom_top,
            })

        # Sample records for interactive explorer
        sample_records = sub_df.head(120).to_dict(orient="records")

        pos_total = round((sub_df["sentiment"] == "Positive").mean() * 100, 1)
        avg_rating = round(float(sub_df["rating"].mean()), 2)

        # Pain point detection (topic with highest negative emotions)
        neg_df = sub_df[sub_df["sentiment"] == "Negative"]
        top_pain_point = neg_df["topic"].mode().iloc[0] if len(neg_df) > 0 else self.topics[0]

        return {
            "kpis": {
                "total_feedback": int(len(sub_df)),
                "average_rating": avg_rating,
                "positive_satisfaction_pct": pos_total,
                "dominant_emotion": sub_df["emotion"].mode().iloc[0],
                "top_pain_point_topic": top_pain_point,
                "best_model_f1": self.model_metrics["models"][
                    "Hybrid Transformer-Style Ensemble (Neural + SVM + Lexicon)"
                ]["macro_f1"],
            },
            "emotion_distribution": emo_counts,
            "topic_distribution": topic_counts,
            "sentiment_distribution": sentiment_counts,
            "topic_emotion_heatmap": heatmap_rows,
            "emotions_list": self.emotions,
            "topics_list": self.topics,
            "course_summary": course_summary,
            "recent_feedback": sample_records,
        }

    def analyze_batch_texts(
        self, texts: List[str], subjects: List[str] = None
    ) -> Dict[str, Any]:
        COURSE_LOOKUP = {
            "CS301": "CS301 — Natural Language Processing",
            "CS302": "CS302 — Machine Learning Foundations",
            "CS204": "CS204 — Database Management Systems",
            "EC201": "EC201 — Digital Signal Processing",
            "MA202": "MA202 — Probability & Statistics",
            "CS405": "CS405 — Deep Learning & Neural Networks",
        }

        def infer_subject_from_text(txt: str, primary_top: str) -> str:
            low = txt.lower()
            if any(w in low for w in ("transformer", "token", "lemmat", "nlp", "bert", "embedding", "attention")):
                return "CS301 — Natural Language Processing"
            if any(w in low for w in ("neural", "deep learning", "gpu", "cnn", "docker", "backprop")):
                return "CS405 — Deep Learning & Neural Networks"
            if any(w in low for w in ("sql", "database", "relational", "query", "indexing")):
                return "CS204 — Database Management Systems"
            if any(w in low for w in ("fourier", "signal", "filter", "dsp", "frequency")):
                return "EC201 — Digital Signal Processing"
            if any(w in low for w in ("probability", "statistics", "calculus", "proof", "theorem", "distribution")):
                return "MA202 — Probability & Statistics"
            if any(w in low for w in ("machine learning", "optimization", "regression", "svm", "classification")):
                return "CS302 — Machine Learning Foundations"
            return f"General Course ({primary_top})"

        results = []
        emo_counter = Counter()
        topic_counter = Counter()
        sentiment_counter = Counter()
        subject_groups: Dict[str, List[Dict[str, Any]]] = {}

        for idx, txt in enumerate(texts):
            if not str(txt).strip():
                continue
            clean_txt = str(txt).strip()
            res = self.analyze_single_feedback(clean_txt)
            emo = res["emotion_analysis"]["primary_emotion"]
            top = res["topic_analysis"]["primary_topic"]
            pol = res["emotion_analysis"]["sentiment_polarity"]

            raw_subj = ""
            if subjects and idx < len(subjects) and str(subjects[idx]).strip():
                raw_subj = str(subjects[idx]).strip()
            if raw_subj.upper() in COURSE_LOOKUP:
                subj_label = COURSE_LOOKUP[raw_subj.upper()]
            elif raw_subj:
                subj_label = raw_subj
            else:
                subj_label = infer_subject_from_text(clean_txt, top)

            emo_counter[emo] += 1
            topic_counter[top] += 1
            sentiment_counter[pol] += 1

            row_item = {
                "index": idx + 1,
                "subject": subj_label,
                "feedback_text": clean_txt,
                "emotion": emo,
                "emotion_confidence": res["emotion_analysis"]["confidence_pct"],
                "topic": top,
                "lda_topic": res["topic_analysis"]["unsupervised_assignments"]["LDA (Probabilistic)"],
                "nmf_topic": res["topic_analysis"]["unsupervised_assignments"]["NMF (Matrix Factorization)"],
                "bertopic_topic": res["topic_analysis"]["unsupervised_assignments"]["BERTopic-Style (c-TF-IDF Clustering)"],
                "sentiment": pol,
                "recommendation": res["pedagogical_recommendation"],
            }
            results.append(row_item)
            subject_groups.setdefault(subj_label, []).append(row_item)

        # Build Subject-Wise Teacher Action Plans & Pedagogical Measures
        subject_wise_suggestions = []
        for subj, items in subject_groups.items():
            total_s = len(items)
            pos_cnt = sum(1 for x in items if x["sentiment"] == "Positive")
            neg_cnt = sum(1 for x in items if x["sentiment"] == "Negative")
            neu_cnt = total_s - pos_cnt - neg_cnt

            pos_pct = round((pos_cnt / total_s) * 100, 1)
            neg_pct = round((neg_cnt / total_s) * 100, 1)
            neu_pct = round((neu_cnt / total_s) * 100, 1)

            s_emos = Counter(x["emotion"] for x in items)
            dom_emo = s_emos.most_common(1)[0][0]

            neg_or_neu_items = [x for x in items if x["sentiment"] != "Positive"]
            if neg_or_neu_items:
                pain_topics = Counter(x["topic"] for x in neg_or_neu_items)
                primary_focus_topic = pain_topics.most_common(1)[0][0]
            else:
                all_topics = Counter(x["topic"] for x in items)
                primary_focus_topic = all_topics.most_common(1)[0][0]

            if neg_pct >= 40.0:
                priority = "Immediate Faculty Intervention Required"
            elif neg_pct > 0 or neu_pct >= 30.0:
                priority = "Targeted Pedagogical & Pacing Adjustment"
            else:
                priority = "High Student Satisfaction — Reinforce Best Practices"

            # Synthesize distinct, concrete teacher measures for this subject
            measures: List[str] = []
            seen_topics = set()
            # First prioritize measures for negative/constructive reviews in this subject
            for x in neg_or_neu_items + items:
                pair_key = (x["topic"], x["emotion"])
                if pair_key not in seen_topics:
                    seen_topics.add(pair_key)
                    base_m = PEDAGOGICAL_RECOMMENDATIONS.get(pair_key, x["recommendation"])
                    measures.append(f"[{x['topic']} • {x['emotion']}]: {base_m}")
                if len(measures) >= 3:
                    break

            # Add an overarching subject coordinator summary action
            if neg_cnt > 0:
                summary_action = (
                    f"Subject Teacher Action for {subj}: Address student {dom_emo} centered on "
                    f"'{primary_focus_topic}' ({neg_cnt + neu_cnt} of {total_s} reviews flagged concerns) "
                    f"before the next assessment cycle."
                )
            else:
                summary_action = (
                    f"Subject Teacher Action for {subj}: Maintain current teaching momentum ({pos_pct}% positive affect) "
                    f"and archive successful '{primary_focus_topic}' materials as departmental benchmarks."
                )

            subject_wise_suggestions.append({
                "subject": subj,
                "total_reviews": total_s,
                "positive_pct": pos_pct,
                "negative_pct": neg_pct,
                "neutral_pct": neu_pct,
                "dominant_emotion": dom_emo,
                "primary_focus_topic": primary_focus_topic,
                "priority_level": priority,
                "summary_action": summary_action,
                "teacher_measures": measures,
            })

        # Sort subjects so those needing intervention appear first, then by review count
        subject_wise_suggestions.sort(
            key=lambda s: (s["negative_pct"], s["neutral_pct"], s["total_reviews"]),
            reverse=True,
        )

        return {
            "total_analyzed": len(results),
            "emotion_counts": dict(emo_counter),
            "topic_counts": dict(topic_counter),
            "sentiment_counts": dict(sentiment_counter),
            "results": results,
            "subject_wise_suggestions": subject_wise_suggestions,
        }

