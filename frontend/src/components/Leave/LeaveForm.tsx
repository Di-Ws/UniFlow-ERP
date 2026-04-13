import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { LeaveInput } from '../../services/leaveService';

interface LeaveFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: LeaveInput) => Promise<void>;
}

const LEAVE_TYPES = ['Sick Leave', 'Casual Leave', 'Academic Leave', 'Other'];

const LeaveForm: React.FC<LeaveFormProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<LeaveInput>({
    leaveType: 'Sick Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate leave duration
  const getDuration = (): number => {
    if (!formData.startDate || !formData.endDate) return 0;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      setError('Please fill in all fields.');
      return;
    }
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setError('End date must be after start date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      setFormData({ leaveType: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit leave request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const duration = getDuration();

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'var(--card-bg, #111827)',
        border: '1px solid var(--border-color, #1e293b)',
        borderRadius: 'var(--border-radius, 12px)',
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem', borderBottom: '1px solid var(--border-color, #1e293b)',
          background: 'var(--sidebar-bg, #020617)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} style={{ color: '#6366f1' }} />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#fff' }}>Apply for Leave</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {error && (
            <div style={{
              marginBottom: '1rem', padding: '0.75rem',
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.5)',
              borderRadius: '6px', color: '#ef4444', fontSize: '0.875rem'
            }}>{error}</div>
          )}

          <form id="leave-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Leave Type */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Leave Type *</label>
              <select name="leaveType" value={formData.leaveType} onChange={handleChange} style={{
                width: '100%', padding: '0.5rem 0.75rem',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '6px', color: '#fff', fontSize: '0.9rem', outline: 'none'
              }}>
                {LEAVE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            {/* Date Range */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Start Date *</label>
                <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} style={{
                  width: '100%', padding: '0.5rem 0.75rem',
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '6px', color: '#fff', fontSize: '0.9rem', outline: 'none',
                  colorScheme: 'dark'
                }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>End Date *</label>
                <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} style={{
                  width: '100%', padding: '0.5rem 0.75rem',
                  background: '#1e293b', border: '1px solid #334155',
                  borderRadius: '6px', color: '#fff', fontSize: '0.9rem', outline: 'none',
                  colorScheme: 'dark'
                }} />
              </div>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div style={{
                padding: '0.5rem 0.75rem', borderRadius: '6px',
                background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
                color: '#818cf8', fontSize: '0.85rem', textAlign: 'center'
              }}>
                Duration: <strong>{duration} day{duration !== 1 ? 's' : ''}</strong>
              </div>
            )}

            {/* Reason */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Reason *</label>
              <textarea name="reason" value={formData.reason} onChange={handleChange} rows={3} placeholder="Describe your reason for leave..." style={{
                width: '100%', padding: '0.5rem 0.75rem',
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: '6px', color: '#fff', fontSize: '0.9rem', outline: 'none',
                resize: 'vertical', fontFamily: 'inherit'
              }} />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.25rem', borderTop: '1px solid var(--border-color, #1e293b)',
          background: 'var(--sidebar-bg, #020617)',
          display: 'flex', justifyContent: 'flex-end', gap: '0.75rem'
        }}>
          <button type="button" onClick={onClose} style={{
            padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500,
            color: '#d1d5db', background: 'transparent', border: 'none',
            borderRadius: '6px', cursor: 'pointer'
          }}>Cancel</button>
          <button form="leave-form" type="submit" disabled={isSubmitting} style={{
            padding: '0.5rem 1.2rem', fontSize: '0.875rem', fontWeight: 500,
            color: '#fff', background: '#6366f1', border: 'none',
            borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.5 : 1
          }}>
            {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveForm;
