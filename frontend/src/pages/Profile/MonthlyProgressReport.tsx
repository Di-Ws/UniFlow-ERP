import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Award, Clock, ThumbsUp, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { getMonthlyProgress } from '../../services/studentPortalService';

interface Props {
  academicReports?: any[];
}

// Helper to generate dynamic suggested topics based on subject name
const getSuggestions = (subject: string, isStrong: boolean): string[] => {
  const sub = (subject || '').toLowerCase();
  if (sub.includes('algo') || sub.includes('ds') || sub.includes('structure')) {
    return isStrong 
      ? ["Advanced Graph Algorithms", "Dynamic Programming Optimization", "String Matching (KMP)", "Amortized Analysis"]
      : ["Basic Sorting & Searching", "Binary Search Trees & Heaps", "Recursion Basics", "Time & Space Complexity"];
  }
  if (sub.includes('prog') || sub.includes('java') || sub.includes('python') || sub.includes('c++') || sub.includes('code') || sub.includes('coding')) {
    return isStrong
      ? ["Object-Oriented Design Patterns", "Memory Management & Pointers", "Multithreading & Concurrency"]
      : ["Variables, Data Types & Syntax", "Control Loops & Branches", "Classes & Objects Basics", "Basic Debugging"];
  }
  if (sub.includes('math') || sub.includes('calc') || sub.includes('algebra') || sub.includes('prob') || sub.includes('stat')) {
    return isStrong
      ? ["Eigenvalues & Matrix Decompositions", "Multivariable Derivatives", "Bayesian Probability & Regression"]
      : ["Basic Matrix Arithmetic", "Vector Operations", "Limits & Derivatives", "Probability Rules"];
  }
  if (sub.includes('db') || sub.includes('sql') || sub.includes('data') || sub.includes('query')) {
    return isStrong
      ? ["Query Execution Optimization", "Database Normalization (BCNF)", "Indexing Strategies (B+ Trees)"]
      : ["SQL Querying (SELECT, JOINs)", "Schema & Table Relationships", "Primary vs Foreign Keys"];
  }
  if (sub.includes('web') || sub.includes('front') || sub.includes('back') || sub.includes('js') || sub.includes('react') || sub.includes('node')) {
    return isStrong
      ? ["State Management (Redux/Zustand)", "Server-Side Rendering (SSR)", "Web Security (JWT/CSRF/CORS)"]
      : ["HTML5 & CSS3 Page Layouts", "JavaScript Basics (ES6)", "React State & Props Management"];
  }
  
  return isStrong
    ? [`Advanced Applications of ${subject}`, `Performance Tuning in ${subject}`, `Specialized Case Studies`]
    : [`Core Definitions of ${subject}`, `Fundamental Principles`, `Reviewing Textbook Exercises`];
};

const MonthlyProgressReport: React.FC<Props> = ({ academicReports = [] }) => {
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

  // Classify reports: Strong (>= 70) vs Work Area (< 70)
  const strongReports = academicReports.filter(r => (r.marks || 0) >= 70);
  const workReports = academicReports.filter(r => (r.marks || 0) < 70);

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

      {/* Performance Visualization and Strong/Work Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col justify-between">
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

        {/* Quick Summary / Insights */}
        <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <Sparkles className="text-amber-500" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-white">Academic Summary</h3>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Subjects</span>
              <span className="text-lg font-black text-gray-900 dark:text-white">{academicReports.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Strong Fields</span>
              <span className="text-lg font-black text-emerald-500">{strongReports.length}</span>
            </div>
            <div className="flex items-center justify-between pb-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Work Areas</span>
              <span className="text-lg font-black text-amber-500">{workReports.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Strong and Work Areas Details Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Strong Area */}
        <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ThumbsUp className="text-emerald-500" size={22} />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Strong Area</h3>
          </div>
          
          {strongReports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic text-sm">
              No strong areas identified yet. Score 70%+ in any exam to list here!
            </div>
          ) : (
            <div className="space-y-6">
              {strongReports.map((report: any) => (
                <div key={report.id} className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <BookOpen size={16} className="text-emerald-400" />
                      {report.subject}
                    </h4>
                    <span className="text-xs font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                      {report.marks}% ({report.grade})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-3">
                    Your basic is outstanding here but need some more improvement to make it more strong.
                  </p>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1.5">Suggested Topics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getSuggestions(report.subject, true).map((topic, idx) => (
                        <span key={idx} className="text-[10px] bg-emerald-500/10 text-emerald-400 dark:text-emerald-300 font-bold px-2 py-1 rounded-lg border border-emerald-500/10">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Work Area / Weak Area */}
        <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-amber-500" size={22} />
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Work Area (Improvement)</h3>
          </div>
          
          {workReports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 italic text-sm">
              No immediate focus areas! Excellent work maintaining high grades.
            </div>
          ) : (
            <div className="space-y-6">
              {workReports.map((report: any) => (
                <div key={report.id} className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                      <BookOpen size={16} className="text-amber-400" />
                      {report.subject}
                    </h4>
                    <span className="text-xs font-black bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-lg border border-amber-500/20">
                      {report.marks}% ({report.grade})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-3">
                    You need a bit more practice and revision in this area to improve.
                  </p>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mb-1.5">Suggested Topics:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {getSuggestions(report.subject, false).map((topic, idx) => (
                        <span key={idx} className="text-[10px] bg-amber-500/10 text-amber-400 dark:text-amber-300 font-bold px-2 py-1 rounded-lg border border-amber-500/10">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MonthlyProgressReport;
