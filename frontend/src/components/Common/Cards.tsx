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

export const TeacherCard: React.FC<{ teacher: any }> = ({ teacher }) => {
  return (
    <div className="data-card teacher-card">
      <div className="card-avatar">
        <img src={teacher.photoUrl || 'https://i.pravatar.cc/150'} alt={teacher.name} />
      </div>
      <div className="card-main">
        <h3>{teacher.name}</h3>
        <p className="active-subject">{teacher.subject}</p>
        
        <div className="card-details">
          <div className="detail-item">
            <Phone size={14} />
            <span>{teacher.phone}</span>
          </div>
          <div className="detail-item">
            <MapPin size={14} />
            <span>{teacher.address}</span>
          </div>
        </div>
      </div>
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
