import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { FiLogIn, FiMail, FiLock } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(formData.email, formData.password);
      toast.success(`Welcome back, ${data.name}!`);
      
      switch (data.role) {
        case 'donor': navigate('/donor/dashboard'); break;
        case 'receiver': navigate('/receiver/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await googleLogin(credentialResponse.credential);
      toast.success(`Welcome back, ${data.name}!`);
      switch (data.role) {
        case 'donor': navigate('/donor/dashboard'); break;
        case 'receiver': navigate('/receiver/dashboard'); break;
        case 'admin': navigate('/admin/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign-In failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-header-icon"><FiLogIn /></div>
          <h2>Welcome Back</h2>
          <p>Sign in to your FoodShare account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          <div style={{ textAlign: 'center', margin: '16px 0', color: 'var(--text-muted)' }}>— OR —</div>
          
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google Sign-In was unsuccessful')}
              theme="outline"
              size="large"
              shape="pill"
            />
          </div>
        </form>

        <div className="auth-footer">
          <p>Don&apos;t have an account?</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
            <Link to="/register/donor" className="btn btn-secondary btn-sm">Register as Donor</Link>
            <Link to="/register/receiver" className="btn btn-secondary btn-sm">Register as Receiver</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
