"use client";

import { useState } from 'react';
import AddressSearch from './AddressSearch';
import MapPicker from './MapPicker';
import { Search, Map } from 'lucide-react';

interface LocationInputProps {
    onLocationChange: (lat: number, lng: number, address?: string) => void;
    initialLat?: number;
    initialLng?: number;
}

type InputMode = 'address' | 'map';

export default function LocationInput({
    onLocationChange,
    initialLat,
    initialLng
}: LocationInputProps) {
    const [mode, setMode] = useState<InputMode>('address');
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );

    const handleLocationSelect = (lat: number, lng: number, address?: string) => {
        setSelectedLocation({ lat, lng, address });
        onLocationChange(lat, lng, address);
    };

    return (
        <div className="space-y-4">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                <button
                    type="button"
                    onClick={() => setMode('address')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${mode === 'address'
                            ? 'bg-white shadow-sm text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Search size={18} />
                    Search Address
                </button>
                <button
                    type="button"
                    onClick={() => setMode('map')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all ${mode === 'map'
                            ? 'bg-white shadow-sm text-blue-600 font-medium'
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    <Map size={18} />
                    Pick on Map
                </button>
            </div>

            {/* Input Component */}
            <div>
                {mode === 'address' ? (
                    <AddressSearch
                        onLocationSelect={handleLocationSelect}
                        placeholder="Type an address (e.g., Ho Chi Minh City, Vietnam)"
                    />
                ) : (
                    <MapPicker
                        initialLat={selectedLocation?.lat || initialLat}
                        initialLng={selectedLocation?.lng || initialLng}
                        onLocationSelect={handleLocationSelect}
                    />
                )}
            </div>

            {/* Selected Location Display */}
            {selectedLocation && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-medium text-green-800">✓ Location Selected</p>
                    <p className="text-sm text-green-700 mt-1">
                        Coordinates: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                    </p>
                    {selectedLocation.address && (
                        <p className="text-sm text-green-600 mt-1">
                            {selectedLocation.address}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
