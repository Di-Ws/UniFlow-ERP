import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Faculty, FacultyInput } from '../../services/facultyService';

interface FacultyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FacultyInput) => Promise<void>;
  initialData?: Faculty | null;
}

const FacultyForm: React.FC<FacultyFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<FacultyInput>({
    name: '',
    email: '',
    department: '',
    phone: '',
    address: '',
    photoUrl: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      const deptName = typeof initialData.department === 'object' && initialData.department !== null
        ? (initialData.department as any).name
        : initialData.department || '';
      setFormData({
        name: initialData.name,
        email: initialData.email || '',
        department: deptName,
        phone: initialData.phone || '',
        address: initialData.address || '',
        photoUrl: initialData.photoUrl || ''
      });
    } else {
      setFormData({ name: '', email: '', department: '', phone: '', address: '', photoUrl: '' });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FacultyInput) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields (Name, Phone).');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="faculty-modal-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '100%', maxWidth: '480px',
        background: 'var(--card-bg, #111827)',
        border: '1px solid var(--border-color, #1e293b)',
        borderRadius: 'var(--border-radius, 12px)',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem', borderBottom: '1px solid var(--border-color, #1e293b)',
          background: 'var(--sidebar-bg, #020617)'
        }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff' }}>
            {initialData ? 'Edit Faculty Member' : 'Add New Faculty'}
          </h2>
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
          <form id="faculty-form" onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Full Name *', name: 'name', type: 'text', placeholder: 'Dr. John Doe' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'john@university.edu' },
                { label: 'Phone *', name: 'phone', type: 'text', placeholder: '555-0101' },
                { label: 'Department', name: 'department', type: 'text', placeholder: 'Computer Science' },
                { label: 'Address', name: 'address', type: 'text', placeholder: '123 University Ave' },
                { label: 'Photo URL', name: 'photoUrl', type: 'text', placeholder: 'https://...' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.25rem' }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    style={{
                      width: '100%', padding: '0.5rem 0.75rem',
                      background: '#1e293b', border: '1px solid #334155',
                      borderRadius: '6px', color: '#fff', fontSize: '0.9rem',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              ))}
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
          <button form="faculty-form" type="submit" disabled={isSubmitting} style={{
            padding: '0.5rem 1rem', fontSize: '0.875rem', fontWeight: 500,
            color: '#fff', background: '#6366f1', border: 'none',
            borderRadius: '6px', cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.5 : 1
          }}>
            {isSubmitting ? 'Processing...' : initialData ? 'Save Changes' : 'Add Faculty'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyForm;
