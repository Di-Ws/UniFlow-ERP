import React from 'react';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CardStyles.css';

export const StudentCard: React.FC<{ student: any }> = ({ student }) => {
  return (
    <Link to={`/students/${student.id}`} className="data-card student-card">
      <div className="card-badge">{student.branch}</div>
      <div className="card-avatar">
        <User size={32} />
      </div>
      <div className="card-main">
        <h3>{student.name}</h3>
        <p className="card-subtext">{student.section} Section • Sem {student.semester}</p>
        
        <div className="card-details">
          <div className="detail-item">
            <Mail size={14} />
            <span>{student.email}</span>
          </div>
          <div className="detail-item">
            <PercentBadge value={student.attendance} label="Attendance" />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <span className={`fee-status ${student.feeStatus?.toLowerCase()}`}>
          {student.feeStatus}
        </span>
      </div>
    </Link>
  );
};

export const TeacherCard: React.FC<{ teacher: any; onEdit?: (t: any) => void; onDelete?: (id: number) => void; onAssign?: (t: any) => void }> = ({ teacher, onEdit, onDelete, onAssign }) => {
  const studentCount = teacher.students?.length || 0;
  return (
    <div className="data-card teacher-card">
      <div className="card-badge">{teacher.department || 'General'}</div>
      <div className="card-avatar">
        <img src={teacher.photoUrl || 'https://i.pravatar.cc/150'} alt={teacher.name} />
      </div>
      <div className="card-main">
        <h3>{teacher.name}</h3>
        <p className="active-subject">{teacher.subject}</p>
        
        <div className="card-details">
          {teacher.email && (
            <div className="detail-item">
              <Mail size={14} />
              <span>{teacher.email}</span>
            </div>
          )}
          <div className="detail-item">
            <Phone size={14} />
            <span>{teacher.phone}</span>
          </div>
          <div className="detail-item">
            <MapPin size={14} />
            <span>{teacher.address}</span>
          </div>
          <div className="detail-item">
            <User size={14} />
            <span>{studentCount} student{studentCount !== 1 ? 's' : ''} assigned</span>
          </div>
        </div>
      </div>
      {(onEdit || onDelete || onAssign) && (
        <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          {onAssign && (
            <button onClick={() => onAssign(teacher)} className="card-action-btn" style={{
              flex: 1, padding: '0.4rem', fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px', cursor: 'pointer'
            }}>Assign</button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(teacher)} className="card-action-btn" style={{
              flex: 1, padding: '0.4rem', fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '6px', cursor: 'pointer'
            }}>Edit</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(teacher.id)} className="card-action-btn" style={{
              flex: 1, padding: '0.4rem', fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '6px', cursor: 'pointer'
            }}>Delete</button>
          )}
        </div>
      )}
    </div>
  );
};

const PercentBadge: React.FC<{ value: number, label: string }> = ({ value, label }) => {
  const color = value >= 75 ? '#22c55e' : value >= 60 ? '#f97316' : '#ef4444';
  return (
    <div className="percent-badge">
      <div className="percent-bar-bg">
        <div className="percent-bar-fill" style={{ width: `${value}%`, backgroundColor: color }}></div>
      </div>
      <span style={{ color }}>{value}% {label}</span>
    </div>
  );
};
