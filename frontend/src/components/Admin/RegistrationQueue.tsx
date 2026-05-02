import React, { useState, useEffect } from 'react';
import { getPendingUsers, approveUser } from '../../services/adminService';
import { Check, X, Users, Mail, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const RegistrationQueue: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const data = await getPendingUsers();
      setPendingUsers(data);
    } catch (error) {
      toast.error("Failed to load pending registrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id: number, status: 'APPROVED' | 'REJECTED') => {
    try {
      await approveUser(id, status);
      toast.success(`User ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully`);
      setPendingUsers(prev => prev.filter(user => user.id !== id));
    } catch (error) {
      toast.error("Action failed. Please try again.");
    }
  };

  if (loading) return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-gray-500 dark:text-slate-400">Loading requests...</p>
    </div>
  );

  if (pendingUsers.length === 0) return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl p-12 text-center shadow-sm">
      <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check size={32} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Queue Clear!</h3>
      <p className="text-gray-500 dark:text-slate-400">There are no pending registration requests at this time.</p>
    </div>
  );

  return (
    <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
      <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white tracking-tight">Registration Requests</h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">{pendingUsers.length} registrations waiting for approval</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5">
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">User Info</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Role</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Requested On</th>
              <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {pendingUsers.map((user) => (
              <tr key={user.id} className="group hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 dark:text-white">{user.name}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                      <Mail size={12} />
                      {user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    user.role === 'FACULTY' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <CalendarIcon size={14} />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleAction(user.id, 'REJECTED')}
                      className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all border border-rose-100 dark:border-rose-500/20"
                      title="Reject"
                    >
                      <X size={18} />
                    </button>
                    <button
                      onClick={() => handleAction(user.id, 'APPROVED')}
                      className="p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all border border-emerald-100 dark:border-emerald-500/20"
                      title="Approve"
                    >
                      <Check size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RegistrationQueue;
