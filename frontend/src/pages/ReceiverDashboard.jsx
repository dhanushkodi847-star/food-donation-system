import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
<<<<<<< HEAD
import { FiSearch, FiPackage, FiClock, FiCheckCircle, FiShoppingBag, FiMap, FiDownload, FiFileText } from 'react-icons/fi';
import MapView from '../components/MapView';
import LiveTrackingMap from '../components/LiveTrackingMap';
import { toast } from 'react-toastify';
import './Dashboard.css';
import { downloadPDF } from '../utils/downloadHelper';
=======
import { FiSearch, FiPackage, FiClock, FiCheckCircle, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const [available, setAvailable] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
<<<<<<< HEAD
  const [receiptRequests, setReceiptRequests] = useState([]);
  const [nearbyDonations, setNearbyDonations] = useState([]);
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [requesting, setRequesting] = useState(null);
<<<<<<< HEAD
  const [userLocation, setUserLocation] = useState(null);
  const [trackingDonationId, setTrackingDonationId] = useState(null);

  useEffect(() => {
    fetchData();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(loc);

          // Update user location on server
          try {
            await API.put('/geo/update-location', loc);
          } catch (err) {
            console.log('Location update skipped');
          }

          // Fetch nearby donations
          try {
            const { data } = await API.get(`/geo/nearby?lat=${loc.lat}&lng=${loc.lng}&radius=15`);
            setNearbyDonations(data);
          } catch (err) {
            console.log('Nearby fetch skipped');
          }
        },
        () => {
          console.log('Geolocation denied');
        }
      );
    }
  };

  const fetchData = async () => {
    try {
      const [availRes, reqRes, receiptsRes] = await Promise.all([
        API.get('/donations/available'),
        API.get('/donations/my-requests'),
        API.get('/receipts/my-requests').catch(() => ({ data: [] }))
      ]);
      setAvailable(availRes.data);
      setMyRequests(reqRes.data);
      setReceiptRequests(receiptsRes.data);
=======

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
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
      toast.success('Donation requested! 🧾 Blockchain record created.');
=======
      toast.success('Donation requested successfully!');
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request donation');
    } finally {
      setRequesting(null);
    }
  };

<<<<<<< HEAD
  // Sort available donations: expiring soon first
  const sortedAvailable = [...available].sort((a, b) => {
    return new Date(a.expiryDate) - new Date(b.expiryDate);
  });

  const filteredAvailable = categoryFilter
    ? sortedAvailable.filter(d => d.category === categoryFilter)
    : sortedAvailable;

  // Expiring soon items (within 24 hours)
  const expiringSoon = sortedAvailable.filter(d => {
    const hoursLeft = (new Date(d.expiryDate) - Date.now()) / (1000 * 60 * 60);
    return hoursLeft > 0 && hoursLeft <= 24;
  });
=======
  const filteredAvailable = categoryFilter
    ? available.filter(d => d.category === categoryFilter)
    : available;
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda

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

