import { useEffect, useRef, useState } from 'react';
import { GEOAPIFY_API_KEY } from '../config/api';

const RouteMap = ({ origin, destination, height = '400px' }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [routeInfo, setRouteInfo] = useState(null);

  useEffect(() => {
    if (!mapRef.current || !origin || !destination) return;

    // Dynamic import for Leaflet
    const initMap = async () => {
      const L = await import('leaflet');
      
      // Fix Leaflet default marker icon issue
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Clear existing map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Create map
      const map = L.map(mapRef.current).setView([origin.lat, origin.lon], 12);
      mapInstanceRef.current = map;

      // Add Geoapify tile layer
      L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
        {
          attribution: '© Geoapify | © OpenMapTiles | © OpenStreetMap',
          maxZoom: 20
        }
      ).addTo(map);

      // Custom icons
      const originIcon = L.divIcon({
        className: 'custom-marker origin-marker',
        html: '<div class="marker-pin origin"></div>',
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      const destIcon = L.divIcon({
        className: 'custom-marker dest-marker',
        html: '<div class="marker-pin destination"></div>',
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      // Add markers
      L.marker([origin.lat, origin.lon], { icon: originIcon })
        .addTo(map)
        .bindPopup(`<b>Pickup:</b> ${origin.address}`);

      L.marker([destination.lat, destination.lon], { icon: destIcon })
        .addTo(map)
        .bindPopup(`<b>Drop-off:</b> ${destination.address}`);

      // Fetch and draw route
      try {
        const routeResponse = await fetch(
          `https://api.geoapify.com/v1/routing?waypoints=${origin.lat},${origin.lon}|${destination.lat},${destination.lon}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`
        );
        const routeData = await routeResponse.json();

        if (routeData.features && routeData.features.length > 0) {
          const route = routeData.features[0];
          const routeCoords = route.geometry.coordinates[0].map(coord => [coord[1], coord[0]]);
          
          L.polyline(routeCoords, {
            color: '#2563eb',
            weight: 4,
            opacity: 0.8
          }).addTo(map);

          // Fit bounds to show entire route
          const bounds = L.latLngBounds([
            [origin.lat, origin.lon],
            [destination.lat, destination.lon]
          ]);
          map.fitBounds(bounds, { padding: [50, 50] });

          // Set route info
          const distance = (route.properties.distance / 1000).toFixed(1);
          const duration = Math.round(route.properties.time / 60);
          setRouteInfo({ distance, duration });
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback: just fit bounds to markers
        const bounds = L.latLngBounds([
          [origin.lat, origin.lon],
          [destination.lat, destination.lon]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [origin, destination]);

  if (!origin || !destination) {
    return (
      <div className="map-placeholder" style={{ height }}>
        <p>Select origin and destination to view route</p>
      </div>
    );
  }

  return (
    <div className="route-map-container">
      <div ref={mapRef} style={{ height, width: '100%', borderRadius: '8px' }} />
      {routeInfo && (
        <div className="route-info">
          <span>📍 {routeInfo.distance} km</span>
          <span>⏱️ ~{routeInfo.duration} min</span>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
