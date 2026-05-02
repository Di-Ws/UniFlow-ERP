import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: { id: number, status: 'APPROVED' | 'REJECTED' } | null;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 p-8">
        <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isOpen.status === 'APPROVED' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'}`}>
          {isOpen.status === 'APPROVED' ? <CheckCircle size={40} /> : <XCircle size={40} />}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white text-center tracking-tight">Confirm Action</h3>
        <p className="text-gray-500 dark:text-slate-400 text-center mt-3 text-sm">
          Are you sure you want to <span className={isOpen.status === 'APPROVED' ? 'text-emerald-600 dark:text-emerald-500 font-bold' : 'text-rose-600 dark:text-rose-500 font-bold'}>{isOpen.status.toLowerCase()}</span> this leave application? This action cannot be undone.
        </p>
        <div className="grid grid-cols-2 gap-4 mt-8">
          <button 
            onClick={onClose}
            className="px-4 py-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-xl font-bold transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className={`px-4 py-3 ${isOpen.status === 'APPROVED' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'} text-white rounded-xl font-bold shadow-lg shadow-black/10 transition-colors`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
