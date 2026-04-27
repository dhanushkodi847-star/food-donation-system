import { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';
import { FiX, FiNavigation } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import './DeliveryTracker.css';

const GOOGLE_MAPS_ICON = (
  <svg viewBox="0 0 92.3 132.3" xmlns="http://www.w3.org/2000/svg" width="22" height="22">
    <path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/>
    <path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.8-21.8-18.3z"/>
    <path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-34.3-5.6-10.8-15.3-19-27-21.1L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"/>
    <path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.8c4.3 10 10.8 19.4 18.5 29.4l32.4-39.5c-3.2 3.4-7.8 5.3-9.3 5.3z"/>
    <path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L23.1 98c2.6 3.4 5.3 7 7.9 10.8 8.5 12.8 11 25.6 15.2 25.6 4.1 0 5.7-12.5 12.9-25.2"/>
  </svg>
);

const DeliveryTracker = ({ donationId, onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const donorMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const watchIdRef = useRef(null);

  const [trackingData, setTrackingData] = useState(null);
  const [donorPosition, setDonorPosition] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const [isTracking, setIsTracking] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Upload donor location to server
  const uploadLocation = useCallback(async (lat, lng) => {
    try {
      await API.put(`/tracking/${donationId}/update-location`, { lat, lng });
    } catch (err) {
      console.log('Location upload failed:', err.message);
    }
  }, [donationId]);

  // Get route from OSRM
  const fetchRoute = useCallback(async (fromLat, fromLng, toLat, toLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.ceil(route.duration / 60),
        });
        return route.geometry;
      }
    } catch (err) {
      console.log('Route fetch skipped:', err.message);
    }
    return null;
  }, []);

  // Fetch initial tracking data
  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const { data } = await API.get(`/tracking/${donationId}/location`);
        setTrackingData(data);
      } catch (err) {
        toast.error('Failed to load tracking data');
      }
    };
    fetchTrackingData();
  }, [donationId]);

  // Initialize map
  useEffect(() => {
    if (!trackingData || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const center = trackingData.pickupCoordinates?.lat
        ? [trackingData.pickupCoordinates.lat, trackingData.pickupCoordinates.lng]
        : [13.0827, 80.2707];

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView(center, 14);

      mapInstanceRef.current = map;

      // Premium dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Pickup marker (green)
      if (trackingData.pickupCoordinates?.lat) {
        const pickupIcon = L.divIcon({
          html: '<div style="background:linear-gradient(135deg,#10b981,#059669);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(16,185,129,0.5);"></div>',
          className: 'pickup-marker',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([trackingData.pickupCoordinates.lat, trackingData.pickupCoordinates.lng], { icon: pickupIcon })
          .addTo(map)
          .bindPopup(`<b>📍 Pickup Point</b><br>${trackingData.pickupAddress || ''}`);
      }

      // Receiver marker (orange)
      if (trackingData.receiverCoordinates?.lat) {
        const receiverIcon = L.divIcon({
          html: '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(245,158,11,0.5);"></div>',
          className: 'receiver-marker',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([trackingData.receiverCoordinates.lat, trackingData.receiverCoordinates.lng], { icon: receiverIcon })
          .addTo(map)
          .bindPopup(`<b>🏠 Delivery Destination</b><br>${trackingData.receiver?.name || ''}`);
      }

      // Donor marker (blue pulsing)
      const donorIcon = L.divIcon({
        html: `<div style="position:relative;">
          <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(59,130,246,0.5);position:relative;z-index:2;"></div>
          <div style="position:absolute;top:-4px;left:-4px;width:30px;height:30px;border-radius:50%;background:rgba(59,130,246,0.3);animation:markerPulse 2s ease-in-out infinite;"></div>
        </div>`,
        className: 'donor-live-marker',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const donorMarker = L.marker(center, { icon: donorIcon }).addTo(map);
      donorMarker.bindPopup('<b>🚗 Your Location</b>');
      donorMarkerRef.current = donorMarker;

      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [trackingData]);

  // Start geolocation tracking
  useEffect(() => {
    if (!mapReady) return;

    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setDonorPosition(pos);
        setIsTracking(true);

        // Update marker position
        if (donorMarkerRef.current) {
          donorMarkerRef.current.setLatLng([pos.lat, pos.lng]);
        }

        // Upload to server
        await uploadLocation(pos.lat, pos.lng);

        // Draw route to receiver
        if (trackingData?.receiverCoordinates?.lat) {
          const geometry = await fetchRoute(
            pos.lat, pos.lng,
            trackingData.receiverCoordinates.lat,
            trackingData.receiverCoordinates.lng
          );

          if (geometry && mapInstanceRef.current) {
            const L = (await import('leaflet')).default;
            if (routeLayerRef.current) {
              mapInstanceRef.current.removeLayer(routeLayerRef.current);
            }
            routeLayerRef.current = L.geoJSON(geometry, {
              style: {
                color: '#3b82f6',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 8',
              },
            }).addTo(mapInstanceRef.current);
          }
        }
      },
      (error) => {
        console.log('Geolocation error:', error.message);
        setIsTracking(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [mapReady, trackingData, uploadLocation, fetchRoute]);

  // Build Google Maps URL
  const getGoogleMapsUrl = () => {
    const origin = donorPosition
      ? `${donorPosition.lat},${donorPosition.lng}`
      : trackingData?.pickupCoordinates?.lat
        ? `${trackingData.pickupCoordinates.lat},${trackingData.pickupCoordinates.lng}`
        : '';
    const destination = trackingData?.receiverCoordinates?.lat
      ? `${trackingData.receiverCoordinates.lat},${trackingData.receiverCoordinates.lng}`
      : trackingData?.pickupAddress || '';

    return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
  };

  return (
    <div className="delivery-tracker-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="delivery-tracker-container">
        {/* Header */}
        <div className="delivery-tracker-header">
          <h2>
            🗺️ Delivery Tracking
            {trackingData && <span style={{ fontWeight: 400, fontSize: '0.85rem', color: 'var(--text-muted)' }}>— {trackingData.foodName}</span>}
          </h2>
          <button className="delivery-tracker-close" onClick={onClose}>
            <FiX />
          </button>
        </div>

        {/* Info Chips */}
        {trackingData && (
          <div className="delivery-tracker-info">
            <div className="tracker-info-chip">
              <span className="chip-icon">🍽️</span>
              <span className="chip-value">{trackingData.foodName}</span>
            </div>
            {trackingData.receiver && (
              <div className="tracker-info-chip">
                <span className="chip-icon">🏠</span>
                Delivering to <span className="chip-value">{trackingData.receiver.name}</span>
              </div>
            )}
            <div className="tracker-info-chip">
              <span className="chip-icon">📍</span>
              From: <span className="chip-value">{trackingData.pickupAddress || 'N/A'}</span>
            </div>
          </div>
        )}

        {/* Status + Google Maps Button */}
        <div className="delivery-tracker-actions">
          <div className={`tracking-status-pill ${isTracking ? 'active' : 'inactive'}`}>
            <div className={`pulse-dot ${!isTracking ? 'danger' : ''}`} />
            {isTracking ? 'Live Tracking Active' : 'Waiting for GPS...'}
          </div>

          <a
            href={getGoogleMapsUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="google-maps-btn"
            title="Open in Google Maps for turn-by-turn navigation"
          >
            {GOOGLE_MAPS_ICON}
            Navigate in Google Maps
          </a>
        </div>

        {/* Map */}
        <div className="delivery-tracker-map">
          <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          {!mapReady && (
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <div className="spinner" />
            </div>
          )}
        </div>

        {/* Route Info */}
        <div className="route-info-panel">
          <div className="route-info-card">
            <div className="label">Distance</div>
            <div className="value">
              {routeInfo.distance || '—'}
              {routeInfo.distance && <span className="unit"> km</span>}
            </div>
          </div>
          <div className="route-info-card">
            <div className="label">Est. Time</div>
            <div className="value">
              {routeInfo.duration || '—'}
              {routeInfo.duration && <span className="unit"> min</span>}
            </div>
          </div>
          <div className="route-info-card">
            <div className="label">Status</div>
            <div className="value" style={{ fontSize: '0.95rem', color: 'var(--primary-400)' }}>
              <FiNavigation style={{ marginRight: '4px' }} />
              En Route
            </div>
          </div>
          <div className="route-info-card">
            <div className="label">GPS Signal</div>
            <div className="value" style={{ fontSize: '0.95rem', color: isTracking ? 'var(--primary-400)' : 'var(--danger-400)' }}>
              {isTracking ? '🟢 Strong' : '🔴 Weak'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;
