"use client";

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getFloodGuardClient, getResourceMatcher } from '@/lib/singletons';
import { MatchProposal } from '@/lib/matchingEngine';
import toast from 'react-hot-toast';
import { Heart, MapPin, AlertCircle, CheckCircle, Loader2, Zap, ArrowRight } from 'lucide-react';

// ✅ Use singletons from centralized location
const suiClient = getFloodGuardClient();
const matcher = getResourceMatcher();

export default function MatchDashboard() {
    const account = useCurrentAccount();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

    const [matches, setMatches] = useState<MatchProposal[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchMatches = async (isAutoRefresh = false) => {
        if (!account) return;

        try {
            if (!isAutoRefresh) setLoading(true);

            // Use MatchingEngine's findMatches method
            const results = await matcher.findMatches(account.address);

            setMatches(results);
        } catch (error) {
            console.error("Error finding matches:", error);
            if (!isAutoRefresh) toast.error("Failed to find matches");
        } finally {
            setLoading(false);
        }
    };

    // ✅ OPTIMIZED: Increased from 15s to 30s
    useEffect(() => {
        if (account) {
            fetchMatches(false);

            const interval = setInterval(() => {
                fetchMatches(true);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [account]);

    const handleMatch = async (proposal: MatchProposal) => {
        if (!account) return;
        setProcessingId(proposal.offerId + proposal.requestId);

        try {
            toast.loading("Creating match on blockchain...", { id: 'match' });

            const tx = await suiClient.createMatch(proposal.offerId, proposal.requestId);

            signAndExecute(
                { transaction: tx },
                {
                    onSuccess: (result) => {
                        toast.success(`Match created! Tx: ${result.digest.slice(0, 8)}...`, { id: 'match' });
                        setMatches(prev => prev.filter(m => m.offerId !== proposal.offerId));
                        setProcessingId(null);
                    },
                    onError: (error) => {
                        console.error("Match error:", error);
                        toast.error(`Match failed: ${error.message}`, { id: 'match' });
                        setProcessingId(null);
                    }
                }
            );
        } catch (error: any) {
            console.error("Match error:", error);
            toast.error(`Match failed: ${error.message}`, { id: 'match' });
            setProcessingId(null);
        }
    };

    const getResourceLabel = (type: number) => {
        const labels = ['Food', 'Water', 'Medical', 'Shelter', 'Transportation', 'Rescue', 'Communication'];
        return labels[type] || 'Unknown';
    };

    if (!account) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-600">Please connect your wallet to view matches.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Zap className="text-yellow-500" />
                    Resource Matching Engine
                </h1>
                <button
                    onClick={() => fetchMatches(false)}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    {loading ? 'Scanning...' : 'Refresh Matches'}
                </button>
            </div>

            {matches.length === 0 && !loading ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">All Clear!</h3>
                    <p className="text-gray-500">No pending matches found for your resources.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {matches.map((match) => (
                        <div
                            key={match.offerId + match.requestId}
                            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                            {getResourceLabel(match.resourceType)}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${match.score > 80 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            Score: {match.score}%
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">{match.offerQuantity}</span>
                                            <span>Offered</span>
                                        </div>
                                        <ArrowRight size={16} className="text-gray-400" />
                                        <div className="flex items-center gap-1">
                                            <span className="font-bold">{match.requestQuantity}</span>
                                            <span>Requested</span>
                                        </div>
                                    </div>

                                    <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14} /> {match.distance} km away
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <AlertCircle size={14} /> Urgency: {match.urgency}/5
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleMatch(match)}
                                    disabled={!!processingId}
                                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    {processingId === match.offerId + match.requestId ? (
                                        <>Processing...</>
                                    ) : (
                                        <>
                                            <Zap size={18} />
                                            Execute Match
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
