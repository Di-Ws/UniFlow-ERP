import React, { useState, useEffect } from 'react';
import StatisticsCards from '../../components/Dashboard/StatisticsCards';
import AnalyticsCharts from '../../components/Dashboard/AnalyticsCharts';
import SearchBar from '../../components/SearchBar/SearchBar';
import { getDashboardStatsAPI } from '../../api/students';
import { getEventsAPI } from '../../api/common';
import { Calendar, ChevronRight } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  
  // Settings based visibility (mocking state from settings)
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
    
    // Load widget visibility from localStorage if exists
    const savedSettings = localStorage.getItem('dashboard_settings');
    if (savedSettings) setWidgetsVisible(JSON.parse(savedSettings));

    fetchDashboardData();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) return <div className="dashboard-loading">Initializing Student Management System...</div>;

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-main">
        <div className="dashboard-top">
          <SearchBar onSearch={handleSearch} />
        </div>

        {widgetsVisible.stats && <StatisticsCards stats={stats} />}

        <div className="dashboard-content-grid">
          <div className="main-analytics">
            {widgetsVisible.charts && stats?.branchCounts && (
              <AnalyticsCharts branchData={stats.branchCounts} />
            )}
          </div>
          
          {widgetsVisible.events && (
            <div className="side-events">
              <div className="side-card">
                <div className="side-card-header">
                  <div className="icon-title">
                    <Calendar size={18} />
                    <h3>Upcoming Events</h3>
                  </div>
                  <ChevronRight size={18} className="chevron" />
                </div>
                <div className="events-list">
                  {events.length === 0 ? (
                    <p className="no-data">No upcoming events found.</p>
                  ) : (
                    events.slice(0, 4).map(event => (
                      <div key={event.id} className="event-item">
                        <div className="event-date">
                          {new Date(event.eventDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="event-info">
                          <h4>{event.title}</h4>
                          <p>{event.description}</p>
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
