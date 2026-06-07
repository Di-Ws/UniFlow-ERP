import React from 'react';
import { getUser } from '../../utils/auth';

const FacultySidebar: React.FC = () => {
  const user = getUser();

  const infoItems = [
    { label: 'Employee ID', value: user?.id || 'F-2024-007' },
    { label: 'Department', value: 'Computer Science & Engineering' },
    { label: 'Subjects Assigned', value: 'DBMS, Operating Systems, Computer Networks' },
    { label: 'Contact', value: '+1 (555) 123-4567' },
    { label: 'Email', value: user?.email || 'faculty.john@university.edu' },
    { label: 'Location', value: 'Faculty Block B, Room 402' }
  ];

  return (
    <aside className="hidden lg:flex w-[320px] bg-white/90 dark:bg-dark-card/90 backdrop-blur-md border-r border-slate-100 dark:border-white/5 flex flex-col h-full z-20 shrink-0">
      <div className="p-10 flex flex-col items-start">
        {/* Profile Section */}
        <div className="flex items-center gap-5 mb-10">
          <div className="relative">
            <img 
              src={`https://i.pravatar.cc/150?u=${user?.name || 'faculty'}`} 
              alt="Profile" 
              className="w-20 h-20 rounded-3xl object-cover shadow-xl border-4 border-slate-50 dark:border-slate-800"
            />
            <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white dark:border-dark-card rounded-full"></span>
          </div>
          <div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Welcome back</span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Prof. {user?.name?.split(' ')[0] || 'John'}</h2>
            </div>
            <div className="mt-2 px-3 py-1 bg-primary/10 text-[9px] font-black text-primary rounded-full inline-block uppercase tracking-widest border border-primary/20">
              FACULTY
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-50 dark:bg-white/5 mb-10"></div>

        {/* Detailed Info */}
        <div className="w-full space-y-9">
          {infoItems.map((item, idx) => (
            <div key={idx} className="space-y-2 group">
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] group-hover:text-primary transition-colors">
                {item.label}
              </p>
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Bottom Status Card */}
      <div className="mt-auto p-10">
        <div className="p-8 bg-slate-50/50 dark:bg-white/5 rounded-[32px] border border-slate-100/50 dark:border-white/5 flex flex-col gap-4">
          <div>
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">Status</p>
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Active Session</span>
            </div>
          </div>
          <button className="w-full py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
            View Full Profile
          </button>
        </div>
      </div>
    </aside>
  );
};

export default FacultySidebar;
