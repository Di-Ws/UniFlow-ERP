import React from 'react';
import { CreditCard, History, Download, AlertCircle } from 'lucide-react';

interface Props {
  feeDue: number;
  lastPayment: string | null;
  transactions: any[];
}

const FeeDashboard: React.FC<Props> = ({ feeDue, lastPayment, transactions }) => {
  return (
    <div className="space-y-8">
      {/* Fee Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Outstanding Due</p>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                ${feeDue.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${feeDue > 0 ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                  {feeDue > 0 ? 'Payment Required' : 'Fully Paid'}
                </span>
                {lastPayment && (
                  <span className="text-[10px] text-slate-400 font-bold">
                    Last: {new Date(lastPayment).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <CreditCard size={24} />
            </div>
          </div>
          
          {feeDue > 0 && (
            <button className="w-full mt-8 py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20">
              Pay Now
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-white/[0.03] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Fee Policy</h3>
          </div>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Late payments incur a 5% monthly penalty after the 10th.</p>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Examination results will be withheld if dues exceed $500.</p>
            </li>
          </ul>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-white/[0.03] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center">
              <History size={20} />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white">Transaction History</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Description</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Amount</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No transactions found</td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.01] transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">{t.description}</span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 dark:text-white text-sm">
                      ${t.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${t.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors">
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeeDashboard;
