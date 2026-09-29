import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Retrieve token from LocalStorage
  const token = localStorage.getItem('token');
  
  // If authorized, render children. Otherwise, redirect to login page.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
