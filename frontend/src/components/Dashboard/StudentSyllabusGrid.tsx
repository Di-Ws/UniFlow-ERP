import React, { useEffect, useState } from 'react';
import { BookOpen, User, Mail, ShieldCheck } from 'lucide-react';
import api from '../../services/api';

const StudentSyllabusGrid: React.FC = () => {
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyllabus = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/student-portal/syllabus');
      setSyllabus(res.data);
    } catch (err: any) {
      console.error("Failed to fetch student syllabus", err);
      setError(err.response?.data?.message || "Connection to academic server lost");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyllabus();
  }, []);

  if (loading) return <div className="h-48 animate-pulse bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Your Curriculum...</div>;

  if (error) return (
    <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-8 rounded-3xl text-center">
      <h3 className="font-bold text-rose-500 mb-2">Sync Error</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{error}</p>
      <button onClick={fetchSyllabus} className="text-xs font-black uppercase tracking-widest text-primary hover:underline">Retry Connection</button>
    </div>
  );

  if (syllabus.length === 0) return (
    <div className="bg-white dark:bg-white/[0.03] border-2 border-dashed border-gray-200 dark:border-white/10 p-12 rounded-3xl text-center">
      <BookOpen className="mx-auto mb-4 text-slate-300" size={40} />
      <h3 className="font-bold text-gray-900 dark:text-white">Curriculum Not Found</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your semester subjects are currently being updated by the HOD.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {syllabus.map((course) => (
        <div key={course.id} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
          <div className="p-6 flex-1">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              <span className="bg-primary/5 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/10">
                Core Subject
              </span>
            </div>
            
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">{course.name}</h3>
            <p className="text-xs font-bold text-slate-400 font-mono tracking-wider mb-6">{course.code}</p>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" />
                Assigned Educator
              </p>
              {course.faculty && course.faculty.length > 0 ? (
                <div className="bg-gray-50 dark:bg-white/[0.02] p-4 rounded-2xl border border-gray-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">{course.faculty[0].name}</h4>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Mail size={12} />
                        <span className="text-[11px] font-medium">{course.faculty[0].email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50/50 dark:bg-rose-500/5 p-4 rounded-2xl border border-dashed border-rose-200 dark:border-rose-500/20 text-center">
                  <p className="text-xs font-bold text-rose-500">Instructor TBA</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentSyllabusGrid;
