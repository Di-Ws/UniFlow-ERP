import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import HodLayout from '../layouts/HodLayout';
import FacultyLayout from '../layouts/FacultyLayout';
import StudentLayout from '../layouts/StudentLayout';

// Pages
import Dashboard from '../pages/Dashboard/Dashboard';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Students from '../pages/Students';
import Teachers from '../pages/Teachers';
import Leaves from '../pages/Leaves';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile/Profile';
import StudentProfile from '../pages/StudentProfile';
import Unauthorized from '../pages/Unauthorized';
import { Events } from '../pages/PlaceholderPages';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* HOD Routes */}
      <Route
        path="/hod"
        element={
          <ProtectedRoute allowedRoles={['HOD']}>
            <HodLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="faculty" element={<Teachers />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="events" element={<Events />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Faculty Routes */}
      <Route
        path="/faculty"
        element={
          <ProtectedRoute allowedRoles={['Faculty']}>
            <FacultyLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="events" element={<Events />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="leaves" element={<Leaves />} />
        <Route path="events" element={<Events />} />
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Default Redirection based on Auth state */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
