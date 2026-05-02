import React, { useEffect, useState } from 'react';
import { BookOpen, Users, Layout, ChevronRight } from 'lucide-react';
import api from '../../services/api';

const FacultyCourseGrid: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/faculty/my-courses');
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch faculty courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) return <div className="h-48 animate-pulse bg-gray-50 dark:bg-white/5 rounded-3xl flex items-center justify-center text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Assigned Courses...</div>;

  if (courses.length === 0) return (
    <div className="bg-white dark:bg-white/[0.03] border-2 border-dashed border-gray-200 dark:border-white/10 p-12 rounded-3xl text-center">
      <Layout className="mx-auto mb-4 text-slate-300" size={40} />
      <h3 className="font-bold text-gray-900 dark:text-white">No Courses Assigned</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please contact your HOD to assign subjects to your profile.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {courses.map((course) => (
        <div key={course.id} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:bg-primary/10 transition-colors"></div>
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen size={24} />
            </div>
            <span className="bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
              SEM {course.semester}
            </span>
          </div>

          <div className="mb-6 relative z-10">
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-primary transition-colors">{course.name}</h3>
            <p className="text-xs font-bold text-slate-400 font-mono tracking-wider">{course.code}</p>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5 relative z-10">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{course._count.students} Students</span>
            </div>
            <button className="p-2 bg-gray-50 dark:bg-white/5 rounded-xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacultyCourseGrid;
