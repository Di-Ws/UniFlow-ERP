import React from 'react';
import { Mail, Phone, MapPin, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import './CardStyles.css';

// Helper to safely render department/object names
const safeRender = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'object') {
    return val.name || JSON.stringify(val);
  }
  return String(val);
};

export const StudentCard: React.FC<{ student: any }> = ({ student }) => {
  const deptName = safeRender(student.department);

  return (
    <Link to={`/students/${student.id}`} className="data-card student-card">
      <div className="card-badge">{safeRender(student.batch) || deptName || 'General'}</div>
      <div className="card-avatar">
        <User size={32} />
      </div>
      <div className="card-main">
        <h3>{safeRender(student.name)}</h3>
        <p className="card-subtext">Year {safeRender(student.year)} (Sem {safeRender(student.semester)}) • {safeRender(student.batch) || 'Batch N/A'}</p>
        
        <div className="card-details">
          <div className="detail-item">
            <Mail size={14} />
            <span>{safeRender(student.email)}</span>
          </div>
          <div className="detail-item">
            <PercentBadge value={Number(student.attendanceRate || student.attendance || 0)} label="Attendance" />
          </div>
        </div>
      </div>
      <div className="card-footer">
        <span className={`fee-status ${String(student.feeStatus || '').toLowerCase()}`}>
          {safeRender(student.feeStatus)}
        </span>
      </div>
    </Link>
  );
};

export const FacultyCard: React.FC<{ Faculty: any; onEdit?: (t: any) => void; onDelete?: (id: number) => void; onAssign?: (t: any) => void }> = ({ Faculty, onEdit, onDelete, onAssign }) => {
  const studentCount = Faculty.students?.length || 0;
  const deptName = safeRender(Faculty.department);

  return (
    <div className="data-card Faculty-card">
      <div className="card-badge">{deptName || 'General'}</div>
      <div className="card-avatar">
        <img src={Faculty.photoUrl || 'https://i.pravatar.cc/150'} alt={safeRender(Faculty.name)} />
      </div>
      <div className="card-main">
        <h3>{safeRender(Faculty.name)}</h3>
        <p className="active-subject">{deptName} Faculty</p>
        
        <div className="card-details">
          {Faculty.email && (
            <div className="detail-item">
              <Mail size={14} />
              <span>{safeRender(Faculty.email)}</span>
            </div>
          )}
          {Faculty.phone && (
            <div className="detail-item">
              <Phone size={14} />
              <span>{safeRender(Faculty.phone)}</span>
            </div>
          )}
          {Faculty.address && (
            <div className="detail-item">
              <MapPin size={14} />
              <span>{safeRender(Faculty.address)}</span>
            </div>
          )}
          {Faculty.students && (
            <div className="detail-item">
              <User size={14} />
              <span>{studentCount} student{studentCount !== 1 ? 's' : ''} assigned</span>
            </div>
          )}
        </div>
      </div>

      {(onEdit || onDelete || onAssign) && (
        <div className="card-footer" style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          {onAssign && (
            <button onClick={() => onAssign(Faculty)} className="card-action-btn" style={{
              flex: 1, padding: '0.4rem', fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)',
              borderRadius: '6px', cursor: 'pointer'
            }}>Assign</button>
          )}
          {onEdit && (
            <button onClick={() => onEdit(Faculty)} className="card-action-btn" style={{
              flex: 1, padding: '0.4rem', fontSize: '0.8rem', fontWeight: 500,
              background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)',
              borderRadius: '6px', cursor: 'pointer'
            }}>Edit</button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(Faculty.id)} className="card-action-btn" style={{
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

export default StudentCard;
