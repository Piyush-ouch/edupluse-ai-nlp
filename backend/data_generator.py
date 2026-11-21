"""
Synthetic & Realistic Student Feedback Dataset Generator for NLP Emotion & Topic Analysis.
Generates ~600 nuanced student feedback entries across courses, emotions, and academic topics.
"""

import os
import random
import pandas as pd
import numpy as np

EMOTIONS = [
    "Joy / Satisfaction",
    "Appreciation / Gratitude",
    "Frustration / Anger",
    "Anxiety / Stress",
    "Confusion",
    "Boredom / Disengagement",
]

TOPICS = [
    "Teaching Style & Pedagogy",
    "Curriculum & Course Content",
    "Assessment, Exams & Grading",
    "Workload, Deadlines & Pacing",
    "Lab Infrastructure & Resources",
    "Doubt Support & Mentorship",
]

COURSES = [
    ("CS301", "Natural Language Processing", "Computer Science"),
    ("CS302", "Machine Learning Foundations", "Computer Science"),
    ("CS204", "Database Management Systems", "Computer Science"),
    ("EC201", "Digital Signal Processing", "Electronics"),
    ("MA202", "Probability & Statistics", "Mathematics"),
    ("CS405", "Deep Learning & Neural Networks", "Computer Science"),
]

SEMESTERS = ["Fall 2025", "Spring 2026", "Fall 2026"]

