import React, { useEffect, useState } from 'react';
import { ShieldAlert, Target, BookOpen, CheckCircle2, AlertTriangle, ChevronRight, X } from 'lucide-react';
import api from '../../services/api';
import FacultyAssignment from '../Admin/FacultyAssignment';

const StrategicOverview: React.FC<{ deptName: string }> = ({ deptName }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);

  const fetchStrategic = async () => {
    try {
      setError(null);
      const res = await api.get(`/strategic/summary?departmentName=${deptName}`);
      setData(res.data);
    } catch (err: any) {
      console.error("Failed to fetch strategic data", err);
      setError(err.response?.data?.message || "Strategic data unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deptName) fetchStrategic();
  }, [deptName]);

  if (loading) return <div className="h-64 flex items-center justify-center animate-pulse bg-gray-50 dark:bg-white/5 rounded-3xl text-slate-400 font-bold">Strategic Analysis in progress...</div>;
  
  if (error) return (
    <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-8 rounded-3xl text-center">
      <AlertTriangle className="text-rose-500 mx-auto mb-3" size={32} />
      <h3 className="font-bold text-gray-900 dark:text-white mb-1">Strategic Audit Offline</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">{error}. Please ensure backend is updated and database is synced.</p>
    </div>
  );

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Strategic Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary-hover p-8 rounded-3xl shadow-xl shadow-primary/20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="relative z-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70 mb-2">HOD Super Admin Console</p>
          <h2 className="text-4xl font-black tracking-tight">{data.department} Strategic Summary</h2>
        </div>
        <div className="relative z-10 flex flex-col items-end">
          <div className="text-5xl font-black">{data.curriculumReadiness}%</div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/80">Curriculum Readiness</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3 mb-2 px-2">
            <Target className="text-primary" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Priority Action Items</h3>
          </div>
          
          {data.actionRequired.map((action: any, idx: number) => (
            <div 
              key={idx} 
              onClick={() => action.task === 'Staffing Audit' && setShowAssignment(!showAssignment)}
              className={`bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-6 rounded-3xl flex items-center gap-6 group hover:shadow-lg transition-all ${action.task === 'Staffing Audit' ? 'cursor-pointer ring-primary/20 hover:ring-2' : ''}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                action.priority === 'Urgent' ? 'bg-rose-500 text-white' : 
                action.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {action.priority === 'Urgent' ? <ShieldAlert size={24} /> : <AlertTriangle size={24} />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    action.priority === 'Urgent' ? 'text-rose-500' : 'text-amber-500'
                  }`}>{action.priority} Priority</span>
                  <h4 className="font-black text-gray-900 dark:text-white">{action.task}</h4>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{action.details}</p>
              </div>
              <ChevronRight className="text-slate-300 group-hover:text-primary transition-colors" size={20} />
            </div>
          ))}

          {/* Dynamic Faculty Assignment Section */}
          {showAssignment && (
            <div className="mt-4 animate-in slide-in-from-top duration-300">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-primary text-sm uppercase tracking-widest">Faculty Allocation Console</h3>
                <button onClick={() => setShowAssignment(false)} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-full transition-colors">
                  <X size={18} />
                </button>
              </div>
              <FacultyAssignment deptName={deptName} onAssigned={fetchStrategic} />
            </div>
          )}
        </div>

        {/* Validation Metrics */}
        <div className="space-y-6">
           <div className="flex items-center gap-3 mb-2 px-2">
            <CheckCircle2 className="text-emerald-500" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">System Integrity</h3>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 p-8 rounded-3xl shadow-sm space-y-8">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Syllabus Audit</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-black text-gray-900 dark:text-white">{data.validationMetrics.totalCourses}</span>
                <span className="text-xs font-bold text-slate-500">Total Courses</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${data.curriculumReadiness}%` }}></div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Classroom Links</p>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${data.validationMetrics.classroomIntegrity === 'Verified' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                <span className="font-bold text-gray-900 dark:text-white">{data.validationMetrics.classroomIntegrity}</span>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Pending Audits</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-rose-500">{data.validationMetrics.pendingApprovals}</span>
                <span className="text-xs font-bold text-slate-500">Incomplete Profiles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrategicOverview;
