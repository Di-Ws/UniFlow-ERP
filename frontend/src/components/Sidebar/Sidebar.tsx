import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Box, LogOut, CalendarPlus, LayoutDashboard, 
  Users, GraduationCap, Calendar, PieChart, Settings, UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getPendingCount } from '../../services/adminService';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [pendingCount, setPendingCount] = React.useState<number>(0);
  const role = user?.role;

  React.useEffect(() => {
    if (role === 'HOD') {
      const fetchCount = async () => {
        try {
          const { count } = await getPendingCount();
          setPendingCount(count);
        } catch (error) {
          console.error("Failed to fetch pending count");
        }
      };
      fetchCount();
      // Polling every 1 minute
      const interval = setInterval(fetchCount, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      HOD: 'text-rose-400 bg-rose-500/10',
      Faculty: 'text-primary bg-primary/10',
      Student: 'text-emerald-400 bg-emerald-500/10',
    };
    return (
      <span className={`px-3 py-1 text-[10px] font-bold rounded-full tracking-wider uppercase ${styles[role] || 'text-slate-400 bg-slate-500/10'}`}>
        {role}
      </span>
    );
  };

  const menuItems = {
    HOD: [
      { path: '/hod/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/hod/students', icon: Users, label: 'Students' },
      { path: '/hod/faculty', icon: GraduationCap, label: 'Faculty' },
      { path: '/hod/leaves', icon: Calendar, label: 'Leaves' },
      { path: '/hod/events', icon: PieChart, label: 'Events' },
      { path: '/hod/settings', icon: Settings, label: 'Settings' },
    ],
    Faculty: [
      { path: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/faculty/students', icon: Users, label: 'My Students' },
      { path: '/faculty/leaves', icon: Calendar, label: 'My Leaves' },
      { path: '/faculty/events', icon: PieChart, label: 'Events' },
      { path: '/faculty/settings', icon: Settings, label: 'Settings' },
    ],
    Student: [
      { path: '/student/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/student/profile', icon: UserCircle, label: 'My Profile' },
      { path: '/student/leaves', icon: Calendar, label: 'My Leaves' },
      { path: '/student/events', icon: PieChart, label: 'Events' },
    ],
  };

  const currentRole = (role ? (role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()) : 'Student') as keyof typeof menuItems;
  const currentMenuItems = menuItems[currentRole] || menuItems['Student'] || [];

  return (
    <div className="w-[280px] bg-white/90 dark:bg-dark-card/90 backdrop-blur-md flex flex-col h-screen shrink-0 text-slate-600 dark:text-slate-300 border-r border-gray-100 dark:border-white/5 transition-colors duration-300">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8 text-gray-900 dark:text-white">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Box size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">UniFlow</h1>
      </div>

      {/* Profile Card */}
      <div className="mx-6 mb-8 bg-gray-50 dark:bg-white/5 rounded-2xl p-5 flex flex-col items-center border border-gray-100 dark:border-white/5">
        <div className="relative mb-3">
          <img 
            src={`https://i.pravatar.cc/150?u=${user?.name || 'user'}`} 
            alt="Profile" 
            className="w-16 h-16 rounded-full border-2 border-white dark:border-dark-card shadow-xl object-cover"
          />
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-dark-card rounded-full"></span>
        </div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white leading-tight truncate w-full text-center">{user?.name || 'User'}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 mb-3">ID: {user?.id || Math.floor(Math.random() * 1000)}</p>
        {role && getRoleBadge(role)}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 space-y-1 hide-scrollbar pb-6">
        {currentMenuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`
            }
          >
            <item.icon size={18} />
            <span className="text-sm font-semibold flex-1">{item.label}</span>
            {item.label === 'Students' && role === 'HOD' && pendingCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-rose-500/20">
                {pendingCount}
              </span>
            )}
          </NavLink>
        ))}
        
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 mt-2"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Logout</span>
        </button>
      </div>

      {/* Promotional Card */}
      <div className="mx-4 mb-6 mt-auto">
        <div className="bg-primary/5 dark:bg-primary/10 border border-primary/10 dark:border-primary/20 rounded-2xl p-4 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card flex items-center justify-center shrink-0 shadow-sm">
              <CalendarPlus size={20} className="text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Need a break?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">Take care of yourself</p>
            </div>
          </div>
          <NavLink 
            to={`/${role ? role.toLowerCase() : 'student'}/leaves`} 
            className="w-full mt-3 py-2 bg-primary text-white text-xs font-bold rounded-lg text-center hover:bg-primary-hover transition-colors relative z-10 shadow-md shadow-primary/10"
          >
            Apply Leave
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
