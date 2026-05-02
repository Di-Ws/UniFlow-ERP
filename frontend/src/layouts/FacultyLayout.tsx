import React from 'react';
import { Outlet } from 'react-router-dom';
import FacultySidebar from '../components/Faculty/FacultySidebar';
import FacultyNavbar from '../components/Faculty/FacultyNavbar';

const FacultyLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-white dark:bg-dark-bg text-slate-900 dark:text-white transition-colors duration-300">
      {/* Top Navbar */}
      <FacultyNavbar />
      
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Profile Sidebar */}
        <FacultySidebar />
        
        {/* Middle Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-12 hide-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default FacultyLayout;
