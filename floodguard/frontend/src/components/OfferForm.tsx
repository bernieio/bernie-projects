"use client";

import { useState, FormEvent } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getFloodGuardClient } from '@/lib/singletons';
import { ResourceType } from '@/lib/config';
import toast from 'react-hot-toast';
import { Package, MapPin, Hash, Send } from 'lucide-react';
import LocationInput from './location/LocationInput';

// ✅ Use singleton from centralized location
const suiClient = getFloodGuardClient();

const RESOURCE_TYPES = [
    { value: ResourceType.FOOD, label: 'Food', icon: '🍲', description: 'Food supplies, meals, water' },
    { value: ResourceType.WATER, label: 'Water', icon: '💧', description: 'Drinking water, purification' },
    { value: ResourceType.MEDICAL, label: 'Medical', icon: '⚕️', description: 'Medicine, first aid, equipment' },
    { value: ResourceType.SHELTER, label: 'Shelter', icon: '🏠', description: 'Temporary housing, tents' },
    { value: ResourceType.TRANSPORTATION, label: 'Transportation', icon: '🚗', description: 'Vehicles, fuel, logistics' },
    { value: ResourceType.RESCUE, label: 'Rescue', icon: '🚁', description: 'Rescue teams, equipment' },
    { value: ResourceType.COMMUNICATION, label: 'Communication', icon: '📡', description: 'Radios, phones, internet' },
];

export default function OfferForm() {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [resourceType, setResourceType] = useState<number>(ResourceType.FOOD);
    const [quantity, setQuantity] = useState<number>(0);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (location.lat === 0 && location.lng === 0) {
            toast.error("Please select a location");
            return;
        }

        if (quantity <= 0) {
            toast.error("Quantity must be greater than 0");
            return;
        }

        setLoading(true);

        try {
            const locationStr = `${location.lat.toFixed(6)},${location.lng.toFixed(6)}`;

            const offerTx = await suiClient.submitResourceOffer({
                resourceType,
                quantity,
                location: locationStr,
            });

            signAndExecute(
                { transaction: offerTx },
                {
                    onSuccess: (result) => {
                        toast.success(`Resource offer submitted! Tx: ${result.digest.slice(0, 8)}...`, { duration: 5000 });
                        setQuantity(0);
                        setLocation({ lat: 0, lng: 0 });
                        setLoading(false);
                    },
                    onError: (error) => {
                        toast.error(`Failed: ${error.message || 'Unknown error'}`);
                        setLoading(false);
                    },
                }
            );
        } catch (error: any) {
            toast.error(`Failed: ${error.message || 'Unknown error'}`);
            setLoading(false);
        }
    };

    const selectedResource = RESOURCE_TYPES.find(r => r.value === resourceType);

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Package className="text-green-500" />
                Offer Resources
            </h2>

            {!account && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-medium">⚠️ Please connect your wallet to offer resources</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                        <Package size={18} /> Resource Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {RESOURCE_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setResourceType(type.value)}
                                className={`p-4 border-2 rounded-lg text-left transition-all ${resourceType === type.value
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-green-300'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-3xl">{type.icon}</span>
                                    <div>
                                        <p className="font-semibold text-gray-900">{type.label}</p>
                                        <p className="text-xs text-gray-600">{type.description}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                        <Hash size={18} /> Quantity
                    </label>
                    <div className="flex items-center gap-4">
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={quantity || ''}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                            placeholder="Enter quantity"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        <span className="text-gray-600">
                            {selectedResource?.label === 'Food' && 'kg'}
                            {selectedResource?.label === 'Water' && 'liters'}
                            {selectedResource?.label === 'Medical' && 'units'}
                            {selectedResource?.label === 'Shelter' && 'units'}
                            {selectedResource?.label === 'Transportation' && 'vehicles'}
                            {selectedResource?.label === 'Rescue' && 'personnel'}
                            {selectedResource?.label === 'Communication' && 'devices'}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                        <MapPin size={18} /> Resource Location
                    </label>
                    <LocationInput
                        onLocationChange={(lat, lng) => setLocation({ lat, lng })}
                        initialLat={location.lat || undefined}
                        initialLng={location.lng || undefined}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || !account}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send size={20} />
                            Submit Resource Offer
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
