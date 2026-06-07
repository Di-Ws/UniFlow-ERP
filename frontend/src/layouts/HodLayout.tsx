import React from 'react';
import { Outlet } from 'react-router-dom';
import HodSidebar from '../components/HOD/HodSidebar';
import HodNavbar from '../components/HOD/HodNavbar';

const HodLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-transparent dark:bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      {/* Top Navbar */}
      <HodNavbar />
      
      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Profile Sidebar */}
        <HodSidebar />
        
        {/* Middle Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 hide-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default HodLayout;
