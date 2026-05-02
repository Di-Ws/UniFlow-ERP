import React, { useEffect, useState } from 'react';
import { UserPlus, BookOpen, Check, AlertCircle } from 'lucide-react';
import api from '../../services/api';

const FacultyAssignment: React.FC<{ deptName: string, onAssigned?: () => void }> = ({ deptName, onAssigned }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      const [coursesRes, facultyRes] = await Promise.all([
        api.get(`/admin/unassigned-courses?deptName=${deptName}`),
        api.get('/admin/faculty-list')
      ]);
      setCourses(coursesRes.data);
      setFaculty(facultyRes.data);
    } catch (err) {
      console.error("Failed to fetch assignment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deptName) fetchData();
  }, [deptName]);

  const handleAssign = async (courseId: number, facultyId: string) => {
    if (!facultyId) return;
    setSubmitting(courseId);
    try {
      await api.post('/admin/assign-faculty', { courseId, facultyId });
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (onAssigned) onAssigned();
    } catch (err) {
      console.error("Assignment failed");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Staffing Queue...</div>;

  if (courses.length === 0) return (
    <div className="p-12 text-center bg-emerald-50/50 dark:bg-emerald-500/5 rounded-3xl border border-dashed border-emerald-200 dark:border-emerald-500/20">
      <Check className="text-emerald-500 mx-auto mb-4" size={32} />
      <h3 className="font-bold text-gray-900 dark:text-white">All Courses Staffed</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Excellent! Your department resources are fully allocated.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="text-primary" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">Faculty Allocation</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Link educators to unstaffed subjects</p>
          </div>
        </div>
        <span className="bg-rose-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{courses.length} Pending</span>
      </div>

      <div className="p-2">
        <table className="w-full text-left">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Course Code</th>
              <th className="px-6 py-4">Assign Faculty</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {courses.map((course) => (
              <tr key={course.id} className="group hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                      <BookOpen size={16} />
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{course.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    {course.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <select 
                      className="bg-white dark:bg-dark-card border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-primary outline-none min-w-[200px]"
                      onChange={(e) => handleAssign(course.id, e.target.value)}
                      disabled={submitting === course.id}
                    >
                      <option value="">Select Educator...</option>
                      {faculty.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.email})</option>
                      ))}
                    </select>
                    {submitting === course.id && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary"></div>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyAssignment;
