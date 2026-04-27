import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FiClock, FiMapPin, FiPackage, FiCalendar, FiDownload, FiFileText, FiInfo, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import API from '../api/axios';
import { toast } from 'react-toastify';
import ExpiryTracker from './ExpiryTracker';
import DonationTrail from './DonationTrail';
import './DonationCard.css';

import { downloadPDF } from '../utils/downloadHelper';

const DonationCard = ({ donation, actions, showDonor, showReceiver, footer, receiptStatus }) => {
  const { user } = useAuth();
  const [showTrail, setShowTrail] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const statusLabels = {
    available: 'Available',
    requested: 'Requested',
    accepted: 'Accepted',
    picked_up: 'Picked Up',
    reached: 'Reached',
    delivered: 'Delivered',
    expired: 'Expired',
  };

  const categoryIcons = {
    cooked: '🍲',
    raw: '🥬',
    packaged: '📦',
    beverages: '🥤',
    bakery: '🍞',
    other: '🍽️',
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`donation-card animate-fade-in ${donation.status === 'expired' ? 'expired-card' : ''}`}
      style={donation.status === 'expired' ? { filter: 'grayscale(0.4)', opacity: 0.85 } : {}}
    >
      <div className="donation-card-header">
        <div className="donation-card-category">
          <span className="category-emoji">{categoryIcons[donation.category] || '🍽️'}</span>
          <span className="category-name">{donation.category}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {donation.qualityScore?.label && (
            <span
              className="badge"
              style={{
                fontSize: '0.68rem',
                background: donation.qualityScore.score >= 70
                  ? 'rgba(34,197,94,0.15)' : donation.qualityScore.score >= 40
                  ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
                color: donation.qualityScore.score >= 70
                  ? '#4ade80' : donation.qualityScore.score >= 40
                  ? '#fbbf24' : '#f87171',
                border: `1px solid ${donation.qualityScore.score >= 70
                  ? 'rgba(34,197,94,0.3)' : donation.qualityScore.score >= 40
                  ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)'}`,
              }}
            >
              {donation.qualityScore.score >= 70 ? '✅' : donation.qualityScore.score >= 40 ? '⚠️' : '❌'} {donation.qualityScore.label}
            </span>
          )}
          <span className={`badge badge-${donation.status}`}>
            {statusLabels[donation.status]}
          </span>
        </div>
      </div>

      {/* Food Image */}
      {donation.foodImage && (
        <div style={{
          borderRadius: '8px',
          overflow: 'hidden',
          margin: '8px 0',
          border: '1px solid var(--border-color)',
        }}>
          <img
            src={donation.foodImage.startsWith('http') ? donation.foodImage : `http://localhost:5000${donation.foodImage}`}
            alt={donation.foodName}
            style={{ width: '100%', height: '140px', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      <h3 className="donation-card-title">{donation.foodName}</h3>
      
      {donation.description && (
        <p className="donation-card-desc">{donation.description}</p>
      )}

      {/* Expiry Tracker */}
      {donation.expiryDate && ['available', 'expired'].includes(donation.status) && (
        <div style={{ margin: '8px 0' }}>
          <ExpiryTracker expiryDate={donation.expiryDate} compact={false} />
        </div>
      )}

      <div className="donation-card-details">
        <div className="donation-detail">
          <FiPackage />
          <span>{donation.quantity} {donation.unit}</span>
        </div>
        <div className="donation-detail">
          <FiCalendar />
          <span>Expires: {formatDate(donation.expiryDate)}</span>
        </div>
        <div className="donation-detail">
          <FiMapPin />
          <span>{donation.pickupAddress}</span>
        </div>
        <div className="donation-detail">
          <FiClock />
          <span>Pickup: {donation.pickupTime}</span>
        </div>
        {donation.distance != null && (
          <div className="donation-detail">
            <FiMapPin />
            <span style={{ color: 'var(--primary-400)', fontWeight: 600 }}>
              📏 {donation.distance} km away
            </span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowDetails(!showDetails)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {showDetails ? <><FiChevronUp /> Hide Details</> : <><FiChevronDown /> View Details</>}
        </button>
      </div>

      {showDetails && (
        <div className="donation-card-expanded" style={{
          marginTop: '12px',
          padding: '12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          fontSize: '0.85rem st'
        }}>
          {donation.foodImage && (
            <div style={{ marginBottom: '12px' }}>
              <img
                src={donation.foodImage.startsWith('http') ? donation.foodImage : `http://localhost:5000${donation.foodImage}`}
                alt="Full food image"
                style={{ width: '100%', borderRadius: '4px', maxHeight: '300px', objectFit: 'contain' }}
              />
            </div>
          )}

          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <strong style={{ color: 'var(--primary-400)', display: 'block', marginBottom: '4px' }}>📍 Pickup Address</strong>
              <p style={{ margin: 0, color: 'var(--text-main)' }}>{donation.pickupAddress}</p>
            </div>

            {donation.donor && (
              <div>
                <strong style={{ color: 'var(--primary-400)', display: 'block', marginBottom: '4px' }}>👤 Donor Information</strong>
                <p style={{ margin: '2px 0' }}>Name: {donation.donor.name}</p>
                <p style={{ margin: '2px 0' }}>Phone: {donation.donor.phone}</p>
                {(user?.role === 'admin' || user?._id === donation.donor._id) && (
                  <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Profile Address: {donation.donor.address || 'N/A'}
                  </p>
                )}
              </div>
            )}

            {donation.receiver && (
              <div>
                <strong style={{ color: 'var(--accent-400)', display: 'block', marginBottom: '4px' }}>🏠 Receiver Information</strong>
                <p style={{ margin: '2px 0' }}>Name: {donation.receiver.name}</p>
                {donation.receiver.organization && <p style={{ margin: '2px 0' }}>Org: {donation.receiver.organization}</p>}
                {(user?.role === 'admin' || user?._id === donation.receiver._id) && (
                  <p style={{ margin: '2px 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Address: {donation.receiver.address || 'N/A'}
                  </p>
                )}
              </div>
            )}
            
            {donation.qualityScore && (
              <div>
                <strong style={{ color: 'var(--info-400)', display: 'block', marginBottom: '4px' }}>🛡️ Quality Check</strong>
                <p style={{ margin: 0 }}>Score: {donation.qualityScore.score}% - {donation.qualityScore.label}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {showDonor && donation.donor && (
        <div className="donation-card-user">
          <span className="user-label">Donor:</span>
          <span className="user-name">{donation.donor.name}</span>
          <span className="user-contact">{donation.donor.phone}</span>
        </div>
      )}

      {showReceiver && donation.receiver && (
        <div className="donation-card-user">
          <span className="user-label">Receiver:</span>
          <span className="user-name">{donation.receiver.name}</span>
          {donation.receiver.organization && (
            <span className="user-org">({donation.receiver.organization})</span>
          )}
        </div>
      )}

      <div className="donation-card-actions">
        {actions}
        {donation.status === 'delivered' && !receiptStatus && (
          <button 
            className="btn btn-info btn-sm" 
            onClick={async () => {
              try {
                await API.post('/receipts/request', { donationId: donation._id });
                toast.success('Receipt request sent to admin! 📑');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to request receipt');
              }
            }}
          >
            <FiFileText /> Request Receipt
          </button>
        )}
        {receiptStatus === 'pending' && (
          <span className="badge badge-requested" style={{ fontSize: '0.7rem' }}>Receipt Pending...</span>
        )}
        {receiptStatus === 'approved' && (
          <button 
            onClick={() => downloadPDF(`/receipts/download/${donation._id}`, `receipt_${donation._id}.pdf`)}
            className="btn btn-success btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FiDownload /> Download Receipt
          </button>
        )}
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowTrail(true)}
          style={{ fontSize: '0.78rem' }}
        >
          🔗 Trail
        </button>
      </div>

      {showTrail && (
        <DonationTrail
          donationId={donation._id}
          onClose={() => setShowTrail(false)}
        />
      )}

      {footer && (
        <div className="donation-card-footer" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
          {footer}
        </div>
      )}
    </div>
  );
};

export default DonationCard;
