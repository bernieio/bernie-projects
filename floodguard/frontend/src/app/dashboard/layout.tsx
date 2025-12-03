"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Image from 'next/image';
import { LayoutDashboard, Package, Zap } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Offer Resources', href: '/dashboard/offer', icon: Package },
        { name: 'Match Engine', href: '/dashboard/match', icon: Zap },
    ];

    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100">
                <div className="container mx-auto px-4 py-8">
                    {/* Dashboard Header */}
                    <div className="flex flex-col items-center mb-8">
                        <Image
                            src="/logo.svg"
                            alt="FloodGuard Logo"
                            width={80}
                            height={80}
                            className="mb-4"
                        />
                        <h1 className="text-3xl font-bold text-gray-800">
                            FloodGuard Operations Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Real-time disaster response coordination
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="bg-white rounded-lg shadow-sm mb-6">
                        <nav className="flex border-b border-gray-200">
                            {tabs.map((tab) => {
                                const isActive = pathname === tab.href;
                                const Icon = tab.icon;

                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={`
                                            flex items-center gap-2 px-6 py-4 font-medium transition-colors
                                            border-b-2 -mb-px
                                            ${isActive
                                                ? 'border-blue-600 text-blue-600'
                                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon size={20} />
                                        {tab.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div>
                        {children}
                    </div>
                </div>
            </div>
        </>
    );
}
