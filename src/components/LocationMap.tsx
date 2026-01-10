import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PickupLocation } from '@/stores/cartStore';
import { MapPin, Clock, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
  locations: PickupLocation[];
  onSelectLocation?: (location: PickupLocation) => void;
  selectedLocationId?: string;
  height?: string;
}

export function LocationMap({
  locations,
  onSelectLocation,
  selectedLocationId,
  height = '400px',
}: LocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

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

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers when locations or selection changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    const map = mapInstanceRef.current;
    
    // Clear existing markers
    markersRef.current.forEach(marker => map.removeLayer(marker));
    markersRef.current = [];

    // Add new markers
    locations.forEach((location) => {
      const isSelected = location.id === selectedLocationId;
      
      const marker = L.marker([location.lat, location.lng])
        .addTo(map)
        .bindPopup(`
          <div class="min-w-[180px] p-1">
            <h3 class="font-bold text-sm mb-1">${location.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${location.address}</p>
            <div class="flex items-center gap-1 text-xs text-emerald-600">
              <span>🕐 ${location.hours}</span>
            </div>
          </div>
        `);
      
      if (onSelectLocation) {
        marker.on('click', () => onSelectLocation(location));
      }

      markersRef.current.push(marker);
    });

    // Center on selected location
    const selectedLocation = locations.find(l => l.id === selectedLocationId);
    if (selectedLocation) {
      map.setView([selectedLocation.lat, selectedLocation.lng], 14);
    } else if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map(l => [l.lat, l.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [locations, selectedLocationId, onSelectLocation]);

  return (
    <div 
      ref={mapRef} 
      className="rounded-2xl overflow-hidden border border-border shadow-lg" 
      style={{ height, width: '100%' }} 
    />
  );
}

interface LocationListProps {
  locations: PickupLocation[];
  selectedLocationId?: string;
  onSelectLocation: (location: PickupLocation) => void;
}

export function LocationList({ locations, selectedLocationId, onSelectLocation }: LocationListProps) {
  return (
    <div className="space-y-3">
      {locations.map((location, index) => {
        const isSelected = location.id === selectedLocationId;
        return (
          <motion.button
            key={location.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelectLocation(location)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              isSelected
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {isSelected ? <Check className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground">{location.name}</h4>
                <p className="text-sm text-muted-foreground line-clamp-1">{location.address}</p>
                <div className="flex items-center gap-1 mt-1 text-sm text-primary">
                  <Clock className="w-3 h-3" />
                  <span>{location.hours}</span>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
