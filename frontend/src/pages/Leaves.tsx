import React, { useState, useEffect, useMemo } from 'react';
import { getLeaves, createLeave, updateLeaveStatus, Leave, LeaveInput } from '../services/leaveService';
import LeaveForm from '../components/Leave/LeaveForm';
import { Plus, Search, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Rejected'];
const LEAVE_FILTER = ['All', 'Sick Leave', 'Casual Leave', 'Academic Leave', 'Other'];

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Check if current user is HOD
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isHOD = currentUser?.role === 'HOD';

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaves();
      setLeaves(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch leave requests.');
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
      const matchType = typeFilter === 'All' || leave.leaveType === typeFilter;
      return matchSearch && matchStatus && matchType;
    });
  }, [leaves, searchQuery, statusFilter, typeFilter]);

  // Stats
  const totalLeaves = leaves.length;
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const approvedCount = leaves.filter(l => l.status === 'Approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;

  const handleApplyLeave = async (data: LeaveInput) => {
    await createLeave(data);
    fetchLeaves();
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await updateLeaveStatus(id, status);
      fetchLeaves();
    } catch (err: any) {
      alert(err.message || `Failed to ${status.toLowerCase()} leave.`);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDuration = (start: string, end: string) => {
    const diff = Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '0.25rem 0.75rem', borderRadius: '20px',
      fontSize: '0.75rem', fontWeight: 600, display: 'inline-flex',
      alignItems: 'center', gap: '0.3rem'
    };
    if (status === 'Approved') return { ...base, background: 'rgba(34,197,94,0.1)', color: '#22c55e' };
    if (status === 'Rejected') return { ...base, background: 'rgba(239,68,68,0.1)', color: '#ef4444' };
    return { ...base, background: 'rgba(250,204,21,0.1)', color: '#facc15' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>Leave Management</h1>
          <p style={{ color: '#9ca3af' }}>
            {isHOD ? 'Review and manage all leave requests' : 'Apply for leave and track your requests'}
          </p>
        </div>
        <button onClick={() => setIsFormOpen(true)} style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.6rem 1.2rem', fontSize: '0.9rem', fontWeight: 600,
          background: '#6366f1', color: '#fff', border: 'none',
          borderRadius: '8px', cursor: 'pointer'
        }}>
          <Plus size={18} /> Apply Leave
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Total', value: totalLeaves, icon: <Calendar size={20} />, color: '#6366f1' },
          { label: 'Pending', value: pendingCount, icon: <Clock size={20} />, color: '#facc15' },
          { label: 'Approved', value: approvedCount, icon: <CheckCircle size={20} />, color: '#22c55e' },
          { label: 'Rejected', value: rejectedCount, icon: <XCircle size={20} />, color: '#ef4444' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card-bg, #111827)', border: '1px solid var(--border-color, #1e293b)',
            borderRadius: '12px', padding: '1.25rem',
            display: 'flex', alignItems: 'center', gap: '1rem'
          }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '10px',
              background: `${stat.color}15`, color: stat.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{stat.icon}</div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{stat.value}</p>
              <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--card-bg, #111827)', border: '1px solid var(--border-color, #1e293b)',
        borderRadius: '12px', padding: '1rem',
        display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: '#1e293b', borderRadius: '8px', padding: '0.5rem 0.75rem', flex: '1', minWidth: '200px'
        }}>
          <Search size={16} style={{ color: '#9ca3af' }} />
          <input type="text" placeholder="Search by name..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#e5e7eb', fontSize: '0.85rem', outline: 'none' }}
          />
        </div>
        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 500,
              borderRadius: '6px', cursor: 'pointer', border: 'none',
              background: statusFilter === s ? '#6366f1' : '#1e293b',
              color: statusFilter === s ? '#fff' : '#9ca3af'
            }}>{s}</button>
          ))}
        </div>
        {/* Type Filter */}
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{
          padding: '0.4rem 0.75rem', background: '#1e293b', border: '1px solid #334155',
          borderRadius: '6px', color: '#e5e7eb', fontSize: '0.85rem', outline: 'none'
        }}>
          {LEAVE_FILTER.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '50%',
            border: '3px solid #1e293b', borderTopColor: '#6366f1',
            animation: 'spin 1s linear infinite'
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{
          padding: '2rem', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.4)', borderRadius: '12px',
          color: '#ef4444', textAlign: 'center'
        }}>
          <p style={{ fontWeight: 600 }}>Error</p>
          <p>{error}</p>
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '4rem 2rem', color: '#9ca3af',
          background: 'var(--card-bg, #111827)', border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px'
        }}>
          <Calendar size={48} style={{ marginBottom: '1rem', opacity: 0.3 }} />
          <h3 style={{ color: '#e5e7eb', marginBottom: '0.5rem' }}>No leave requests found</h3>
          <p>Apply for leave to get started, or adjust your filters.</p>
        </div>
      ) : (
        <div style={{
          background: 'var(--card-bg, #111827)', border: '1px solid var(--border-color, #1e293b)',
          borderRadius: '12px', overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--sidebar-bg, #020617)' }}>
                  {['Applicant', 'Role', 'Leave Type', 'From', 'To', 'Days', 'Reason', 'Status', ...(isHOD ? ['Actions'] : [])].map(h => (
                    <th key={h} style={{
                      padding: '0.85rem 1rem', textAlign: 'left',
                      fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      borderBottom: '1px solid var(--border-color, #1e293b)'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map(leave => (
                  <tr key={leave.id} style={{ borderBottom: '1px solid #1e293b' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#1e293b')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                    <td style={{ padding: '0.85rem 1rem', color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>{leave.userName}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>{leave.userRole}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#e5e7eb', fontSize: '0.85rem' }}>{leave.leaveType}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>{formatDate(leave.startDate)}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#9ca3af', fontSize: '0.85rem' }}>{formatDate(leave.endDate)}</td>
                    <td style={{ padding: '0.85rem 1rem', color: '#818cf8', fontSize: '0.85rem', fontWeight: 600 }}>
                      {getDuration(leave.startDate, leave.endDate)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: '#9ca3af', fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {leave.reason}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={getStatusStyle(leave.status)}>
                        {leave.status === 'Approved' && <CheckCircle size={12} />}
                        {leave.status === 'Rejected' && <XCircle size={12} />}
                        {leave.status === 'Pending' && <Clock size={12} />}
                        {leave.status}
                      </span>
                    </td>
                    {isHOD && (
                      <td style={{ padding: '0.85rem 1rem' }}>
                        {leave.status === 'Pending' ? (
                          <div style={{ display: 'flex', gap: '0.4rem' }}>
                            <button onClick={() => handleStatusUpdate(leave.id, 'Approved')} style={{
                              padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 500,
                              background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                              border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', cursor: 'pointer'
                            }}>Approve</button>
                            <button onClick={() => handleStatusUpdate(leave.id, 'Rejected')} style={{
                              padding: '0.3rem 0.6rem', fontSize: '0.75rem', fontWeight: 500,
                              background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                              border: '1px solid rgba(239,68,68,0.3)', borderRadius: '4px', cursor: 'pointer'
                            }}>Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            by {leave.reviewedBy || '—'}
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Leave Form Modal */}
      <LeaveForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleApplyLeave} />
    </div>
  );
};

export default Leaves;
