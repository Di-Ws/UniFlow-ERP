import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, GraduationCap, Settings, LogOut, Calendar, UserCircle } from 'lucide-react';
import { getCurrentUserAPI } from '../../api/auth';
import { logout, getUserRole } from '../../utils/auth';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const role = getUserRole();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUserAPI();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user in sidebar", err);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
  };

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      HOD: 'bg-red-500/10 text-red-500 border-red-500/20',
      Faculty: 'bg-green-500/10 text-green-500 border-green-500/20',
      Student: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${styles[role] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
        {role.toUpperCase()}
      </span>
    );
  };

  // Define menu items per role
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

  const currentMenuItems = menuItems[(role as keyof typeof menuItems)] || [];

  return (
    <div className="sidebar">
      <Link to="/profile" className="sidebar-profile-link">
        <div className="sidebar-profile">
          <div className="avatar">
            <img src={`https://i.pravatar.cc/150?u=${user?.name || 'user'}`} alt="Profile" />
          </div>
          <div className="profile-info">
            <div className="flex flex-col gap-1">
              <h3 className="truncate w-32">{user ? user.name : 'User'}</h3>
              {role && getRoleBadge(role)}
            </div>
          </div>
        </div>
      </Link>

      <nav className="sidebar-menu">
        <ul>
          {currentMenuItems.map((item) => (
            <li key={item.path}>
              <NavLink to={item.path} className={({ isActive }) => isActive ? 'active' : ''}>
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn" style={{ background: 'transparent', border: 'none', width: '100%', cursor: 'pointer' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
