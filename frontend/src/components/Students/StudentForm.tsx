import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Student } from '../../types/student';

// StudentInput aligned to the new schema
interface StudentInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  departmentId: number;
  batch: string;
  year: number;
  semester: number;
  attendanceRate: number;
  feeStatus: string;
}

interface StudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Student | null;
}

const StudentForm: React.FC<StudentFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState<StudentInput>({
    name: '',
    email: '',
    phone: '',
    address: '',
    departmentId: 1,
    batch: '',
    year: 1,
    semester: 1,
    attendanceRate: 100,
    feeStatus: 'Paid'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        phone: initialData.phone || '',
        address: initialData.address || '',
        departmentId: initialData.departmentId || 1,
        batch: initialData.batch || '',
        year: initialData.year || 1,
        semester: initialData.semester,
        attendanceRate: initialData.attendanceRate || 0,
        feeStatus: initialData.feeStatus
      });
    } else {
      setFormData({
        name: '', email: '', phone: '', address: '',
        departmentId: 1, batch: '', year: 1, semester: 1,
        attendanceRate: 100, feeStatus: 'Paid'
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ['attendanceRate', 'semester', 'year', 'departmentId'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.name || !formData.email || !formData.batch) {
      setError('Please fill in all required fields (Name, Email, Batch).');
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm shadow-2xl">
      <div className="w-full max-w-md bg-[#111827] border border-gray-800 rounded-xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-800 bg-[#0f172a]">
          <h2 className="text-xl font-semibold text-white">
            {initialData ? 'Edit Student Details' : 'Register New Student'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-500 text-sm">
              {error}
            </div>
          )}

          <form id="student-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Student Name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="student@university.edu" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="555-0101" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123 College St" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Batch *</label>
                <input type="text" name="batch" value={formData.batch} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. 2022-2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Year</label>
                <input type="number" name="year" min={1} max={4} value={formData.year} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Semester</label>
                <input type="number" name="semester" min={1} max={8} value={formData.semester} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fees Status</label>
                <select name="feeStatus" value={formData.feeStatus} onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary">
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 bg-[#0f172a] flex justify-end gap-3">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors">
            Cancel
          </button>
          <button form="student-form" type="submit" disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {isSubmitting ? 'Processing...' : initialData ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentForm;
