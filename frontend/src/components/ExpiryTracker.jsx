import { useState, useEffect, useCallback } from 'react';

const ExpiryTracker = ({ expiryDate, compact = false }) => {
  const calculateTimeLeft = useCallback(() => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diff = expiry - now;

    if (diff <= 0) {
      return { expired: true, hours: 0, minutes: 0, seconds: 0, urgency: 'expired', label: 'EXPIRED' };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let urgency, label;
    if (hours < 2) {
      urgency = 'critical';
      label = '🔴 CRITICAL';
    } else if (hours < 6) {
      urgency = 'warning';
      label = '🟡 WARNING';
    } else if (hours < 24) {
      urgency = 'moderate';
      label = '🟠 MODERATE';
    } else {
      urgency = 'safe';
      label = '🟢 SAFE';
    }

    return { expired: false, hours, minutes, seconds, urgency, label };
  }, [expiryDate]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [calculateTimeLeft]);

  const urgencyColors = {
    critical: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: 'rgba(239, 68, 68, 0.4)' },
    warning: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.4)' },
    moderate: { bg: 'rgba(251, 146, 60, 0.15)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.4)' },
    safe: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.4)' },
    expired: { bg: 'rgba(107, 114, 128, 0.15)', color: '#9ca3af', border: 'rgba(107, 114, 128, 0.4)' },
  };

  const style = urgencyColors[timeLeft.urgency] || urgencyColors.safe;

  if (compact) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: 700,
          background: style.bg,
          color: style.color,
          border: `1px solid ${style.border}`,
          animation: timeLeft.urgency === 'critical' ? 'pulse-expiry 1.5s ease infinite' : 'none',
          letterSpacing: '0.03em',
        }}
      >
        ⏳ {timeLeft.expired
          ? 'EXPIRED'
          : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
        }
      </span>
    );
  }

  return (
    <div
      className="expiry-tracker"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '12px',
        padding: '12px 16px',
        animation: timeLeft.urgency === 'critical' ? 'pulse-expiry 1.5s ease infinite' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: style.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {timeLeft.label}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {timeLeft.expired ? 'This food has expired' : 'Time until expiry'}
          </div>
        </div>
        {!timeLeft.expired && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {[
              { value: timeLeft.hours, label: 'H' },
              { value: timeLeft.minutes, label: 'M' },
              { value: timeLeft.seconds, label: 'S' },
            ].map((unit, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '8px',
                    padding: '6px 8px',
                    fontFamily: "'Inter', monospace",
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: style.color,
                    minWidth: '40px',
                  }}
                >
                  {String(unit.value).padStart(2, '0')}
                </div>
                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
                  {unit.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiryTracker;
