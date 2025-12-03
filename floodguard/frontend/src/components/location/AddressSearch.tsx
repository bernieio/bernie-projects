"use client";

import { useState, useEffect, useRef } from 'react';
import { MAPBOX_TOKEN } from '@/lib/config';
import { Search } from 'lucide-react';

interface AddressSearchProps {
    onLocationSelect: (lat: number, lng: number, address: string) => void;
    placeholder?: string;
}

interface MapboxFeature {
    place_name: string;
    center: [number, number]; // [lng, lat]
}

export default function AddressSearch({
    onLocationSelect,
    placeholder = "Search for an address..."
}: AddressSearchProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined);

    // Debounced search
    useEffect(() => {
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        setLoading(true);

        // Clear previous timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer
        debounceTimer.current = setTimeout(async () => {
            try {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&limit=5&country=VN`
                );
                const data = await response.json();
                setSuggestions(data.features || []);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Geocoding error:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        }, 300); // 300ms debounce

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [query]);

    const handleSelect = (feature: MapboxFeature) => {
        const [lng, lat] = feature.center;
        onLocationSelect(lat, lng, feature.place_name);
        setQuery(feature.place_name);
        setShowSuggestions(false);
    };

    return (
        <div className="relative">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {loading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {suggestions.map((feature, index) => (
                        <button
                            key={index}
                            onClick={() => handleSelect(feature)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <p className="font-medium text-gray-900">{feature.place_name}</p>
                            <p className="text-sm text-gray-500">
                                {feature.center[1].toFixed(6)}, {feature.center[0].toFixed(6)}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {/* No results */}
            {showSuggestions && query.length >= 3 && !loading && suggestions.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
                    No results found
                </div>
            )}
        </div>
    );
}
