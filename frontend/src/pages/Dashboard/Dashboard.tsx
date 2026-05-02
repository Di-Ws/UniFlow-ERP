import React, { useState, useEffect } from 'react';
import StatisticsCards from '../../components/Dashboard/StatisticsCards';
import AnalyticsCharts from '../../components/Dashboard/AnalyticsCharts';
import SearchBar from '../../components/SearchBar/SearchBar';
import { getDashboardStatsAPI } from '../../api/students';
import { getEventsAPI } from '../../api/common';
import { Calendar, ChevronRight, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { getHODLeaveAnalytics, getStudentAttendanceAnalytics } from '../../services/analyticsService';
import { LeaveAnalyticsChart, AttendancePieChart } from '../../components/Dashboard/DashboardCharts';
import RegistrationQueue from '../../components/Admin/RegistrationQueue';
import StrategicOverview from '../../components/Dashboard/StrategicOverview';
import FacultyCourseGrid from '../../components/Dashboard/FacultyCourseGrid';
import StudentSyllabusGrid from '../../components/Dashboard/StudentSyllabusGrid';

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
  const [leaveAnalytics, setLeaveAnalytics] = useState<any[]>([]);
  const [attendanceAnalytics, setAttendanceAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, eventsData] = await Promise.all([
          getDashboardStatsAPI(),
          getEventsAPI()
        ]);
        setStats(statsData);
        setEvents(eventsData);

        // Fetch specialized analytics based on role
        if (role === 'HOD') {
          const leaveData = await getHODLeaveAnalytics();
          setLeaveAnalytics(leaveData);
        } else if (role === 'STUDENT') {
          const attendanceData = await getStudentAttendanceAnalytics();
          setAttendanceAnalytics(attendanceData);
        }
      } catch (err) {
        console.error("Dashboard and Stats fetch failed", err);
        // Fallback stats to avoid null crash
        setStats({ totalStudents: 0, avgAttendance: 0, feePaidPercent: 0, branchCounts: {} });
      } finally {
        setLoading(false);
      }
    };
    
    const savedSettings = localStorage.getItem('dashboard_settings');
    if (savedSettings) setWidgetsVisible(JSON.parse(savedSettings));

    fetchDashboardData();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-slate-400">Initializing Dashboard...</p>
      </div>
    </div>
  );

  const getDashboardTitle = () => {
    switch(role) {
      case 'HOD': return 'University Analytics Overview';
      case 'FACULTY': return 'Faculty Performance Dashboard';
      case 'STUDENT': return 'My Academic Overview';
      default: return 'Dashboard';
    }
  };

  const getDashboardSubtitle = () => {
    if (role === 'STUDENT') return `Welcome back, ${currentUser?.name}. Here's your current academic standing.`;
    if (role === 'FACULTY') return `Managing analytics for your assigned student groups.`;
    return 'Comprehensive overview of university student data and branch analytics.';
  };

  return (
    <div className="w-full max-w-[1920px] mx-auto pb-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">{getDashboardTitle()}</h1>
        <p className="text-gray-500 dark:text-slate-400">{getDashboardSubtitle()}</p>
      </header>

      {role !== 'STUDENT' && (
        <div className="mb-8">
          <SearchBar onSearch={handleSearch} />
        </div>
      )}

      {role === 'HOD' && (
        <div className="mb-8 space-y-8">
          <StrategicOverview deptName="CSE" />
          <RegistrationQueue />
        </div>
      )}

      {widgetsVisible.stats && <StatisticsCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-8 mt-8">
        <div className="lg:col-span-2 xl:col-span-3 space-y-8">
          
          {/* Faculty Specific: Course Grid */}
          {role === 'FACULTY' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PieIcon className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">My Assigned Courses</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Curriculum & Enrollment</p>
                </div>
              </div>
              <FacultyCourseGrid />
            </div>
          )}

          {/* Student Specific: Syllabus Grid */}
          {role === 'STUDENT' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <PieIcon className="text-primary" size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-sm">My Semester Syllabus</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Departmental Subject Mapping</p>
                </div>
              </div>
              <StudentSyllabusGrid />
            </div>
          )}

          {widgetsVisible.charts && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Existing Branch Distribution Chart (for HOD/Faculty) */}
              {role !== 'STUDENT' && stats?.branchCounts && (
                <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="text-primary" size={20} />
                    <h3 className="font-bold text-gray-900 dark:text-white">Branch Distribution</h3>
                  </div>
                  <AnalyticsCharts branchData={stats.branchCounts} />
                </div>
              )}

              {/* HOD Specific: Leave Analytics */}
              {role === 'HOD' && (
                <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="text-primary" size={20} />
                    <h3 className="font-bold text-gray-900 dark:text-white">Monthly Leave Status</h3>
                  </div>
                  {leaveAnalytics.length > 0 ? (
                    <LeaveAnalyticsChart data={leaveAnalytics} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Leave Data Available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Student Specific: Attendance Analytics */}
              {role === 'STUDENT' && (
                <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <PieIcon className="text-primary" size={20} />
                      <h3 className="font-bold text-gray-900 dark:text-white">Attendance Summary</h3>
                    </div>
                    {attendanceAnalytics && (
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${attendanceAnalytics.attendancePercentage >= attendanceAnalytics.requirement ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {attendanceAnalytics.attendancePercentage >= attendanceAnalytics.requirement ? 'Safe' : 'Low Attendance'}
                      </span>
                    )}
                  </div>
                  {attendanceAnalytics ? (
                    <AttendancePieChart data={attendanceAnalytics.chartData} percentage={attendanceAnalytics.attendancePercentage} />
                  ) : (
                    <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl">
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Attendance Data</p>
                    </div>
                  )}
                </div>
              )}
              
              {!stats?.branchCounts || Object.keys(stats.branchCounts).length === 0 ? (
                role !== 'STUDENT' && (
                  <div className="col-span-full bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm border-dashed border-2">
                    <p className="text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">No branch distribution data available.</p>
                  </div>
                )
              ) : null}
            </div>
          )}
        </div>
        
        {widgetsVisible.events && (
          <div className="lg:col-span-1 xl:col-span-1 space-y-8">
            <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-primary" />
                  <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Upcoming Events</h3>
                </div>
                <ChevronRight size={18} className="text-gray-400 cursor-pointer hover:text-primary transition-colors" />
              </div>
              <div className="p-5">
                {events.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-500 text-sm text-center py-8 italic font-medium">No upcoming events found.</p>
                ) : (
                  <div className="space-y-4">
                    {events.slice(0, 4).map(event => (
                      <div key={event.id} className="flex gap-4 group cursor-pointer">
                        <div className="bg-primary/5 dark:bg-primary/10 text-primary dark:text-primary border border-primary/10 dark:border-primary/20 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap h-fit flex items-center justify-center min-w-[3.5rem]">
                          {new Date(event.eventDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{event.title}</h4>
                          <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
