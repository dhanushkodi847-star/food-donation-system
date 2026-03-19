import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
import { FiUsers, FiPackage, FiCheckCircle, FiTruck, FiTrash2, FiShoppingBag, FiHeart } from 'react-icons/fi';
import { MdVolunteerActivism } from 'react-icons/md';
import { toast } from 'react-toastify';
import './Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, donationsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/donations'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
    } catch (err) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      toast.success('User deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Delete this donation?')) return;
    try {
      await API.delete(`/donations/${id}`);
      toast.success('Donation deleted');
      fetchData();
    } catch (err) {
      toast.error('Failed to delete donation');
    }
  };

  if (loading) {
    return <div className="dashboard"><div className="container"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Admin Dashboard 🛡️</h1>
          <p>Manage users, donations, and monitor platform activity.</p>
        </div>

        <div className="dashboard-stats stagger-children">
          <StatsCard icon={<FiUsers />} label="Total Users" value={stats?.totalUsers || 0} color="primary" />
          <StatsCard icon={<MdVolunteerActivism />} label="Donors" value={stats?.totalDonors || 0} color="accent" />
          <StatsCard icon={<FiHeart />} label="Receivers" value={stats?.totalReceivers || 0} color="info" />
          <StatsCard icon={<FiPackage />} label="Total Donations" value={stats?.totalDonations || 0} color="purple" />
        </div>

        <div className="dashboard-stats stagger-children">
          <StatsCard icon={<FiShoppingBag />} label="Available" value={stats?.availableDonations || 0} color="primary" />
          <StatsCard icon={<FiTruck />} label="Requested" value={stats?.requestedDonations || 0} color="accent" />
          <StatsCard icon={<FiCheckCircle />} label="Accepted" value={stats?.acceptedDonations || 0} color="info" />
          <StatsCard icon={<FiCheckCircle />} label="Delivered" value={stats?.deliveredDonations || 0} color="purple" />
        </div>

        <div className="section-toggle">
          <button className={`section-toggle-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={`section-toggle-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FiUsers /> Users ({users.length})
          </button>
          <button className={`section-toggle-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
            <FiPackage /> Donations ({donations.length})
          </button>
        </div>

        {activeTab === 'overview' && (
          <div className="dashboard-section">
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>Recent Donations</h2>
            {stats?.recentDonations?.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Food</th>
                      <th>Donor</th>
                      <th>Receiver</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentDonations.map((d) => (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 600 }}>{d.foodName}</td>
                        <td>{d.donor?.name || '-'}</td>
                        <td>{d.receiver?.name || '-'}</td>
                        <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(d.createdAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📊</div>
                <h3>No donations yet</h3>
                <p>Donations will appear here once donors start listing food.</p>
              </div>
            )}

            {stats?.categoryStats?.length > 0 && (
              <>
                <h2 style={{ margin: 'var(--space-xl) 0 var(--space-lg)' }}>Donations by Category</h2>
                <div className="dashboard-stats">
                  {stats.categoryStats.map((cat) => {
                    const emojis = { cooked: '🍲', raw: '🥬', packaged: '📦', beverages: '🥤', bakery: '🍞', other: '🍽️' };
                    return (
                      <div key={cat._id} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{emojis[cat._id] || '🍽️'}</div>
                        <div style={{ fontWeight: 800, fontSize: '1.4rem' }}>{cat.count}</div>
                        <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize', fontSize: '0.85rem' }}>{cat._id}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="dashboard-section">
            <div className="table-container admin-users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={`badge badge-${u.role === 'donor' ? 'available' : u.role === 'receiver' ? 'accepted' : 'requested'}`}>{u.role}</span></td>
                      <td>{u.phone}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        {u.role !== 'admin' && (
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id, u.name)}>
                            <FiTrash2 />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="dashboard-section">
            {donations.length > 0 ? (
              <div className="donations-grid stagger-children">
                {donations.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    showDonor={true}
                    showReceiver={true}
                    actions={
                      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDonation(donation._id)}>
                        <FiTrash2 /> Delete
                      </button>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📦</div>
                <h3>No Donations</h3>
                <p>No donations have been created yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
