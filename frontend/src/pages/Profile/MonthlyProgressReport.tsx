import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, Clock } from 'lucide-react';
import { getMonthlyProgress } from '../../services/studentPortalService';

const MonthlyProgressReport: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMonthlyProgress();
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="h-[300px] flex items-center justify-center dark:text-slate-400">Loading Report...</div>;
  if (!data) return <div className="h-[300px] flex items-center justify-center dark:text-slate-400 italic">No data for this month.</div>;

  const chartData = [
    { name: 'Attendance', value: data.attendanceRate, color: '#3b82f6' },
    { name: 'Academic Marks', value: data.averageMarks, color: '#10b981' }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 dark:bg-blue-500/5 rounded-3xl p-6 border border-blue-100 dark:border-blue-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Avg Attendance</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{data.attendanceRate}%</span>
            <span className="text-xs text-blue-400 font-bold">this month</span>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-500/20">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-emerald-500" size={18} />
            <h4 className="text-xs font-black uppercase tracking-widest text-emerald-500">Avg Marks</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{data.averageMarks}%</span>
            <span className="text-xs text-emerald-400 font-bold">this month</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="text-primary" size={20} />
          <h3 className="font-bold text-gray-900 dark:text-white">Performance Visualization</h3>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={60}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b820" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12 }} 
                domain={[0, 100]}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ 
                  borderRadius: '16px', 
                  border: 'none', 
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                  background: '#1e293b'
                }}
                itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MonthlyProgressReport;
