import React from 'react';
import { CalendarDays, CalendarRange, CheckCircle, XCircle, MoreVertical, Search } from 'lucide-react';
import { Leave } from '../../types/leave';
import StatusBadge from './StatusBadge';

interface LeaveTableProps {
  loading: boolean;
  leaves: Leave[];
  isHOD: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const LeaveTable: React.FC<LeaveTableProps> = ({ loading, leaves, isHOD, onApprove, onReject }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getDuration = (start: string, end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  return (
    <div className="overflow-x-auto hide-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-dark-bg/50 sticky top-0 z-10">
            <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Applicant</th>
            <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Leave Type</th>
            <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Duration</th>
            <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Reason</th>
            <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Status</th>
            <th className="px-6 py-5 text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Decision</th>
            <th className="px-6 py-5 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
          {loading ? (
            <tr>
              <td colSpan={7} className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">Loading records...</p>
              </td>
            </tr>
          ) : leaves.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Search size={24} />
                </div>
                <p className="text-gray-900 dark:text-white font-bold text-lg">No records found</p>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Try adjusting your filters or search query.</p>
              </td>
            </tr>
          ) : (
            leaves.map((leave) => (
              <tr key={leave.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={`https://i.pravatar.cc/150?u=${leave.userName}`} 
                      alt={leave.userName} 
                      className="w-10 h-10 rounded-full object-cover shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white font-bold text-sm">{leave.userName}</span>
                      <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">
                        {leave.userRole === 'Faculty' ? 'Faculty (CS)' : 'Student (CS)'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {leave.leaveType.includes('Sick') || leave.leaveType.includes('Medical') ? (
                      <div className="flex items-center gap-1.5 text-primary dark:text-primary">
                        <CalendarDays size={14} /> {leave.leaveType}
                      </div>
                    ) : leave.leaveType.includes('Earned') ? (
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                        <CalendarRange size={14} /> {leave.leaveType}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                        <CalendarDays size={14} /> {leave.leaveType}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-gray-900 dark:text-white text-sm font-semibold">
                      {formatDate(leave.startDate)} {leave.startDate !== leave.endDate && `- ${formatDate(leave.endDate)}`}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400 text-xs font-medium mt-0.5">
                      {getDuration(leave.startDate, leave.endDate)} {getDuration(leave.startDate, leave.endDate) === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-[200px]">
                  <p className="text-gray-900 dark:text-white text-sm font-semibold truncate">{leave.reason.split(' ').slice(0, 3).join(' ')}...</p>
                  <p className="text-gray-500 dark:text-slate-400 text-xs truncate mt-0.5" title={leave.reason}>{leave.reason}</p>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={leave.status} />
                </td>
                <td className="px-6 py-4">
                  {leave.status === 'PENDING' ? (
                    <div className="flex flex-col">
                      <span className="text-gray-900 dark:text-white text-sm font-medium">Awaiting approval</span>
                      <span className="text-gray-400 dark:text-slate-500 text-xs">—</span>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <span className="text-gray-500 dark:text-slate-400 text-xs font-medium">Reviewed by</span>
                      <span className="text-gray-900 dark:text-white text-sm font-bold flex items-center gap-1">
                        {leave.approvedBy?.name || 'Dr. Divyansh'}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {isHOD && leave.status === 'PENDING' ? (
                    <div className="flex items-center gap-1 justify-end">
                      <button 
                        onClick={() => onApprove(leave.id)}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button 
                        onClick={() => onReject(leave.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <button className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveTable;
