import React, { useState } from 'react';
import { ClipboardList, Calendar, CheckCircle2, Clock } from 'lucide-react';

interface Props {
  assignments: any[];
}

const AssignmentTabs: React.FC<Props> = ({ assignments }) => {
  const [filter, setFilter] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  const filtered = assignments.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setFilter('PENDING')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'PENDING' ? 'bg-white dark:bg-white/10 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <Clock size={14} />
          Pending ({assignments.filter(a => a.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setFilter('COMPLETED')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === 'COMPLETED' ? 'bg-white dark:bg-white/10 text-emerald-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
        >
          <CheckCircle2 size={14} />
          Completed ({assignments.filter(a => a.status === 'COMPLETED').length})
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-white/[0.02] rounded-3xl border border-dashed border-gray-200 dark:border-white/5">
            <ClipboardList className="mx-auto text-slate-300 dark:text-white/10 mb-4" size={48} />
            <p className="text-slate-400 font-bold italic">No {filter.toLowerCase()} assignments found.</p>
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="bg-white dark:bg-white/[0.03] rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{a.title}</h4>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${filter === 'PENDING' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {filter}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">{a.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                  <Calendar size={14} />
                  Due: {new Date(a.dueDate).toLocaleDateString()}
                </div>
                {filter === 'PENDING' && (
                  <button className="text-xs font-black uppercase tracking-widest text-primary hover:underline">
                    Submit Now
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentTabs;
