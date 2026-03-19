import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
import { FiSearch, FiPackage, FiClock, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [requesting, setRequesting] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [availRes, reqRes] = await Promise.all([
        API.get('/donations/available'),
        API.get('/donations/my-requests'),
      ]);
      setAvailable(availRes.data);
      setMyRequests(reqRes.data);
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (id) => {
    setRequesting(id);
    try {
      await API.put(`/donations/${id}/request`);
      toast.success('Donation requested successfully!');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request donation');
    } finally {
      setRequesting(null);
    }
  };

  const filteredAvailable = categoryFilter
    ? available.filter(d => d.category === categoryFilter)
    : available;

  const stats = {
    available: available.length,
    requested: myRequests.filter(d => d.status === 'requested').length,
    accepted: myRequests.filter(d => ['accepted', 'picked_up'].includes(d.status)).length,
    delivered: myRequests.filter(d => d.status === 'delivered').length,
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Browse and request available food donations for your organization.</p>
        </div>

        <div className="dashboard-stats stagger-children">
          <StatsCard icon={<FiShoppingBag />} label="Available Now" value={stats.available} color="primary" />
          <StatsCard icon={<FiClock />} label="My Requests" value={stats.requested} color="accent" />
          <StatsCard icon={<FiPackage />} label="In Progress" value={stats.accepted} color="info" />
          <StatsCard icon={<FiCheckCircle />} label="Received" value={stats.delivered} color="purple" />
        </div>

        <div className="section-toggle">
          <button className={`section-toggle-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
            <FiSearch /> Browse Donations
          </button>
          <button className={`section-toggle-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <FiPackage /> My Requests
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="dashboard-section">
            <div className="filter-bar">
              <select className="form-control" style={{ maxWidth: '200px' }} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="">All Categories</option>
                <option value="cooked">🍲 Cooked</option>
                <option value="raw">🥬 Raw</option>
                <option value="packaged">📦 Packaged</option>
                <option value="beverages">🥤 Beverages</option>
                <option value="bakery">🍞 Bakery</option>
                <option value="other">🍽️ Other</option>
              </select>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {filteredAvailable.length} donation{filteredAvailable.length !== 1 ? 's' : ''} found
              </span>
            </div>

            {loading ? (
              <div className="spinner"></div>
            ) : filteredAvailable.length > 0 ? (
              <div className="donations-grid stagger-children">
                {filteredAvailable.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    showDonor={true}
                    actions={
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRequest(donation._id)}
                        disabled={requesting === donation._id}
                      >
                        {requesting === donation._id ? 'Requesting...' : '🙋 Request This Donation'}
                      </button>
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No Donations Available</h3>
                <p>Check back soon! New donations are added regularly.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="dashboard-section">
            {loading ? (
              <div className="spinner"></div>
            ) : myRequests.length > 0 ? (
              <div className="donations-grid stagger-children">
                {myRequests.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    showDonor={true}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No Requests Yet</h3>
                <p>Browse available donations and request the ones your organization needs.</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('browse')}>
                  <FiSearch /> Browse Donations
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiverDashboard;
