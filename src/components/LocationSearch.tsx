import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

interface Suggestion {
    display_name: string;
    lat: number;
    lng: number;
}

interface LocationSearchProps {
    onSelect: (lat: number, lng: number, address: string) => void;
    placeholder?: string;
    className?: string;
}

export function LocationSearch({ onSelect, placeholder = "Search for a location...", className }: LocationSearchProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 3) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const res = await api.get(`/location/search?q=${encodeURIComponent(query)}`);
                setSuggestions(res.data);
                setIsOpen(true);
            } catch (error) {
                console.error('Failed to fetch suggestions');
            } finally {
                setLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (s: Suggestion) => {
        setQuery(s.display_name);
        setIsOpen(false);
        onSelect(s.lat, s.lng, s.display_name);
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <div className="relative">
                <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    className="pl-10 h-12 rounded-xl border-2 focus:ring-primary shadow-sm"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </div>
            </div>

            {isOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border rounded-xl shadow-lg z-50 max-h-[300px] overflow-y-auto">
                    {suggestions.map((s, i) => (
                        <button
                            key={i}
                            className="w-full text-left p-3 hover:bg-muted transition-colors flex items-start gap-3 border-b last:border-none"
                            onClick={() => handleSelect(s)}
                        >
                            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-sm line-clamp-2">{s.display_name}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
