import { useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import './DeliveryTracker.css';

const LiveTrackingMap = ({ donationId, onClose }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const donorMarkerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const pollingRef = useRef(null);

  const [trackingData, setTrackingData] = useState(null);
  const [routeInfo, setRouteInfo] = useState({ distance: null, duration: null });
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [mapReady, setMapReady] = useState(false);

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

  // Fetch tracking data (initial + polling)
  const fetchTrackingData = useCallback(async () => {
    try {
      const { data } = await API.get(`/tracking/${donationId}/location`);
      setTrackingData(data);

      if (data.liveLocation?.lat) {
        setIsLive(true);
        setLastUpdate(new Date(data.liveLocation.updatedAt));

        // Update marker position smoothly
        if (donorMarkerRef.current) {
          donorMarkerRef.current.setLatLng([data.liveLocation.lat, data.liveLocation.lng]);

          // Pan map to follow donor
          if (mapInstanceRef.current) {
            mapInstanceRef.current.panTo([data.liveLocation.lat, data.liveLocation.lng], { animate: true, duration: 1 });
          }
        }

        // Update route
        if (data.receiverCoordinates?.lat || data.pickupCoordinates?.lat) {
          const destLat = data.receiverCoordinates?.lat || data.pickupCoordinates?.lat;
          const destLng = data.receiverCoordinates?.lng || data.pickupCoordinates?.lng;

          const geometry = await fetchRoute(
            data.liveLocation.lat, data.liveLocation.lng,
            destLat, destLng
          );

          if (geometry && mapInstanceRef.current) {
            const L = (await import('leaflet')).default;
            if (routeLayerRef.current) {
              mapInstanceRef.current.removeLayer(routeLayerRef.current);
            }
            routeLayerRef.current = L.geoJSON(geometry, {
              style: {
                color: '#8b5cf6',
                weight: 4,
                opacity: 0.8,
                dashArray: '8, 8',
              },
            }).addTo(mapInstanceRef.current);
          }
        }
      } else {
        setIsLive(false);
      }
    } catch (err) {
      console.log('Tracking fetch failed:', err.message);
    }
  }, [donationId, fetchRoute]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Default coordinates (Chennai, India)
      let defaultLat = 13.0827;
      let defaultLng = 80.2707;
      let zoom = 13;

      // Try to get user's current location
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });
          defaultLat = position.coords.latitude;
          defaultLng = position.coords.longitude;
          zoom = 15;
          console.log('✓ Location obtained:', defaultLat, defaultLng);
        } catch (error) {
          console.log('⚠ Geolocation not available, using default location:', error.message);
        }
      }

      const map = L.map(mapRef.current, {
        zoomControl: true,
        attributionControl: false,
      }).setView([defaultLat, defaultLng], zoom);

      mapInstanceRef.current = map;

      // Premium dark tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Donor marker (blue pulsing — represents the moving donor)
      const donorIcon = L.divIcon({
        html: `<div style="position:relative;">
          <div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 14px rgba(59,130,246,0.6);position:relative;z-index:2;display:flex;align-items:center;justify-content:center;font-size:12px;">🚗</div>
          <div style="position:absolute;top:-6px;left:-6px;width:36px;height:36px;border-radius:50%;background:rgba(59,130,246,0.25);animation:markerPulse 2s ease-in-out infinite;"></div>
        </div>`,
        className: 'donor-live-marker',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });
      const donorMarker = L.marker([defaultLat, defaultLng], { icon: donorIcon, zIndexOffset: 1000 }).addTo(map);
      donorMarker.bindPopup('<b>🚗 Donor Moving</b>');
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
  }, []);

  // Place static markers once we have tracking data
  useEffect(() => {
    if (!mapReady || !trackingData || !mapInstanceRef.current) return;

    const addStaticMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      const bounds = [];

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
        bounds.push([trackingData.pickupCoordinates.lat, trackingData.pickupCoordinates.lng]);
      }

      // Receiver/Destination marker (orange)
      if (trackingData.receiverCoordinates?.lat) {
        const receiverIcon = L.divIcon({
          html: '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(245,158,11,0.5);"></div>',
          className: 'receiver-marker',
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });
        L.marker([trackingData.receiverCoordinates.lat, trackingData.receiverCoordinates.lng], { icon: receiverIcon })
          .addTo(map)
          .bindPopup(`<b>🏠 Your Location</b><br>${trackingData.receiver?.name || ''}`);
        bounds.push([trackingData.receiverCoordinates.lat, trackingData.receiverCoordinates.lng]);
      }

      // Donor live position
      if (trackingData.liveLocation?.lat) {
        donorMarkerRef.current.setLatLng([trackingData.liveLocation.lat, trackingData.liveLocation.lng]);
        bounds.push([trackingData.liveLocation.lat, trackingData.liveLocation.lng]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    };

    addStaticMarkers();
  }, [mapReady, trackingData?.pickupCoordinates?.lat, trackingData?.receiverCoordinates?.lat]);

  // Fetch initial data + start polling
  useEffect(() => {
    fetchTrackingData();

    pollingRef.current = setInterval(fetchTrackingData, 5000);

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchTrackingData]);

  const timeSinceUpdate = lastUpdate
    ? Math.round((Date.now() - lastUpdate.getTime()) / 1000)
    : null;

  return (
    <div className="live-tracking-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="live-tracking-container">
        {/* Header */}
        <div className="live-tracking-header">
          <h2>
            📍 Live Donor Tracking
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
            {trackingData.donor && (
              <div className="tracker-info-chip">
                <span className="chip-icon">🚗</span>
                Donor: <span className="chip-value">{trackingData.donor.name}</span>
              </div>
            )}
            {trackingData.donor?.phone && (
              <div className="tracker-info-chip">
                <span className="chip-icon">📞</span>
                <span className="chip-value">{trackingData.donor.phone}</span>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="delivery-tracker-actions">
          <div className={`tracking-status-pill ${isLive ? 'active' : 'inactive'}`}>
            <div className={`pulse-dot ${!isLive ? 'danger' : ''}`} />
            {isLive ? 'Donor is moving' : 'Waiting for donor GPS...'}
          </div>

          {timeSinceUpdate != null && (
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Updated {timeSinceUpdate < 60 ? `${timeSinceUpdate}s ago` : `${Math.round(timeSinceUpdate / 60)}m ago`}
            </span>
          )}
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
            <div className="label">Est. Arrival</div>
            <div className="value">
              {routeInfo.duration || '—'}
              {routeInfo.duration && <span className="unit"> min</span>}
            </div>
          </div>
          <div className="route-info-card">
            <div className="label">Status</div>
            <div className="value" style={{ fontSize: '0.95rem', color: isLive ? '#8b5cf6' : 'var(--danger-400)' }}>
              {isLive ? '🚗 En Route' : '⏳ Waiting'}
            </div>
          </div>
          <div className="route-info-card">
            <div className="label">Signal</div>
            <div className="value" style={{ fontSize: '0.95rem', color: isLive ? 'var(--primary-400)' : 'var(--danger-400)' }}>
              {isLive ? '🟢 Live' : '🔴 Offline'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTrackingMap;
