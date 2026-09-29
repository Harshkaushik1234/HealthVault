import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ShareRecords = () => {
  const { token } = useParams(); // If present, we are in doctor view mode
  const navigate = useNavigate();

  // Patient Select Mode States
  const [records, setRecords] = useState([]);
  const [selectedRecordIds, setSelectedRecordIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Doctor View Mode States
  const [sharedPatientName, setSharedPatientName] = useState('');
  const [sharedPatientEmail, setSharedPatientEmail] = useState('');
  const [sharedRecords, setSharedRecords] = useState([]);
  const [sharedAt, setSharedAt] = useState('');

  const patientToken = localStorage.getItem('token');

  // Fetch data depending on Doctor vs Patient view
  useEffect(() => {
    const fetchSharedData = async () => {
      setLoading(true);
      setError('');
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        // Fetch shared records public details
        const response = await axios.get(`${backendUrl}/api/share/${token}`);
        if (response.data.success) {
          setSharedPatientName(response.data.patientName);
          setSharedPatientEmail(response.data.patientEmail);
          setSharedRecords(response.data.records);
          setSharedAt(response.data.sharedAt);
        }
      } catch (err) {
        console.error('Retrieve shared records error:', err);
        setError(
          err.response?.data?.message || 'Invalid, expired, or corrupted sharing token.'
        );
      } finally {
        setLoading(false);
      }
    };

    const fetchPatientRecords = async () => {
      setLoading(true);
      setError('');
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const config = { headers: { Authorization: `Bearer ${patientToken}` } };
        
        const response = await axios.get(`${backendUrl}/api/records`, config);
        if (response.data.success) {
          setRecords(response.data.records);
        }
      } catch (err) {
        console.error('Patient load records share error:', err);
        if (err.response?.status === 401) {
          localStorage.clear();
          navigate('/login');
        } else {
          setError('Failed to load your medical records.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      // Doctor View Mode
      fetchSharedData();
    } else {
      // Patient Selector Mode
      if (!patientToken) {
        navigate('/login');
        return;
      }
      fetchPatientRecords();
    }
  }, [token, patientToken, navigate]);

  // Handle Checklist Checkboxes
  const handleCheckboxChange = (recordId) => {
    if (selectedRecordIds.includes(recordId)) {
      setSelectedRecordIds(selectedRecordIds.filter((id) => id !== recordId));
    } else {
      setSelectedRecordIds([...selectedRecordIds, recordId]);
    }
  };

  // Submit and Generate Token API Link
  const handleGenerateLink = async () => {
    setError('');
    setSuccess('');
    setShareUrl('');

    if (selectedRecordIds.length === 0) {
      setError('Please select at least one record to generate a share link.');
      return;
    }

    setGenerating(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = { headers: { Authorization: `Bearer ${patientToken}` } };

      const response = await axios.post(
        `${backendUrl}/api/share`,
        { recordIds: selectedRecordIds },
        config
      );

      if (response.data.success) {
        setSuccess('Secure cryptographic share link generated!');
        setShareUrl(response.data.shareUrl);
        // Clear checkboxes
        setSelectedRecordIds([]);
      }
    } catch (err) {
      console.error('Error generating share link:', err);
      setError(err.response?.data?.message || 'Failed to generate sharing link.');
    } finally {
      setGenerating(false);
    }
  };

  // Copy share URL to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Share link copied to clipboard! You can now send it to your doctor.');
  };

  // ==========================================
  // VIEW RENDER: DOCTOR / PUBLIC ACCESS VIEW
  // ==========================================
  if (token) {
    return (
      <div className="main-content" style={{ maxWidth: '900px', padding: '3rem 1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span style={{ fontSize: '3.5rem' }}>🛡️</span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '1rem', color: '#fff' }}>HealthVault Shared Portal</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Doctor Clinical Document Viewer (Secured Cryptographically)
          </p>
        </div>

        {error && (
          <div className="card" style={{ textAlign: 'center', padding: '3rem', borderColor: 'var(--danger)' }}>
            <span style={{ fontSize: '3rem' }}>⚠️</span>
            <h3 style={{ fontSize: '1.4rem', marginTop: '1rem', color: '#fca5a5' }}>Portal Error</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{error}</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '1rem' }}>
              Please check that the sharing link is complete and hasn't been modified.
            </p>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '4rem' }}>
            <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🔄</div>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Decrypting secure shared links...</p>
          </div>
        )}

        {!loading && !error && (
          <div>
            {/* Patient Header Card */}
            <div className="card" style={{ marginBottom: '2rem', background: 'rgba(16, 185, 129, 0.04)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                📋 Patient Shared Report Details
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <p style={{ fontSize: '0.95rem' }}>
                  <strong>Patient Name:</strong> <span style={{ color: 'var(--text-secondary)' }}>{sharedPatientName}</span>
                </p>
                <p style={{ fontSize: '0.95rem' }}>
                  <strong>Patient Contact:</strong> <span style={{ color: 'var(--text-secondary)' }}>{sharedPatientEmail}</span>
                </p>
                <p style={{ fontSize: '0.95rem' }}>
                  <strong>Generation Date:</strong>{' '}
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {new Date(sharedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </p>
              </div>
            </div>

            <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem' }}>Shared Medical Documents ({sharedRecords.length})</h3>

            {sharedRecords.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No documents were included in this sharing token.</p>
              </div>
            ) : (
              <div className="grid-2">
                {sharedRecords.map((record) => (
                  <div key={record._id} className="card record-card">
                    <span className={`record-badge badge-${record.category.toLowerCase().replace(' ', '-')}`}>
                      {record.category}
                    </span>
                    <h4 className="record-title" title={record.fileName} style={{ marginBottom: '0.5rem' }}>
                      📄 {record.fileName}
                    </h4>
                    <p className="record-date" style={{ marginBottom: '1.5rem' }}>
                      📅 Date: {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    
                    <a
                      href={record.filePath}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: 'auto' }}
                    >
                      👁️ Open File
                    </a>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              ⚠️ Confidential Medical Information. Access to this link is granted solely for clinical review.
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW RENDER: PATIENT LINK GENERATOR VIEW
  // ==========================================
  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Doctor Record Sharing</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Select specific records to securely share with your doctors by generating high-entropy sharing tokens.</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Share url presentation card */}
      {shareUrl && (
        <div className="card pulse" style={{ marginBottom: '2rem', border: '1px solid var(--accent-neon)', background: 'rgba(0, 230, 118, 0.03)' }}>
          <h3 style={{ color: 'var(--accent-neon)', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
            🔗 Sharing Link Generated Successfully!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Send this URL to your doctor. Anyone with this link can view the selected documents without an account.
          </p>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(7, 10, 19, 0.8)', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {shareUrl}
            </span>
            <button className="btn btn-primary" onClick={handleCopyLink} style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Copy Link
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🔄</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading documents library...</p>
        </div>
      ) : records.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📂</span>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No documents to share</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto', marginBottom: '1.5rem' }}>
            You need to upload medical documents in the Medical Records Vault before you can generate share links for doctors.
          </p>
          <button className="btn btn-primary" onClick={() => navigate('/records')}>
            Go to Vault
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Select Documents to Share ({selectedRecordIds.length} selected)</h3>
            <button
              className="btn btn-primary"
              onClick={handleGenerateLink}
              disabled={generating || selectedRecordIds.length === 0}
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
            >
              {generating ? 'Generating Portal...' : '🔗 Generate Sharing Link'}
            </button>
          </div>

          <div className="grid-2" style={{ gap: '1.25rem' }}>
            {records.map((record) => {
              const isChecked = selectedRecordIds.includes(record._id);
              return (
                <div
                  key={record._id}
                  className={`card checkbox-card ${isChecked ? 'pulse' : ''}`}
                  onClick={() => handleCheckboxChange(record._id)}
                  style={{
                    borderColor: isChecked ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255,255,255,0.05)',
                    background: isChecked ? 'rgba(16, 185, 129, 0.02)' : 'var(--bg-card)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Controlled by click on card
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span className={`record-badge badge-${record.category.toLowerCase().replace(' ', '-')}`}>
                      {record.category}
                    </span>
                    <h4 className="record-title" style={{ marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                      {record.fileName}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Date: {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareRecords;
