import { useState, useEffect } from 'react';
import API from '../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/admin/analytics');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--space-xl)' }}><div className="spinner"></div></div>;
  }

  if (!data) return <div>No data available</div>;

  // 1. Line Chart Data (Donation Trends)
  const lineChartData = {
    labels: data.donationsByMonth.map(d => d.month),
    datasets: [
      {
        label: 'Donations Over Last 6 Months',
        data: data.donationsByMonth.map(d => d.count),
        borderColor: '#10b981', // primary color
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Donation Growth Trend' },
    },
  };

  // 2. Doughnut Chart Data (Waste Reduction)
  const statusLabels = data.statusStats.map(s => s._id);
  const statusCounts = data.statusStats.map(s => s.count);
  
  // Custom colors matching the platform's theme
  const backgroundColors = statusLabels.map(status => {
    switch(status) {
      case 'available': return '#3b82f6'; // blue
      case 'requested': return '#f59e0b'; // warning
      case 'accepted': return '#8b5cf6'; // purple
      case 'picked_up': return '#ec4899'; // pink
      case 'delivered': return '#10b981'; // green (success/waste reduced)
      default: return '#9ca3af'; // gray
    }
  });

  const doughnutData = {
    labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [
      {
        label: 'Donation Status Breakdown',
        data: statusCounts,
        backgroundColor: backgroundColors,
        borderWidth: 0,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: { position: 'right' },
      title: { display: true, text: 'Food Lifecycle & Waste Saved' },
    },
  };

  return (
    <div className="analytics-container stagger-children">
      <div className="analytics-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
        
        {/* Line Chart */}
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
          <Line options={lineChartOptions} data={lineChartData} />
        </div>

        {/* Doughnut Chart */}
        <div className="card" style={{ padding: 'var(--space-lg)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', maxWidth: '350px' }}>
            <Doughnut options={doughnutOptions} data={doughnutData} />
          </div>
        </div>
      </div>

      {/* Heatmap / Geo-Density */}
      <div className="card" style={{ padding: 'var(--space-lg)' }}>
        <h3 style={{ marginBottom: 'var(--space-md)' }}>📍 Geographical Food Needs Heatmap</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-md)' }}>
          Visualize where food is being <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Requested (Red)</span> versus where it is <span style={{ color: '#10b981', fontWeight: 'bold' }}>Available (Green)</span>.
        </p>
        
        <div style={{ height: '400px', width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <MapContainer center={[20.5937, 78.9629]} zoom={4} style={{ height: '100%', width: '100%', zIndex: 1 }}>
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.heatmapData.map((loc, i) => (
              <CircleMarker
                key={i}
                center={[loc.lat, loc.lng]}
                radius={loc.intensity === 0.8 ? 15 : 10} // Larger radius for supply
                pathOptions={{
                  fillColor: loc.intensity === 0.8 ? '#10b981' : '#ef4444', // Green for supply, Red for request
                  color: loc.intensity === 0.8 ? '#059669' : '#dc2626',
                  fillOpacity: 0.6,
                  weight: 1
                }}
              >
                <Popup>
                  {loc.intensity === 0.8 ? 'Available Food Area' : 'High Demand Area'}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
