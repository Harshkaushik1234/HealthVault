import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MedicineReminder = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form inputs
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Fetch reminders
  const fetchReminders = async () => {
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const response = await axios.get(`${backendUrl}/api/reminders`, config);
      if (response.data.success) {
        setReminders(response.data.reminders);
      }
    } catch (err) {
      console.error('Error fetching reminders:', err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError('Failed to fetch reminders.');
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
    fetchReminders();
  }, [token, navigate]);

  // Form Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!medicineName || !dosage || !time) {
      setError('Please fill in all required fields (Name, Dosage, and Time)');
      return;
    }

    setAdding(true);
    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.post(
        `${backendUrl}/api/reminders`,
        { medicineName, dosage, time, notes },
        config
      );

      if (response.data.success) {
        setSuccess('Medicine reminder configured successfully.');
        setMedicineName('');
        setDosage('');
        setTime('08:00');
        setNotes('');
        fetchReminders();
      }
    } catch (err) {
      console.error('Add reminder error:', err);
      setError(err.response?.data?.message || 'Failed to add reminder.');
    } finally {
      setAdding(false);
    }
  };

  // Delete Reminder
  const handleDeleteReminder = async (id) => {
    setError('');
    setSuccess('');

    try {
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const response = await axios.delete(`${backendUrl}/api/reminders/${id}`, config);

      if (response.data.success) {
        setSuccess('Reminder removed.');
        fetchReminders();
      }
    } catch (err) {
      console.error('Delete reminder error:', err);
      setError(err.response?.data?.message || 'Failed to delete reminder.');
    }
  };

  return (
    <div className="main-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.25rem' }}>Medicine Reminder Portal</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure schedules and log notes for taking your pills.</p>
      </div>

      {error && <div className="alert alert-danger">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      <div className="grid-3" style={{ alignItems: 'start', gap: '2rem' }}>
        {/* Reminder config form */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '0.5rem' }}>
            Schedule Reminder
          </h3>

          <form onSubmit={handleAddSubmit}>
            <div className="form-group">
              <label htmlFor="medName">Medicine Name *</label>
              <input
                type="text"
                id="medName"
                className="form-control"
                placeholder="e.g. Paracetamol"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="dosage">Dosage *</label>
              <input
                type="text"
                id="dosage"
                className="form-control"
                placeholder="e.g. 1 Tablet, 5ml"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="time">Time *</label>
              <input
                type="time"
                id="time"
                className="form-control"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Special Notes (Optional)</label>
              <textarea
                id="notes"
                className="form-control"
                rows="3"
                placeholder="e.g. Take after dinner"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{ resize: 'vertical', minHeight: '80px' }}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={adding}
            >
              {adding ? 'Creating Schedule...' : '⏰ Set Reminder'}
            </button>
          </form>
        </div>

        {/* Reminders List Panel */}
        <div style={{ gridColumn: 'span 2' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '2.5rem', animation: 'spin 1.5s linear infinite' }}>🔄</div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading schedule items...</p>
            </div>
          ) : reminders.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⏰</span>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No active reminders</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Use the setup panel on the left to configure your first daily dosage reminder.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {reminders.map((reminder) => (
                <div key={reminder._id} className="card" style={{ display: 'flex', flexDirection: 'column', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.2rem', color: '#fff' }}>💊 {reminder.medicineName}</h4>
                    <span style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--accent-neon)' }}>
                      🕒 {reminder.time}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                    Dosage: <span style={{ color: 'var(--text-secondary)' }}>{reminder.dosage}</span>
                  </p>

                  {reminder.notes && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '0.5rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '6px', marginBottom: '1.5rem', borderLeft: '2px solid rgba(16, 185, 129, 0.3)' }}>
                      📝 {reminder.notes}
                    </p>
                  )}

                  <div style={{ marginTop: 'auto', textAlign: 'right' }}>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteReminder(reminder._id)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                    >
                      🗑️ Delete Reminder
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

export default MedicineReminder;
