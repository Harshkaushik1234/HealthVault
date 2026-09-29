import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import MedicalRecords from './pages/MedicalRecords';
import MedicineReminder from './pages/MedicineReminder';
import MedicineInfo from './pages/MedicineInfo';
import ShareRecords from './pages/ShareRecords';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Navbar renders dynamically based on session status */}
        <Navbar />
        
        <Routes>
          {/* Public Authentication Gates */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Public Doctor Clinical Document Viewer Gate */}
          <Route path="/share/:token" element={<ShareRecords />} />

          {/* Protected Patient Dashboard Gateways */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/records" element={<MedicalRecords />} />
            <Route path="/reminders" element={<MedicineReminder />} />
            <Route path="/medicines" element={<MedicineInfo />} />
            <Route path="/share" element={<ShareRecords />} />
          </Route>
          
          {/* Catch-all Redirect */}
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
