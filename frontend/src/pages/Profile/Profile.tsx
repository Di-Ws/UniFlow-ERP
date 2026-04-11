import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import InputField from '../../components/Auth/InputField';
import { getCurrentUserAPI, updateProfileAPI } from '../../api/auth';
import './Profile.css';

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUserAPI();
        setFormData(prev => ({
          ...prev,
          name: user.name,
          email: user.email
        }));
      } catch (err) {
        console.error("Failed to fetch user profile", err);
        setError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
    setSuccess('');
    setError('');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setSuccess('');
    setError('');
    setFieldErrors({});

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (formData.name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    if (formData.password) {
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = '8+ chars, with letters and numbers';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      setUpdating(false);
      return;
    }

    try {
      const updatePayload: any = { name: formData.name, email: formData.email };
      if (formData.password) updatePayload.password = formData.password;
      
      await updateProfileAPI(updatePayload);
      setSuccess("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Optional: Refresh page or global state to update sidebar name
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      setError(msg);
      if (msg.includes('email')) setFieldErrors({ email: msg });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading Profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>Teacher Profile</h1>
        <p>Edit your personal information and account settings</p>
      </div>

      <div className="profile-card">
        <form onSubmit={handleUpdate} className="profile-form">
          <div className="form-section">
            <h3 className="section-title">Personal Information</h3>
            <InputField
              label="Full Name"
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />
            <InputField
              label="Email Address"
              type="email"
              name="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={handleChange}
              error={fieldErrors.email}
            />
          </div>

          <div className="form-section">
            <h3 className="section-title">Security (Optional)</h3>
            <p className="section-desc">Leave blank to keep your current password</p>
            <InputField
              label="New Password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
            <InputField
              label="Confirm New Password"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />
          </div>

          {success && (
            <div className="alert success-alert">
              <CheckCircle size={18} />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="alert error-alert">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={updating}>
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
