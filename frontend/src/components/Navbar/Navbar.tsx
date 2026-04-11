import React from 'react';
import { Search, Bell, Sun } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  return (
    <header className="navbar">
      <div className="navbar-title">
        <h2>Analytics Dashboard</h2>
      </div>
      
      <div className="navbar-actions">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search..." />
        </div>
        
        <button className="icon-btn action-btn">
          <Bell size={20} />
          <span className="badge"></span>
        </button>
        
        <button className="icon-btn action-btn active-theme">
          <Sun size={20} />
        </button>

        <div className="nav-user-avatar">
          <img src="https://i.pravatar.cc/150?u=admin" alt="User Avatar" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
