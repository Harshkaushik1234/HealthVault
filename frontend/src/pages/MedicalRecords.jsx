import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MedicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Form Fields
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('Other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch records
  const fetchRecords = async (searchQuery = '') => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: searchQuery ? { search: searchQuery } : {},
      };

      const response = await axios.get(`${backendUrl}/api/records`, config);
      if (response.data.success) {
        setRecords(response.data.records);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to load medical records.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchRecords();
  }, [token, navigate]);

  // Handle search typing
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    fetchRecords(term);
  };

  // Handle file select
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // Upload Record submit
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    if (!category || !date) {
      setError('Please select both a category and a record date.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      formData.append('date', date);

      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.post(`${backendUrl}/api/records`, formData, config);

      if (response.data.success) {
        setSuccess('Medical record uploaded directly to Cloudinary successfully!');
        setFile(null);
        setCategory('Other');
        setDate(new Date().toISOString().split('T')[0]);
        // Reset file input element
        document.getElementById('file-input').value = '';
        // Reload record grid
        fetchRecords(searchTerm);
      }
    } catch (err) {
      console.error('Upload record error:', err);
      setError(
        err.response?.data?.message || 'Upload failed. Ensure Cloudinary is configured in .env file.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Delete Record
  const handleDeleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medical record? This will remove it from Cloudinary.')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`${backendUrl}/api/records/${id}`, config);

      if (response.data.success) {
        setSuccess('Record deleted successfully.');
        fetchRecords(searchTerm);
      }
    } catch (err) {
      console.error('Delete record error:', err);
      setError(err.response?.data?.message || 'Failed to delete record.');
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Medical Record Vault</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Upload, search, organize, and manage your health documents.</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="grid-3" style={{ alignItems: 'start', gap: '2rem' }}>
        {/* Upload Form Panel */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            Upload Document
          </h3>

          <form onSubmit={handleUploadSubmit}>
            <div className="form-group">
              <label htmlFor="file-input">Select File</label>
              <input
                type="file"
                id="file-input"
                className="form-control"
                style={{ padding: '0.5rem' }}
                onChange={handleFileChange}
                required
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                Supports PDF, DOC, DOCX, JPG, PNG
              </span>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Vaccine Record">Vaccine Record</option>
                <option value="Billing/Invoice">Billing / Invoice</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Record Date</label>
              <input
                type="date"
                id="date"
                className="form-control"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading to Cloudinary...' : '🚀 Stream to Cloudinary'}
            </button>
          </form>
        </div>

        {/* View Grid and Search panel */}
        <div style={{ gridColumn: 'span 2' }}>
          <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '1.25rem' }}>🔍</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search documents by name or category..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{ border: 'none', background: 'transparent', padding: '0.5rem 0' }}
              />
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🔄</div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading record grid...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📂</span>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No medical documents found</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                {searchTerm ? 'No results matched your search term.' : 'Use the upload form on the left to add your first record.'}
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {records.map((record) => (
                <div key={record._id} className="card record-card">
                  <span className={`record-badge badge-${record.category.toLowerCase().replace(' ', '-')}`}>
                    {record.category}
                  </span>
                  <h4 className="record-title" title={record.fileName}>
                    📄 {record.fileName}
                  </h4>
                  <p className="record-date">
                    📅 Date: {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  
                  <div className="record-actions">
                    <a
                      href={record.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '0.5rem' }}
                    >
                      👁️ View Document
                    </a>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteRecord(record._id)}
                      style={{ padding: '0.5rem 0.75rem' }}
                      title="Delete Record"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MedicalRecords;
