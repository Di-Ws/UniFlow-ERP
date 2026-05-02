import React from 'react';
import { Plus, CalendarDays } from 'lucide-react';
import { useLeaves } from '../hooks/useLeaves';
import LeaveForm from '../components/Leave/LeaveForm';
import SummaryCards from '../components/Leave/SummaryCards';
import LeaveFilters from '../components/Leave/LeaveFilters';
import LeaveTable from '../components/Leave/LeaveTable';
import Pagination from '../components/Leave/Pagination';
import ConfirmationModal from '../components/Leave/ConfirmationModal';

const Leaves: React.FC = () => {
  const {
    leaves, loading, paginatedLeaves, stats,
    filters, pagination, modals, handlers
  } = useLeaves();

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = currentUser?.role === 'HOD';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 max-w-7xl mx-auto w-full pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-dark-bg p-6 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/5 dark:bg-primary/10 flex items-center justify-center text-primary dark:text-primary">
            <CalendarDays size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Leave Management</h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Apply for leave and track your application status</p>
          </div>
        </div>
        <button 
          onClick={() => modals.setIsFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-violet-600 hover:from-primary hover:to-violet-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
        >
          <Plus size={20} /> Apply Leave
        </button>
      </div>

      {/* Summary Cards */}
      <SummaryCards stats={stats} />

      {/* Filters & Table Container */}
      <div className="bg-white dark:bg-dark-card border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        
        <LeaveFilters 
          searchQuery={filters.searchQuery}
          setSearchQuery={filters.setSearchQuery}
          statusFilter={filters.statusFilter}
          setStatusFilter={filters.setStatusFilter}
          typeFilter={filters.typeFilter}
          setTypeFilter={filters.setTypeFilter}
          timeFilter={filters.timeFilter}
          setTimeFilter={filters.setTimeFilter}
          onFilterChange={() => pagination.setCurrentPage(1)}
        />

        <LeaveTable 
          loading={loading}
          leaves={paginatedLeaves}
          isHOD={isHOD}
          onApprove={(id) => modals.setIsConfirmOpen({id, status: 'APPROVED'})}
          onReject={(id) => modals.setIsConfirmOpen({id, status: 'REJECTED'})}
        />

        <Pagination 
          currentPage={pagination.currentPage}
          setCurrentPage={pagination.setCurrentPage}
          itemsPerPage={pagination.itemsPerPage}
          setItemsPerPage={pagination.setItemsPerPage}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
          loading={loading}
        />
      </div>

      <ConfirmationModal 
        isOpen={modals.isConfirmOpen}
        onClose={() => modals.setIsConfirmOpen(null)}
        onConfirm={handlers.handleStatusUpdate}
      />

      <LeaveForm 
        isOpen={modals.isFormOpen} 
        onClose={() => modals.setIsFormOpen(false)} 
        onSubmit={handlers.handleApplyLeave} 
      />
    </div>
  );
};

export default Leaves;
