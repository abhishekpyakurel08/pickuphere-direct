import { useEffect, useState, lazy, Suspense } from 'react';
import { PickupLocation } from '@/stores/cartStore';
import { MapPin, Clock, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LocationMapProps {
  locations: PickupLocation[];
  onSelectLocation?: (location: PickupLocation) => void;
  selectedLocationId?: string;
  height?: string;
}

// Map loading placeholder
function MapPlaceholder({ height }: { height: string }) {
  return (
    <div className="flex items-center justify-center bg-muted/30 rounded-2xl" style={{ height }}>
      <div className="text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    </div>
  );
}

// Lazy loaded map component
const LeafletMap = lazy(() => import('./LeafletMapInner'));

export function LocationMap({
  locations,
  onSelectLocation,
  selectedLocationId,
  height = '400px',
}: LocationMapProps) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-lg" style={{ height }}>
      <Suspense fallback={<MapPlaceholder height={height} />}>
        <LeafletMap 
          locations={locations}
          selectedLocationId={selectedLocationId}
          onSelectLocation={onSelectLocation}
        />
      </Suspense>
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
