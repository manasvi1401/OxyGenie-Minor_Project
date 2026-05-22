import os
import re
import numpy as np
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Combines multiple feature extractors together. Here it combines: Word TF-IDF & Character TF-IDF
from sklearn.pipeline import FeatureUnion
# Improves probability accuracy., Makes confidence scores more reliable.
from sklearn.calibration import CalibratedClassifierCV
# Detects unusual or unknown inputs, Used for anomaly detection.
from sklearn.ensemble import IsolationForest
# Prints accuracy metrics: precision, recall, f1-score  
from sklearn.metrics import classification_report


def clean_text(text):
    if pd.isna(text):
        return ""
    text = str(text).lower().strip()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text) # Removes multiple spaces
    return text


def build_text(symptom_text, plantcategory="plant"):
    plant = str(plantcategory).lower().strip() if pd.notna(plantcategory) else "plant"
    symptom = clean_text(symptom_text)
    return f"{plant} {symptom}".strip()


def train_ml_classifier(csv_path="plant_disease_dataset.csv"):
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset file '{csv_path}' not found.")

    df = pd.read_csv(csv_path, header=None)
    df.columns = [
        'id',
        'plantcategory',
        'symptomtext',
        'diseaselabel',
        'severity',
        'treatment',
        'prevention',
        'expertverified',
        'scientificsource',
    ]

    df = df.dropna(subset=['symptomtext', 'diseaselabel']).copy()
    df['diseaselabel'] = df['diseaselabel'].astype(str).str.strip()
    df['text'] = df.apply(
        lambda row: build_text(row['symptomtext'], row['plantcategory']),
        axis=1
    )

    if len(df) < 2:
        raise ValueError("Dataset must contain at least 2 valid rows.")

    class_counts = df['diseaselabel'].value_counts()
    min_count = class_counts.min()

    print("\n=== Class counts ===")
    print(class_counts)

    rare_classes = class_counts[class_counts < 2]
    if not rare_classes.empty:
        print("\nWarning: These classes have fewer than 2 samples:")
        print(rare_classes)

    use_stratify = min_count >= 2

    X = df['text']
    y = df['diseaselabel']

    X_train, X_val, y_train, y_val = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y if use_stratify else None # Keeps class balance if possible.
    )

    feature_extractor = FeatureUnion([  # Combines multiple TF-IDF models.
        (
            'word_tfidf',
            TfidfVectorizer(
                ngram_range=(1, 2),
                stop_words='english',
                min_df=1,
                max_df=0.95,
                sublinear_tf=True
            )
        ),
        (
            'char_tfidf',
            TfidfVectorizer(
                analyzer='char_wb',  # Uses character windows
                ngram_range=(3, 5),
                min_df=1,
                sublinear_tf=True
            )
        )
    ])

    X_train_vec = feature_extractor.fit_transform(X_train)
    X_val_vec = feature_extractor.transform(X_val)

    train_class_counts = pd.Series(y_train).value_counts()
    min_train_count = train_class_counts.min()

    base_clf = LogisticRegression(
        max_iter=4000,
        class_weight='balanced',
        random_state=42
    )

    ''' Probability calibration works by introducing a secondary machine learning model (the calibrator) 
    that acts as a post-processing layer. This layer sits directly between your base model's raw 
    uncalibrated scores and the final output probabilities.
    Instead of changing the base model's inner weights or decision boundaries, 
    it learns a mathematical function that maps distorted scores into true, reliable probabilities'''

    if min_train_count >= 3:
        classifier = CalibratedClassifierCV(
            estimator=base_clf,
            cv=3,
            method='sigmoid'
        )
        print("\nUsing CalibratedClassifierCV with cv=3")
    elif min_train_count >= 2:
        classifier = CalibratedClassifierCV(
            estimator=base_clf,
            cv=2,
            method='sigmoid'
        )
        print("\nUsing CalibratedClassifierCV with cv=2")
    else:
        classifier = base_clf
        print("\nToo few samples for calibration. Using plain LogisticRegression.")

    classifier.fit(X_train_vec, y_train)

    try:
        val_preds = classifier.predict(X_val_vec)
        print("\n=== Validation Report ===")
        print(classification_report(y_val, val_preds, zero_division=0))
    except Exception as e:
        print(f"\nValidation report skipped: {e}")

    '''Isolation Forest is an unsupervised machine learning algorithm specifically configured for anomaly or outlier detection.
    The specific code uses your vectorized text data (X_train_vec) 
    to construct a mathematical boundary of what "normal" text data looks like so it can flag unusual entries later.'''
    
    novelty_detector = IsolationForest(
        n_estimators=200,
        contamination=0.08,
        random_state=42
    )
    novelty_detector.fit(X_train_vec)

    disease_info = {}
    for disease in df['diseaselabel'].unique():
        sub = df[df['diseaselabel'] == disease]

        treatments = sub['treatment'].dropna().astype(str).str.strip().unique().tolist()
        preventions = sub['prevention'].dropna().astype(str).str.strip().unique().tolist()

        sev_mode = sub['severity'].dropna().astype(str).str.strip().mode()
        severity = sev_mode.iloc[0] if not sev_mode.empty else "moderate"

        disease_info[disease] = {
            "treatment": treatments[:3] if treatments else ["Consult agriculture expert"],
            "prevention": preventions[:3] if preventions else ["Follow general guidelines"],
            "severity": severity,
        }

    return classifier, feature_extractor, novelty_detector, disease_info


