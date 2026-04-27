import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import DonationCard from '../components/DonationCard';
import FoodQualityChecker from '../components/FoodQualityChecker';
import DeliveryTracker from '../components/DeliveryTracker';
import { FiPlus, FiPackage, FiClock, FiCheckCircle, FiTruck, FiX, FiDownload, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';
import { downloadPDF } from '../utils/downloadHelper';

const DonorDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [receiptRequests, setReceiptRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('donations');
  const [formData, setFormData] = useState({
    foodName: '', category: 'cooked', quantity: '', unit: 'kg',
    expiryDate: '', pickupAddress: user?.address || '', pickupTime: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [qualityResult, setQualityResult] = useState(null);
  const [trackingDonationId, setTrackingDonationId] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const [donationsRes, requestsRes] = await Promise.all([
        API.get('/donations/my-donations'),
        API.get('/receipts/my-requests')
      ]);
      setDonations(donationsRes.data);
      setReceiptRequests(requestsRes.data);
    } catch (err) {
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const donationData = { ...formData };

      // Add quality results if available
      if (qualityResult) {
        donationData.foodImage = qualityResult.imageUrl;
        donationData.qualityScore = qualityResult.qualityScore;
      }

      // Geocode the address for coordinates
      try {
        const { data: geoData } = await API.post('/geo/geocode', {
          address: donationData.pickupAddress,
        });
        donationData.coordinates = { lat: geoData.lat, lng: geoData.lng };
      } catch (geoErr) {
        console.log('Geocoding skipped:', geoErr.message);
      }

      await API.post('/donations', donationData);
      toast.success('Donation created successfully! 🧾 Blockchain record added.');
      setFormData({
        foodName: '', category: 'cooked', quantity: '', unit: 'kg',
        expiryDate: '', pickupAddress: user?.address || '', pickupTime: '',
        description: '',
      });
      setQualityResult(null);
      fetchDonations();
      setActiveTab('donations');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create donation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (id, status, otp = null) => {
    try {
      await API.put(`/donations/${id}/status`, { status, otp });
      toast.success(`Donation ${status === 'available' ? 'rejected' : status}! 🧾 Blockchain updated.`);
      fetchDonations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    try {
      await API.delete(`/donations/${id}`);
      toast.success('Donation deleted');
      fetchDonations();
    } catch (err) {
      toast.error('Failed to delete donation');
    }
  };

  const stats = {
    total: donations.length,
    available: donations.filter(d => d.status === 'available').length,
    requested: donations.filter(d => d.status === 'requested').length,
    delivered: donations.filter(d => d.status === 'delivered').length,
  };

  const OTPForm = ({ donationId, onSubmit }) => {
    const [otp, setOtp] = useState('');
    return (
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', width: '100%' }}>
        <input 
          type="text" 
          className="form-control" 
          style={{ width: '120px', padding: '0.25rem 0.5rem', height: '32px' }} 
          placeholder="6-digit OTP" 
          value={otp} 
          onChange={e => setOtp(e.target.value)} 
          maxLength={6}
        />
        <button 
          className="btn btn-primary btn-sm" 
          onClick={() => onSubmit(donationId, 'delivered', otp)}
          disabled={otp.length !== 6}
        >
          <FiCheckCircle /> Verify & Deliver
        </button>
      </div>
    );
  };

  const getActions = (donation) => {
    const actions = [];
    if (donation.status === 'requested') {
      actions.push(
        <button key="accept" className="btn btn-primary btn-sm" onClick={() => handleStatusUpdate(donation._id, 'accepted')}>
          <FiCheckCircle /> Accept
        </button>,
        <button key="reject" className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(donation._id, 'available')}>
          <FiX /> Reject
        </button>
      );
    }
    if (donation.status === 'accepted') {
      actions.push(
        <button key="pickup" className="btn btn-accent btn-sm" onClick={() => handleStatusUpdate(donation._id, 'picked_up')}>
          <FiTruck /> Mark Picked Up
        </button>
      );
    }
    if (donation.status === 'picked_up') {
      actions.push(
        <button key="track" className="track-delivery-btn" onClick={() => setTrackingDonationId(donation._id)}>
          🗺️ Track Delivery
        </button>
      );
      actions.push(
        <button key="reached" className="btn btn-info btn-sm" onClick={() => handleStatusUpdate(donation._id, 'reached')}>
          📍 I have Reached
        </button>
      );
    }
    if (donation.status === 'reached') {
      actions.push(
        <button key="track" className="track-delivery-btn" onClick={() => setTrackingDonationId(donation._id)}>
          🗺️ Track Delivery
        </button>
      );
      // Prompt for OTP
      actions.push(
        <OTPForm key="deliver" donationId={donation._id} onSubmit={handleStatusUpdate} />
      );
    }
    if (['available', 'requested'].includes(donation.status)) {
      actions.push(
        <button key="delete" className="btn btn-danger btn-sm" onClick={() => handleDelete(donation._id)}>
          Delete
        </button>
      );
    }
    return actions.length > 0 ? <>{actions}</> : null;
  };

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}! 👋</h1>
          <p>Manage your food donations and track their journey.</p>
        </div>

        <div className="dashboard-stats stagger-children">
          <StatsCard icon={<FiPackage />} label="Total Donations" value={stats.total} color="primary" />
          <StatsCard icon={<FiClock />} label="Available" value={stats.available} color="accent" />
          <StatsCard icon={<FiTruck />} label="Requested" value={stats.requested} color="info" />
          <StatsCard icon={<FiCheckCircle />} label="Delivered" value={stats.delivered} color="purple" />
        </div>

        <div className="section-toggle" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex' }}>
            <button className={`section-toggle-btn ${activeTab === 'donations' ? 'active' : ''}`} onClick={() => setActiveTab('donations')}>
              <FiPackage /> My Donations
            </button>
            <button className={`section-toggle-btn ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
              <FiPlus /> Create Donation
            </button>
          </div>
          
          {activeTab === 'donations' && donations.length > 0 && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {receiptRequests.some(r => r.type === 'all' && r.status === 'approved') ? (
                <button 
                  onClick={() => downloadPDF('/receipts/download-all', 'my_donations_report.pdf')}
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
                      fetchDonations();
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
        </div>

        {activeTab === 'create' && (
          <div className="dashboard-section">
            <div className="card create-donation-form">
              <h2 style={{ marginBottom: 'var(--space-lg)' }}>New Donation</h2>

              {/* 📸 AI Food Quality Checker */}
              <FoodQualityChecker onResult={(result) => setQualityResult(result)} />

              <div style={{ marginTop: 'var(--space-lg)' }}>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Food Name</label>
                    <input type="text" name="foodName" className="form-control" placeholder="e.g. Rice & Dal, Fresh Vegetables" value={formData.foodName} onChange={handleChange} required />
                  </div>

                  <div className="form-row-3">
                    <div className="form-group">
                      <label>Category</label>
                      <select name="category" className="form-control" value={formData.category} onChange={handleChange} required>
                        <option value="cooked">🍲 Cooked</option>
                        <option value="raw">🥬 Raw</option>
                        <option value="packaged">📦 Packaged</option>
                        <option value="beverages">🥤 Beverages</option>
                        <option value="bakery">🍞 Bakery</option>
                        <option value="other">🍽️ Other</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Quantity</label>
                      <input type="number" name="quantity" className="form-control" placeholder="Amount" value={formData.quantity} onChange={handleChange} required min="1" />
                    </div>
                    <div className="form-group">
                      <label>Unit</label>
                      <select name="unit" className="form-control" value={formData.unit} onChange={handleChange} required>
                        <option value="kg">Kg</option>
                        <option value="liters">Liters</option>
                        <option value="pieces">Pieces</option>
                        <option value="packets">Packets</option>
                        <option value="plates">Plates</option>
                        <option value="boxes">Boxes</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date & Time</label>
                      <input type="datetime-local" name="expiryDate" className="form-control" value={formData.expiryDate} onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                      <label>Pickup Time</label>
                      <input type="text" name="pickupTime" className="form-control" placeholder="e.g. 10 AM - 2 PM" value={formData.pickupTime} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Pickup Address</label>
                    <input type="text" name="pickupAddress" className="form-control" placeholder="Pickup location" value={formData.pickupAddress} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Description (Optional)</label>
                    <textarea name="description" className="form-control" placeholder="Any additional details about the food" value={formData.description} onChange={handleChange} rows={3} />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Creating...' : '🧾 Create Donation (+ Blockchain Record)'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'donations' && (
          <div className="dashboard-section">
            {loading ? (
              <div className="spinner"></div>
            ) : donations.length > 0 ? (
              <div className="donations-grid stagger-children">
                {donations.map((donation) => (
                  <DonationCard
                    key={donation._id}
                    donation={donation}
                    showReceiver={true}
                    actions={getActions(donation)}
                    receiptStatus={receiptRequests.find(r => r.donation?._id === donation._id || r.donation === donation._id)?.status}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🍽️</div>
                <h3>No Donations Yet</h3>
                <p>Start sharing surplus food by creating your first donation!</p>
                <button className="btn btn-primary" style={{ marginTop: '16px' }} onClick={() => setActiveTab('create')}>
                  <FiPlus /> Create First Donation
                </button>
              </div>
            )}
          </div>
        )}

        {/* Delivery Tracker Modal (Donor) */}
        {trackingDonationId && (
          <DeliveryTracker
            donationId={trackingDonationId}
            onClose={() => setTrackingDonationId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;
