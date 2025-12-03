import Image from "next/image";
import Link from "next/link";
import { Shield, AlertTriangle, TrendingUp, Package, Zap } from "lucide-react";
import Header from "@/components/Header";
import ContractStats from "@/components/ContractStats";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <Image src="/logo.svg" alt="FloodGuard Logo" width={120} height={120} />
          </div>

          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Decentralized Disaster Response
          </h2>

          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            AI-powered resource matching on Sui blockchain with Walrus storage.
            Transparent, efficient, and trustless disaster relief coordination.
          </p>

          {/* Contract Stats */}
          <ContractStats />

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            <Link
              href="/report"
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <AlertTriangle size={20} />
              Report Disaster
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 bg-white text-blue-600 font-bold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              View Dashboard
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Shield className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Blockchain Verified</h3>
              <p className="text-gray-600">
                All disaster reports and resource allocations are permanently recorded on Sui blockchain
              </p>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Package className="text-green-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Matching</h3>
              <p className="text-gray-600">
                AI-powered algorithm matches resource offers with requests based on location and urgency
              </p>
              <Link
                href="/dashboard/offer"
                className="mt-3 inline-block text-green-600 hover:text-green-700 font-medium"
              >
                Offer Resources →
              </Link>
            </div>

            <div className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Zap className="text-purple-600" size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Coordination</h3>
              <p className="text-gray-600">
                Live dashboard with automatic updates ensures rapid response to evolving situations
              </p>
              <Link
                href="/dashboard/match"
                className="mt-3 inline-block text-purple-600 hover:text-purple-700 font-medium"
              >
                View Matches →
              </Link>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-20 p-8 bg-white rounded-xl shadow-md">
            <h3 className="text-2xl font-bold mb-6">Built With</h3>
            <div className="flex flex-wrap justify-center gap-6 text-gray-700">
              <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Sui Blockchain</div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Walrus Storage</div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Next.js 16</div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium">TypeScript</div>
              <div className="px-4 py-2 bg-gray-100 rounded-lg font-medium">AI Algorithms</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-gray-200">
        <div className="text-center text-gray-600">
          <p>FloodGuard Protocol - Phase 2 Implementation</p>
          <p className="text-sm mt-2">Decentralized Disaster Response System</p>
        </div>
      </footer>
    </div>
  );
}
