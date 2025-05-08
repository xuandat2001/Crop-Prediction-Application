import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';

export default function CropPredictionPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [csvUrl, setCsvUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.zip')) {
      setSelectedFile(file);
    } else {
      alert('Please upload a .zip file only.');
      setSelectedFile(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('No valid file selected.');
      return;
    }

    const formData = new FormData();
    formData.append('zipfile', selectedFile);

    try {
       // Call API Post here to save the zip file to drive, Example :
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Backend should return the path to the generated CSV
      const csvBlob = new Blob([response.data.csvContent], { type: 'text/csv' });
      setCsvUrl(URL.createObjectURL(csvBlob));
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const CustomButton = ({ children, onClick, className }) => (
    <button
      onClick={onClick}
      className={`btn btn-success w-100 d-flex align-items-center justify-content-center ${className}`}>
      {children}
    </button>
  );

  const CustomCard = ({ children }) => (
    <div className="card shadow rounded-4 p-4">
      <div className="card-body">
        {children}
      </div>
    </div>
  );

  const UploadIcon = () => <i className="bi bi-upload me-2"></i>;
  const DownloadIcon = () => <i className="bi bi-download me-2"></i>;

  return (
    <div className="container">
      <div className='row'>
        <div className='col-12'>
          <header className="bg-success text-white text-center py-4 mb-5 rounded-4 shadow">
            <h1 className="display-5 fw-bold">Crop Health Prediction</h1>
            <p className="lead">Upload a .zip file containing crop images</p>
          </header>
          <CustomCard>
            <div className="mb-3">
              <label htmlFor="zipUpload" className="form-label fw-semibold">Upload ZIP File</label>
              <input id="zipUpload" type="file" accept=".zip" onChange={handleFileChange} className="form-control" />
            </div>
            <CustomButton onClick={handleUpload}>
              <UploadIcon /> Upload ZIP & Predict
            </CustomButton>

            {csvUrl && (
              <a
                href={csvUrl}
                download="prediction_summary.csv"
                className="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center"
              >
                <DownloadIcon /> Download Prediction Summary (CSV)
              </a>
            )}
          </CustomCard>
        </div>
      </div>
    </div>
  );
}
