import React, { useState, useEffect, useMemo } from 'react';
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, assignStudentsToFaculty, Faculty as FacultyMember } from '../services/facultyService';
import { getStudents } from '../services/studentService';
import { Student } from '../types/student';
import { FacultyCard } from '../components/Common/Cards';
import FacultyForm from '../components/Faculty/FacultyForm';
import { Plus, Search, X } from 'lucide-react';
import './Faculty.css';

import { getUserRole } from '../utils/auth';

const Faculty: React.FC = () => {
  const role = getUserRole();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);

  // Assign students modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<FacultyMember | null>(null);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await getFaculty();
      setFaculty(data);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to fetch faculty.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const filteredFaculty = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return faculty.filter(f => {
      const deptName = typeof f.department === 'object' && f.department !== null
        ? (f.department as any).name
        : f.department;
      return (
        f.name.toLowerCase().includes(q) ||
        (deptName && String(deptName).toLowerCase().includes(q))
      );
    });
  }, [faculty, searchQuery]);

  // Handlers
  const handleAddClick = () => {
    setEditingFaculty(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (f: FacultyMember) => {
    setEditingFaculty(f);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to remove this faculty member?')) {
      try {
        await deleteFaculty(id);
        fetchFaculty();
      } catch (err: any) {
        alert(err.message || 'Failed to delete faculty.');
      }
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (editingFaculty) {
      await updateFaculty(editingFaculty.id, data);
    } else {
      await createFaculty(data);
    }
    fetchFaculty();
  };

  const handleAssignClick = async (f: FacultyMember) => {
    setAssignTarget(f);
    setSelectedStudentIds(f.students?.map(s => s.id) || []);
    try {
      const students = await getStudents();
      setAllStudents(students);
    } catch { /* ignore */ }
    setIsAssignOpen(true);
  };

  const toggleStudentSelection = (id: number) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleAssignSubmit = async () => {
    if (!assignTarget) return;
    try {
      await assignStudentsToFaculty(assignTarget.id, selectedStudentIds);
      setIsAssignOpen(false);
      fetchFaculty();
    } catch (err: any) {
      alert(err.message || 'Failed to assign students.');
    }
  };

  if (loading) return <div className="loading-state">Loading Faculty Data...</div>;

  const isHod = role === 'HOD';

  return (
    <div className="Faculty-page">
      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="header-info">
          <h1>{role === 'STUDENT' ? 'My Faculty' : 'Faculty Management'}</h1>
          <p>{role === 'STUDENT' ? 'View details of faculty members assigned to you' : 'Manage faculty members, assign students, and track workloads'}</p>
        </div>
        {isHod && (
          <button onClick={handleAddClick} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.2rem', fontSize: '0.9rem', fontWeight: 600,
            background: 'var(--primary-color, #6366f1)', color: '#fff',
            border: 'none', borderRadius: '8px', cursor: 'pointer'
          }}>
            <Plus size={18} /> Add Faculty
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{
        position: 'relative', maxWidth: '400px',
        background: 'var(--card-bg, #111827)',
        borderRadius: 'var(--border-radius, 12px)',
        border: '1px solid var(--border-color, #1e293b)',
        padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        <Search size={16} style={{ color: 'var(--text-muted, #9ca3af)' }} />
        <input
          type="text"
          placeholder="Search by name, department, or subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1, background: 'transparent', border: 'none', color: 'var(--text-main, #e5e7eb)',
            fontSize: '0.9rem', outline: 'none'
          }}
        />
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          padding: '1.5rem', background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.5)', borderRadius: '12px',
          color: '#ef4444', textAlign: 'center'
        }}>
          <p style={{ fontWeight: 600 }}>Error Loading Faculty</p>
          <p>{error}</p>
        </div>
      )}

      {/* Faculty Cards Grid */}
      {!error && filteredFaculty.length === 0 ? (
        <div className="empty-state text-center" style={{ padding: '4rem 2rem' }}>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No faculty members found.</h3>
          <p style={{ color: '#9ca3af' }}>{searchQuery ? 'Try adjusting your search.' : 'There are currently no faculty assigned to you.'}</p>
        </div>
      ) : (
        <div className="Faculty-grid">
          {filteredFaculty.map(f => (
            <FacultyCard
              key={f.id}
              Faculty={f}
              onEdit={isHod ? handleEditClick : undefined}
              onDelete={isHod ? handleDeleteClick : undefined}
              onAssign={isHod ? handleAssignClick : undefined}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Faculty Modal */}
      <FacultyForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingFaculty}
      />

      {/* Assign Students Modal */}
      {isAssignOpen && assignTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            width: '100%', maxWidth: '500px',
            background: 'var(--card-bg, #111827)',
            border: '1px solid var(--border-color, #1e293b)',
            borderRadius: 'var(--border-radius, 12px)',
            overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1.25rem', borderBottom: '1px solid var(--border-color, #1e293b)',
              background: 'var(--sidebar-bg, #020617)'
            }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>
                Assign Students to {assignTarget.name}
              </h2>
              <button onClick={() => setIsAssignOpen(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ padding: '1rem', maxHeight: '350px', overflowY: 'auto' }}>
              {allStudents.length === 0 ? (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No students available.</p>
              ) : (
                allStudents.map(s => (
                  <label key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    padding: '0.6rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
                    background: selectedStudentIds.includes(s.id) ? 'rgba(99,102,241,0.1)' : 'transparent',
                    border: selectedStudentIds.includes(s.id) ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                    marginBottom: '0.4rem'
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(s.id)}
                      onChange={() => toggleStudentSelection(s.id)}
                      style={{ accentColor: '#6366f1' }}
                    />
                    <div>
                      <span style={{ color: '#e5e7eb', fontSize: '0.9rem', fontWeight: 500 }}>{s.name}</span>
                      <span style={{ color: '#9ca3af', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                        {s.batch} – Yr {s.year}
                      </span>
                    </div>
                  </label>
                ))
              )}
            </div>
            <div style={{
              padding: '1rem', borderTop: '1px solid var(--border-color, #1e293b)',
              background: 'var(--sidebar-bg, #020617)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <span style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
                {selectedStudentIds.length} student{selectedStudentIds.length !== 1 ? 's' : ''} selected
              </span>
              <button onClick={handleAssignSubmit} style={{
                padding: '0.5rem 1.2rem', fontSize: '0.875rem', fontWeight: 500,
                color: '#fff', background: '#6366f1', border: 'none',
                borderRadius: '6px', cursor: 'pointer'
              }}>Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculty;
