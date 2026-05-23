import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, GraduationCap, BookOpen, CreditCard, 
  CheckCircle, XCircle, AlertCircle, User, Edit, 
  Trash2, Lock, Unlock, FileText, Check, X 
} from 'lucide-react';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../services/studentService';
import { Student } from '../types/student';
import StudentTable from '../components/Students/StudentTable';
import StudentForm from '../components/Students/StudentForm';
import { getUserRole } from '../utils/auth';

const Students: React.FC = () => {
  const role = getUserRole();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  
  // Modals / Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedReportStudent, setSelectedReportStudent] = useState<Student | null>(null);
  const [permittingStudent, setPermittingStudent] = useState<Student | null>(null);
  const [permitReason, setPermitReason] = useState('');

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
      const deptName = typeof student.department === 'object' ? student.department?.name : student.department;
      return (
        student.name.toLowerCase().includes(q) ||
        (deptName && deptName.toLowerCase().includes(q)) ||
        (student.batch && student.batch.toLowerCase().includes(q))
      );
    });
  }, [students, searchQuery]);

  // Semester students for HOD view
  const semesterStudents = useMemo(() => {
    return filteredStudents.filter(s => s.semester === selectedSemester);
  }, [filteredStudents, selectedSemester]);

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
    fetchStudents();
  };

  // Fee standing permission handlers
  const handleGrantPermissionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!permittingStudent) return;
    try {
      await updateStudent(permittingStudent.id, {
        feePermitted: true,
        feePermissionReason: permitReason
      });
      setPermittingStudent(null);
      setPermitReason('');
      fetchStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to permit student.');
    }
  };

  const handleRevokePermission = async (studentId: number) => {
    if (window.confirm('Are you sure you want to revoke this student\'s portal permission? This will block their attendance.')) {
      try {
        await updateStudent(studentId, {
          feePermitted: false,
          feePermissionReason: null
        });
        fetchStudents();
      } catch (err: any) {
        alert(err.message || 'Failed to revoke permission.');
      }
    }
  };

  const canManageStudents = role === 'HOD' || role === 'FACULTY';

  return (
    <div className="w-full h-full p-8 overflow-y-auto bg-[#0b0f19] text-gray-100">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 mb-1">
            {role === 'STUDENT' ? 'My Academic Record' : role === 'HOD' ? 'Department ERP - Students' : 'Students Management'}
          </h1>
          <p className="text-gray-400">
            {role === 'STUDENT' 
              ? 'View your academic profile and attendance details.' 
              : role === 'HOD' 
                ? 'Semester-wise academic reports, mentorship mappings, and portal permission status.'
                : 'View, search, and manage university student records.'}
          </p>
        </div>
        
        {canManageStudents && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 font-semibold text-sm"
          >
            <Plus size={18} />
            Add Student
          </button>
        )}
      </div>

      {/* Toolbar for HOD/Faculty */}
      {role !== 'STUDENT' && (
        <div className="bg-[#111827]/80 backdrop-blur-md rounded-2xl p-4 mb-6 shadow-md border border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              className="bg-[#1e293b] border border-gray-700 text-white text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent block w-full pl-10 p-2.5 placeholder-gray-400"
              placeholder="Search by student name, batch, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {role === 'HOD' && (
            <div className="text-sm font-semibold text-gray-400">
              Filtered Total: <span className="text-indigo-400 font-bold">{filteredStudents.length}</span>
            </div>
          )}
        </div>
      )}

      {/* Semester Tab Selection for HOD */}
      {role === 'HOD' && !loading && !error && students.length > 0 && (
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 border-b border-gray-800 pb-px">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-6 py-3 font-semibold text-sm rounded-t-xl transition-all whitespace-nowrap ${
                  selectedSemester === sem
                    ? 'bg-[#111827] text-blue-400 border-t-2 border-l border-r border-gray-800 shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/40'
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-6 rounded-2xl text-center">
          <p className="text-lg font-semibold mb-2">Error Loading Students</p>
          <p>{error}</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-[#111827] border border-gray-800 rounded-2xl flex items-center justify-center p-12 text-center">
          <div>
            <h3 className="text-xl font-medium text-white mb-2">No students found</h3>
            <p className="text-gray-400 mb-6">{role === 'STUDENT' ? 'Your profile record was not found.' : 'Get started by creating a new student record.'}</p>
            {canManageStudents && (
              <button onClick={handleAddClick} className="text-blue-400 hover:text-blue-300 font-medium">
                + Register First Student
              </button>
            )}
          </div>
        </div>
      ) : role === 'HOD' ? (
        /* HOD Semester-grouped View */
        semesterStudents.length === 0 ? (
          <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
            No students registered in <span className="text-blue-400 font-bold">Semester {selectedSemester}</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {semesterStudents.map((student) => {
              const hasUnpaid = student.feeStatus !== 'Paid';
              const isPermitted = student.feePermitted;
              
              return (
                <div 
                  key={student.id} 
                  className="bg-[#111827]/80 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-gray-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {student.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">{student.name}</h3>
                          <p className="text-xs text-gray-400">{student.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-800 text-gray-300 font-medium">
                              Batch: {student.batch}
                            </span>
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-900/30 text-blue-400 font-medium">
                              Sem: {student.semester}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(student)}
                          className="p-2 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(student.id)}
                          className="p-2 hover:bg-red-950/40 text-gray-400 hover:text-red-400 rounded-lg transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Stats & Mentorship Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-900/40 p-4 rounded-xl border border-gray-800/60">
                      <div>
                        <span className="text-xs text-gray-400 block mb-1">Attendance Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${student.attendanceRate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                              style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
                            />
                          </div>
                          <span className="text-sm font-bold">{Math.round(student.attendanceRate)}%</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 block mb-1">Assigned Mentor(s)</span>
                        <div className="flex flex-col gap-0.5">
                          {student.faculty && student.faculty.length > 0 ? (
                            student.faculty.map((f: any) => (
                              <div key={f.id} className="text-xs text-white font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                {f.name}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-amber-500 font-medium">None Assigned</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fee Status & HOD override */}
                    <div className="mb-4 p-4 rounded-xl border border-gray-800 bg-gray-900/20">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CreditCard size={16} className="text-gray-400" />
                          <span className="text-sm font-semibold text-gray-300">Fee standing</span>
                        </div>
                        <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                          !hasUnpaid 
                            ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-800/40' 
                            : 'bg-rose-900/40 text-rose-400 border border-rose-800/40'
                        }`}>
                          {!hasUnpaid ? 'Paid' : `Pending: ₹${student.feeDue}`}
                        </span>
                      </div>

                      {hasUnpaid && (
                        <div className="bg-[#1e1e30] border border-gray-800 rounded-lg p-3 mt-2 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Portal Standing:</span>
                            {isPermitted ? (
                              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                                <Unlock size={12} /> Permitted Attendance
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                                <Lock size={12} /> Blocked from Faculty Portal
                              </span>
                            )}
                          </div>
                          
                          {isPermitted && student.feePermissionReason && (
                            <div className="text-xs bg-[#111827] text-gray-300 p-2.5 rounded border border-gray-800">
                              <span className="text-gray-500 block mb-0.5">Reason Permitted:</span>
                              "{student.feePermissionReason}"
                            </div>
                          )}

                          <div className="flex justify-end gap-2 mt-1">
                            {isPermitted ? (
                              <button
                                onClick={() => handleRevokePermission(student.id)}
                                className="text-xs bg-rose-950/60 hover:bg-rose-900/80 border border-rose-800/60 text-rose-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
                              >
                                Revoke Permission
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setPermittingStudent(student);
                                  setPermitReason('');
                                }}
                                className="text-xs bg-amber-950/60 hover:bg-amber-900/80 border border-amber-800/60 text-amber-300 px-3 py-1.5 rounded-lg transition-colors font-medium"
                              >
                                Permit Attendance
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between items-center">
                    <button
                      onClick={() => setSelectedReportStudent(student)}
                      className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                      <BookOpen size={16} />
                      Academic Report ({student.academicReports?.length || 0})
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Faculty/Student Standard Table View */
        <StudentTable
          students={filteredStudents}
          onEdit={canManageStudents ? handleEditClick : undefined}
          onDelete={canManageStudents ? handleDeleteClick : undefined}
        />
      )}

      {/* Add / Edit Student Modal */}
      <StudentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingStudent}
      />

      {/* Grant Portal Permission Modal */}
      {permittingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Unlock size={20} className="text-amber-400" />
                Permit Attendance
              </h3>
              <button 
                onClick={() => setPermittingStudent(null)} 
                className="text-gray-400 hover:text-white rounded-lg p-1 hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-400 mb-4">
              You are allowing <span className="text-white font-bold">{permittingStudent.name}</span> to access their faculty attendance portal even though their fee status is pending.
            </p>

            <form onSubmit={handleGrantPermissionSubmit}>
              <div className="mb-5">
                <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
                  Reason For Permitting
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full bg-[#1e293b] border border-gray-700 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                  placeholder="e.g. Approved medical installment plan, letter from HOD."
                  value={permitReason}
                  onChange={(e) => setPermitReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPermittingStudent(null)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white bg-gray-850 hover:bg-gray-800 rounded-xl transition-all border border-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl transition-all shadow-lg"
                >
                  Permit Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Academic Report Modal */}
      {selectedReportStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap size={22} className="text-indigo-400" />
                  Academic Report Card
                </h3>
                <p className="text-xs text-gray-400 mt-1">Student: {selectedReportStudent.name} ({selectedReportStudent.email})</p>
              </div>
              <button 
                onClick={() => setSelectedReportStudent(null)} 
                className="text-gray-400 hover:text-white rounded-lg p-1 hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {selectedReportStudent.academicReports && selectedReportStudent.academicReports.length > 0 ? (
              <div>
                <div className="overflow-x-auto border border-gray-800 rounded-xl mb-4 bg-gray-900/20">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-900/60 border-b border-gray-800 text-xs font-bold uppercase text-gray-400">
                        <th className="p-4">Subject Course</th>
                        <th className="p-4 text-center">Marks</th>
                        <th className="p-4 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800 text-sm">
                      {selectedReportStudent.academicReports.map((report: any) => (
                        <tr key={report.id} className="hover:bg-gray-800/30">
                          <td className="p-4 font-medium text-white">{report.subject}</td>
                          <td className="p-4 text-center text-gray-300 font-semibold">{report.marks} / 100</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              ['A+', 'A', 'B'].includes(report.grade) 
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' 
                                : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'
                            }`}>
                              {report.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-gray-900/40 p-4 rounded-xl border border-gray-800/60 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-400">Overall Average Score:</span>
                  <span className="font-bold text-white text-lg">
                    {Math.round(
                      selectedReportStudent.academicReports.reduce((acc: number, cur: any) => acc + cur.marks, 0) / 
                      selectedReportStudent.academicReports.length
                    )}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 border border-dashed border-gray-800 rounded-xl">
                <FileText size={40} className="mx-auto text-gray-600 mb-2" />
                No subjects or academic report data loaded for this student.
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setSelectedReportStudent(null)}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Students;
