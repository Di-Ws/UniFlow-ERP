import React, { useState, useEffect } from 'react';
import { User, Monitor, Layout, Save } from 'lucide-react';
import { updateProfileAPI, getCurrentUserAPI } from '../api/auth';
import './Settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const [appearance, setAppearance] = useState({
    darkMode: true,
    fontSize: 'Medium',
    accentColor: '#6366f1'
  });
  const [dashboard, setDashboard] = useState({
    showStats: true,
    showCharts: true,
    showEvents: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await getCurrentUserAPI();
        setUserData({ name: user.name, email: user.email, password: '' });
        
        // Load settings from localStorage
        const savedAppearance = localStorage.getItem('appearance_settings');
        if (savedAppearance) setAppearance(JSON.parse(savedAppearance));
        
        const savedDashboard = localStorage.getItem('dashboard_settings');
        if (savedDashboard) setDashboard(JSON.parse(savedDashboard));
      } catch (err) {
        console.error("Failed to load settings data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: any = { name: userData.name, email: userData.email };
      if (userData.password) payload.password = userData.password;
      await updateProfileAPI(payload);
      alert("Account settings saved!");
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAppearance = () => {
    localStorage.setItem('appearance_settings', JSON.stringify(appearance));
    // Apply dark mode class to body for global effect
    document.body.classList.toggle('light-mode', !appearance.darkMode);
    alert("Appearance settings applied!");
  };

  const handleSaveDashboard = () => {
    localStorage.setItem('dashboard_settings', JSON.stringify(dashboard));
    alert("Dashboard layout updated!");
  };

  if (loading) return <div className="settings-loading">Loading Preferences...</div>;

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account, appearance, and dashboard preferences</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-tabs">
          {[
            { id: 'General', icon: <User size={18} /> },
            { id: 'Appearance', icon: <Monitor size={18} /> },
            { id: 'Dashboard', icon: <Layout size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.id}</span>
            </button>
          ))}
        </aside>

        <main className="settings-content">
          <div className="settings-card">
            {activeTab === 'General' && (
              <form onSubmit={handleSaveGeneral} className="settings-form">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={userData.name}
                    onChange={e => setUserData({ ...userData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={userData.email}
                    onChange={e => setUserData({ ...userData, email: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    value={userData.password}
                    onChange={e => setUserData({ ...userData, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="save-btn" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Account'}
                </button>
              </form>
            )}

            {activeTab === 'Appearance' && (
              <div className="settings-form">
                <div className="toggle-group">
                  <span>Dark Mode</span>
                  <button 
                    className={`toggle-switch ${appearance.darkMode ? 'on' : ''}`}
                    onClick={() => setAppearance({ ...appearance, darkMode: !appearance.darkMode })}
                  ></button>
                </div>
                <div className="form-group">
                  <label>Font Size</label>
                  <select 
                    value={appearance.fontSize}
                    onChange={e => setAppearance({ ...appearance, fontSize: e.target.value })}
                  >
                    <option>Small</option>
                    <option>Medium</option>
                    <option>Large</option>
                  </select>
                </div>
                <button onClick={handleSaveAppearance} className="save-btn">
                  <Save size={16} /> Apply Settings
                </button>
              </div>
            )}

            {activeTab === 'Dashboard' && (
              <div className="settings-form">
                <div className="toggle-group">
                  <span>Show Statistics Cards</span>
                  <button 
                    className={`toggle-switch ${dashboard.showStats ? 'on' : ''}`}
                    onClick={() => setDashboard({ ...dashboard, showStats: !dashboard.showStats })}
                  ></button>
                </div>
                <div className="toggle-group">
                  <span>Show Analytics Charts</span>
                  <button 
                    className={`toggle-switch ${dashboard.showCharts ? 'on' : ''}`}
                    onClick={() => setDashboard({ ...dashboard, showCharts: !dashboard.showCharts })}
                  ></button>
                </div>
                <div className="toggle-group">
                  <span>Show Events Panel</span>
                  <button 
                    className={`toggle-switch ${dashboard.showEvents ? 'on' : ''}`}
                    onClick={() => setDashboard({ ...dashboard, showEvents: !dashboard.showEvents })}
                  ></button>
                </div>
                <button onClick={handleSaveDashboard} className="save-btn">
                  <Save size={16} /> Save Layout
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
