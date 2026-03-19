import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin } from 'react-icons/fi';
import { MdVolunteerActivism } from 'react-icons/md';
import { toast } from 'react-toastify';
import './Auth.css';

const DonorRegister = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerDonor } = useAuth();
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
      await registerDonor({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        address: formData.address,
      });
      toast.success('Registration successful! Welcome aboard!');
      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-header-icon"><MdVolunteerActivism /></div>
          <h2>Become a Donor</h2>
          <p>Register to start sharing surplus food</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input type="text" name="name" className="form-control" placeholder="Enter your name" value={formData.name} onChange={handleChange} required />
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
            <textarea name="address" className="form-control" placeholder="Enter your address" value={formData.address} onChange={handleChange} required rows={2} />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Donor Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign In</Link></p>
          <div className="auth-divider">or</div>
          <p>Want to receive food? <Link to="/register/receiver">Register as Receiver</Link></p>
        </div>
      </div>
    </div>
  );
};

export default DonorRegister;
