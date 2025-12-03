"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/config';
import { MapPin, Navigation } from 'lucide-react';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({
    initialLat,
    initialLng,
    onLocationSelect
}: MapPickerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const marker = useRef<mapboxgl.Marker | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
        initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null
    );
    const [address, setAddress] = useState<string>('');
    const [loadingAddress, setLoadingAddress] = useState(false);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return;

        const center: [number, number] = initialLat && initialLng
            ? [initialLng, initialLat]
            : DEFAULT_MAP_CENTER;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAPBOX_STYLE,
            center: center,
            zoom: DEFAULT_MAP_ZOOM
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Create draggable marker
        marker.current = new mapboxgl.Marker({
            draggable: true,
            color: '#3B82F6'
        })
            .setLngLat(center)
            .addTo(map.current);

        // Update location when marker is dragged
        marker.current.on('dragend', () => {
            const lngLat = marker.current!.getLngLat();
            handleLocationUpdate(lngLat.lat, lngLat.lng);
        });

        // Update location when map is clicked
        map.current.on('click', (e) => {
            marker.current!.setLngLat(e.lngLat);
            handleLocationUpdate(e.lngLat.lat, e.lngLat.lng);
        });

        // Set initial location if provided
        if (initialLat && initialLng) {
            handleLocationUpdate(initialLat, initialLng);
        }

        return () => {
            map.current?.remove();
        };
    }, []);

    const handleLocationUpdate = async (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
        onLocationSelect(lat, lng);

        // Reverse geocode to get address
        setLoadingAddress(true);
        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                setAddress(data.features[0].place_name);
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                map.current?.flyTo({ center: [longitude, latitude], zoom: 15 });
                marker.current?.setLngLat([longitude, latitude]);
                handleLocationUpdate(latitude, longitude);
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get your location. Please select manually.');
            }
        );
    };

    return (
        <div className="space-y-3">
            {/* Map container */}
            <div ref={mapContainer} className="w-full h-[400px] rounded-lg shadow-lg" />

            {/* Controls */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={handleUseMyLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Navigation size={18} />
                    Use My Location
                </button>

                {selectedLocation && (
                    <div className="flex-1 px-4 py-2 bg-gray-100 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                            <MapPin size={16} className="text-blue-600" />
                            <span className="font-medium">
                                {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                            </span>
                        </div>
                        {loadingAddress ? (
                            <p className="text-xs text-gray-500 mt-1">Loading address...</p>
                        ) : address ? (
                            <p className="text-xs text-gray-600 mt-1">{address}</p>
                        ) : null}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <p className="text-sm text-gray-600">
                💡 Click on the map or drag the marker to select a location
            </p>
        </div>
    );
}
