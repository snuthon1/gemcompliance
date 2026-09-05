import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If vendor tries to access officer routes, send to /vendor
    if (user.role === 'VENDOR') {
      return <Navigate to="/vendor" replace />;
    }
    // If officer tries to access vendor dashboard, send to /
    return <Navigate to="/" replace />;
  }

  return children;
}
