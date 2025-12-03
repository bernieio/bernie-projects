"use client";

import { useState, useEffect } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { getFloodGuardClient, getWalrusClient, getAIRiskService } from '@/lib/singletons';
import { RiskAnalysisResult } from '@/lib/aiRiskService';
import toast from 'react-hot-toast';
import { MapPin, AlertTriangle, Zap, CheckCircle, Upload } from 'lucide-react';
import LocationInput from './location/LocationInput';

// ✅ Use true singletons from centralized location
const walrusClient = getWalrusClient();
const suiClient = getFloodGuardClient();
const aiService = getAIRiskService();

export default function ReportFlood() {
    const account = useCurrentAccount();
    const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction();

    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState({ lat: 0, lng: 0 });
    const [severity, setSeverity] = useState(3);
    const [photo, setPhoto] = useState<File | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<RiskAnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    // AI Analysis on severity/location change
    // ✅ OPTIMIZED: Increased debounce from 1s to 3s
    useEffect(() => {
        const runAnalysis = async () => {
            if (severity > 0 && location.lat !== 0) {
                setAnalyzing(true);
                try {
                    const result = await aiService.analyzeRisk(severity, location);
                    setAiAnalysis(result);
                } catch (e) {
                    console.error("AI Analysis failed", e);
                } finally {
                    setAnalyzing(false);
                }
            }
        };

        const timer = setTimeout(runAnalysis, 3000); // Increased from 1s
        return () => clearTimeout(timer);
    }, [severity, location]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!account) {
            toast.error("Please connect your wallet first");
            return;
        }

        if (!photo) {
            toast.error("Please upload a photo");
            return;
        }

        if (location.lat === 0 && location.lng === 0) {
            toast.error("Please enter a valid location");
            return;
        }

        setLoading(true);

        try {
            // Step 1: Upload to Walrus
            toast.loading("Uploading evidence to Walrus...", { id: 'upload' });
            const blobId = await walrusClient.uploadBlob(photo);

            console.log('Uploaded to Walrus. Blob ID:', blobId);
            toast.success("Evidence uploaded to Walrus!", { id: 'upload' });

            // Step 2: Format location
            const locationStr = `${location.lat.toFixed(6)},${location.lng.toFixed(6)}`;

            // Step 3: Register disaster
            const disasterTx = await suiClient.registerDisaster({
                location: locationStr,
                severity,
                walrusBlobId: blobId,
            });

            // Step 4: Execute transaction
            toast.loading("Registering disaster on-chain...", { id: 'upload' });

            const result = await signAndExecute({ transaction: disasterTx });
            toast.success(`Disaster registered! ID: ${result.digest.slice(0, 8)}...`, { id: 'upload' });

            // Reset form
            setSeverity(1);
            setPhoto(null);
            setAiAnalysis(null);

        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to submit report", { id: 'upload' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <AlertTriangle className="text-red-500" />
                Report Flood Disaster
            </h2>

            {!account && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-medium">⚠️ Please connect your wallet to submit a disaster report</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Location Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="inline-block w-4 h-4 mr-1" />
                        Location
                    </label>
                    <LocationInput
                        onLocationChange={(lat, lng) => setLocation({ lat, lng })}
                        initialLat={location.lat || undefined}
                        initialLng={location.lng || undefined}
                    />
                </div>

                {/* Severity Slider */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <AlertTriangle className="inline-block w-4 h-4 mr-1" />
                        Severity Level: {severity}
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="5"
                        value={severity}
                        onChange={(e) => setSeverity(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Minor</span>
                        <span>Critical</span>
                    </div>
                </div>

                {/* AI Analysis Section */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                        <Zap size={16} className="text-purple-500" />
                        AI Risk Assessment
                    </h4>

                    {analyzing ? (
                        <div className="flex items-center gap-2 text-sm text-gray-500 animate-pulse">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                            Analyzing satellite & sensor data...
                        </div>
                    ) : aiAnalysis ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Risk Score</span>
                                <span className={`text-lg font-bold ${aiAnalysis.level === 'CRITICAL' ? 'text-red-600' :
                                        aiAnalysis.level === 'HIGH' ? 'text-orange-500' :
                                            'text-blue-600'
                                    }`}>
                                    {aiAnalysis.score}/100 ({aiAnalysis.level})
                                </span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-500 ${aiAnalysis.level === 'CRITICAL' ? 'bg-red-500' :
                                            aiAnalysis.level === 'HIGH' ? 'bg-orange-500' :
                                                'bg-blue-500'
                                        }`}
                                    style={{ width: `${aiAnalysis.score}%` }}
                                />
                            </div>

                            <div className="space-y-1">
                                {aiAnalysis.factors.map((factor: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                                        <CheckCircle size={10} className="text-green-500" />
                                        {factor}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 italic">
                            Select location and severity to generate AI analysis.
                        </p>
                    )}
                </div>

                {/* Photo Upload */}
                <div className="space-y-2">
                    <label className="flex items-center gap-2 font-medium">
                        <Upload size={18} /> Evidence Photo
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setPhoto(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    {photo && (
                        <p className="text-sm text-green-600">✓ {photo.name} selected</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading || !account}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Processing...' : !account ? 'Connect Wallet First' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
}
