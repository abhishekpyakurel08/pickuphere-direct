import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import api from '@/services/api';

// Fix Leaflet default icon issue in React
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
    onLocationSelect: (location: { address: string; lat: number; lng: number }) => void;
    selectedLocation?: { address: string; lat: number; lng: number } | null;
}

const LocationMarker = ({ setLocation, position, setPosition }: { setLocation: (vals: any) => void, position: L.LatLng | null, setPosition: (p: any) => void }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
        locationfound(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, 16);
            setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return position === null ? null : (
        <>
            <Marker position={position}></Marker>
            <Circle
                center={position}
                radius={50}
                pathOptions={{ fillColor: '#6366f1', fillOpacity: 0.1, color: '#6366f1', weight: 1, dashArray: '5, 5' }}
            />
        </>
    );
};

const LocateMeButton = ({ onLocate }: { onLocate: () => void }) => {
    return (
        <div className="absolute top-20 left-3 z-[1000]">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    onLocate();
                }}
                className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-black/10 hover:bg-gray-50 transition-colors"
                title="Locate me"
                aria-label="Find my current location"
            >
                <LocateFixed className="w-5 h-5 text-indigo-600" />
            </button>
        </div>
    );
};

export function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
    const [address, setAddress] = useState(selectedLocation?.address || '');
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : null);
    const [markerPos, setMarkerPos] = useState<L.LatLng | null>(selectedLocation ? L.latLng(selectedLocation.lat, selectedLocation.lng) : null);
    const [map, setMap] = useState<L.Map | null>(null);

    useEffect(() => {
        if (coords) {
            api.get(`/location/reverse?lat=${coords.lat}&lng=${coords.lng}`)
                .then(res => {
                    setAddress(res.data.address);
                    onLocationSelect({ address: res.data.address, ...coords });
                })
                .catch(err => console.error(err));
        }
    }, [coords, onLocationSelect]);

    const handleLocateMe = () => {
        if (map) {
            map.locate();
        }
    };

    return (
        <div className="space-y-4">
            <div className="h-[450px] w-full rounded-3xl overflow-hidden border-4 border-muted shadow-2xl relative">
                <MapContainer
                    center={[27.7172, 85.3240]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    ref={setMap}
                >
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />

                    <LocateMeButton onLocate={handleLocateMe} />

                    <LocationMarker setLocation={setCoords} position={markerPos} setPosition={setMarkerPos} />
                </MapContainer>

                <div className="absolute top-4 right-4 z-[1000] bg-background/90 backdrop-blur-md px-4 py-2 rounded-xl border shadow-lg">
                    <p className="text-xs font-black uppercase text-muted-foreground">Precision Pinning Active</p>
                </div>
            </div>

            {address && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-5 bg-indigo-50/50 border-2 border-indigo-100 rounded-2xl flex items-start gap-4"
                >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                        <span className="text-white text-xl">📍</span>
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                            Selected Delivery Destination
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                        </p>
                        <p className="text-sm font-bold text-foreground leading-relaxed">
                            {address}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
