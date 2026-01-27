import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  userLocation?: { lat: number; lng: number; address?: string };
  height?: string;
}

export function LocationMap({
  userLocation,
  height = '400px',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [27.7172, 85.3240]; // Kathmandu as default center

    const map = L.map(mapRef.current).setView(center, 15);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation) return;

    const map = mapInstanceRef.current;

    // Remove existing marker
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const pos: [number, number] = [userLocation.lat, userLocation.lng];

    const userIcon = L.divIcon({
      html: `<div class="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-2xl animate-bounce" />`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });

    markerRef.current = L.marker(pos, { icon: userIcon })
      .addTo(map)
      .bindPopup(userLocation.address || 'Delivery Destination')
      .openPopup();

    map.flyTo(pos, 16);
  }, [userLocation]);

  return (
    <div
      ref={mapRef}
      className="rounded-3xl overflow-hidden border-4 border-muted shadow-2xl"
      style={{ height, width: '100%' }}
    />
  );
}
