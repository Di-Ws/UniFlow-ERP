import React, { useState, useEffect } from 'react';
import { getUnpaidStudents, permitStudent } from '../../services/adminService';
import { ShieldCheck, ShieldAlert, FileText, X, Check, Search, AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  batch: string;
  year: number;
  feeDue: number;
  feeStatus: string;
  feePermitted: boolean;
  feePermissionReason: string | null;
  department?: {
    name: string;
  };
}

const UnpaidStudentsList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track which student ID is currently being permitted (shows the input form)
  const [permittingId, setPermittingId] = useState<number | null>(null);
  const [reason, setReason] = useState('');
  const [submittingId, setSubmittingId] = useState<number | null>(null);

  const fetchUnpaid = async () => {
    try {
      setLoading(true);
      const data = await getUnpaidStudents();
      setStudents(data);
    } catch (error) {
      toast.error("Failed to load unpaid student list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnpaid();
  }, []);

  const handlePermitToggle = (studentId: number, currentlyPermitted: boolean) => {
    if (currentlyPermitted) {
      // Direct revoke, no reason needed
      handleSavePermission(studentId, false, '');
    } else {
      // Open form
      setPermittingId(studentId);
      setReason('');
    }
  };

  const handleSavePermission = async (studentId: number, permitted: boolean, permissionReason: string) => {
    if (permitted && !permissionReason.trim()) {
      toast.error("Please provide a reason for permitting attendance");
      return;
    }

    try {
      setSubmittingId(studentId);
      await permitStudent(studentId, permitted, permitted ? permissionReason : undefined);
      toast.success(permitted ? "Attendance permission granted" : "Attendance permission revoked");
      
      // Update local state
      setStudents(prev => prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            feePermitted: permitted,
            feePermissionReason: permitted ? permissionReason : null
          };
        }
        return s;
      }));

      // Reset permitting form
      setPermittingId(null);
      setReason('');
    } catch (error) {
      toast.error("Operation failed. Please try again.");
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.department?.name && s.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-500 dark:text-slate-400">Loading outstanding fees data...</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
      {/* Header controls */}
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Outstanding Fees & Gating Console</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {students.length} students have unpaid fees. {students.filter(s => s.feePermitted).length} permitted by override.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search student or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 pl-10 pr-4 py-2 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none w-64 transition-all"
            />
          </div>
          {/* Refresh button */}
          <button 
            onClick={fetchUnpaid}
            className="p-2 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Roster Cleared!</h3>
          <p className="text-gray-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
            {searchTerm ? "No students matching search criteria." : "All students have cleared their financial dues. Attendance block is currently inactive."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-slate-50/10 dark:bg-white/[0.01]">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Student Info</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Department</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Outstanding Balance</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Attendance Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">HOD Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filteredStudents.map((student) => {
                const isFormOpen = permittingId === student.id;
                const isSubmitting = submittingId === student.id;
                return (
                  <React.Fragment key={student.id}>
                    <tr className={`group hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors ${student.feePermitted ? 'bg-emerald-500/[0.01]' : 'bg-rose-500/[0.01]'}`}>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${student.feePermitted ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-600'}`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white block">{student.name}</span>
                            <span className="text-[10px] text-gray-400 dark:text-slate-500 block mt-0.5">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          {student.department?.name || 'Unassigned'}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 block mt-0.5">
                          Batch: {student.batch} • Yr {student.year}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-rose-500 text-sm">
                        ${student.feeDue.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        {student.feePermitted ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border border-emerald-100 dark:border-emerald-500/20">
                            <ShieldCheck size={12} />
                            Permitted (Allowed)
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 dark:bg-rose-500/10 text-rose-600 border border-rose-100 dark:border-rose-500/20">
                            <ShieldAlert size={12} />
                            Blocked (Locked)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => handlePermitToggle(student.id, student.feePermitted)}
                          disabled={isSubmitting}
                          className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                            student.feePermitted
                              ? 'bg-rose-50 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 text-rose-500 hover:bg-rose-100'
                              : 'bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-emerald-500 hover:bg-emerald-100'
                          }`}
                        >
                          {student.feePermitted ? 'Revoke Override' : 'Grant Override'}
                        </button>
                      </td>
                    </tr>

                    {/* Permission overriding form block */}
                    {isFormOpen && (
                      <tr className="bg-slate-50 dark:bg-white/[0.02]">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 border border-dashed border-emerald-500/20 rounded-2xl">
                            <div className="flex-1 space-y-2">
                              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                                Reason For Permitting (HOD Override)
                              </label>
                              <div className="relative">
                                <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                  type="text"
                                  required
                                  placeholder="Enter the reason why this student is allowed to attend (e.g. extension requested, emergency)"
                                  value={reason}
                                  onChange={(e) => setReason(e.target.value)}
                                  className="w-full bg-white dark:bg-dark-card border border-slate-200 dark:border-white/5 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                />
                              </div>
                            </div>
                            <div className="flex items-center gap-2 self-end">
                              <button
                                onClick={() => {
                                  setPermittingId(null);
                                  setReason('');
                                }}
                                className="p-3 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-all"
                                title="Cancel"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => handleSavePermission(student.id, true, reason)}
                                className="px-4 py-3 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
                              >
                                <Check size={14} strokeWidth={3} />
                                Allow Student
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* Display existing permission reason if permitted */}
                    {student.feePermitted && student.feePermissionReason && !isFormOpen && (
                      <tr className="bg-emerald-500/[0.02]">
                        <td colSpan={5} className="px-6 py-2 pb-3 text-xs text-emerald-600 dark:text-emerald-400">
                          <div className="flex items-center gap-1.5 pl-12">
                            <AlertCircle size={12} />
                            <span className="font-bold">Override Reason:</span>
                            <span className="italic">"{student.feePermissionReason}"</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UnpaidStudentsList;
