import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService';
import { Student } from '../types/student';
import StudentTable from '../components/Students/StudentTable';
import StudentForm from '../components/Students/StudentForm';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getStudents();
      setStudents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch students. Ensure the backend is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Compute filtered students based on search
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const q = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(q) ||
        student.branch.toLowerCase().includes(q) ||
        student.section.toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery]);

  // Handlers
  const handleAddClick = () => {
    setEditingStudent(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      try {
        await deleteStudent(id);
        // Optimistic UI Update or Refetch. We'll refetch.
        fetchStudents();
      } catch (err: any) {
        alert(err.message || 'Failed to delete student.');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingStudent) {
      await updateStudent(editingStudent.id, data);
    } else {
      await createStudent(data);
    }
    // Refresh list on success
    fetchStudents();
  };

  return (
    <div className="w-full h-full p-8 overflow-y-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Students Management</h1>
          <p className="text-gray-400">View, search, and manage university student records.</p>
        </div>
        
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg shadow-md transition-colors font-medium text-sm"
        >
          <Plus size={18} />
          Add Student
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-[#111827] rounded-lg p-4 mb-6 shadow-md border border-gray-800">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="bg-[#1e293b] border border-gray-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
            placeholder="Filter by name, department, or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-lg text-center">
          <p className="text-lg font-semibold mb-2">Error Loading Students</p>
          <p>{error}</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-lg flex items-center justify-center p-12 text-center">
          <div>
            <h3 className="text-xl font-medium text-white mb-2">No students found</h3>
            <p className="text-gray-400 mb-6">Get started by creating a new student record.</p>
            <button onClick={handleAddClick} className="text-indigo-400 hover:text-indigo-300 font-medium">
              + Register First Student
            </button>
          </div>
        </div>
      ) : (
        <StudentTable
          students={filteredStudents}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Logic Modal Injection */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
      />
      
    </div>
  );
};

export default Students;
