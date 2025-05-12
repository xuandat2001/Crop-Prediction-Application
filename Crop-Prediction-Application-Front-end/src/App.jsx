import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

export default function CropPredictionPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [predictionType, setPredictionType] = useState('variety');
  const [predictionResult, setPredictionResult] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPredictionResult('');
    } else {
      alert('Please upload a valid image.');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handlePredict = async () => {
    if (!selectedFile) {
      alert('Please upload an image file first.');
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);

    let endpoint = '';
    if (predictionType === 'variety') {
      endpoint = 'predict-variety';
    } else if (predictionType === 'disease') {
      endpoint = 'predict-disease';
    } else if (predictionType === 'age') {
      endpoint = 'predict-age';
    }

    try {
      const response = await axios.post(`http://localhost:5000/${endpoint}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setPredictionResult(response.data.prediction);// assuming backend returns { result: 'something' }
    } catch (error) {
      console.error('Prediction error:', error);
      alert('Prediction failed. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          <header className="bg-success text-white text-center py-4 mb-5 rounded-4 shadow">
            <h1 className="display-5 fw-bold">Crop Health Prediction</h1>
            <p className="lead">Select a prediction task and upload a crop image</p>
          </header>
          <div className="card shadow rounded-4 p-4">
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="taskSelect" className="form-label fw-semibold">Select Prediction Type</label>
                <select
                  id="taskSelect"
                  className="form-select"
                  value={predictionType}
                  onChange={(e) => setPredictionType(e.target.value)}
                >
                  <option value="disease">Predict Disease</option>
                  <option value="age">Predict Age</option>
                  <option value="variety">Predict Variety</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="imageUpload" className="form-label fw-semibold">Upload Image</label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>

              <button onClick={handlePredict} className="btn btn-success w-100 mb-3">
                Upload & Predict
              </button>

              {previewUrl && (
                <div className="text-center mb-3">
                  <img src={previewUrl} alt="Preview" className="img-fluid rounded shadow" style={{ maxHeight: '300px' }} />
                </div>
              )}

              {predictionResult && (
                <div className="alert alert-info text-center fw-bold">
                  Prediction: {predictionResult}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
