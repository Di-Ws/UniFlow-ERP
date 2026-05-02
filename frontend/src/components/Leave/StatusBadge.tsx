import React from 'react';

interface StatusBadgeProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    APPROVED: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    REJECTED: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20',
    PENDING: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-widest uppercase border ${styles[status]}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
