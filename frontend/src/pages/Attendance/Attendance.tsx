import React, { useState, useEffect } from 'react';
import AttendanceMarker from '../../components/Attendance/AttendanceMarker';
import { getAssignedStudents } from '../../services/facultyService';
import { Users, BookOpen, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AttendancePage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('Morning Session');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getAssignedStudents();
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students:", error);
        toast.error("Could not load your assigned students");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            <BookOpen size={14} />
            Academic Management
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Mark Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
            Mark daily attendance for your assigned students. Duplicates for the same day and slot are automatically managed.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-dark-card p-3 rounded-[24px] border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-xl">
            <Users size={16} className="text-slate-400" />
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">{students.length} Students</span>
          </div>
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-transparent border-none text-sm font-black text-primary focus:ring-0 cursor-pointer"
          >
            <option value="Morning Session">Morning Session (09-10 AM)</option>
            <option value="Afternoon Session">Afternoon Session (02-03 PM)</option>
            <option value="Evening Session">Evening Session (04-05 PM)</option>
          </select>
        </div>
      </header>

      {/* Main Content */}
      {students.length > 0 ? (
        <AttendanceMarker 
          students={students} 
          period={selectedClass} 
        />
      ) : (
        <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 p-12 rounded-[40px] text-center space-y-4">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 mx-auto">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-xl font-black text-amber-900 dark:text-amber-400">No Students Assigned</h3>
          <p className="text-amber-700 dark:text-amber-500/60 max-w-md mx-auto">
            You don't have any students assigned to your classes yet. Please contact the HOD to update your student roster.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendancePage;
