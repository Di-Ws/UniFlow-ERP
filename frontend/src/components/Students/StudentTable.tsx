import React from 'react';
import { Student } from '../../types/student';
import { Edit2, Trash2 } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  onEdit?: (student: Student) => void;
  onDelete?: (id: number) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onEdit, onDelete }) => {
  const showActions = onEdit || onDelete;

  const getDeptName = (dept: Student['department']) =>
    typeof dept === 'object' && dept !== null ? dept.name : (dept || '—');

  return (
    <div className="overflow-x-auto rounded-lg shadow ring-1 ring-black ring-opacity-5">
      <table className="min-w-full divide-y divide-gray-700 bg-[#111827]">
        <thead className="bg-[#0f172a]">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-6">Name</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Email</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Department</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Batch / Year</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Attendance</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-300">Fees Status</th>
            {showActions && (
              <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                <span className="sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {students.map((student) => (
            <tr key={student.id} className="hover:bg-[#1e293b] transition-colors">
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-6">{student.name}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{student.email}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{getDeptName(student.department)}</td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                {student.batch} &mdash; Yr {student.year}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-16 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${student.attendanceRate < 75 ? 'bg-red-500' : 'bg-green-500'}`}
                      style={{ width: `${student.attendanceRate}%` }}
                    />
                  </div>
                  <span>{student.attendanceRate}%</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  student.feeStatus?.toLowerCase() === 'paid'
                  ? 'bg-green-400/10 text-green-400 ring-green-400/20'
                  : 'bg-red-400/10 text-red-400 ring-red-400/20'
                }`}>
                  {student.feeStatus || 'Unpaid'}
                </span>
              </td>
              {showActions && (
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-3">
                    {onEdit && (
                      <button onClick={() => onEdit(student)} className="text-primary hover:text-indigo-300" title="Edit Student">
                        <Edit2 size={16} />
                      </button>
                    )}
                    {onDelete && (
                      <button onClick={() => onDelete(student.id)} className="text-red-400 hover:text-red-300" title="Delete Student">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentTable;
