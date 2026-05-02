import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface AnalyticsChartsProps {
  branchData: any;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f97316', '#22c55e', '#06b6d4'];

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ branchData }) => {
  if (!branchData) return null;

  const data = Object.keys(branchData).map(key => ({
    name: key,
    students: branchData[key]
  }));

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const tooltipBg = isDark ? '#0A0D14' : '#ffffff';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
  const tooltipText = isDark ? '#ffffff' : '#0f172a';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      <div className="flex flex-col">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg tracking-tight">Students by Branch</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="name" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} dx={-10} />
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ color: '#6366f1', fontWeight: 'bold' }}
                cursor={{ fill: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)' }}
              />
              <Bar dataKey="students" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex flex-col border-t border-gray-100 dark:border-white/5 pt-8 md:pt-0 md:border-t-0 md:border-l md:pl-8">
        <h3 className="font-bold text-gray-900 dark:text-white mb-6 text-lg tracking-tight">Distribution</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="students"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText, borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
