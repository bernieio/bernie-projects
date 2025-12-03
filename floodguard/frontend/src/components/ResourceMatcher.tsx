"use client";

import { useState } from 'react';
import { matchResources } from '@/lib/aiLogic';
import { RefreshCw, CheckCircle, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Data
const MOCK_OFFERS = [
    { id: 'o1', type: 'FOOD', lat: 10.762622, lng: 106.660172 }, // District 1
    { id: 'o2', type: 'MEDICAL', lat: 10.776889, lng: 106.700806 }, // District 2
    { id: 'o3', type: 'SHELTER', lat: 10.754028, lng: 106.663376 }, // District 5
];

const MOCK_REQUESTS = [
    { id: 'r1', type: 'FOOD', lat: 10.762913, lng: 106.682146, urgency: 8, peopleCount: 50 }, // District 3
    { id: 'r2', type: 'MEDICAL', lat: 10.801133, lng: 106.711536, urgency: 10, peopleCount: 20 }, // Binh Thanh
    { id: 'r3', type: 'FOOD', lat: 10.732669, lng: 106.709142, urgency: 5, peopleCount: 100 }, // District 7
];

export default function ResourceMatcher() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleMatch = async () => {
        setLoading(true);
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const results = matchResources(MOCK_OFFERS, MOCK_REQUESTS);
        setMatches(results);
        setLoading(false);
        toast.success(`Found ${results.length} optimal matches`);
    };

    const confirmMatch = (matchId: string) => {
        toast.success("Match confirmed on-chain!");
        // In real app, call suiClient.confirmMatch
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Resource Matching Dashboard</h2>
                <button
                    onClick={handleMatch}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    <RefreshCw className={loading ? "animate-spin" : ""} size={20} />
                    Run AI Matching
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lists */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-600">Available Resources</h3>
                    {MOCK_OFFERS.map(o => (
                        <div key={o.id} className="p-3 bg-white border rounded shadow-sm flex justify-between">
                            <span className="font-medium">{o.type}</span>
                            <span className="text-xs text-gray-500">{o.lat.toFixed(4)}, {o.lng.toFixed(4)}</span>
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    <h3 className="font-semibold text-gray-600">Active Requests</h3>
                    {MOCK_REQUESTS.map(r => (
                        <div key={r.id} className="p-3 bg-white border rounded shadow-sm">
                            <div className="flex justify-between">
                                <span className="font-medium">{r.type}</span>
                                <span className="text-red-500 text-sm font-bold">Urg: {r.urgency}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {r.peopleCount} people • {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results */}
            {matches.length > 0 && (
                <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Optimal Matches (AI Generated)</h3>
                    <div className="grid gap-4">
                        {matches.map((m, idx) => (
                            <div key={idx} className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Truck className="text-green-600" />
                                    </div>
                                    <div>
                                        <div className="font-bold">Offer {m.offerId} ➔ Request {m.requestId}</div>
                                        <div className="text-sm text-green-700">Match Score: {(m.score * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => confirmMatch(`${m.offerId}-${m.requestId}`)}
                                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                                >
                                    <CheckCircle size={16} /> Confirm
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
