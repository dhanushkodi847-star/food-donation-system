import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiBriefcase } from 'react-icons/fi';
import { MdFoodBank } from 'react-icons/md';
import { toast } from 'react-toastify';
import './Auth.css';

const ReceiverRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '', organization: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerReceiver, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerReceiver({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
        organization: formData.organization,
      });
      toast.success('Registration successful! Welcome aboard!');
      navigate('/receiver/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await googleLogin(credentialResponse.credential, 'receiver');
      toast.success(`Welcome aboard, ${data.name}!`);
      navigate('/receiver/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-Up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-header-icon"><MdFoodBank /></div>
          <h2>Become a Receiver</h2>
          <p>Register your organization to receive food donations</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input type="text" name="name" className="form-control" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FiBriefcase /> Organization Name</label>
            <input type="text" name="organization" className="form-control" placeholder="e.g. Helping Hands NGO" value={formData.organization} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input type="email" name="email" className="form-control" placeholder="Enter your email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FiLock /> Password</label>
              <input type="password" name="password" className="form-control" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} required minLength={6} />
            </div>
            <div className="form-group">
              <label><FiLock /> Confirm Password</label>
              <input type="password" name="confirmPassword" className="form-control" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label><FiPhone /> Phone Number</label>
            <input type="tel" name="phone" className="form-control" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FiMapPin /> Address</label>
            <textarea name="address" className="form-control" placeholder="Enter organization address" value={formData.address} onChange={handleChange} required rows={2} />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Receiver Account'}
          </button>

          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)' }}>— OR —</div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-Up was unsuccessful')}
              text="signup_with"
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
          <div className="auth-divider">or</div>
          <p>Want to donate food? <Link to="/register/donor">Register as Donor</Link></p>
        </div>
      </div>
    </div>
  );
};

export default ReceiverRegister;
