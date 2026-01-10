import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PickupLocation } from '@/stores/cartStore';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AdminMapViewProps {
  locations: PickupLocation[];
}

export default function AdminMapView({ locations }: AdminMapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center: [number, number] = locations.length > 0 
      ? [locations[0].lat, locations[0].lng]
      : [40.7128, -74.006];

    const map = L.map(mapRef.current).setView(center, 12);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    locations.forEach((location) => {
      L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`
          <div class="min-w-[180px] p-1">
            <h3 class="font-bold text-sm mb-1">${location.name}</h3>
            <p class="text-xs text-gray-600">${location.address}</p>
          </div>
        `);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add new markers
    locations.forEach((location) => {
      L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`
          <div class="min-w-[180px] p-1">
            <h3 class="font-bold text-sm mb-1">${location.name}</h3>
            <p class="text-xs text-gray-600">${location.address}</p>
          </div>
        `);
    });

    // Fit bounds if we have locations
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
}
