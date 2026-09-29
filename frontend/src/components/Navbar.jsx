import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Do not render Navbar if user is not logged in (or on login/register/public doctor pages)
  if (!token) {
    return null;
  }

  return (
    <header className="nav-header">
      <div className="nav-container">
        <div className="nav-logo" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span className="nav-logo-icon">🛡️</span>
          <span>Health<span style={{ color: 'var(--primary)' }}>Vault</span></span>
        </div>

        <nav>
          <ul className="nav-menu">
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink to="/records" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Medical Records
              </NavLink>
            </li>
            <li>
              <NavLink to="/reminders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Reminders
              </NavLink>
            </li>
            <li>
              <NavLink to="/medicines" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Medicine Info
              </NavLink>
            </li>
            <li>
              <NavLink to="/share" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Share Link
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="nav-auth">
          {user && (
            <div className="user-tag">
              👤 {user.name}
            </div>
          )}
          <button className="btn btn-secondary" onClick={handleLogout} style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem' }}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
