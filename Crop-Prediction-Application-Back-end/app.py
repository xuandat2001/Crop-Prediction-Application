from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
import os
import numpy as np
from PIL import Image
import tensorflow as tf
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allows frontend on port 5173 to talk to this backend


# Config
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
MODEL_PATH = 'models/final_EfficientNetB0_model_task_2.keras'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load model once at startup
model = tf.keras.models.load_model(MODEL_PATH)

# Class names (adjust these to match your dataset)
class_names = ['Variety A', 'Variety B', 'Variety C']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def preprocess_image(image_path):
    img = Image.open(image_path).convert('RGB')
    img = img.resize((224, 224))  # Adjust if your model uses a different input size
    img_array = np.array(img) / 255.0  # Normalize
    return np.expand_dims(img_array, axis=0)

@app.route('/predict-variety', methods=['POST'])
def predict_variety():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    file = request.files['image']
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(image_path)

        # Preprocess and predict
        input_image = preprocess_image(image_path)
        predictions = model.predict(input_image)
        predicted_class = class_names[np.argmax(predictions)]

        # Optional: delete the uploaded image
        os.remove(image_path)

        return jsonify({
            'prediction': predicted_class
        })
    else:
        return jsonify({'error': 'Invalid file type'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)