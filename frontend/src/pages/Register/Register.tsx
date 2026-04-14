import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import InputField from '../../components/Auth/InputField';
import { registerAPI } from '../../api/auth';
import '../../styles/Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Faculty' // Default role
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

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
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Password must be at least 8 characters, with letters and numbers';
    }
    
    // Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
        role: formData.role 
      });
      navigate('/login');
    } catch (err: any) {
      // Map server message to correct field or general state
      const msg = err.response?.data?.message || err.message || 'Failed to register';
      
      const lowerMsg = String(msg).toLowerCase();
      if (lowerMsg.includes('email')) {
        setErrors({ email: String(msg) });
      } else if (lowerMsg.includes('password')) {
        setErrors({ password: String(msg) });
      } else if (lowerMsg.includes('name')) {
        setErrors({ name: String(msg) });
      } else {
        setServerError(String(msg));
      }
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
          <p>Sign up to start analyzing datasets</p>
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

          <div className="input-group" style={{ marginBottom: '1.5rem' }}>
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
              <option value="HOD">HOD (Admin)</option>
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
            </select>
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
