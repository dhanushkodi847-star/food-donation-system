import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { FiUser, FiMail, FiPhone, FiMapPin, FiBriefcase, FiLock, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Auth.css';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    organization: user?.organization || '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = { ...formData };
      if (!updateData.password) delete updateData.password;
      
      const { data } = await API.put('/auth/profile', updateData);
      updateUser(data);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '520px' }}>
        <div className="auth-header">
          <div className="auth-header-icon"><FiUser /></div>
          <h2>My Profile</h2>
          <p>{user?.email} &bull; <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input type="email" className="form-control" value={user?.email || ''} disabled style={{ opacity: 0.5 }} />
          </div>

          <div className="form-group">
            <label><FiPhone /> Phone Number</label>
            <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label><FiMapPin /> Address</label>
            <textarea name="address" className="form-control" value={formData.address} onChange={handleChange} required rows={2} />
          </div>

          {user?.role === 'receiver' && (
            <div className="form-group">
              <label><FiBriefcase /> Organization</label>
              <input type="text" name="organization" className="form-control" value={formData.organization} onChange={handleChange} />
            </div>
          )}

          <div className="form-group">
            <label><FiLock /> New Password (leave blank to keep current)</label>
            <input type="password" name="password" className="form-control" placeholder="Enter new password" value={formData.password} onChange={handleChange} minLength={6} />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            <FiSave /> {loading ? 'Saving...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