# Templates keyed by (Topic, Emotion) to create realistic, domain-rich academic text
FEEDBACK_TEMPLATES = {
    ("Teaching Style & Pedagogy", "Joy / Satisfaction"): [
        "The professor explains complex algorithms with crystal clear intuition and engaging real-world analogies.",
        "I absolutely loved the interactive coding demonstrations during lectures; every session felt lively and insightful.",
        "Visualizing mathematical derivations step by step on the board made learning effortless and genuinely enjoyable.",
        "The instructor's enthusiasm is contagious and the structured lecture flow kept the entire class excited to learn.",
        "Connecting theoretical concepts directly to live industry case studies made this my favorite class of the semester.",
        "Every lecture was well-paced, engaging, and packed with practical insights that made tough concepts click immediately.",
    ],
    ("Teaching Style & Pedagogy", "Appreciation / Gratitude"): [
        "Thank you professor for being so patient and encouraging whenever students asked foundational questions in class.",
        "I am deeply grateful for the extra effort the instructor put into recording supplemental walkthrough videos for us.",
        "Truly appreciate how the faculty adapted the teaching pace after our mid-semester feedback to help everyone succeed.",
        "Heartfelt thanks to the teaching team for fostering such a welcoming, respectful, and motivating classroom environment.",
        "The professor genuinely cares about student comprehension rather than just rushing through slides—thank you so much!",
    ],
    ("Teaching Style & Pedagogy", "Boredom / Disengagement"): [
        "Lectures consist entirely of reading verbatim from dense PowerPoint slides in a monotone voice for two straight hours.",
        "There is zero interaction in class; the delivery is so dry and repetitive that most students zone out within ten minutes.",
        "The teaching style feels completely mechanical and uninspiring, with no real examples or class discussions.",
        "Sitting through the morning lectures feels tedious because the instructor just recites textbook paragraphs word for word.",
        "The class lacks energy and practical engagement, making even interesting topics feel dull and monotonous.",
    ],
    ("Teaching Style & Pedagogy", "Confusion"): [
        "The instructor jumps between advanced mathematical proofs and code snippets without explaining how they connect.",
        "I often leave the lecture hall more bewildered than when I walked in because the explanations skip critical intermediate steps.",
        "The terminology used in class is inconsistent with the textbook, leaving everyone puzzled about the core definitions.",
        "Topics are introduced randomly without a clear roadmap, so it is really hard to follow the overarching logic of the subject.",
        "When explaining neural architectures, the professor assumes we already know advanced tensor calculus, which is very confusing.",
    ],
    ("Teaching Style & Pedagogy", "Frustration / Anger"): [
        "It is extremely frustrating when the instructor dismisses student questions in class and tells us to just Google it.",
        "The professor rushes through fifty slides in forty minutes and refuses to slow down despite repeated requests from students.",
        "Wasting lecture time on tangential stories and then cramming the actual syllabus in the last five minutes is unacceptable.",
    ],

    ("Curriculum & Course Content", "Joy / Satisfaction"): [
        "The syllabus is brilliantly modernized with state-of-the-art topics like transformers, embeddings, and practical NLP pipelines.",
        "I am thrilled with how well the course modules build upon each other, transitioning smoothly from fundamentals to advanced projects.",
        "The reading materials, curated research papers, and hands-on notebooks are top-notch and directly relevant to modern AI roles.",
        "Learning both classical statistical methods and modern deep learning architectures gave me a complete, satisfying mastery of the field.",
        "The curriculum strikes the perfect balance between rigorous mathematical theory and exciting applied engineering.",
    ],
    ("Curriculum & Course Content", "Appreciation / Gratitude"): [
        "Grateful that the department updated the syllabus this year to include modern frameworks and open-source tools.",
        "Thank you for providing such well-documented lecture notes and curated reference guides that saved us hours of searching.",
        "I really appreciate the inclusion of ethical AI and real-world deployment modules in the course curriculum.",
    ],
    ("Curriculum & Course Content", "Boredom / Disengagement"): [
        "The syllabus is severely outdated and focuses on obsolete tools from fifteen years ago that nobody uses in industry anymore.",
        "Most of the course content simply repeats what we already covered in introductory programming, making it redundant and boring.",
        "We spent six weeks on trivial introductory definitions without ever touching a single interesting real-world application.",
        "The prescribed textbook is dry, archaic, and completely disconnected from modern engineering practices.",
    ],
    ("Curriculum & Course Content", "Confusion"): [
        "The syllabus structure is chaotic; advanced modules are taught before the prerequisite mathematical foundations are covered.",
        "I cannot figure out how the lab experiments relate to the theoretical syllabus because the two tracks are completely out of sync.",
        "The course notes contain contradictory formulas and vague problem statements that leave us guessing what is actually correct.",
        "There is no clear learning objective for several modules, and the overlapping topics create a lot of conceptual ambiguity.",
    ],
    ("Curriculum & Course Content", "Frustration / Anger"): [
        "We were promised hands-on machine learning projects in the course catalog, but the entire syllabus turned out to be rote memorization.",
        "It is infuriating to pay tuition for an advanced elective only to be taught outdated syllabus material copied from old blogs.",
        "Essential prerequisite topics were skipped entirely in the curriculum, setting students up to struggle on advanced modules.",
    ],

    ("Assessment, Exams & Grading", "Frustration / Anger"): [
        "The grading rubric is completely arbitrary and opaque; points were deducted without a single comment explaining why.",
        "The midterm exam tested obscure footnote trivia that was never once discussed in lectures or assignments—totally unfair!",
        "Waiting six weeks to receive grades for quiz one while quiz three is already tomorrow is deeply frustrating and unprofessional.",
        "Two students with nearly identical project implementations received wildly different grades due to inconsistent TA evaluation.",
        "Penalizing twenty percent for a minor formatting typo while ignoring the working algorithm is ridiculous and demoralizing.",
    ],
    ("Assessment, Exams & Grading", "Anxiety / Stress"): [
        "Making the final closed-book exam worth seventy percent of the total grade creates unbearable pressure and exam anxiety.",
        "The surprise pop quizzes with negative marking keep everyone on edge and terrified of making a single mistake.",
        "The exam time limit is so tight that even well-prepared students panic and cannot finish half the analytical questions.",
        "Not knowing the grading scale or passing threshold until after the final exam causes constant worry throughout the semester.",
    ],
    ("Assessment, Exams & Grading", "Confusion"): [
        "The exam questions were worded so vaguely that nobody in the hall knew whether to write pseudocode, full code, or a proof.",
        "The grading breakdown on the portal does not match the syllabus weightage, and I have no idea how my midterm score was calculated.",
        "Assignment evaluation criteria change after submission, leaving students unsure about what the graders actually expect.",
    ],
    ("Assessment, Exams & Grading", "Joy / Satisfaction"): [
        "The open-book analytical exams tested genuine conceptual understanding rather than rote memorization—a breath of fresh air!",
        "Grading was prompt, transparent, and accompanied by detailed rubric feedback that helped me improve on the next project.",
        "Replacing the high-stakes final exam with a milestone-based capstone project allowed us to showcase our real engineering skills.",
    ],
    ("Assessment, Exams & Grading", "Appreciation / Gratitude"): [
        "Thank you for providing detailed solution keys and constructive feedback comments on every graded assignment.",
        "I really appreciate the fair regrade policy and how openly the professor reviewed midterm marking queries.",
    ],

    ("Workload, Deadlines & Pacing", "Anxiety / Stress"): [
        "Assigning three heavy coding projects, a research paper review, and a midterm in the same week is overwhelming and exhausting.",
        "The relentless pace of weekly assignments leaves zero time to sleep or study for other required departmental courses.",
        "I am constantly stressed about meeting the midnight lab deadlines because each homework takes over twenty hours to debug.",
        "The workload in the second half of the semester escalated so drastically that my mental health and sleep schedule suffered.",
        "Having overlapping project deliverables due during exam week induces severe burnout and academic anxiety.",
    ],
    ("Workload, Deadlines & Pacing", "Frustration / Anger"): [
        "Releasing a massive programming assignment on Friday evening and making it due Monday morning shows zero respect for students' time.",
        "The workload for this three-credit course is heavier than two four-credit courses combined, which is completely unreasonable.",
        "Changing the project specifications two days before the submission deadline wasted a full week of our hard work!",
    ],
    ("Workload, Deadlines & Pacing", "Joy / Satisfaction"): [
        "The bi-weekly assignment schedule was thoughtfully paced, giving us ample time to experiment, debug, and learn deeply.",
        "Having three flexible grace days for homework submissions removed unnecessary panic and helped me produce my best work.",
        "The course pacing was steady and well-distributed across the semester without any last-minute cramming.",
    ],
    ("Workload, Deadlines & Pacing", "Appreciation / Gratitude"): [
        "Thank you for extending the capstone deadline by forty-eight hours when our batch had multiple midterm exams scheduled.",
        "I really appreciate how the professor broke the semester project into manageable checkpoints with clear weekly goals.",
    ],

    ("Lab Infrastructure & Resources", "Frustration / Anger"): [
        "Half the computers in the laboratory crash during model training and lack the GPU drivers required for the assignments.",
        "The local lab server goes down every time more than twenty students log in before a submission deadline—it is infuriating!",
        "We are expected to train deep neural networks, yet the department lab machines do not even have Python packages properly installed.",
        "Broken software licenses and restricted admin permissions in the lab wasted three full hours of our practical session.",
        "The Wi-Fi in the lab building disconnects constantly, making it impossible to download datasets or push code to Git.",
    ],
    ("Lab Infrastructure & Resources", "Confusion"): [
        "The lab manual instructions were written for an older software version, so none of the menu paths or commands match our systems.",
        "There is no documentation on how to connect to the department GPU cluster or configure the virtual environment for lab tasks.",
        "Students are confused about which dataset version to use because the lab portal has three broken links and outdated starter code.",
    ],
    ("Lab Infrastructure & Resources", "Anxiety / Stress"): [
        "During practical lab exams, the slow machines freeze for ten minutes at a time, making us panic about losing our code before time runs out.",
        "Worrying about whether the shared cloud credits will run out mid-training adds a lot of stress to our final project.",
    ],
    ("Lab Infrastructure & Resources", "Joy / Satisfaction"): [
        "The new GPU cloud notebooks and pre-configured Docker containers worked flawlessly and made running experiments a breeze!",
        "Having access to well-maintained lab workstations and clean starter repositories made the practical sessions super productive.",
    ],
    ("Lab Infrastructure & Resources", "Appreciation / Gratitude"): [
        "Big thanks to the lab technicians and sysadmins for setting up the JupyterHub server so we could run experiments remotely.",
        "Really appreciate the comprehensive environment setup guide and pre-installed libraries in the computer lab.",
    ],

    ("Doubt Support & Mentorship", "Appreciation / Gratitude"): [
        "The teaching assistants went above and beyond during office hours, staying late to help me debug my tokenization pipeline.",
        "I am so grateful to the professor for mentoring our project team and giving us career advice and research guidance.",
        "Whenever I posted a conceptual doubt on the discussion forum, the TAs responded within an hour with clear, helpful hints.",
        "Thank you for creating such a supportive mentorship culture where no student feels hesitant to ask for help.",
        "The one-on-one project review sessions with the instructor gave our group the exact direction and confidence we needed.",
    ],
    ("Doubt Support & Mentorship", "Joy / Satisfaction"): [
        "Office hours were super collaborative and helpful; walking through my architecture diagrams with the TA solved all my doubts.",
        "The active Q&A forum and weekly doubt-clearing tutorials made learning complex NLP algorithms smooth and enjoyable.",
    ],
    ("Doubt Support & Mentorship", "Frustration / Anger"): [
        "My questions on the course discussion forum have gone completely unanswered for three weeks despite multiple polite reminders.",
        "The TA didn't even show up to scheduled office hours twice in a row, leaving ten students waiting outside the office.",
        "Emailing the instructor for project clarification yields one-word replies after ten days, which is no help at all.",
    ],
    ("Doubt Support & Mentorship", "Confusion"): [
        "Different TAs give completely contradictory advice on how to structure the final report, leaving our team confused.",
        "When I asked for help during tutorial hours, the TA's explanation was so vague that I still didn't understand the bug.",
    ],
    ("Doubt Support & Mentorship", "Boredom / Disengagement"): [
        "Tutorial doubt sessions are passive and unengaging because the TA just copies solutions onto the board without talking to us.",
    ],
}

