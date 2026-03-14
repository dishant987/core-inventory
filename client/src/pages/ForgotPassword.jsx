import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setIsSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
       console.error(error);
       toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="icon-container">
            {isSent ? <ShieldCheck size={28} className="auth-icon" /> : <Mail size={28} className="auth-icon" />}
          </div>
          <h2>{isSent ? 'Check Your Email' : 'Forgot Password'}</h2>
          <p>{isSent ? 'We have sent you a recovery code' : 'Enter your email to reset your password'}</p>
        </div>

        {isSent ? (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#cbd5e1', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              We've sent an email to <strong style={{color: '#f8fafc'}}>{email}</strong> containing a 6-digit OTP code.<br/><br/>
              Please check your inbox and use the code to create a new password.
            </p>
            <Link to="/reset-password" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', textDecoration: 'none', borderRadius: '12px', fontWeight: 600, textAlign: 'center', transition: 'opacity 0.2s' }}>
               Enter OTP Code <ArrowRight size={18} />
            </Link>
            <div style={{ marginTop: '1.5rem' }}>
               <Link to="/login" className="auth-link">Back to Login</Link>
            </div>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input 
                  type="email" 
                  placeholder="Ex. admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            
            <div className="auth-footer">
              Remember your password? <Link to="/login" className="auth-link">Log in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
