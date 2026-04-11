import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './InputField.css';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, error, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="input-field-wrapper">
      <label className="input-label">{label}</label>
      <div className="input-container">
        <input
          className={`auth-input ${error ? 'input-error' : ''}`}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={togglePassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && typeof error === 'string' && <span className="error-text">{error}</span>}
    </div>
  );
};

export default InputField;
