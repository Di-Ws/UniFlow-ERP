import React, { useState, useEffect } from 'react';
import { getTeachersAPI } from '../api/common';
import { TeacherCard } from '../components/Common/Cards';
import './Teachers.css';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const data = await getTeachersAPI();
        setTeachers(data);
      } catch (err) {
        console.error("Failed to fetch teachers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  if (loading) return <div className="loading-state">Loading Faculty Data...</div>;

  return (
    <div className="teachers-page">
      <div className="page-header">
        <h1>Faculty Directory</h1>
        <p>Explore our experienced teaching staff and mentors</p>
      </div>

      {teachers.length === 0 ? (
        <div className="empty-state">
          <h3>No teacher profiles registered yet.</h3>
          <p>Please check back later or contact administration.</p>
        </div>
      ) : (
        <div className="teachers-grid">
          {teachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Teachers;
