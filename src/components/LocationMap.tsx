import { useEffect, useState } from 'react';
import { PickupLocation } from '@/stores/cartStore';
import { MapPin, Clock, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationMapProps {
  locations: PickupLocation[];
  onSelectLocation?: (location: PickupLocation) => void;
  selectedLocationId?: string;
  height?: string;
}

// Lazy load map component
function LazyMap({ locations, selectedLocationId, onSelectLocation, height }: LocationMapProps) {
  const [MapComponent, setMapComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // Dynamically import Leaflet components
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([reactLeaflet, L]) => {
      const { MapContainer, TileLayer, Marker, Popup, useMap } = reactLeaflet;
      
      // Fix default marker icon issue
      delete (L.default.Icon.Default.prototype as any)._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create the map component
      const Map = () => {
        const center: [number, number] = locations.length > 0 
          ? [locations[0].lat, locations[0].lng]
          : [40.7128, -74.006];

        return (
          <MapContainer
            center={center}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locations.map((location) => (
              <Marker
                key={location.id}
                position={[location.lat, location.lng]}
                eventHandlers={{
                  click: () => onSelectLocation?.(location),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-bold text-foreground mb-1">{location.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Clock className="w-4 h-4" />
                      <span>{location.hours}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );
      };

      setMapComponent(() => Map);
    });
  }, [locations, onSelectLocation]);

  if (!MapComponent) {
    return (
      <div className="flex items-center justify-center h-full bg-muted/30 rounded-2xl">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <MapPin className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  return <MapComponent />;
}

export function LocationMap({
  locations,
  onSelectLocation,
  selectedLocationId,
  height = '400px',
}: LocationMapProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-lg" style={{ height }}>
      <LazyMap 
        locations={locations}
        selectedLocationId={selectedLocationId}
        onSelectLocation={onSelectLocation}
        height={height}
      />
    </div>
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
