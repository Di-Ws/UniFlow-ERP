import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  AlertCircle, 
  ChevronRight,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  ArrowRight
} from 'lucide-react';
import { getFacultySummary, getAssignedStudents } from '../../services/facultyService';
import { toast } from 'react-hot-toast';

// Helper to safely render potential objects
const safeRender = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return val.name || JSON.stringify(val);
  return String(val);
};

const AnalyticsCard: React.FC<{ 
  label: string; 
  value: string; 
  subLabel: string;
  icon: any; 
  color: string;
}> = ({ label, value, subLabel, icon: Icon, color }) => (
    <div 
      className="bg-white dark:bg-dark-card rounded-[40px] p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)] flex flex-col items-center justify-between min-h-[380px] border border-slate-50 dark:border-white/5 group hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500"
    >
      <div 
        className={`w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl mb-8 group-hover:scale-110 transition-transform duration-500`}
        style={{ backgroundColor: color }}
      >
        <Icon size={28} />
      </div>
      <div className="text-center mb-8">
        <h3 className="font-bold text-slate-400 dark:text-slate-500 text-[10px] uppercase tracking-[0.25em] mb-4">{label}</h3>
        <p className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">{value}</p>
      </div>
      <div className="w-full flex flex-col items-center gap-3">
        <div className="h-1.5 w-full bg-slate-50 dark:bg-white/5 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-1000" style={{ backgroundColor: color, width: '70%' }}></div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600">{subLabel}</p>
      </div>
    </div>
);

const FacultyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryData, studentsData] = await Promise.all([
          getFacultySummary(),
          getAssignedStudents()
        ]);
        setSummary(summaryData);
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const analyticsData = [
    { label: 'Assigned Students', value: String(summary?.analytics?.totalStudents || '0'), subLabel: 'Total Active', icon: Users, color: '#6366f1' },
    { label: 'Classes Today', value: String(summary?.analytics?.classesToday || '0'), subLabel: 'Full Schedule', icon: Calendar, color: '#f43f5e' },
    { label: 'Attendance Taken', value: String(summary?.analytics?.attendanceTaken || '0/0'), subLabel: 'Daily Progress', icon: ClipboardCheck, color: '#10b981' },
    { label: 'Pending Reports', value: String(summary?.analytics?.pendingTasks || '0'), subLabel: 'Action Required', icon: AlertCircle, color: '#f59e0b' }
  ];

  const filteredStudents = students.filter(s => 
    safeRender(s.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
    safeRender(s.batch || s.branch).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-slate-900 dark:text-white">
      
      {/* Main Content (8 Columns) */}
      <div className="lg:col-span-8 space-y-16">
        
        {/* Analytics Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Faculty Analytics</h2>
            <div className="px-5 py-2 bg-white dark:bg-dark-card rounded-2xl border border-slate-100 dark:border-white/5 flex items-center gap-3 shadow-sm">
              <Clock size={16} className="text-primary" />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Real-time Data</span>
            </div>
          </div>
          <div 
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8"
          >
            {analyticsData.map((data, idx) => (
              <AnalyticsCard key={idx} {...data} />
            ))}
          </div>
        </section>

        {/* Timetable Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Daily Schedule</h2>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-[56px] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Time</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Class/Year</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Subject</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Room</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Type</th>
                </tr>
              </thead>
              <tbody>
                {summary?.timetable?.length > 0 ? summary.timetable.map((row: any, idx: number) => (
                  <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-50 dark:border-white/5 last:border-0">
                    <td className="py-10 px-12 text-[14px] font-bold text-center text-slate-600 dark:text-slate-400">{safeRender(row.startTime)} - {safeRender(row.endTime)}</td>
                    <td className="py-10 px-12 text-[14px] font-black text-center text-slate-900 dark:text-white">{safeRender(row.year || row.section)}</td>
                    <td className="py-10 px-12 text-[14px] font-black text-center text-slate-800 dark:text-slate-200">{safeRender(row.subject)}</td>
                    <td className="py-10 px-12 text-[14px] font-bold text-center text-slate-600 dark:text-slate-400">{safeRender(row.room)}</td>
                    <td className="py-10 px-12 text-[14px] font-bold text-center">
                      <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400`}>
                        {safeRender(row.type)}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No classes scheduled for today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Assigned Students Section */}
        <section>
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">Assigned Students</h2>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="Search students..." 
                  className="pl-12 pr-6 py-3 bg-white dark:bg-dark-card border border-slate-100 dark:border-white/5 rounded-2xl text-xs font-bold focus:outline-none w-64 shadow-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-dark-card rounded-[56px] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 dark:border-white/5 bg-slate-50/30 dark:bg-white/5">
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Student Name</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Year</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Batch</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Attendance</th>
                  <th className="py-10 px-12 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? filteredStudents.map((student, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all border-b border-slate-50 dark:border-white/5 last:border-0">
                    <td className="py-10 px-12 font-black text-slate-800 dark:text-white text-[15px]">{safeRender(student.name)}</td>
                    <td className="py-10 px-12 text-[14px] font-bold text-slate-500 dark:text-slate-400 text-center">{safeRender(student.year || student.section)}</td>
                    <td className="py-10 px-12 text-[14px] font-bold text-slate-500 dark:text-slate-400 text-center">{safeRender(student.batch || student.branch)}</td>
                    <td className="py-10 px-12 text-center">
                      <span className="text-[14px] font-black text-slate-800 dark:text-white">{student.attendanceRate || student.attendance || 0}%</span>
                    </td>
                    <td className="py-10 px-12 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black ${(student.attendanceRate || student.attendance || 0) > 75 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' : 'text-rose-600 bg-rose-50 dark:bg-rose-500/10'}`}>
                        {(student.attendanceRate || student.attendance || 0) > 75 ? 'Safe' : 'Low'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Side Content (4 Columns) */}
      <div className="lg:col-span-4 space-y-16">
        
        {/* Attendance Management */}
        <section>
          <div className="bg-primary rounded-[48px] p-12 shadow-2xl shadow-primary/20 text-white relative overflow-hidden group transition-all duration-500">
            <div className="relative z-10">
              <h3 className="text-3xl font-black tracking-tighter mb-4">Live Attendance</h3>
              <p className="text-white/80 text-sm mb-8 leading-relaxed">Mark attendance for your currently active classroom sessions.</p>
              <button 
                onClick={() => navigate('/faculty/attendance')}
                className="w-full py-5 bg-white text-primary rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
              >
                <CheckCircle2 size={18} />
                Open Attendance Tool
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </section>

        {/* Announcements */}
        <section>
          <h2 className="text-4xl font-black tracking-tighter mb-10 text-slate-900 dark:text-white">Academic Notices</h2>
          <div className="bg-white dark:bg-dark-card rounded-[56px] shadow-[0_20px_60px_rgba(0,0,0,0.02)] border border-slate-50 dark:border-white/5 p-12 space-y-12">
            {summary?.announcements?.length > 0 ? summary.announcements.map((ann: any, idx: number) => (
              <div key={idx} className="group cursor-pointer border-b border-slate-50 dark:border-white/5 last:border-0 pb-10 last:pb-0">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary">{safeRender(ann.priority)}</span>
                </div>
                <p className="text-lg font-bold leading-tight text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">{safeRender(ann.title)}</p>
                <p className="text-[10px] font-black uppercase tracking-widest mt-3 flex items-center gap-2 text-slate-400 dark:text-slate-500">
                  <Clock size={12} /> {new Date(ann.createdAt).toLocaleDateString()}
                </p>
              </div>
            )) : (
              <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No recent announcements</p>
            )}
          </div>
        </section>

        {/* Students on Leave */}
        <section>
          <h2 className="text-4xl font-black tracking-tighter mb-10 text-slate-900 dark:text-white">Students on leave</h2>
          <div className="space-y-8">
            {summary?.studentsOnLeave?.length > 0 ? summary.studentsOnLeave.map((leave: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-dark-card rounded-[40px] p-8 shadow-sm border border-slate-100 dark:border-white/5 flex items-center gap-6">
                <div className="flex-1">
                  <p className="text-lg font-black leading-none text-slate-800 dark:text-slate-200">{safeRender(leave.userName)}</p>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 text-slate-400 dark:text-slate-500">{safeRender(leave.leaveType)} • {new Date(leave.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">Approved</div>
              </div>
            )) : (
              <p className="text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No students on leave today</p>
            )}
          </div>
        </section>

        {/* Faculty Leave Management Quick Link */}
        <section>
          <div className="bg-amber-500 rounded-[48px] p-12 shadow-2xl shadow-amber-500/20 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-3xl font-black tracking-tighter mb-4">My Leave</h3>
              <p className="text-amber-50 text-sm mb-8 leading-relaxed opacity-80">Submit your leave applications and track approval status.</p>
              <button 
                onClick={() => window.location.href = '/faculty/leaves'}
                className="w-full py-5 bg-white text-amber-600 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs hover:shadow-xl transition-all flex items-center justify-center gap-3"
              >
                <Calendar size={18} />
                Manage My Leaves
              </button>
            </div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-20 -mb-20 blur-2xl group-hover:scale-125 transition-transform duration-700"></div>
          </div>
        </section>
      </div>

    </div>
  );
};

export default FacultyDashboard;
