import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import './VerifyOTP.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const { verifyEmail, resendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const phone = queryParams.get('phone');

  useEffect(() => {
    if (!email) {
      navigate('/login');
      return;
    }

    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [email, navigate, timer]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }

    setIsVerifying(true);
    try {
      const data = await verifyEmail(email, otpString);
      toast.success('Email verified successfully!');
      
      // Redirect based on role
      switch (data.role) {
        case 'donor': navigate('/donor/dashboard'); break;
        case 'receiver': navigate('/receiver/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;

    setIsResending(true);
    try {
      await resendOTP(email || phone); // Assuming resendOTP can handle either email or phone
      toast.success('A new code has been sent to your ' + (phone ? 'phone' : 'email'));
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-container animate-fade-in">
      <div className="verify-card glass">
        <div className="verify-header">
          <Link to="/login" className="back-link">
            <FiArrowLeft /> Back to Login
          </Link>
          <div className="icon-badge">
            <FiCheckCircle />
          </div>
          <h1>Verify Your Phone</h1>
          <p>
            We've sent a 6-digit verification code to <br />
            <strong>{phone || email}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="otp-form">
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="otp-field"
                autoComplete="one-time-code"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block" 
            disabled={isVerifying}
          >
            {isVerifying ? (
              <><FiRefreshCw className="spinner-icon" /> Verifying...</>
            ) : 'Verify & Activate Account'}
          </button>
        </form>

        <div className="resend-section">
          <p>Didn't receive the code?</p>
          <button 
            onClick={handleResend} 
            className="resend-link" 
            disabled={timer > 0 || isResending}
          >
            {isResending ? 'Sending...' : timer > 0 ? `Resend code in ${timer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
