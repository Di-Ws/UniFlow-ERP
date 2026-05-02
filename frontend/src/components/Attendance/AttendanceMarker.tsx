import React, { useState, useEffect } from 'react';
import { Check, X, Users, Save, Loader2, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { markBulkAttendanceAPI, AttendanceRecord } from '../../services/attendanceService';
import { getUser } from '../../utils/auth';

interface Student {
  id: number;
  name: string;
  batch?: string;
  year?: string;
}

interface AttendanceMarkerProps {
  students: Student[];
  courseId?: number;
  period?: string;
  onSuccess?: () => void;
}

const AttendanceMarker: React.FC<AttendanceMarkerProps> = ({ 
  students, 
  courseId, 
  period = "09:00 AM - 10:00 AM",
  onSuccess 
}) => {
  const user = getUser();
  const [attendanceMap, setAttendanceMap] = useState<Record<number, 'PRESENT' | 'ABSENT'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Initialize all as PRESENT by default
  useEffect(() => {
    const initialMap: Record<number, 'PRESENT' | 'ABSENT'> = {};
    students.forEach(s => {
      initialMap[s.id] = 'PRESENT';
    });
    setAttendanceMap(initialMap);
  }, [students]);

  const toggleAll = (status: 'PRESENT' | 'ABSENT') => {
    const newMap = { ...attendanceMap };
    students.forEach(s => {
      newMap[s.id] = status;
    });
    setAttendanceMap(newMap);
  };

  const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to mark attendance");
      return;
    }

    try {
      setIsSubmitting(true);
      const records: AttendanceRecord[] = students.map(s => ({
        studentId: s.id,
        courseId: courseId || null,
        date: date,
        period: period,
        status: attendanceMap[s.id] || 'PRESENT'
      }));

      await markBulkAttendanceAPI(records);
      toast.success("Attendance marked successfully");
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    } finally {
      setIsSubmitting(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter(v => v === 'PRESENT').length;

  return (
    <div className="bg-white dark:bg-dark-card rounded-[32px] border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
      {/* Header Controls */}
      <div className="p-8 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border-none text-lg font-black text-slate-900 dark:text-white focus:ring-0 cursor-pointer"
            />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Attendance Date</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-lg font-black text-slate-900 dark:text-white">{period}</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Session</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-dark-card p-2 rounded-2xl border border-slate-100 dark:border-white/5">
          <button 
            onClick={() => toggleAll('PRESENT')}
            className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
          >
            All Present
          </button>
          <button 
            onClick={() => toggleAll('ABSENT')}
            className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all bg-rose-500 text-white shadow-lg shadow-rose-500/20"
          >
            All Absent
          </button>
        </div>
      </div>

      {/* Student List Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/30 dark:bg-white/5 border-b border-slate-100 dark:border-white/5">
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Student Name</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Details</th>
              <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-center text-slate-400 dark:text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-6 px-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center font-bold text-slate-400">
                      {student.name.charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{student.name}</span>
                  </div>
                </td>
                <td className="py-6 px-8 text-center text-xs font-bold text-slate-400">
                  {student.batch} • {student.year}
                </td>
                <td className="py-6 px-8">
                  <div className="flex items-center justify-center gap-4">
                    <label className="relative flex items-center cursor-pointer group">
                      <input 
                        type="radio" 
                        name={`status-${student.id}`}
                        checked={attendanceMap[student.id] === 'PRESENT'}
                        onChange={() => handleStatusChange(student.id, 'PRESENT')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                        attendanceMap[student.id] === 'PRESENT' 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                          : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-300 group-hover:border-emerald-500/50'
                      }`}>
                        <Check size={20} strokeWidth={3} />
                      </div>
                    </label>
                    <label className="relative flex items-center cursor-pointer group">
                      <input 
                        type="radio" 
                        name={`status-${student.id}`}
                        checked={attendanceMap[student.id] === 'ABSENT'}
                        onChange={() => handleStatusChange(student.id, 'ABSENT')}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                        attendanceMap[student.id] === 'ABSENT' 
                          ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/30' 
                          : 'bg-transparent border-slate-200 dark:border-white/10 text-slate-300 group-hover:border-rose-500/50'
                      }`}>
                        <X size={20} strokeWidth={3} />
                      </div>
                    </label>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Submit */}
      <div className="p-8 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500">
            <span className="text-emerald-500">{presentCount} Present</span> / {students.length} Total
          </span>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || students.length === 0}
          className="px-10 py-4 bg-primary text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          {isSubmitting ? 'Submitting...' : 'Confirm Attendance'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceMarker;
