"""
Pre-trains the StudentFeedbackNLPEngine and saves a version-tagged Joblib cache
to data/nlp_engine_cache.joblib for sub-second Render Free Tier startup.
"""

import os
import sys
import time
import joblib
import numpy as np
import pandas as pd
import sklearn

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from data_generator import generate_dataset
from nlp_engine import StudentFeedbackNLPEngine

DATA_DIR = os.path.join(BASE_DIR, "data")
DATASET_PATH = os.path.join(DATA_DIR, "student_feedback_dataset.csv")
CACHE_PATH = os.path.join(DATA_DIR, "nlp_engine_cache.joblib")


def main():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DATASET_PATH):
        print(f"Generating dataset at {DATASET_PATH}...")
        df_init = generate_dataset(620)
        df_init.to_csv(DATASET_PATH, index=False)

    t0 = time.perf_counter()
    print(
        f"Building NLP cache (Python {sys.version.split()[0]}, "
        f"sklearn {sklearn.__version__}, numpy {np.__version__}, pandas {pd.__version__})..."
    )
    engine = StudentFeedbackNLPEngine(DATASET_PATH)
    payload = {
        "sklearn_version": sklearn.__version__,
        "numpy_version": np.__version__,
        "pandas_version": pd.__version__,
        "engine": engine,
    }
    joblib.dump(payload, CACHE_PATH, compress=3)
    size_mb = round(os.path.getsize(CACHE_PATH) / (1024 * 1024), 2)
    elapsed = round(time.perf_counter() - t0, 2)
    print(f"Saved NLP cache to {CACHE_PATH} ({size_mb} MB) in {elapsed}s")


if __name__ == "__main__":
    main()
