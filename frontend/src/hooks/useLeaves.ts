import { useState, useEffect, useMemo } from 'react';
import { getLeaves, createLeave, updateLeaveStatus } from '../services/leaveService';
import { Leave, LeaveInput, LeaveStats } from '../types/leave';
import toast from 'react-hot-toast';

export const useLeaves = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [timeFilter, setTimeFilter] = useState('All Time');
  
  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState<{id: number, status: 'APPROVED' | 'REJECTED'} | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves();
      setLeaves(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const filteredLeaves = useMemo(() => {
    return leaves.filter(leave => {
      const matchSearch = leave.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' || leave.status === statusFilter;
      const matchType = typeFilter === 'All Types' || leave.leaveType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [leaves, searchQuery, statusFilter, typeFilter]);

  const totalItems = filteredLeaves.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedLeaves = filteredLeaves.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats: LeaveStats = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter(l => l.status === 'PENDING').length,
    approved: leaves.filter(l => l.status === 'APPROVED').length,
    rejected: leaves.filter(l => l.status === 'REJECTED').length,
  }), [leaves]);

  const handleApplyLeave = async (data: LeaveInput) => {
    try {
      await createLeave(data);
      toast.success('Leave request submitted successfully!');
      setIsFormOpen(false);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit leave request.');
    }
  };

  const handleStatusUpdate = async () => {
    if (!isConfirmOpen) return;
    const { id, status } = isConfirmOpen;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const reviewedBy = user.name || 'HOD';
    
    const loadingToast = toast.loading(`${status === 'APPROVED' ? 'Approving' : 'Rejecting'} leave request...`);
    try {
      await updateLeaveStatus(id, status, reviewedBy);
      toast.success(`Leave ${status === 'APPROVED' ? 'Approved' : 'Rejected'} successfully!`, { id: loadingToast });
      setIsConfirmOpen(null);
      fetchLeaves();
    } catch (err: any) {
      toast.error(err.message || `Failed to update status.`, { id: loadingToast });
    }
  };

  return {
    leaves,
    loading,
    paginatedLeaves,
    stats,
    filters: {
      searchQuery, setSearchQuery,
      statusFilter, setStatusFilter,
      typeFilter, setTypeFilter,
      timeFilter, setTimeFilter
    },
    pagination: {
      currentPage, setCurrentPage,
      itemsPerPage, setItemsPerPage,
      totalItems, totalPages
    },
    modals: {
      isFormOpen, setIsFormOpen,
      isConfirmOpen, setIsConfirmOpen
    },
    handlers: {
      handleApplyLeave,
      handleStatusUpdate,
      fetchLeaves
    }
  };
};
