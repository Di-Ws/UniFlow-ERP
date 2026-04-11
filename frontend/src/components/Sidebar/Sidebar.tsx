import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, PieChart, GraduationCap, Settings, LogOut } from 'lucide-react';
import { getCurrentUserAPI } from '../../api/auth';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string } | null>(null);

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
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <Link to="/profile" className="sidebar-profile-link">
        <div className="sidebar-profile">
          <div className="avatar">
            <img src="https://i.pravatar.cc/150?u=admin" alt="Admin Profile" />
          </div>
          <div className="profile-info">
            <h3>{user ? user.name : 'Admin User'}</h3>
            <p>Superadmin</p>
          </div>
        </div>
      </Link>

      <nav className="sidebar-menu">
        <ul>
          <li>
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/students" className={({ isActive }) => isActive ? 'active' : ''}>
              <Users size={20} />
              <span>Students</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/teachers" className={({ isActive }) => isActive ? 'active' : ''}>
              <GraduationCap size={20} />
              <span>Teachers</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>
              <PieChart size={20} />
              <span>Upcoming Events</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </li>
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