classifier, feature_extractor, novelty_detector, disease_info = train_ml_classifier()


def diagnose_symptoms(symptom_text, plantcategory="plant", min_conf=25.0, min_margin=15.0):
    text = build_text(symptom_text, plantcategory)

    if not text or len(text.split()) < 2:
        return {
            "disease": "unknown",
            "confidence": 0.0,
            "confidence_level": "LOW",
            "reason": "Input text is too short or empty.",
            "severity": "unknown",
            "treatment": ["Provide clearer symptom details."],
            "prevention": ["Mention plant name and visible symptoms."],
            "top_candidates": {},
        }

    vec = feature_extractor.transform([text])

    anomaly_flag = novelty_detector.predict(vec)[0]

    probs = classifier.predict_proba(vec)[0]
    classes = classifier.classes_

    top_idx = np.argsort(probs)[::-1]
    best_idx = top_idx[0]
    second_idx = top_idx[1] if len(top_idx) > 1 else top_idx[0]

    pred = classes[best_idx]
    conf = float(probs[best_idx] * 100)
    margin = float((probs[best_idx] - probs[second_idx]) * 100)

    top_candidates = {
        classes[i]: round(float(probs[i]) * 100, 1)
        for i in top_idx[:3]
    }

    if anomaly_flag == -1:
        return {
            "disease": "unknown",
            "confidence": round(conf, 1),
            "confidence_level": "LOW",
            "reason": "Input appears outside the training distribution.",
            "severity": "unknown",
            "treatment": ["Consult agriculture expert"],
            "prevention": ["Provide clearer symptom details with plant name."],
            "top_candidates": top_candidates,
        }

    if conf < min_conf or margin < min_margin:
        return {
            "disease": "unknown",
            "confidence": round(conf, 1),
            "confidence_level": "LOW",
            "reason": "Prediction confidence is too weak.",
            "severity": "unknown",
            "treatment": ["Consult agriculture expert"],
            "prevention": ["Provide clearer symptom details with plant name."],
            "top_candidates": top_candidates,
        }

    info = disease_info.get(
        pred,
        {
            "treatment": ["Consult agriculture expert"],
            "prevention": ["Follow general guidelines"],
            "severity": "unknown",
        },
    )

    return {
        "disease": pred,
        "confidence": round(conf, 1),
        "confidence_level": "HIGH" if conf >= 85 else "MEDIUM",
        "margin": round(margin, 1),
        "severity": info["severity"],
        "treatment": info["treatment"],
        "prevention": info["prevention"],
        "top_candidates": top_candidates,
    }


if __name__ == "__main__":
    test_cases = [
        ("yellow leaves with holes and white fungus", "tomato"),
        ("plant leaf turning yellow with brown spots", "potato"),
        ("asdfgh qwerty random nonsense text", "plant"),
        ("", "plant"),
    ]

    for symptom, plant in test_cases:
        print("\nInput:", symptom)
        print(diagnose_symptoms(symptom, plant))