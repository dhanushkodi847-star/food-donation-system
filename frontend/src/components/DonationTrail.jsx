import { useState, useEffect } from 'react';
import API from '../api/axios';
import './DonationTrail.css';

const DonationTrail = ({ donationId, onClose }) => {
  const [chain, setChain] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchChain();
  }, [donationId]);

  const fetchChain = async () => {
    try {
      const { data } = await API.get(`/blockchain/${donationId}`);
      setChain(data);
    } catch (err) {
      console.error('Failed to fetch blockchain:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const { data } = await API.get(`/blockchain/${donationId}/verify`);
      setVerification(data);
    } catch (err) {
      console.error('Verification failed:', err);
    } finally {
      setVerifying(false);
    }
  };

  const actionEmojis = {
    created: '📝',
    requested: '🙋',
    accepted: '✅',
    rejected: '❌',
    picked_up: '🚚',
    delivered: '📦',
    deleted: '🗑️',
  };

  const actionLabels = {
    created: 'Donation Created',
    requested: 'Donation Requested',
    accepted: 'Donation Accepted',
    rejected: 'Request Rejected',
    picked_up: 'Food Picked Up',
    delivered: 'Food Delivered',
    deleted: 'Donation Deleted',
  };

  return (
    <div className="trail-overlay" onClick={onClose}>
      <div className="trail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="trail-header">
          <div>
            <h2>🧾 Blockchain Trail</h2>
            <p className="trail-subtitle">Immutable donation tracking powered by SHA-256</p>
          </div>
          <button className="trail-close" onClick={onClose}>✕</button>
        </div>

        {verification && (
          <div className={`trail-verification ${verification.valid ? 'valid' : 'invalid'}`}>
            <div className="trail-verification-icon">
              {verification.valid ? '🛡️' : '⚠️'}
            </div>
            <div>
              <div className="trail-verification-title">
                {verification.valid ? 'Chain Verified' : 'Chain Compromised'}
              </div>
              <div className="trail-verification-text">{verification.message}</div>
            </div>
          </div>
        )}

        <button
          className="btn btn-primary trail-verify-btn"
          onClick={handleVerify}
          disabled={verifying}
        >
          {verifying ? '⏳ Verifying...' : '🔍 Verify Chain Integrity'}
        </button>

        {loading ? (
          <div className="spinner" />
        ) : chain.length === 0 ? (
          <div className="trail-empty">No blockchain records found</div>
        ) : (
          <div className="trail-chain">
            {chain.map((block, index) => (
              <div key={block._id} className="trail-block" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="trail-connector">
                  <div className="trail-dot" />
                  {index < chain.length - 1 && <div className="trail-line" />}
                </div>
                <div className="trail-content">
                  <div className="trail-action">
                    <span className="trail-emoji">{actionEmojis[block.action] || '📋'}</span>
                    <span className="trail-action-label">{actionLabels[block.action] || block.action}</span>
                    <span className="trail-block-index">Block #{block.blockIndex}</span>
                  </div>
                  <div className="trail-meta">
                    <span>👤 {block.actor?.name || 'Unknown'}</span>
                    <span>🕐 {new Date(block.createdAt).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="trail-hash">
                    <div className="trail-hash-label">Hash</div>
                    <code className="trail-hash-value">{block.hash?.substring(0, 24)}...</code>
                  </div>
                  {block.previousHash !== '0' && (
                    <div className="trail-hash">
                      <div className="trail-hash-label">Prev Hash</div>
                      <code className="trail-hash-value">{block.previousHash?.substring(0, 24)}...</code>
                    </div>
                  )}
                  {block.data && Object.keys(block.data).length > 0 && (
                    <div className="trail-data">
                      {Object.entries(block.data).map(([key, value]) => (
                        <span key={key} className="trail-data-tag">
                          {key}: {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="trail-footer">
          <span>🔗 {chain.length} blocks in chain</span>
          <span>🔒 SHA-256 encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default DonationTrail;
