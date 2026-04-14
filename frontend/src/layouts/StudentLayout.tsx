import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';

const StudentLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <main className="page-content">
          <div className="page-content-inner">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
