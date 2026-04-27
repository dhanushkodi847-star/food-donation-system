import { useState, useEffect } from 'react';
import API from '../api/axios';
import StatsCard from '../components/StatsCard';
import { FiActivity, FiTrendingUp, FiTrendingDown, FiMinus, FiRefreshCw, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './Dashboard.css';

const PredictionDashboard = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data } = await API.get('/predictions');
      setPredictions(data);
    } catch (err) {
      toast.error('Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data } = await API.post('/predictions/generate');
      toast.success(data.message);
      fetchPredictions();
    } catch (err) {
      toast.error('Failed to generate predictions');
    } finally {
      setGenerating(false);
    }
  };

  const trendIcons = {
    rising: <FiTrendingUp style={{ color: '#4ade80' }} />,
    falling: <FiTrendingDown style={{ color: '#f87171' }} />,
    stable: <FiMinus style={{ color: '#fbbf24' }} />,
  };

  const trendLabels = {
    rising: '↑ Rising Demand',
    falling: '↓ Falling Demand',
    stable: '→ Stable',
  };

  const getIntensityColor = (demand) => {
    if (demand >= 50) return { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#f87171' };
    if (demand >= 30) return { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.3)', text: '#fbbf24' };
    if (demand >= 15) return { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.3)', text: '#60a5fa' };
    return { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: '#4ade80' };
  };

  const timeSlotLabels = {
    morning: '🌅 Morning',
    afternoon: '☀️ Afternoon',
    evening: '🌆 Evening',
    night: '🌙 Night',
  };

  const categoryEmojis = {
    cooked: '🍲', raw: '🥬', packaged: '📦', beverages: '🥤', bakery: '🍞', other: '🍽️',
  };

  const topDemand = predictions.length > 0 ? predictions[0].predictedDemand : 0;
  const avgConfidence = predictions.length > 0
    ? Math.round(predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length)
    : 0;
  const risingAreas = predictions.filter(p => p.trend === 'rising').length;

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>🤖 AI Demand Predictions</h1>
          <p>Smart food demand analysis powered by historical data</p>
        </div>

        <div className="dashboard-stats stagger-children">
          <StatsCard icon={<FiActivity />} label="Areas Analyzed" value={predictions.length} color="primary" />
          <StatsCard icon={<FiTrendingUp />} label="Peak Demand" value={topDemand} color="accent" />
          <StatsCard icon={<FiMapPin />} label="Rising Areas" value={risingAreas} color="info" />
          <StatsCard icon={<FiActivity />} label="Avg Confidence" value={`${avgConfidence}%`} color="purple" />
        </div>

        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={generating}
            style={{ width: '100%' }}
          >
            {generating ? (
              <><span className="quality-spinner" /> Generating Predictions...</>
            ) : (
              <><FiRefreshCw /> Generate / Refresh Predictions</>
            )}
          </button>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : predictions.length > 0 ? (
          <div className="predictions-grid">
            {predictions.map((prediction, index) => {
              const intensity = getIntensityColor(prediction.predictedDemand);
              return (
                <div
                  key={prediction._id}
                  className="card prediction-card"
                  style={{
                    borderColor: intensity.border,
                    animation: `fadeIn 0.5s ease ${index * 0.08}s forwards`,
                    opacity: 0,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        📍 Area
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, marginTop: '2px', lineHeight: 1.3 }}>
                        {prediction.area}
                      </div>
                    </div>
                    <div
                      style={{
                        background: intensity.bg,
                        border: `1px solid ${intensity.border}`,
                        borderRadius: '12px',
                        padding: '8px 12px',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: '1.3rem', fontWeight: 900, color: intensity.text }}>
                        {prediction.predictedDemand}
                      </div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>DEMAND</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className="badge badge-available" style={{ fontSize: '0.72rem' }}>
                      {trendIcons[prediction.trend]} {trendLabels[prediction.trend]}
                    </span>
                    <span className="badge badge-accepted" style={{ fontSize: '0.72rem' }}>
                      {timeSlotLabels[prediction.timeSlot] || prediction.timeSlot}
                    </span>
                    <span className="badge badge-requested" style={{ fontSize: '0.72rem' }}>
                      🎯 {prediction.confidence}% confidence
                    </span>
                  </div>

                  {prediction.categoryBreakdown?.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                        Category Breakdown
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {prediction.categoryBreakdown.map((cat) => (
                          <div
                            key={cat.category}
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {categoryEmojis[cat.category] || '🍽️'}
                            <span style={{ fontWeight: 600 }}>{cat.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Visual bar */}
                  <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', height: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, prediction.predictedDemand)}%`,
                        height: '100%',
                        background: `linear-gradient(90deg, ${intensity.text}, transparent)`,
                        borderRadius: '4px',
                        transition: 'width 1s ease',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                    Based on {prediction.basedOnDataPoints} data points
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🤖</div>
            <h3>No Predictions Yet</h3>
            <p>Click "Generate Predictions" to analyze donation data and generate demand forecasts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionDashboard;
