"use client";

import { useEffect, useState } from 'react';
import { getFloodGuardClient } from '@/lib/singletons';
import { Package, AlertTriangle, Activity } from 'lucide-react';

// ✅ Use singleton from centralized location
const floodGuardClient = getFloodGuardClient();

export default function ContractStats() {
    const [stats, setStats] = useState({
        totalDisasters: 0,
        totalMatches: 0,
        isPaused: false,
        loading: true
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [disasters, matches, paused] = await Promise.all([
                    floodGuardClient.getTotalDisasters(),
                    floodGuardClient.getTotalMatches(),
                    floodGuardClient.isPaused()
                ]);

                setStats({
                    totalDisasters: disasters,
                    totalMatches: matches,
                    isPaused: paused,
                    loading: false
                });
            } catch (error) {
                console.error('Failed to fetch stats:', error);
                setStats(prev => ({ ...prev, loading: false }));
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    if (stats.loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map(i => (
                    <div key={i} className="p-4 bg-white rounded-lg shadow animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 rounded-full">
                        <AlertTriangle className="text-red-600" size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">Total Disasters</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalDisasters}</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 rounded-full">
                        <Package className="text-green-600" size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">Total Matches</span>
                </div>
                <p className="text-3xl font-bold text-gray-900">{stats.totalMatches}</p>
            </div>

            <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${stats.isPaused ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                        <Activity className={stats.isPaused ? 'text-yellow-600' : 'text-blue-600'} size={20} />
                    </div>
                    <span className="text-gray-600 font-medium">System Status</span>
                </div>
                <p className={`text-2xl font-bold ${stats.isPaused ? 'text-yellow-600' : 'text-green-600'}`}>
                    {stats.isPaused ? 'Paused' : 'Active'}
                </p>
            </div>
        </div>
    );
}
