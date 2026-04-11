import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Network } from 'lucide-react';
import InputField from '../../components/Auth/InputField';
import { loginAPI } from '../../api/auth';
import '../../styles/Auth.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    
    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const data = await loginAPI(formData);
      if (data.token) {
        localStorage.setItem('token', data.token);
        navigate('/');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to login';
      const lowerMsg = String(msg).toLowerCase();
      if (lowerMsg.includes('email') || lowerMsg.includes('found')) {
        setErrors({ email: String(msg) });
      } else if (lowerMsg.includes('password') || lowerMsg.includes('wrong')) {
        setErrors({ password: String(msg) });
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
          <h1>Welcome Back</h1>
          <p>Login to your account to continue</p>
        </div>

        <form onSubmit={handleLogin}>
          {serverError && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: '1rem', fontSize: '0.9rem' }}>{serverError}</div>}

          <InputField
            label="Email Address"
            type="email"
            name="email"
            placeholder="admin@university.edu"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
          />
          
          <InputField
            label="Password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
