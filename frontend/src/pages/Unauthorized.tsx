import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const role = getUserRole();

  const handleBack = () => {
    if (!role) {
      navigate('/login');
    } else {
      navigate(`/${role.toLowerCase()}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6">
      <div className="relative w-full max-w-md">
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse delay-700" />

        {/* Glassmorphic Card */}
        <div className="relative bg-slate-900/50 border border-slate-800 backdrop-blur-xl rounded-3xl p-10 shadow-2xl text-center">
          <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
            <ShieldAlert size={40} />
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-3">Access Denied</h1>
          <p className="text-slate-400 mb-8 font-medium">
            You don't have permission to access this area. If you believe this is an error, please contact your administrator.
          </p>

          <button
            onClick={handleBack}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-primary hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 transition-all duration-200"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
