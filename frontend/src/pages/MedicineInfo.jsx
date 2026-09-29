import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MedicineInfo = () => {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Load a few default medicines on startup
  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    handleSearch(null, true);
  }, [token, navigate]);

  // Search logic
  const handleSearch = async (e, initialLoad = false) => {
    if (e) e.preventDefault();
    
    setLoading(true);
    setError('');
    if (!initialLoad) {
      setSearched(true);
    }
    
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: query ? { name: query } : {},
      };

      const response = await axios.get(`${backendUrl}/api/medicines`, config);
      if (response.data.success) {
        setMedicines(response.data.medicines);
      }
    } catch (err) {
      console.error('Medicine info search error:', err);
      setError(
        err.response?.data?.message || 'Failed to search medicine information.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Medicine Information Vault</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Look up uses, side effects, and vital safety precautions for common medicines.</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}

      {/* Search Bar console */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <form onSubmit={(e) => handleSearch(e)} style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: '1rem', fontSize: '1.2rem' }}>🔍</span>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Paracetamol, Ibuprofen, Amoxicillin..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ minWidth: '120px' }}>
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🔄</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Searching medical catalog...</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🔬</span>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No medicines found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>
            {searched
              ? `No catalog entry found matching "${query}". Try searching for 'Paracetamol', 'Aspirin' or 'Ibuprofen'.`
              : 'Our lookup index was empty. Make sure your server successfully seeded values.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {medicines.map((med) => (
            <div key={med._id} className="card" style={{ padding: '2rem', borderTop: '2px solid rgba(16, 185, 129, 0.4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '2rem' }}>💊</span>
                <div>
                  <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>{med.name}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '600', textTransform: 'uppercase', tracking: '0.05em' }}>
                    Verified Database Information
                  </span>
                </div>
              </div>

              {/* Medicine Grid */}
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                {/* Uses */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                    🏥 Primary Uses
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{med.use}</p>
                </div>

                {/* Side Effects */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                    ⚠️ Side Effects
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{med.sideEffects}</p>
                </div>

                {/* Precautions */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.04)', borderRadius: '12px', padding: '1.25rem' }}>
                  <h4 style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1.1rem' }}>
                    🛡️ Precautions
                  </h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.6' }}>{med.precautions}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MedicineInfo;
