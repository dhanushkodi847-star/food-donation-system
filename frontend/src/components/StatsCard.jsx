import { useEffect, useState, useRef } from 'react';
import './StatsCard.css';

const StatsCard = ({ icon, label, value, color = 'primary' }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const cardRef = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current) return;
    const numValue = parseInt(value) || 0;
    if (numValue === 0) { setDisplayValue(0); return; }
    
    animated.current = true;
    const duration = 1200;
    const steps = 30;
    const increment = numValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), numValue);
      setDisplayValue(current);
      if (step >= steps) clearInterval(timer);
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`stats-card stats-card-${color}`} ref={cardRef}>
      <div className="stats-card-icon">{icon}</div>
      <div className="stats-card-info">
        <h3 className="stats-card-value">{displayValue}</h3>
        <p className="stats-card-label">{label}</p>
      </div>
    </div>
  );
};

export default StatsCard;
