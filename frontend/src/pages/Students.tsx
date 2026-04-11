import React, { useState, useEffect } from 'react';
import { getStudentsAPI } from '../api/students';
import { StudentCard } from '../components/Common/Cards';
import SearchBar from '../components/SearchBar/SearchBar';
import { Filter } from 'lucide-react';
import './Students.css';

const BRANCHES = ['All', 'Computer Science', 'Mechanical', 'Civil', 'Electrical', 'Electronics'];

const Students: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBranch, setActiveBranch] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const data = await getStudentsAPI();
        setStudents(data);
        setFilteredStudents(data);
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    let result = students;
    if (activeBranch !== 'All') {
      result = result.filter(s => s.branch === activeBranch);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.email.toLowerCase().includes(q) ||
        s.section.toLowerCase().includes(q)
      );
    }
    setFilteredStudents(result);
  }, [activeBranch, searchQuery, students]);

  if (loading) return <div className="loading-state">Loading Student Database...</div>;

  return (
    <div className="students-page">
      <div className="page-header">
        <div className="header-info">
          <h1>Student Directory</h1>
          <p>Displaying {filteredStudents.length} students across all branches</p>
        </div>
        <div className="header-actions">
           <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      <div className="filter-shelf">
        <div className="filter-header">
          <Filter size={16} />
          <span>Branch Filter:</span>
        </div>
        <div className="filter-options">
          {BRANCHES.map(branch => (
            <button
              key={branch}
              className={`filter-btn ${activeBranch === branch ? 'active' : ''}`}
              onClick={() => setActiveBranch(branch)}
            >
              {branch}
            </button>
          ))}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="empty-state">
          <h3>No students found matching your criteria.</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="students-grid">
          {filteredStudents.map(student => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Students;