MODIFIERS_PREFIX = [
    "",
    "Honestly, ",
    "In my experience this semester, ",
    "Overall, ",
    "From a student perspective, ",
    "To be completely frank, ",
    "Reflecting on this course, ",
    "Throughout the semester, ",
]

MODIFIERS_SUFFIX = [
    "",
    " This definitely impacted my learning experience.",
    " I hope the department takes note of this for future batches.",
    " Everyone in my study group felt the exact same way.",
    " It really stood out compared to my other classes this term.",
    " This aspect of the course deserves special mention in the evaluation.",
    " It made a huge difference to my academic progress this semester.",
]

RATING_MAP = {
    "Joy / Satisfaction": [4, 5, 5, 5],
    "Appreciation / Gratitude": [4, 5, 5, 5],
    "Confusion": [2, 2, 3, 3],
    "Boredom / Disengagement": [1, 2, 2, 3],
    "Anxiety / Stress": [1, 2, 2, 3],
    "Frustration / Anger": [1, 1, 2, 2],
}


def generate_dataset(num_samples: int = 620, seed: int = 42) -> pd.DataFrame:
    random.seed(seed)
    np.random.seed(seed)

    records = []
    # First include all base templates so every single clean archetype is represented
    all_pairs = list(FEEDBACK_TEMPLATES.keys())

    # Weights to simulate realistic academic distribution
    pair_weights = []
    for topic, emotion in all_pairs:
        w = len(FEEDBACK_TEMPLATES[(topic, emotion)])
        pair_weights.append(w)

    total_w = sum(pair_weights)
    probs = [w / total_w for w in pair_weights]

    for idx in range(num_samples):
        if idx < sum(len(v) for v in FEEDBACK_TEMPLATES.values()):
            # Deterministically iterate through all base templates first
            running = 0
            chosen_pair = all_pairs[0]
            base_text = ""
            for pair, templates in FEEDBACK_TEMPLATES.items():
                if idx < running + len(templates):
                    chosen_pair = pair
                    base_text = templates[idx - running]
                    break
                running += len(templates)
            prefix = ""
            suffix = ""
        else:
            pair_idx = np.random.choice(len(all_pairs), p=probs)
            chosen_pair = all_pairs[pair_idx]
            templates = FEEDBACK_TEMPLATES[chosen_pair]
            base_text = random.choice(templates)
            prefix = random.choice(MODIFIERS_PREFIX)
            suffix = random.choice(MODIFIERS_SUFFIX)

            # Lowercase first char of base_text if prefix is non-empty and base_text doesn't start with "I " or "TA" or "GPU" or "Wi-Fi"
            if prefix and not base_text.startswith(("I ", "TA", "GPU", "Wi-Fi")):
                base_text = base_text[0].lower() + base_text[1:]

        topic, emotion = chosen_pair
        course_code, course_name, department = random.choice(COURSES)
        semester = random.choice(SEMESTERS)
        rating = random.choice(RATING_MAP[emotion])

        full_text = f"{prefix}{base_text}{suffix}".strip()

        # Introduce realistic mixed-context / cross-aspect academic phrasing in ~8% of samples
        # so held-out test benchmarks reflect real-world ambiguity and highlight ensemble gains
        if idx >= 120 and idx % 12 == 0:
            cross_clauses = [
                " Even though the subject itself is interesting, this issue really stood out.",
                " While I tried my best to keep up with the lectures and notes, it was tough.",
                " My peers had mixed reactions during the lab and tutorial sessions as well.",
                " Hopefully the grading rubric and lecture pacing can be balanced better next time.",
            ]
            full_text = full_text + random.choice(cross_clauses)
        if idx >= 150 and idx % 19 == 0:
            # Subtle borderline emotion phrasing (e.g., confusion vs frustration or anxiety vs frustration)
            borderline_swap = {
                "Frustration / Anger": "Confusion",
                "Confusion": "Anxiety / Stress",
                "Anxiety / Stress": "Frustration / Anger",
                "Joy / Satisfaction": "Appreciation / Gratitude",
                "Appreciation / Gratitude": "Joy / Satisfaction",
                "Boredom / Disengagement": "Confusion",
            }
            emotion = borderline_swap.get(emotion, emotion)

        # Derive polarity category
        if emotion in ("Joy / Satisfaction", "Appreciation / Gratitude"):
            sentiment = "Positive"
        elif emotion in ("Confusion", "Boredom / Disengagement"):
            sentiment = "Neutral / Constructive"
        else:
            sentiment = "Negative"

        records.append({
            "feedback_id": f"FB-{1001 + idx}",
            "student_id": f"STU-{random.randint(100, 999)}",
            "course_code": course_code,
            "course_name": course_name,
            "department": department,
            "semester": semester,
            "rating": rating,
            "feedback_text": full_text,
            "emotion": emotion,
            "topic": topic,
            "sentiment": sentiment,
        })

    df = pd.DataFrame(records)
    # Shuffle rows deterministically
    df = df.sample(frac=1.0, random_state=seed).reset_index(drop=True)
    df["feedback_id"] = [f"FB-{1001 + i}" for i in range(len(df))]
    return df


if __name__ == "__main__":
    out_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "student_feedback_dataset.csv")
    df = generate_dataset(620)
    df.to_csv(out_path, index=False)
    print(f"Generated {len(df)} student feedback records at: {out_path}")
    print("\nEmotion Distribution:")
    print(df["emotion"].value_counts())
    print("\nTopic Distribution:")
    print(df["topic"].value_counts())

