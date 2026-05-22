import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image

# ==========================================
# PATHS
# ==========================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "plant_disease_efficientnet.keras"
)

CLASS_NAMES_PATH = os.path.join(
    BASE_DIR,
    "class_names.json"
)

IMG_SIZE = (224, 224)

# ==========================================
# LOAD MODEL
# ==========================================
model = tf.keras.models.load_model(
    MODEL_PATH
)

# ==========================================
# LOAD CLASS NAMES
# ==========================================
with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:

    loaded = json.load(f)

# Handle dict or list
if isinstance(loaded, dict):

    idx_to_class = {
        int(v): k
        for k, v in loaded.items()
    }

    class_names = [
        idx_to_class[i]
        for i in sorted(idx_to_class.keys())
    ]

else:
    class_names = loaded

# Remove invalid labels
class_names = [
    c for c in class_names
    if c.lower() not in ["plantvillage", "dataset"]
]

print("\nLoaded Classes:")

for i, cls in enumerate(class_names):
    print(i, cls)

# ==========================================
# FORMAT LABEL
# ==========================================
def format_label(label):

    return (
        label
        .replace("___", " - ")
        .replace("_", " ")
    )

# ==========================================
# PREPROCESS IMAGE
# ==========================================
def preprocess_image(file):

    img = Image.open(file).convert("RGB")

    img = img.resize(
        IMG_SIZE,
        Image.Resampling.LANCZOS
    )

    # IMPORTANT:
    # USE SAME PREPROCESSING AS TRAINING
    # Assuming training used rescale=1./255

    img_array = np.array(
        img,
        dtype=np.float32
    ) / 255.0

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    return img_array

# ==========================================
# PREDICT DISEASE
# ==========================================
def predict_disease_from_image(
    file,
    threshold=0.60
):

    img_array = preprocess_image(file)

    preds = model.predict(
        img_array,
        verbose=0
    )[0]

    pred_idx = int(np.argmax(preds))

    confidence = float(np.max(preds))

    print("\nTop Predictions:")

    for i in np.argsort(preds)[::-1][:5]:

        print(
            class_names[i],
            float(preds[i])
        )

    top3_idx = np.argsort(preds)[::-1][:3]

    top_predictions = [

        {
            "label": format_label(
                class_names[i]
            ),

            "confidence": round(
                float(preds[i]) * 100,
                2
            )
        }

        for i in top3_idx
    ]

    # ======================================
    # LOW CONFIDENCE
    # ======================================
    if confidence < threshold:

        return {

            "disease": "Unknown",

            "confidence": round(
                confidence * 100,
                2
            ),

            "confidence_level": "LOW",

            "reason": "Low confidence prediction",

            "top_predictions": top_predictions
        }

    # ======================================
    # FINAL RESULT
    # ======================================
    return {

        "disease": format_label(
            class_names[pred_idx]
        ),

        "confidence": round(
            confidence * 100,
            2
        ),

        "confidence_level": (
            "HIGH"
            if confidence >= 0.85
            else "MEDIUM"
            if confidence >= 0.60
            else "LOW"
        ),

        "top_predictions": top_predictions
    }