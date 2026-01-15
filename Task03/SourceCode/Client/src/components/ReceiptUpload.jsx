/**
 * ReceiptUpload Component
 * Upload receipt images for OCR processing and expense creation
 */

import { useState, useRef } from 'react';
import { FaCamera, FaUpload, FaCheck, FaTimes, FaLightbulb, FaRuler, FaBullseye, FaStar, FaFileAlt } from 'react-icons/fa';
import { MdRocketLaunch } from 'react-icons/md';
import { expenseAPI } from '../services/api';
import '../styles/ReceiptUpload.css';

export default function ReceiptUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      setUploading(true);
      setError(null);
      const response = await expenseAPI.upload(formData);
      
      setResult({
        success: true,
        data: response.data,
        message: 'Receipt uploaded and processed successfully!'
      });

      // Call success callback if provided
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
      }

      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('expenseUploaded', { detail: response.data }));

      // Reset form after 3 seconds
      setTimeout(() => {
        handleReset();
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload receipt');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatAmount = (amount) => {
    return `Rs ${amount.toFixed(2)}`;
  };

  return (
    <div className="receipt-upload">
      <div className="upload-header">
        <h1><FaCamera style={{verticalAlign: 'middle'}} /> Upload Receipt</h1>
        <p>Upload a receipt image for automatic OCR processing</p>
      </div>

      <div className="upload-container">
        {!selectedFile ? (
          <div
            className={`drop-zone ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="drop-zone-content">
              <div className="upload-icon"><FaUpload size={48} /></div>
              <h3>Drag & Drop Receipt Image</h3>
              <p>or click to browse</p>
              <p className="file-info">Supports: JPEG, PNG, WebP (Max 5MB)</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileInputChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div className="preview-section">
            <div className="preview-header">
              <h3>Selected Receipt</h3>
              <button className="btn-reset" onClick={handleReset}>
                Change File
              </button>
            </div>

            <div className="preview-container">
              <img src={preview} alt="Receipt preview" />
              <div className="file-details">
                <p className="file-name"><FaFileAlt style={{verticalAlign: 'middle'}} /> {selectedFile.name}</p>
                <p className="file-size">
                  Size: {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>

            {!uploading && !result && (
              <button className="btn-upload" onClick={handleUpload}>
                <MdRocketLaunch style={{verticalAlign: 'middle'}} /> Upload & Process
              </button>
            )}

            {uploading && (
              <div className="uploading-state">
                <div className="spinner"></div>
                <p>Processing receipt with OCR...</p>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-message">
            <FaTimes style={{verticalAlign: 'middle'}} /> {error}
          </div>
        )}

        {result && result.success && (
          <div className="success-message">
            <div className="success-header">
              <div className="success-icon"><FaCheck size={32} /></div>
              <h3>{result.message}</h3>
            </div>

            <div className="extracted-data">
              <h4>Extracted Information:</h4>
              <div className="data-grid">
                <div className="data-item">
                  <span className="label">Vendor:</span>
                  <span className="value">{result.data.vendor || 'N/A'}</span>
                </div>
                <div className="data-item">
                  <span className="label">Amount:</span>
                  <span className="value amount">
                    {formatAmount(result.data.amount || 0)}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Date:</span>
                  <span className="value">
                    {result.data.date ? new Date(result.data.date).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="data-item">
                  <span className="label">Category:</span>
                  <span className="value">{result.data.category || 'Other'}</span>
                </div>
                {result.data.ocrConfidence && (
                  <div className="data-item">
                    <span className="label">OCR Confidence:</span>
                    <span className="value">
                      {(result.data.ocrConfidence * 100).toFixed(0)}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="redirect-message">Redirecting to expense list...</p>
          </div>
        )}
      </div>

      {/* Upload Tips */}
      <div className="upload-tips">
        <h3><FaBullseye style={{verticalAlign: 'middle'}} /> Tips for Better Results</h3>
        <div className="tips-grid">
          <div className="tip">
            <div className="tip-icon"><FaLightbulb size={24} /></div>
            <p>Ensure the receipt is well-lit and clearly visible</p>
          </div>
          <div className="tip">
            <div className="tip-icon"><FaRuler size={24} /></div>
            <p>Keep the receipt flat and avoid wrinkles or folds</p>
          </div>
          <div className="tip">
            <div className="tip-icon"><FaBullseye size={24} /></div>
            <p>Capture the entire receipt including vendor and date</p>
          </div>
          <div className="tip">
            <div className="tip-icon"><FaStar size={24} /></div>
            <p>Use high resolution images for better OCR accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
