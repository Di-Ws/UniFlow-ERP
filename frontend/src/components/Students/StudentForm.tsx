import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { StudentInput } from '../../services/studentService';
import { Student } from '../../types/student';

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
    branch: '', // Used as Department conceptually
    section: '',
    semester: 1,
    attendance: 100,
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
        branch: initialData.branch,
        section: initialData.section,
        semester: initialData.semester,
        attendance: initialData.attendance,
        feeStatus: initialData.feeStatus
      });
    } else {
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        branch: '',
        section: '',
        semester: 1,
        attendance: 100,
        feeStatus: 'Paid'
      });
    }
    setError('');
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendance' || name === 'semester' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic Local validation
    if (!formData.name || !formData.email || !formData.branch) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(formData);
      onClose(); // Automatically close on success
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
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Student Name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="student@university.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number *</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="555-0101"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="123 College St"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Department *</label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Computer Science"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. A"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Attendance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Fees Status</label>
                <select
                  name="feeStatus"
                  value={formData.feeStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-[#1e293b] border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-800 bg-[#0f172a] flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            form="student-form"
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Processing...' : initialData ? 'Save Changes' : 'Add Student'}
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default StudentForm;
