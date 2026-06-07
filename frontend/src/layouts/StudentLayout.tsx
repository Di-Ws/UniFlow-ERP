import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { X } from 'lucide-react';

const StudentLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-transparent dark:bg-transparent text-slate-900 dark:text-white transition-colors duration-300">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setIsSidebarOpen(false)} 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          ></div>
          
          {/* Sidebar Drawer Container */}
          <div className="relative w-80 max-w-xs h-full z-50 shadow-2xl flex flex-col bg-white dark:bg-[#0f1322] border-r border-slate-100 dark:border-white/5 animate-slide-in">
            {/* Close Button Inside Drawer */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-6 right-4 z-50 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
            >
              <X size={20} />
            </button>
            <div onClick={() => setIsSidebarOpen(false)} className="h-full flex-1">
              <Sidebar />
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar">
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
