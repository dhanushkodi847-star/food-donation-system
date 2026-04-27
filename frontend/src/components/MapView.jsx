import { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';

const MapView = ({ donations = [], userLocation = null, onDonationClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(userLocation);

  // Get current location on mount if not provided
  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          console.log('✓ Current location:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('⚠ Geolocation error:', error.message);
          // Use default location as fallback
          setCurrentLocation({ lat: 13.0827, lng: 80.2707 });
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else if (userLocation) {
      setCurrentLocation(userLocation);
    }
  }, [userLocation]);

  useEffect(() => {
    let map;

    const initMap = async () => {
      const L = (await import('leaflet')).default;

      // Fix default marker icon
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const defaultCenter = currentLocation
        ? [currentLocation.lat, currentLocation.lng]
        : [13.0827, 80.2707]; // Chennai default

      map = L.map(mapRef.current).setView(defaultCenter, 12);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // User location marker
      if (currentLocation) {
        const userIcon = L.divIcon({
          html: '<div style="background:linear-gradient(135deg,#3b82f6,#1d4ed8);width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(59,130,246,0.5);"></div>',
          className: 'user-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        L.marker([currentLocation.lat, currentLocation.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<b>📍 Your Location</b>');

        // Radius circle
        L.circle([currentLocation.lat, currentLocation.lng], {
          radius: 10000, // 10km
          color: 'rgba(59, 130, 246, 0.3)',
          fillColor: 'rgba(59, 130, 246, 0.08)',
          fillOpacity: 0.5,
        }).addTo(map);
      }

      // Donation markers
      donations.forEach((donation) => {
        if (!donation.coordinates?.lat || !donation.coordinates?.lng) return;

        const donationIcon = L.divIcon({
          html: `<div style="background:linear-gradient(135deg,#10b981,#059669);width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 0 8px rgba(16,185,129,0.4);"></div>`,
          className: 'donation-marker',
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        const marker = L.marker(
          [donation.coordinates.lat, donation.coordinates.lng],
          { icon: donationIcon }
        ).addTo(map);

        const distText = donation.distance != null ? `<br>📏 ${donation.distance} km away` : '';

        marker.bindPopup(`
          <div style="min-width:180px">
            <b>🍽️ ${donation.foodName}</b><br>
            <span style="color:#666">📦 ${donation.quantity} ${donation.unit} • ${donation.category}</span>
            ${distText}<br>
            <span style="color:#666">📍 ${donation.pickupAddress}</span>
          </div>
        `);

        marker.on('click', () => {
          if (onDonationClick) onDonationClick(donation);
        });
      });

      // Fit bounds if we have markers
      if (donations.length > 0) {
        const validDonations = donations.filter(d => d.coordinates?.lat && d.coordinates?.lng);
        if (validDonations.length > 0) {
          const bounds = L.latLngBounds(
            validDonations.map(d => [d.coordinates.lat, d.coordinates.lng])
          );
          if (currentLocation) {
            bounds.extend([currentLocation.lat, currentLocation.lng]);
          }
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }

      setMapReady(true);
    };

    if (currentLocation) {
      initMap();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [donations, currentLocation]);

  return (
    <div className="map-view-container">
      <div
        ref={mapRef}
        style={{
          width: '100%',
          height: '450px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-color)',
          overflow: 'hidden',
        }}
      />
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
  );
};

export default MapView;
