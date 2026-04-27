import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
import AdminAnalytics from '../components/AdminAnalytics';
import LiveTrackingMap from '../components/LiveTrackingMap';
import { FiUsers, FiPackage, FiCheckCircle, FiTruck, FiTrash2, FiShoppingBag, FiHeart, FiTrendingUp, FiFileText, FiDownload, FiCheck, FiX, FiMapPin } from 'react-icons/fi';
import { MdVolunteerActivism } from 'react-icons/md';
import { toast } from 'react-toastify';
import './Dashboard.css';
import { downloadPDF } from '../utils/downloadHelper';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [expiredDonations, setExpiredDonations] = useState([]);
  const [receiptRequests, setReceiptRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [trackingDonationId, setTrackingDonationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, donationsRes, expiredRes, requestsRes, activeRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/donations'),
        API.get('/donations/expired'),
        API.get('/receipts/requests?status=pending'),
        API.get('/tracking/active/all').catch(() => ({ data: [] })),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setDonations(donationsRes.data);
      setExpiredDonations(expiredRes.data);
      setReceiptRequests(requestsRes.data);
      setActiveDeliveries(activeRes.data);
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

  const handleDeleteAllExpired = async () => {
    if (!window.confirm(`Are you sure you want to delete ALL ${expiredDonations.length} expired donations?`)) return;
    try {
      const { data } = await API.delete('/admin/donations/expired');
      toast.success(data.message);
      fetchData();
    } catch (err) {
      toast.error('Failed to delete expired donations');
    }
  };

  const handleUpdateReceiptRequest = async (id, status) => {
    try {
      await API.put(`/receipts/requests/${id}`, { status });
      toast.success(`Receipt request ${status}!`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update request');
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <p>Manage users, donations, and monitor platform activity.</p>
            <button 
              onClick={() => downloadPDF('/receipts/export/all', 'full_platform_report.pdf')}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiDownload /> Export Full Report (PDF)
            </button>
          </div>
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
          <StatsCard icon={<FiCheckCircle />} label="Delivered" value={stats?.deliveredDonations || 0} color="info" />
          <StatsCard icon={<FiTrash2 />} label="Expired" value={stats?.expiredDonations || 0} color="danger" />
        </div>

        <div className="section-toggle">
          <button className={`section-toggle-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            📊 Overview
          </button>
          <button className={`section-toggle-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
            <FiTrendingUp /> Analytics
          </button>
          <button className={`section-toggle-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <FiUsers /> Users ({users.length})
          </button>
          <button className={`section-toggle-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
            <FiPackage /> Active ({donations.filter(d => d.status !== 'expired').length})
          </button>
          <button className={`section-toggle-btn ${activeTab === 'expired' ? 'active' : ''}`} onClick={() => setActiveTab('expired')}>
            <FiTrash2 /> Expired ({expiredDonations.length})
          </button>
          <button className={`section-toggle-btn ${activeTab === 'tracking' ? 'active' : ''}`} onClick={() => setActiveTab('tracking')}>
            <FiMapPin /> Live Tracking ({activeDeliveries.length})
          </button>
          <button className={`section-toggle-btn ${activeTab === 'receipts' ? 'active' : ''}`} onClick={() => setActiveTab('receipts')}>
            <FiFileText /> Receipts ({receiptRequests.length})
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

        {activeTab === 'analytics' && (
          <div className="dashboard-section fade-in">
            <AdminAnalytics />
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
            {donations.filter(d => d.status !== 'expired').length > 0 ? (
              <div className="donations-grid stagger-children">
                {donations.filter(d => d.status !== 'expired').map((donation) => (
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
                <h3>No Active Donations</h3>
                <p>There are no active donations at the moment.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'expired' && (
          <div className="dashboard-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h2>Expired Donations</h2>
              {expiredDonations.length > 0 && (
                <button className="btn btn-danger" onClick={handleDeleteAllExpired}>
                  <FiTrash2 /> Clear All Expired
                </button>
              )}
            </div>
            
            {expiredDonations.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Food</th>
                      <th>Donor</th>
                      <th>Expired On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expiredDonations.map((d) => (
                      <tr key={d._id}>
                        <td style={{ fontWeight: 600 }}>{d.foodName}</td>
                        <td>{d.donor?.name || '-'}</td>
                        <td style={{ color: 'var(--danger)' }}>
                          {new Date(d.expiryDate).toLocaleString('en-IN')}
                        </td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDonation(d._id)}>
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">✅</div>
                <h3>No Expired Records</h3>
                <p>The system is clean! No food has expired yet.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tracking' && (
          <div className="dashboard-section">
            <h2 style={{ marginBottom: 'var(--space-lg)' }}>🗺️ Active Deliveries</h2>
            {activeDeliveries.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Food Item</th>
                      <th>Donor</th>
                      <th>Receiver</th>
                      <th>Last Update</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDeliveries.map((delivery) => (
                      <tr key={delivery.donationId}>
                        <td style={{ fontWeight: 600 }}>{delivery.foodName}</td>
                        <td>
                          <div>{delivery.donor?.name || '-'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{delivery.donor?.phone || ''}</div>
                        </td>
                        <td>
                          <div>{delivery.receiver?.name || '-'}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{delivery.receiver?.organization || ''}</div>
                        </td>
                        <td>
                          {delivery.liveLocation?.updatedAt ? (
                            <span style={{ color: 'var(--primary-400)', fontSize: '0.85rem' }}>
                              🟢 {new Date(delivery.liveLocation.updatedAt).toLocaleTimeString('en-IN')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>🔴 No GPS</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="track-donor-btn"
                            onClick={() => setTrackingDonationId(delivery.donationId)}
                          >
                            📍 Track Live
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📍</div>
                <h3>No Active Deliveries</h3>
                <p>There are no deliveries currently in transit.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'receipts' && (
          <div className="dashboard-section">
            <h2>Pending Receipt Requests</h2>
            {receiptRequests.length > 0 ? (
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Donation</th>
                      <th>Status</th>
                      <th>Requested On</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptRequests.map((req) => (
                      <tr key={req._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{req.user?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.user?.role}</div>
                        </td>
                        <td>
                          {req.donation ? (
                            <>
                              <div style={{ fontWeight: 600 }}>{req.donation.foodName}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{req.donation.quantity} {req.donation.unit}</div>
                            </>
                          ) : 'Full Record'}
                        </td>
                        <td><span className="badge badge-requested">Pending</span></td>
                        <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => handleUpdateReceiptRequest(req._id, 'approved')}
                            title="Approve"
                          >
                            <FiCheck /> Approve
                          </button>
                          <button 
                            className="btn btn-danger btn-sm" 
                            onClick={() => handleUpdateReceiptRequest(req._id, 'rejected')}
                            title="Reject"
                          >
                            <FiX /> Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📄</div>
                <h3>No Pending Requests</h3>
                <p>All receipt requests have been processed.</p>
              </div>
            )}
          </div>
        )}

        {/* Live Tracking Modal (Admin) */}
        {trackingDonationId && (
          <LiveTrackingMap
            donationId={trackingDonationId}
            onClose={() => setTrackingDonationId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
