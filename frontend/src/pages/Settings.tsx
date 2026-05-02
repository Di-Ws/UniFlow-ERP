import React, { useState, useEffect } from 'react';
import { User, Monitor, Layout, Save, Check } from 'lucide-react';
import { updateProfileAPI, getCurrentUserAPI } from '../api/auth';
import { useTheme } from '../hooks/useTheme';
import './Settings.css';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [userData, setUserData] = useState({ name: '', email: '', password: '' });
  const { themeMode, themeColor, toggleTheme, setThemeColor } = useTheme();
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

  const handleSaveDashboard = () => {
    localStorage.setItem('dashboard_settings', JSON.stringify(dashboard));
    alert("Dashboard layout updated!");
  };

  if (loading) return <div className="settings-loading">Loading Preferences...</div>;

  const colors: { name: string; value: 'indigo' | 'blue' | 'green' | 'purple'; hex: string }[] = [
    { name: 'Indigo', value: 'indigo', hex: '#6366f1' },
    { name: 'Blue', value: 'blue', hex: '#3b82f6' },
    { name: 'Green', value: 'green', hex: '#10b981' },
    { name: 'Purple', value: 'purple', hex: '#8b5cf6' },
  ];

  return (
    <div className="settings-page bg-white dark:bg-dark-bg min-h-screen">
      <div className="page-header border-b border-gray-100 dark:border-white/5 pb-6">
        <h1 className="text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-slate-400">Manage your account, appearance, and dashboard preferences</p>
      </div>

      <div className="settings-layout mt-8">
        <aside className="settings-tabs bg-gray-50/50 dark:bg-white/5 p-2 rounded-2xl">
          {[
            { id: 'General', icon: <User size={18} /> },
            { id: 'Appearance', icon: <Monitor size={18} /> },
            { id: 'Dashboard', icon: <Layout size={18} /> }
          ].map(tab => (
            <button
              key={tab.id}
              className={`tab-btn w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span className="font-medium">{tab.id}</span>
            </button>
          ))}
        </aside>

        <main className="settings-content">
          <div className="settings-card bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
            {activeTab === 'General' && (
              <form onSubmit={handleSaveGeneral} className="settings-form space-y-6">
                <div className="form-group space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    value={userData.name}
                    onChange={e => setUserData({ ...userData, name: e.target.value })}
                  />
                </div>
                <div className="form-group space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    value={userData.email}
                    onChange={e => setUserData({ ...userData, email: e.target.value })}
                  />
                </div>
                <div className="form-group space-y-2">
                  <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Leave blank to keep current"
                    className="w-full bg-gray-50 dark:bg-dark-card border border-gray-200 dark:border-white/5 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 transition-all outline-none"
                    value={userData.password}
                    onChange={e => setUserData({ ...userData, password: e.target.value })}
                  />
                </div>
                <button type="submit" className="save-btn bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20" disabled={saving}>
                  <Save size={18} /> {saving ? 'Saving...' : 'Save Account Settings'}
                </button>
              </form>
            )}

            {activeTab === 'Appearance' && (
              <div className="settings-form space-y-10">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Theme Mode</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => themeMode === 'dark' && toggleTheme()}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${themeMode === 'light' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-dark-card'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-500">
                        <Monitor size={24} />
                      </div>
                      <span className={`font-bold ${themeMode === 'light' ? 'text-primary' : 'text-gray-500 dark:text-slate-400'}`}>Light Mode</span>
                    </button>
                    <button 
                      onClick={() => themeMode === 'light' && toggleTheme()}
                      className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-4 ${themeMode === 'dark' ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-dark-card'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-[#0f172a] shadow-sm flex items-center justify-center text-primary">
                        <Monitor size={24} />
                      </div>
                      <span className={`font-bold ${themeMode === 'dark' ? 'text-primary' : 'text-gray-500 dark:text-slate-400'}`}>Dark Mode</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Theme Color</h3>
                  <div className="flex flex-wrap gap-4">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setThemeColor(color.value as any)}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${themeColor === color.value ? 'ring-4 ring-offset-4 ring-primary' : 'hover:scale-110'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {themeColor === color.value && <Check size={24} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl">
                  <h4 className="font-bold text-primary mb-2">Live Preview</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">Changes are applied immediately and saved to your preferences.</p>
                </div>
              </div>
            )}

            {activeTab === 'Dashboard' && (
              <div className="settings-form space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="font-bold text-gray-700 dark:text-slate-300">Show Statistics Cards</span>
                  <button 
                    className={`w-14 h-8 rounded-full transition-all relative ${dashboard.showStats ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-700'}`}
                    onClick={() => setDashboard({ ...dashboard, showStats: !dashboard.showStats })}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${dashboard.showStats ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="font-bold text-gray-700 dark:text-slate-300">Show Analytics Charts</span>
                  <button 
                    className={`w-14 h-8 rounded-full transition-all relative ${dashboard.showCharts ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-700'}`}
                    onClick={() => setDashboard({ ...dashboard, showCharts: !dashboard.showCharts })}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${dashboard.showCharts ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-white/5">
                  <span className="font-bold text-gray-700 dark:text-slate-300">Show Events Panel</span>
                  <button 
                    className={`w-14 h-8 rounded-full transition-all relative ${dashboard.showEvents ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-700'}`}
                    onClick={() => setDashboard({ ...dashboard, showEvents: !dashboard.showEvents })}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${dashboard.showEvents ? 'right-1' : 'left-1'}`}></div>
                  </button>
                </div>
                <button onClick={handleSaveDashboard} className="save-btn bg-primary hover:bg-primary-hover text-white flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20">
                  <Save size={18} /> Save Layout Preferences
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
