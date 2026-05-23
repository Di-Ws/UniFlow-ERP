import React, { useState, useEffect } from 'react';
import { getStudentDashboardData } from '../../services/studentPortalService';
import ProfileUpdateForm from './ProfileUpdateForm';
import FeeDashboard from './FeeDashboard';
import AssignmentTabs from './AssignmentTabs';
import MonthlyProgressReport from './MonthlyProgressReport';
import StudentStudyMaterials from '../../components/Student/StudentStudyMaterials';
import { User, Wallet, ClipboardList, BarChart3, Lock, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentPortal: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'fees' | 'assignments' | 'reports' | 'materials'>('profile');

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getStudentDashboardData();
      setData(res);
    } catch (err) {
      toast.error("Failed to load portal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  // Gated Access Check: Student must have Next of Kin details to access other tabs
  const hasRequiredInfo = data?.nextOfKinName && data?.nextOfKinPhone;
  const isProfileLocked = !hasRequiredInfo;

  const tabs: Array<{ id: 'profile' | 'fees' | 'assignments' | 'reports' | 'materials', label: string, icon: any, color: string, locked?: boolean }> = [
    { id: 'profile', label: 'My Profile', icon: User, color: 'text-blue-500' },
    { id: 'fees', label: 'Fees & Finance', icon: Wallet, color: 'text-amber-500', locked: isProfileLocked },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, color: 'text-emerald-500', locked: isProfileLocked },
    { id: 'reports', label: 'Performance', icon: BarChart3, color: 'text-purple-500', locked: isProfileLocked },
    { id: 'materials', label: 'Study Materials', icon: BookOpen, color: 'text-sky-500', locked: isProfileLocked },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Student Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Manage your academic profile and finances</p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-xl">
            {data?.name?.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{data?.name}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Semester {data?.semester || 'N/A'} • Student ID: #{data?.id}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            disabled={tab.locked && activeTab !== 'profile'}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-4 rounded-2xl transition-all whitespace-nowrap border ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-white/10 border-primary text-primary shadow-lg shadow-primary/5' 
                : 'bg-white dark:bg-white/[0.02] border-gray-100 dark:border-white/5 text-slate-500 hover:text-gray-900 dark:hover:text-white'
            } ${tab.locked ? 'opacity-70 grayscale' : ''}`}
          >
            <tab.icon size={18} className={activeTab === tab.id ? 'text-primary' : tab.color} />
            <span className="text-sm font-bold tracking-tight">{tab.label}</span>
            {tab.locked && <Lock size={12} className="text-rose-500" />}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'profile' && (
          <ProfileUpdateForm initialData={data} onSuccess={fetchData} />
        )}

        {activeTab === 'fees' && !isProfileLocked && (
          <FeeDashboard 
            feeDue={data.feeDue} 
            lastPayment={data.lastPaymentDate} 
            transactions={data.transactions} 
            studentName={data.name}
            studentId={data.id}
            onPaymentSuccess={fetchData} 
          />
        )}

        {activeTab === 'assignments' && !isProfileLocked && (
          <AssignmentTabs assignments={data.assignments} />
        )}

        {activeTab === 'reports' && !isProfileLocked && (
          <MonthlyProgressReport academicReports={data?.academicReports || []} />
        )}

        {activeTab === 'materials' && !isProfileLocked && (
          <StudentStudyMaterials 
            defaultDepartmentId={data?.departmentId} 
            defaultSemester={data?.semester} 
          />
        )}

        {activeTab !== 'profile' && isProfileLocked && (
          <div className="bg-rose-50 dark:bg-rose-500/5 rounded-3xl p-12 text-center border-2 border-dashed border-rose-100 dark:border-rose-500/20">
            <Lock className="mx-auto text-rose-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Restricted</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
              You must provide your **Next of Kin** contact details in the profile section before accessing financial and academic modules.
            </p>
            <button 
              onClick={() => setActiveTab('profile')}
              className="px-6 py-3 bg-rose-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-rose-600 transition-all"
            >
              Update Profile Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentPortal;
