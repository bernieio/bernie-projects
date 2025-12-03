"use client";

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN, MAPBOX_STYLE, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/config';

mapboxgl.accessToken = MAPBOX_TOKEN;

interface MapContainerProps {
    disasters?: any[];
    offers?: any[];
    requests?: any[];
    className?: string;
}

export default function MapContainer({
    disasters = [],
    offers = [],
    requests = [],
    className = "w-full h-[600px]"
}: MapContainerProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [loaded, setLoaded] = useState(false);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current) return;
        if (map.current) return; // Initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: MAPBOX_STYLE,
            center: DEFAULT_MAP_CENTER,
            zoom: DEFAULT_MAP_ZOOM
        });

        map.current.on('load', () => {
            setLoaded(true);
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add fullscreen control
        map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

        return () => {
            map.current?.remove();
        };
    }, []);

    // Add markers when data changes
    useEffect(() => {
        if (!loaded || !map.current) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add disaster markers (red)
        disasters.forEach((disaster, index) => {
            try {
                const [lng, lat] = parseLocation(disaster.location);
                const marker = new mapboxgl.Marker({ color: '#EF4444' })
                    .setLngLat([lng, lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                        <div class="p-2">
                            <h3 class="font-bold text-red-600">⚠️ Disaster Report</h3>
                            <p class="text-sm">Severity: ${disaster.severity}/5</p>
                            <p class="text-sm text-gray-600">Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                        </div>
                    `))
                    .addTo(map.current!);

                markersRef.current.push(marker);
            } catch (error) {
                console.error(`Failed to add disaster marker ${index}:`, error);
            }
        });

        // Add offer markers (green)
        offers.forEach((offer, index) => {
            try {
                const [lng, lat] = parseLocation(offer.location);
                const marker = new mapboxgl.Marker({ color: '#10B981' })
                    .setLngLat([lng, lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                        <div class="p-2">
                            <h3 class="font-bold text-green-600">📦 Resource Offer</h3>
                            <p class="text-sm">Type: ${getResourceTypeName(offer.resourceType)}</p>
                            <p class="text-sm">Quantity: ${offer.quantity}</p>
                        </div>
                    `))
                    .addTo(map.current!);

                markersRef.current.push(marker);
            } catch (error) {
                console.error(`Failed to add offer marker ${index}:`, error);
            }
        });

        // Add request markers (blue)
        requests.forEach((request, index) => {
            try {
                const [lng, lat] = parseLocation(request.location);
                const marker = new mapboxgl.Marker({ color: '#3B82F6' })
                    .setLngLat([lng, lat])
                    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(`
                        <div class="p-2">
                            <h3 class="font-bold text-blue-600">🆘 Resource Request</h3>
                            <p class="text-sm">Type: ${getResourceTypeName(request.resourceType)}</p>
                            <p class="text-sm">Quantity: ${request.quantity}</p>
                            <p class="text-sm">Urgency: ${request.urgency}/5</p>
                        </div>
                    `))
                    .addTo(map.current!);

                markersRef.current.push(marker);
            } catch (error) {
                console.error(`Failed to add request marker ${index}:`, error);
            }
        });

        // Fit bounds to show all markers
        if (markersRef.current.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            markersRef.current.forEach(marker => {
                bounds.extend(marker.getLngLat());
            });
            map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
        }
    }, [loaded, disasters, offers, requests]);

    return (
        <div ref={mapContainer} className={`rounded-lg shadow-lg ${className}`} />
    );
}

// Helper function to parse location string "lat,lng" to [lng, lat]
function parseLocation(geohash: string): [number, number] {
    const [lat, lng] = geohash.split(',').map(Number);
    if (isNaN(lat) || isNaN(lng)) {
        throw new Error(`Invalid location format: ${geohash}`);
    }
    return [lng, lat]; // Mapbox uses [lng, lat] order
}

// Helper function to get resource type name
function getResourceTypeName(type: number): string {
    const types = ['Food', 'Water', 'Medical', 'Shelter', 'Transportation', 'Rescue', 'Communication'];
    return types[type] || 'Unknown';
}
