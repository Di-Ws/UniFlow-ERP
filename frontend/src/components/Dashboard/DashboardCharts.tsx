import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';

/**
 * HOD Monthly Leaves Comparison (Bar Chart)
 */
export const LeaveAnalyticsChart: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              padding: '12px'
            }}
          />
          <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} barSize={30} name="Approved" />
          <Bar dataKey="rejected" fill="#f43f5e" radius={[6, 6, 0, 0]} barSize={30} name="Rejected" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

/**
 * Student Attendance Pie Chart
 */
export const AttendancePieChart: React.FC<{ data: any[], percentage: number }> = ({ data, percentage }) => {
  return (
    <div className="w-full h-[300px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={8}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
             contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Center Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mb-8">
        <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{percentage}%</span>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Attendance</span>
      </div>
    </div>
  );
};
