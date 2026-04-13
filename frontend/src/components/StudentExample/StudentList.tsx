import React, { useEffect, useState } from 'react';
import { getStudents } from '../../services/studentService';
import { Student } from '../../types/student';

const StudentList: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getStudents();
        setStudents(data);
        setError(null);
      } catch (err: any) {
        // Fallback or explicit mapping can be done here from the custom Error thrown by logic block
        setError(err.message || 'An unexpected error occurred while fetching students.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) {
    return <div style={{ padding: '2rem' }}>Loading students...</div>;
  }

  if (error) {
    return <div style={{ padding: '2rem', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Student Directory</h2>
      <p>Displaying all students retrieved from the ERP System via the robust API layer.</p>
      
      {students.length === 0 ? (
        <p>No students found in the system. Try adding one!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {students.map((student) => (
            <li 
              key={student.id} 
              style={{ border: '1px solid #ddd', padding: '1rem', margin: '0.5rem 0', borderRadius: '5px' }}
            >
              <strong>{student.name}</strong> - {student.branch} (Section: {student.section})
              <br />
              <small>Email: {student.email} | Attendance: {student.attendance}% | Fees: {student.feeStatus}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentList;
