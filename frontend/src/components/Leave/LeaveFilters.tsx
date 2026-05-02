import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const STATUS_FILTERS = ['All', 'PENDING', 'APPROVED', 'REJECTED'];
const LEAVE_FILTER = ['All Types', 'Sick Leave', 'Casual Leave', 'Medical Leave', 'Earned Leave', 'Other'];

interface LeaveFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  timeFilter: string;
  setTimeFilter: (val: string) => void;
  onFilterChange: () => void;
}

const LeaveFilters: React.FC<LeaveFiltersProps> = ({
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  typeFilter, setTypeFilter,
  timeFilter, setTimeFilter,
  onFilterChange
}) => {
  return (
    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col xl:flex-row gap-6 items-start xl:items-center justify-between">
      <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student or faculty name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-full py-2.5 pl-11 pr-4 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
        
        {/* Quick Status Tabs */}
        <div className="flex bg-gray-50 dark:bg-dark-bg p-1.5 rounded-full border border-gray-200 dark:border-white/5 shrink-0 self-start">
          {STATUS_FILTERS.map(s => (
            <button 
              key={s} 
              onClick={() => { setStatusFilter(s); onFilterChange(); }}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all ${
                statusFilter === s 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3 w-full xl:w-auto">
        {/* Type Dropdown */}
        <div className="relative shrink-0">
          <select 
            value={typeFilter} 
            onChange={(e) => { setTypeFilter(e.target.value); onFilterChange(); }}
            className="appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[140px]"
          >
            {LEAVE_FILTER.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Time Dropdown */}
        <div className="relative shrink-0">
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value)}
            className="appearance-none bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-white/5 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer min-w-[120px]"
          >
            <option value="All Time">All Time</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default LeaveFilters;
