import Header from '@/components/Header';
import Image from 'next/image';
import ReportFloodWrapper from '@/components/ReportFloodWrapper';

export default function ReportPage() {
    return (
        <>
            <Header />
            <div className="min-h-screen bg-gray-100 py-12">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col items-center mb-8">
                        <Image src="/logo.svg" alt="FloodGuard Logo" width={80} height={80} className="mb-4" />
                        <h1 className="text-3xl font-bold text-gray-800">Disaster Reporting Center</h1>
                    </div>
                    <ReportFloodWrapper />
                </div>
            </div>
        </>
    );
}
