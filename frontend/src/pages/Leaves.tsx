import React, { useState, useEffect, useMemo } from 'react';
import { getLeaves, createLeave, updateLeaveStatus, Leave, LeaveInput } from '../services/leaveService';
import LeaveForm from '../components/Leave/LeaveForm';
import { Plus, Search, Calendar, CheckCircle, XCircle, Clock, UserCheck, Filter, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_FILTERS = ['All', 'PENDING', 'APPROVED', 'REJECTED'];
const LEAVE_FILTER = ['All', 'Sick Leave', 'Casual Leave', 'Academic Leave', 'Other'];

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<{id: number, status: 'APPROVED' | 'REJECTED'} | null>(null);

  // Check if current user is HOD
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = currentUser?.role === 'HOD';

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves();
      setLeaves(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leave requests.');
      toast.error(err.message || 'Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const matchSearch = leave.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || leave.status === statusFilter;
      const matchType = typeFilter === 'All' || leave.leaveType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [leaves, searchQuery, statusFilter, typeFilter]);

  // Stats
  const stats = {
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  };

  const handleApplyLeave = async (data: LeaveInput) => {
    try {
      await createLeave(data);
      toast.success('Leave request submitted successfully!');
      setIsFormOpen(false);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave request.');
    }
  };

  const handleStatusUpdate = async () => {
    if (!isConfirmOpen) return;
    const { id, status } = isConfirmOpen;
    
    const loadingToast = toast.loading(`${status === 'APPROVED' ? 'Approving' : 'Rejecting'} leave request...`);
    try {
      await updateLeaveStatus(id, status);
      toast.success(`Leave ${status === 'APPROVED' ? 'Approved' : 'Rejected'} successfully!`, { id: loadingToast });
      setIsConfirmOpen(null);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || `Failed to update status.`, { id: loadingToast });
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDuration = (start: string, end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      APPROVED: 'bg-green-500/10 text-green-500 border-green-500/20',
      REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    const Icons = {
      PENDING: Clock,
      APPROVED: CheckCircle,
      REJECTED: XCircle,
    };
    const Icon = Icons[status as keyof typeof Icons] || Clock;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${styles[status as keyof typeof styles]}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Leave Management</h1>
          <p className="text-slate-400 mt-1">
            {isHOD ? 'Review and manage departmental leave requests' : 'Apply for leave and track your application status'}
          </p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Plus size={20} /> Apply Leave
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: Calendar, color: 'indigo' },
          { label: 'Pending Approval', value: stats.pending, icon: Clock, color: 'yellow' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'green' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 hover:border-slate-700 transition-colors group">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${stat.color}-500/10 text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between backdrop-blur-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by student or faculty name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            {STATUS_FILTERS.map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  statusFilter === s 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {s === 'All' ? s : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          
          <select 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 focus:outline-none ring-offset-0 focus:ring-2 focus:ring-indigo-500/50"
          >
            {LEAVE_FILTER.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-400 font-medium">Loading requests...</p>
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-6">
            <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center text-slate-500 mb-4">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-white">No requests found</h3>
            <p className="text-slate-400 mt-1 max-w-xs">No leave requests match your current filters or searching criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold">{leave.userName}</span>
                        <span className="text-indigo-400 text-xs font-medium uppercase tracking-tighter">{leave.userRole}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-slate-300 font-medium">{leave.leaveType}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="text-slate-300 text-sm font-semibold">{formatDate(leave.startDate)}</span>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <span>{getDuration(leave.startDate, leave.endDate)} days</span>
                          <ChevronRight size={10} />
                          <span>{formatDate(leave.endDate)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 max-w-xs overflow-hidden">
                      <p className="text-slate-400 text-sm line-clamp-2 italic" title={leave.reason}>
                        "{leave.reason}"
                      </p>
                    </td>
                    <td className="px-6 py-5">
                      {getStatusBadge(leave.status)}
                    </td>
                    <td className="px-6 py-5">
                      {leave.status === 'PENDING' ? (
                        isHOD ? (
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => setIsConfirmOpen({id: leave.id, status: 'APPROVED'})}
                              className="px-3 py-1.5 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white border border-green-500/20 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <CheckCircle size={14} /> Approve
                            </button>
                            <button 
                              onClick={() => setIsConfirmOpen({id: leave.id, status: 'REJECTED'})}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                            >
                              <XCircle size={14} /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs italic font-medium flex items-center gap-1">
                            <Clock size={12} /> Waiting for HOD
                          </span>
                        )
                      ) : (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-500 text-xs font-medium">Reviewed by</span>
                          <span className="text-white text-[13px] font-bold flex items-center gap-1">
                            <UserCheck size={14} className="text-indigo-500" />
                            {leave.approvedBy?.name || 'Authorized Admin'}
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 p-6">
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 ${isConfirmOpen.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {isConfirmOpen.status === 'APPROVED' ? <CheckCircle size={32} /> : <XCircle size={32} />}
            </div>
            <h3 className="text-xl font-bold text-white text-center">Confirm Action</h3>
            <p className="text-slate-400 text-center mt-2">
              Are you sure you want to <span className={isConfirmOpen.status === 'APPROVED' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>{isConfirmOpen.status.toLowerCase()}</span> this leave application? This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-8">
              <button 
                onClick={() => setIsConfirmOpen(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStatusUpdate}
                className={`px-4 py-2 ${isConfirmOpen.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl font-bold shadow-lg shadow-black/20 transition-colors`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Form Modal */}
      <LeaveForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleApplyLeave} />
    </div>
  );
};

export default Leaves;