<<<<<<< HEAD
        <div className="section-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            <button className={`section-toggle-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
              <FiSearch /> Browse Donations
            </button>
            <button className={`section-toggle-btn ${activeTab === 'map' ? 'active' : ''}`} onClick={() => setActiveTab('map')}>
              <FiMap /> 📍 Map View
            </button>
            <button className={`section-toggle-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
              <FiPackage /> My Requests
            </button>
          </div>

          {activeTab === 'requests' && myRequests.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {receiptRequests.some(r => r.type === 'all' && r.status === 'approved') ? (
                <button 
                  onClick={() => downloadPDF('/receipts/download-all', 'my_receipts_report.pdf')}
                  className="btn btn-success btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FiDownload /> Download All Receipts (PDF)
                </button>
              ) : (
                <button 
                  className="btn btn-secondary btn-sm" 
                  onClick={async () => {
                    try {
                      await API.post('/receipts/request', { type: 'all' });
                      toast.success('Bulk receipt request sent to admin!');
                      fetchData();
                    } catch (err) {
                      toast.error(err.response?.data?.message || 'Failed to request');
                    }
                  }}
                  disabled={receiptRequests.some(r => r.type === 'all' && r.status === 'pending')}
                >
                  <FiPackage /> {receiptRequests.some(r => r.type === 'all' && r.status === 'pending') ? 'Bulk Request Pending...' : 'Request Receipt for ALL'}
                </button>
              )}
            </div>
          )}
=======
        <div className="section-toggle">
          <button className={`section-toggle-btn ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>
            <FiSearch /> Browse Donations
          </button>
          <button className={`section-toggle-btn ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
            <FiPackage /> My Requests
          </button>
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
        </div>

        {activeTab === 'browse' && (
          <div className="dashboard-section">
<<<<<<< HEAD
            {/* Expiring Soon Alert */}
            {expiringSoon.length > 0 && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                marginBottom: 'var(--space-lg)',
              }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-sm)', color: '#f87171' }}>
                  ⏳ Expiring Soon — Priority Dispatch ({expiringSoon.length})
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
                  These donations need immediate pickup to prevent food waste!
                </p>
                <div className="donations-grid stagger-children">
                  {expiringSoon.slice(0, 3).map((donation) => (
                    <DonationCard
                      key={donation._id}
                      donation={donation}
                      showDonor={true}
                      actions={
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleRequest(donation._id)}
                          disabled={requesting === donation._id}
                        >
                          {requesting === donation._id ? 'Requesting...' : '🚨 Urgent Request'}
                        </button>
                      }
                    />
                  ))}
                </div>
              </div>
            )}

=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
                    receiptStatus={receiptRequests.find(r => r.donation?._id === donation._id || r.donation === donation._id)?.status}
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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

<<<<<<< HEAD
        {activeTab === 'map' && (
          <div className="dashboard-section">
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>📍 Nearby Donations</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {nearbyDonations.length > 0
                  ? `Found ${nearbyDonations.length} donations within 15km of your location`
                  : userLocation
                    ? 'No nearby donations with coordinates found'
                    : 'Allow location access to see nearby donations'}
              </p>
            </div>
            <MapView
              donations={nearbyDonations.length > 0 ? nearbyDonations : available.filter(d => d.coordinates?.lat)}
              userLocation={userLocation}
              onDonationClick={(d) => toast.info(`${d.foodName} — ${d.distance || '?'} km away`)}
            />
            {nearbyDonations.length > 0 && (
              <div className="donations-grid stagger-children" style={{ marginTop: 'var(--space-lg)' }}>
                {nearbyDonations.slice(0, 6).map((donation) => (
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
                        {requesting === donation._id ? 'Requesting...' : '🙋 Request'}
                      </button>
                    }
                  />
                ))}
              </div>
            )}
          </div>
        )}

=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD
                    receiptStatus={receiptRequests.find(r => r.donation?._id === donation._id || r.donation === donation._id)?.status}
                    footer={
                      <>
                        {['picked_up', 'reached'].includes(donation.status) && (
                          <div style={{ marginBottom: '8px' }}>
                            <button
                              className="track-donor-btn"
                              onClick={() => setTrackingDonationId(donation._id)}
                              style={{ width: '100%', justifyContent: 'center' }}
                            >
                              📍 Track Donor Live
                            </button>
                          </div>
                        )}
                        {['picked_up', 'reached'].includes(donation.status) && donation.deliveryOtp ? (
                          <div style={{ textAlign: 'center', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              Provide this OTP to the donor upon delivery:
                            </p>
                            <h3 style={{ margin: '4px 0 0 0', letterSpacing: '4px', color: 'var(--primary-500)', fontSize: '1.5rem' }}>
                              {donation.deliveryOtp}
                            </h3>
                          </div>
                        ) : null}
                      </>
                    }
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
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
<<<<<<< HEAD

        {/* Live Tracking Modal (Receiver) */}
        {trackingDonationId && (
          <LiveTrackingMap
            donationId={trackingDonationId}
            onClose={() => setTrackingDonationId(null)}
          />
        )}
=======
>>>>>>> 57fc707ed19b2d85e716b828c579053818e2fcda
      </div>
    </div>
  );
};

export default ReceiverDashboard;
