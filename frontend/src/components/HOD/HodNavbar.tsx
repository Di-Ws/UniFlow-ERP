import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, GraduationCap, Calendar, PieChart, LogOut, Lock, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../ThemeToggle';
import { useTheme } from '../../hooks/useTheme';

const HodNavbar: React.FC = () => {
  const { logout } = useAuth();
  return (
    <nav className="h-24 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-white/5 px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      {/* Left: Branding */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
          E
        </div>
        <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">ERP</span>
      </div>

      {/* Center: Tabs Navigation */}
      <div className="hidden lg:flex items-center bg-slate-50 dark:bg-white/5 p-2 rounded-[24px] border border-slate-100 dark:border-white/5">
        {[
          { name: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
          { name: 'Students', path: '/hod/students', icon: Users },
          { name: 'Faculty', path: '/hod/faculty', icon: GraduationCap },
          { name: 'Leaves', path: '/hod/leaves', icon: Calendar },
          { name: 'Attendance', path: '/hod/attendance', icon: CheckCircle },
          { name: 'Events', path: '/hod/events', icon: PieChart }
        ].map((link, idx) => (
          <NavLink
            key={idx}
            to={link.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-8 py-3 rounded-[20px] text-sm font-black transition-all duration-300 ${
                isActive 
                ? 'bg-white dark:bg-dark-bg text-primary shadow-xl scale-105' 
                : 'text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <link.icon size={20} />
            {link.name}
          </NavLink>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-[20px] p-1 border border-slate-100 dark:border-white/5">
          <button className="flex items-center gap-3 px-6 py-2.5 rounded-[18px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all group">
            <Lock size={18} />
            <span className="text-sm font-bold hidden xl:block">Admin Panel</span>
          </button>

          <button 
            onClick={logout}
            className="flex items-center gap-3 px-6 py-2.5 rounded-[18px] text-slate-500 hover:text-rose-500 hover:bg-white dark:hover:bg-white/10 hover:shadow-sm transition-all group"
          >
            <LogOut size={18} />
            <span className="text-sm font-bold hidden xl:block">Logout</span>
          </button>
        </div>

        <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 mx-2"></div>

        <ThemeToggle />
      </div>
    </nav>
  );
};

export default HodNavbar;
