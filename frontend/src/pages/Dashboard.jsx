import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const [name, setName] = useState('');
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalReminders, setTotalReminders] = useState(0);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token exists
    const token = localStorage.getItem('token');
    const userString = localStorage.getItem('user');

    if (!token || !userString) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userString);
    setName(user.name);

    const fetchDashboardData = async () => {
      setLoading(true);
      setError('');
      try {
        const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const authConfig = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        // Fetch records and reminders in parallel
        const [recordsRes, remindersRes] = await Promise.all([
          axios.get(`${backendUrl}/api/records`, authConfig),
          axios.get(`${backendUrl}/api/reminders`, authConfig),
        ]);

        if (recordsRes.data.success) {
          setTotalRecords(recordsRes.data.count);
          // Show up to 3 recent records
          setRecentRecords(recordsRes.data.records.slice(0, 3));
        }

        if (remindersRes.data.success) {
          setTotalReminders(remindersRes.data.count);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to fetch dashboard data. Please log in again.');
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', animation: 'spin 1.5s linear infinite' }}>🔄</div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dash-header">
        <div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Welcome back, {name}! 👋</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Here is a summary of your medical portal status.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/records" className="btn btn-primary">
            ➕ Upload Record
          </Link>
          <Link to="/reminders" className="btn btn-secondary">
            ⏰ Add Reminder
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
        <div className="card metric-card">
          <div className="metric-info">
            <h3>Medical Records</h3>
            <p>{totalRecords}</p>
          </div>
          <div className="metric-icon">📂</div>
        </div>

        <div className="card metric-card">
          <div className="metric-info">
            <h3>Reminders Set</h3>
            <p>{totalReminders}</p>
          </div>
          <div className="metric-icon">⏰</div>
        </div>
      </div>

      {/* Recent Records Section */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Recent Uploaded Records</h2>
          <Link to="/records" style={{ fontSize: '0.9rem', fontWeight: '600' }}>
            View All Records →
          </Link>
        </div>

        {recentRecords.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>📝</span>
            <p>No medical records uploaded yet.</p>
            <Link to="/records" className="btn btn-secondary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Upload Your First Record
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Record Name</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Category</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem' }}>Record Date</th>
                  <th style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.9rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((record) => (
                  <tr key={record._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', transition: 'var(--transition)' }} className="table-row-hover">
                    <td style={{ padding: '1rem 0.5rem', fontWeight: '500' }}>📄 {record.fileName}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`record-badge badge-${record.category.toLowerCase().replace(' ', '-')}`} style={{ margin: 0 }}>
                        {record.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'var(--text-secondary)' }}>
                      {new Date(record.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <a
                        href={record.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        👁️ View
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
