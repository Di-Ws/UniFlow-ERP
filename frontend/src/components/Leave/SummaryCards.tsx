import React from 'react';
import { CalendarDays, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LeaveStats } from '../../types/leave';

interface SummaryCardsProps {
  stats: LeaveStats;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Card */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center shrink-0 text-primary dark:text-primary">
          <CalendarDays size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.total}</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total Requests</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">All time requests</p>
        </div>
      </div>

      {/* Pending Card */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400">
          <Clock size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.pending}</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Pending Approval</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Awaiting response</p>
        </div>
      </div>

      {/* Approved Card */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
          <CheckCircle size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.approved}</p>
            <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2"></div>
          </div>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Approved</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Approved leaves</p>
        </div>
      </div>

      {/* Rejected Card */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 flex items-start gap-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
          <XCircle size={24} />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.rejected}</p>
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Rejected</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Rejected leaves</p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;
