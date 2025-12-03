"use client";

import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
    const account = useCurrentAccount();

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <Image src="/logo.svg" alt="FloodGuard Logo" width={40} height={40} />
                        <h1 className="text-xl font-bold text-gray-800">FloodGuard Protocol</h1>
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link href="/report" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Report
                        </Link>
                        <Link href="/dashboard" className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors">
                            Dashboard
                        </Link>

                        <div className="ml-4">
                            <ConnectButton />
                        </div>
                    </nav>
                </div>

                {account && (
                    <div className="mt-2 text-sm text-gray-600">
                        Connected: <span className="font-mono text-blue-600">{account.address.slice(0, 8)}...{account.address.slice(-6)}</span>
                    </div>
                )}
            </div>
        </header>
    );
}
