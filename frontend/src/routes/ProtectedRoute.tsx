import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('HOD' | 'Faculty' | 'Student')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const userRole = getUserRole();

  if (!isAuth) {
    // Redirect to login but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole as any)) {
    // Redirect to unauthorized page if role not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
