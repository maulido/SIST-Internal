'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { IncomeStatement } from '@/components/dashboard/reports/IncomeStatement';
import { BalanceSheet } from '@/components/dashboard/reports/BalanceSheet';
import { CashFlowStatement } from '@/components/dashboard/reports/CashFlowStatement';
import { SystemModal } from '@/components/SystemModal';

export default function ReportsPage() {
    const { token, isLoading } = useAuth();
    const [pnl, setPnl] = useState<any>(null);
    const [bs, setBs] = useState<any>(null);
    const [cf, setCf] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'PNL' | 'BALANCE' | 'CASH'>('PNL');
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'confirm' | 'info'; message: string }>({ isOpen: false, type: 'info', message: '' });

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (token && !isLoading) {
            Promise.allSettled([
                axios.get('http://localhost:3000/reports/pnl', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:3000/reports/balance-sheet', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:3000/reports/cash-flow', { headers: { Authorization: `Bearer ${token}` } })
            ]).then((results) => {
                const [pnlRes, bsRes, cfRes] = results;

                if (pnlRes.status === 'fulfilled') setPnl(pnlRes.value.data);
                else console.error('PnL Failed', pnlRes.reason);

                if (bsRes.status === 'fulfilled') setBs(bsRes.value.data);
                else console.error('BS Failed', bsRes.reason);

                if (cfRes.status === 'fulfilled') setCf(cfRes.value.data);
                else console.error('CF Failed', cfRes.reason);
            }).catch(err => setError(err.message));
        }
    }, [token, isLoading]);

    // ... export logic ...

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:3000/reports/export', {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob', // Important for binary files
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Financial_Report.xlsx'); // Filename matches backend
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Export failed:', error);
            setModal({ isOpen: true, type: 'error', message: 'Failed to export report. Please try again.' });
        }
    };

    if (isLoading) return (
        <div className="flex h-[50vh] items-center justify-center space-x-2 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-[var(--primary)]"></div>
            <div className="w-4 h-4 rounded-full bg-[var(--primary)] delay-75"></div>
            <div className="w-4 h-4 rounded-full bg-[var(--primary)] delay-150"></div>
            <span className="text-[var(--primary)] font-medium">Loading...</span>
        </div>
    );

    if (error) return <div className="p-8 text-red-500">Error loading reports: {error}</div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto print:max-w-none">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Financial Statements</h3>
                    <p className="text-gray-500">Real-time business performance overview</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={handleExportExcel}
                        className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/5 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Export Excel
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90 transition-colors text-sm font-medium flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                        </svg>
                        Print PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[var(--card-border)] print:hidden">
                <button
                    onClick={() => setActiveTab('PNL')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'PNL' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-[var(--foreground)]'}`}
                >
                    Profit & Loss
                </button>
                <button
                    onClick={() => setActiveTab('BALANCE')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'BALANCE' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-[var(--foreground)]'}`}
                >
                    Balance Sheet
                </button>
                <button
                    onClick={() => setActiveTab('CASH')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'CASH' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-gray-500 hover:text-[var(--foreground)]'}`}
                >
                    Cash Flow
                </button>
            </div>

            {/* Content */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm backdrop-blur-sm print:border-none print:shadow-none print:p-0">
                <div className={activeTab === 'PNL' ? 'block' : 'hidden print:block print:mb-12'}>
                    <IncomeStatement data={pnl} />
                </div>
                <div className={activeTab === 'BALANCE' ? 'block' : 'hidden print:block print:mb-12'}>
                    <BalanceSheet data={bs} />
                </div>
                <div className={activeTab === 'CASH' ? 'block' : 'hidden print:block'}>
                    <CashFlowStatement data={cf} />
                </div>
            </div>

            <SystemModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                message={modal.message}
            />
        </div>
    );
}
