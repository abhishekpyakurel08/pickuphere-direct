import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { PickupLocation } from '@/stores/cartStore';
import { Clock } from 'lucide-react';

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapInnerProps {
  locations: PickupLocation[];
  onSelectLocation?: (location: PickupLocation) => void;
  selectedLocationId?: string;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

export default function LeafletMapInner({
  locations,
  onSelectLocation,
  selectedLocationId,
}: LeafletMapInnerProps) {
  const center: [number, number] = locations.length > 0 
    ? [locations[0].lat, locations[0].lng]
    : [40.7128, -74.006];

  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const mapCenter: [number, number] = selectedLocation 
    ? [selectedLocation.lat, selectedLocation.lng]
    : center;

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
      <MapController center={mapCenter} />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.lat, location.lng]}
          eventHandlers={{
            click: () => onSelectLocation?.(location),
          }}
        >
          <Popup>
            <div className="min-w-[180px] p-1">
              <h3 className="font-bold text-sm mb-1">{location.name}</h3>
              <p className="text-xs text-gray-600 mb-2">{location.address}</p>
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <Clock className="w-3 h-3" />
                <span>{location.hours}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
