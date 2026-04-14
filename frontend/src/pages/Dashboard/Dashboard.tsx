import React, { useState, useEffect } from 'react';
import StatisticsCards from '../../components/Dashboard/StatisticsCards';
import AnalyticsCharts from '../../components/Dashboard/AnalyticsCharts';
import SearchBar from '../../components/SearchBar/SearchBar';
import { getDashboardStatsAPI } from '../../api/students';
import { getEventsAPI } from '../../api/common';
import { Calendar, ChevronRight } from 'lucide-react';
import './Dashboard.css';

import { getUserRole, getUser } from '../../utils/auth';

const Dashboard: React.FC = () => {
  const role = getUserRole();
  const currentUser = getUser();
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [widgetsVisible, setWidgetsVisible] = useState({
    stats: true,
    charts: true,
    events: true
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          getDashboardStatsAPI(),
          getEventsAPI()
        ]);
        setStats(statsData);
        setEvents(eventsData);
      } catch (err) {
        console.error("Dashboard and Stats fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    
    const savedSettings = localStorage.getItem('dashboard_settings');
    if (savedSettings) setWidgetsVisible(JSON.parse(savedSettings));

    fetchDashboardData();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#020617]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Initializing Dashboard...</p>
      </div>
    </div>
  );

  const getDashboardTitle = () => {
    switch(role) {
      case 'HOD': return 'University Analytics Overview';
      case 'Faculty': return 'Faculty Performance Dashboard';
      case 'Student': return 'My Academic Overview';
      default: return 'Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    if (role === 'Student') return `Welcome back, ${currentUser?.name}. Here's your current academic standing.`;
    if (role === 'Faculty') return `Managing analytics for your assigned student groups.`;
    return 'Comprehensive overview of university student data and branch analytics.';
  };

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main p-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{getDashboardTitle()}</h1>
          <p className="text-gray-400">{getDashboardSubtitle()}</p>
        </header>

        {role !== 'Student' && (
          <div className="dashboard-top mb-8">
            <SearchBar onSearch={handleSearch} />
          </div>
        )}

        {widgetsVisible.stats && <StatisticsCards stats={stats} />}

        <div className="dashboard-content-grid mt-8">
          <div className="main-analytics">
            {widgetsVisible.charts && stats?.branchCounts && Object.keys(stats.branchCounts).length > 0 ? (
              <AnalyticsCharts branchData={stats.branchCounts} />
            ) : (
              <div className="bg-[#111827] border border-gray-800 rounded-xl p-12 text-center">
                <p className="text-gray-400">No branch analytics data available to display.</p>
              </div>
            )}
          </div>
          
          {widgetsVisible.events && (
            <div className="side-events">
              <div className="side-card bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                <div className="side-card-header p-4 border-b border-gray-800 flex justify-between items-center bg-[#0f172a]">
                  <div className="icon-title flex items-center gap-2">
                    <Calendar size={18} className="text-indigo-400" />
                    <h3 className="font-semibold text-white text-sm">Upcoming Events</h3>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </div>
                <div className="events-list p-4 bg-[#0f172a]/50">
                  {events.length === 0 ? (
                    <p className="no-data text-gray-500 text-sm text-center py-8 italic">No upcoming events found.</p>
                  ) : (
                    events.slice(0, 4).map(event => (
                      <div key={event.id} className="event-item flex gap-4 mb-4 last:mb-0">
                        <div className="event-date bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded text-xs font-bold whitespace-nowrap h-fit">
                          {new Date(event.eventDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="event-info">
                          <h4 className="text-white text-sm font-medium mb-1 line-clamp-1">{event.title}</h4>
                          <p className="text-gray-500 text-xs line-clamp-2">{event.description}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
