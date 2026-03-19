import { FiClock, FiMapPin, FiPackage, FiCalendar } from 'react-icons/fi';
import './DonationCard.css';

const DonationCard = ({ donation, actions, showDonor, showReceiver }) => {
  const statusLabels = {
    available: 'Available',
    requested: 'Requested',
    accepted: 'Accepted',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
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
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="donation-card animate-fade-in">
      <div className="donation-card-header">
        <div className="donation-card-category">
          <span className="category-emoji">{categoryIcons[donation.category] || '🍽️'}</span>
          <span className="category-name">{donation.category}</span>
        </div>
        <span className={`badge badge-${donation.status}`}>
          {statusLabels[donation.status]}
        </span>
      </div>

      <h3 className="donation-card-title">{donation.foodName}</h3>
      
      {donation.description && (
        <p className="donation-card-desc">{donation.description}</p>
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
      </div>

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

      {actions && (
        <div className="donation-card-actions">
          {actions}
        </div>
      )}
    </div>
  );
};

export default DonationCard;
