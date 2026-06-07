import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import InputField from '../../components/Auth/InputField';
import { registerAPI, getDepartmentsAPI } from '../../api/auth';
import '../../styles/Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Faculty', // Default role
    departmentId: ''
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const data = await getDepartmentsAPI();
        setDepartments(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, departmentId: data[0].id.toString() }));
      } catch (err) {
        console.error("Failed to load departments");
      }
    };
    fetchDepts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setErrors({});
    
    // Detailed Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailLower = formData.email.toLowerCase();
    const isAllowedDomain = emailLower.endsWith('@college.edu.in') || emailLower.endsWith('@university.edu');
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (!isAllowedDomain) {
      newErrors.email = 'Only institutional email domains (@college.edu.in) are permitted';
    }
    
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters, with letters and numbers';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.departmentId) {
      newErrors.departmentId = 'Please select a department';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      await registerAPI({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        role: formData.role.toUpperCase(),
        registrationMetadata: {
          departmentId: formData.departmentId
        }
      });
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to register';
      setServerError(String(msg));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Network size={24} />
          </div>
          <h1>Create Account</h1>
          <p>Sign up to access UniFlow</p>
        </div>

        <form onSubmit={handleRegister}>
          {serverError && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{serverError}</div>}

          <InputField
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
          />

          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="admin@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>Register As</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="HOD" style={{ background: '#1e293b', color: '#f8fafc' }}>HOD (Admin)</option>
                <option value="Faculty" style={{ background: '#1e293b', color: '#f8fafc' }}>Faculty</option>
                <option value="Student" style={{ background: '#1e293b', color: '#f8fafc' }}>Student</option>
              </select>
            </div>

            <div className="input-group">
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8', marginBottom: '0.5rem' }}>
                {formData.role === 'HOD' ? 'Department to Manage' : 'Department'}
              </label>
              <select
                name="departmentId"
                value={formData.departmentId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {departments.length === 0 ? (
                  <option value="" style={{ background: '#1e293b', color: '#f8fafc' }}>Loading...</option>
                ) : (
                  <>
                    <option value="" style={{ background: '#1e293b', color: '#f8fafc' }}>Select Department</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id} style={{ background: '#1e293b', color: '#f8fafc' }}>
                        {dept.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            </div>
          </div>
          
          <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <InputField
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="auth-link">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
