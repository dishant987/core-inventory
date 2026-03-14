import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import api from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { otp: formData.otp });
      toast.success('OTP verified! Now enter your new password.');
      setStep(2);
    } catch (error) {
       console.error(error);
       toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}/.test(formData.newPassword)) {
      toast.error('Password must be at least 9 characters long, contain an uppercase letter, a lowercase letter, and a special character.');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/reset-password', formData);
      toast.success('Password updated successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
       console.error(error);
       toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
           <div className="icon-container">
             <Shield size={28} className="auth-icon" />
           </div>
          <h2>{step === 1 ? 'Verify OTP' : 'Create New Password'}</h2>
          <p>{step === 1 ? 'Enter the 6-digit code sent to your email' : 'Secure your account with a strong password'}</p>
        </div>

        <form className="auth-form" onSubmit={step === 1 ? handleVerifyOTP : handleSubmit}>
          {step === 1 ? (
            <div className="input-group">
              <label>6-Digit OTP Code</label>
              <div className="input-wrapper" style={{ padding: '0.5rem 1rem' }}>
                <input 
                  type="text" 
		  id="otp-input"
                  name="otp"
                  placeholder="------"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength="6"
                  pattern="\d{6}"
                  title="Please enter a 6-digit OTP"
                  required
                  style={{ 
                    letterSpacing: '0.5rem', 
                    textAlign: 'center', 
                    fontWeight: 'bold', 
                    fontSize: '1.5rem',
                    padding: '0.5rem',
                    background: 'transparent'
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="input-group">
                <label>New Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    name="newPassword"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    minLength="9"
                    pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{9,}"
                    title="Must contain at least one uppercase, one lowercase, and one special character"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="toggle-password-btn" tabIndex="-1">
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label>Confirm Password</label>
                <div className="input-wrapper">
                  <KeyRound size={20} className="input-icon" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    name="confirmPassword"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength="9"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="toggle-password-btn" tabIndex="-1">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? (step === 1 ? 'Verifying...' : 'Resetting...') : (step === 1 ? 'Verify OTP' : 'Reset Password')}
          </button>
          
          <div className="auth-footer">
            <Link to="/login" className="auth-link">Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
