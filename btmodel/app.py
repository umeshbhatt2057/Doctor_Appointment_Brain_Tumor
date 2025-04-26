from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
from PIL import Image
import numpy as np
import io
import json  # ✅ Import JSON module

app = Flask(__name__)
CORS(app)

# Load the trained model
MODEL_PATH = 'best_model.h5'  # Or 'model.keras'
model = load_model(MODEL_PATH)

# ✅ Load class names from JSON
with open('class_names.json', 'r') as f:
    CLASS_NAMES = json.load(f)

# Preprocess uploaded image
def preprocess_image(image_bytes):
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image = image.resize((224, 224))  # Match your model’s input
    image = img_to_array(image)
    image = image / 255.0
    image = np.expand_dims(image, axis=0)
    return image

# Prediction API
@app.route('/api/check-tumor', methods=['POST'])
def check_tumor():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    try:
        img_bytes = file.read()
        processed_image = preprocess_image(img_bytes)

        prediction = model.predict(processed_image)
        predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
        confidence = float(np.max(prediction[0]))

        return jsonify({
            'result': f'{predicted_class} (Confidence: {confidence:.1%})'
        })
    except Exception as e:
        print("🔥 Error during prediction:", str(e))
        return jsonify({'error': str(e)}), 500

# Run Flask server
if __name__ == '__main__':
    app.run(debug=True, port=5000)
