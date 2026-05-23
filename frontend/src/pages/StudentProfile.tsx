import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentByIdAPI } from '../api/students';
import { getStudentReportAPI } from '../api/common';
import { User, Mail, Phone, MapPin, GraduationCap, ArrowLeft, Trash, Edit } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import './StudentProfile.css';

// Helper to safely render data
const safeRender = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') return val.name || JSON.stringify(val);
  return String(val);
};

const StudentProfile: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentData, reportData] = await Promise.all([
          getStudentByIdAPI(Number(id)),
          getStudentReportAPI(Number(id))
        ]);
        setStudent(studentData);
        setReports(reportData);
      } catch (err) {
        console.error("Failed to fetch profile details", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  if (loading) return <div className="profile-loading">Fetching Student Records...</div>;
  if (!student) return <div className="error-state">Student not found.</div>;

  const avgMarks = reports.length > 0 
    ? (reports.reduce((acc, r) => acc + r.marks, 0) / reports.length).toFixed(1) 
    : 0;

  return (
    <div className="profile-wrapper">
      <div className="profile-nav">
        <button onClick={() => navigate(-1)} className="back-btn">
          <ArrowLeft size={18} />
          <span>Back to Directory</span>
        </button>
        <div className="profile-actions">
          <button className="action-btn edit"><Edit size={16} /> Edit</button>
          <button className="action-btn delete"><Trash size={16} /> Delete</button>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-left">
          <div className="profile-card hero-card">
            <div className="hero-avatar">
              <User size={48} />
            </div>
            <div className="hero-info">
              <h2>{safeRender(student.name)}</h2>
              <p>{safeRender(student.batch || student.branch)} • Year {safeRender(student.year)} • Semester {safeRender(student.semester)}</p>
              <div className={`fee-status-pill ${String(student.feeStatus || '').toLowerCase()}`}>
                {safeRender(student.feeStatus)}
              </div>
            </div>
          </div>

          <div className="profile-card info-card">
            <h3>Personal Information</h3>
            <div className="info-list">
              <div className="info-item">
                <Mail size={16} />
                <div className="info-content">
                  <label>Email</label>
                  <span>{safeRender(student.email)}</span>
                </div>
              </div>
              <div className="info-item">
                <Phone size={16} />
                <div className="info-content">
                  <label>Phone</label>
                  <span>{safeRender(student.phone)}</span>
                </div>
              </div>
              <div className="info-item">
                <MapPin size={16} />
                <div className="info-content">
                  <label>Home Address</label>
                  <span>{safeRender(student.address)}</span>
                </div>
              </div>
              <div className="info-item">
                <GraduationCap size={16} />
                <div className="info-content">
                  <label>Academic Standing</label>
                  <span>Semester {safeRender(student.semester)} • Batch {safeRender(student.batch)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-right">
          <div className="stats-row">
            <div className="mini-stat">
              <label>Attendance</label>
              <div className="mini-val">{student.attendanceRate || student.attendance || 0}%</div>
            </div>
            <div className="mini-stat">
              <label>Avg. Marks</label>
              <div className="mini-val">{avgMarks}%</div>
            </div>
          </div>

          <div className="profile-card analysis-card">
            <h3>Academic Performance</h3>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                {reports.length === 0 ? (
                   <div className="no-data-msg">No academic data available for this student.</div>
                ) : (
                  <BarChart data={reports}>
                    <XAxis dataKey="subject" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)' }} />
                    <Bar dataKey="marks" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="profile-card subjects-card">
            <h3>Subject Wise Breakdown</h3>
            <div className="subject-table">
              {reports.map(report => (
                <div key={report.id} className="subject-row">
                  <span className="subj-name">{safeRender(report.subject)}</span>
                  <div className="subj-marks">
                    <span className="mark-val">{safeRender(report.marks)}</span>
                    <span className={`grade-label grade-${String(report.grade || '').toLowerCase()}`}>{safeRender(report.grade)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
