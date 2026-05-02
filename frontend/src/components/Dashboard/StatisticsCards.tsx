import React from 'react';
import { Users, CheckCircle, Percent } from 'lucide-react';

interface Stats {
  totalStudents: number;
  avgAttendance: number;
  feePaidPercent: number;
}

const StatisticsCards: React.FC<{ stats: Stats | null }> = ({ stats }) => {
  if (!stats) return null;

  const cardData = [
    {
      id: 1,
      title: 'Total Students',
      value: stats.totalStudents.toLocaleString(),
      icon: <Users size={24} className="text-blue-500" />,
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20'
    },
    {
      id: 2,
      title: 'Avg. Attendance',
      value: `${stats.avgAttendance}%`,
      icon: <Percent size={24} className="text-purple-500" />,
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20'
    },
    {
      id: 3,
      title: 'Fees Paid',
      value: `${stats.feePaidPercent}%`,
      icon: <CheckCircle size={24} className="text-emerald-500" />,
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cardData.map((card) => (
        <div key={card.id} className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div className="mb-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${card.bg} ${card.border} border`}>
              {card.icon}
            </div>
            <p className="text-gray-500 dark:text-slate-400 font-medium text-sm">{card.title}</p>
          </div>
          <div>
            <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
