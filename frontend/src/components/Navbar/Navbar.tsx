import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Bell, Home, Menu } from 'lucide-react';
import ThemeToggle from '../ThemeToggle';

interface NavbarProps {
  onMenuClick?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const location = useLocation();

  const pathnames = location.pathname.split('/').filter(x => x);
  const breadcrumbText = pathnames.length > 1 ? pathnames[1].charAt(0).toUpperCase() + pathnames[1].slice(1) : (pathnames.length === 1 ? pathnames[0].charAt(0).toUpperCase() + pathnames[0].slice(1) : 'Dashboard');

  return (
    <nav className="bg-white/80 dark:bg-dark-card/65 backdrop-blur-md border-b border-gray-100 dark:border-white/5 h-[72px] flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 w-full">
      
      {/* Breadcrumbs */}
      <div className="flex items-center text-sm font-medium text-gray-500 dark:text-slate-400">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 mr-2"
          >
            <Menu size={20} />
          </button>
        )}
        <div className="hidden sm:flex items-center">
          <Home size={14} className="mr-2" />
          <span>Home</span>
          <span className="mx-2 text-gray-300 dark:text-slate-600">›</span>
        </div>
        <span className="text-gray-900 dark:text-white">{breadcrumbText}</span>
      </div>

      {/* Global Search */}
      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button className="relative p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white dark:border-[#0A0D14]"></span>
        </button>

        {/* Theme Toggle */}
        <ThemeToggle />

        <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1"></div>

        {/* Profile Avatar */}
        <button className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-white/10 hover:ring-2 hover:ring-primary/50 transition-all">
          <img src="https://i.pravatar.cc/150?u=user" alt="Profile" className="w-full h-full object-cover" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
