"use client";

import { useState, useEffect } from 'react';
import MapContainer from '@/components/map/MapContainer';
import { fetchDashboardData } from '@/lib/dashboardData';
import { RefreshCw, AlertTriangle, Package, HelpCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiveDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

    const loadData = async (isAutoRefresh = false) => {
        try {
            if (!isAutoRefresh) setLoading(true);

            const newData = await fetchDashboardData();

            // Smart Notifications
            if (isAutoRefresh && data) {
                const newDisasters = newData.disasters.length - data.disasters.length;
                const newOffers = newData.offers.length - data.offers.length;
                const newRequests = newData.requests.length - data.requests.length;

                if (newDisasters > 0) toast.error(`${newDisasters} New Disaster(s) Reported!`, { icon: '🚨', duration: 5000 });
                if (newOffers > 0) toast.success(`${newOffers} New Resource Offer(s)`, { icon: '📦' });
                if (newRequests > 0) toast(`${newRequests} New Resource Request(s)`, { icon: '🆘' });
            } else if (!isAutoRefresh) {
                toast.success('Dashboard updated');
            }

            setData(newData);
            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            if (!isAutoRefresh) toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadData(false);
    }, []);

    // Auto-refresh every 30 seconds (optimized from 10s)
    // ✅ CRITICAL FIX: Removed 'data' dependency to prevent infinite loop
    useEffect(() => {
        const interval = setInterval(() => {
            loadData(true);
        }, 30000); // Increased from 10s to 30s

        return () => clearInterval(interval);
    }, []); // ✅ Empty dependency array - only set up once

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <RefreshCw className="animate-spin mx-auto mb-4 text-blue-600" size={48} />
                    <p className="text-gray-600">Loading dashboard data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Disasters</p>
                            <p className="text-2xl font-bold text-gray-900">{data?.stats.totalDisasters || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Package className="text-green-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Active Offers</p>
                            <p className="text-2xl font-bold text-gray-900">{data?.stats.activeOffers || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <HelpCircle className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{data?.stats.pendingRequests || 0}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity className="text-purple-600" size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Last Update</p>
                            <p className="text-sm font-medium text-gray-900">
                                {lastUpdate.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Live Operations Map</h2>
                    <button
                        onClick={() => loadData(false)}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
                        Refresh
                    </button>
                </div>

                <div className="mb-4 flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span className="text-gray-700">Disasters ({data?.disasters.length || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">Resource Offers ({data?.offers.length || 0})</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">Resource Requests ({data?.requests.length || 0})</span>
                    </div>
                </div>

                <MapContainer
                    disasters={data?.disasters || []}
                    offers={data?.offers || []}
                    requests={data?.requests || []}
                    className="w-full h-[600px]"
                />
            </div>

            {/* Empty State */}
            {data && data.disasters.length === 0 && data.offers.length === 0 && data.requests.length === 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                    <AlertTriangle className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Data Available</h3>
                    <p className="text-gray-600">
                        No disasters, offers, or requests have been registered yet.
                    </p>
                </div>
            )}
        </div>
    );
}
