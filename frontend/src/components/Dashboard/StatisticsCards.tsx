import React from 'react';
import { Users, CheckCircle, Percent } from 'lucide-react';
import './StatisticsCards.css';

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
      icon: <Users size={24} className="icon-blue" />,
      color: 'blue'
    },
    {
      id: 2,
      title: 'Avg. Attendance',
      value: `${stats.avgAttendance}%`,
      icon: <Percent size={24} className="icon-purple" />,
      color: 'purple'
    },
    {
      id: 3,
      title: 'Fees Paid',
      value: `${stats.feePaidPercent}%`,
      icon: <CheckCircle size={24} className="icon-green" />,
      color: 'green'
    }
  ];

  return (
    <div className="stats-grid">
      {cardData.map((card) => (
        <div key={card.id} className={`stat-card card-${card.color}`}>
          <div className="card-top">
            <div className="card-icon-bg">{card.icon}</div>
          </div>
          <div className="card-info">
            <h3>{card.value}</h3>
            <p>{card.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatisticsCards;
