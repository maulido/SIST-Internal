'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function ReportsPage() {
    const { token, isLoading } = useAuth();
    const [pnl, setPnl] = useState<any>(null);
    const [bs, setBs] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'PNL' | 'BALANCE'>('PNL');

    useEffect(() => {
        if (token && !isLoading) {
            axios.get('http://localhost:3000/reports/pnl', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setPnl(res.data)).catch(console.error);

            axios.get('http://localhost:3000/reports/balance-sheet', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setBs(res.data)).catch(console.error);
        }
    }, [token, isLoading]);

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
            alert('Failed to export report');
        }
    };

    if (!pnl || !bs) return (
        <div className="flex h-[50vh] items-center justify-center space-x-2 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-[var(--primary)]"></div>
            <div className="w-4 h-4 rounded-full bg-[var(--primary)] delay-75"></div>
            <div className="w-4 h-4 rounded-full bg-[var(--primary)] delay-150"></div>
            <span className="text-[var(--primary)] font-medium">Generating Financial Reports...</span>
        </div>
    );

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
            </div>

            {/* Content */}
            <div className={`space-y-6 ${activeTab === 'PNL' ? 'block' : 'hidden print:block'}`}>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm backdrop-blur-sm print:border-none print:shadow-none">
                    <div className="text-center mb-8 pb-4 border-b border-[var(--card-border)] border-dashed">
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">Profit & Loss Statement</h2>
                        <p className="text-gray-500 text-sm">Period: Current Fiscal Year</p>
                    </div>

                    <div className="space-y-4 max-w-2xl mx-auto">
                        {/* Revenue Section */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-widest">Revenue</h4>
                            <div className="flex justify-between items-center py-2 border-b border-[var(--card-border)]">
                                <span className="text-[var(--foreground)]">Gross Sales</span>
                                <span className="font-mono font-medium text-[var(--foreground)]">Rp {pnl.revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-[var(--card-border)]">
                                <span className="text-gray-500">Cost of Goods Sold (COGS)</span>
                                <span className="font-mono font-medium text-red-500">- Rp {pnl.cogs.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center py-3 bg-[var(--foreground)]/5 px-4 rounded-lg mt-2">
                                <span className="font-bold text-[var(--foreground)]">Gross Profit</span>
                                <span className="font-mono font-bold text-[var(--foreground)]">Rp {pnl.grossProfit.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Operational Expenses */}
                        <div className="space-y-2 pt-6">
                            <h4 className="text-sm font-bold text-orange-500 uppercase tracking-widest">Operational Expenses</h4>
                            {Object.entries(pnl.expenseBreakdown).map(([cat, amount]) => (
                                <div key={cat} className="flex justify-between items-center py-2 border-b border-[var(--card-border)] border-dashed">
                                    <span className="text-gray-500">{cat}</span>
                                    <span className="font-mono text-gray-600 dark:text-gray-400">Rp {(amount as number).toLocaleString()}</span>
                                </div>
                            ))}
                            {Object.keys(pnl.expenseBreakdown).length === 0 && <p className="text-gray-500 text-sm italic py-2">No expenses recorded.</p>}
                        </div>

                        {/* Net Income */}
                        <div className="pt-8">
                            <div className={`flex justify-between items-center py-4 px-6 rounded-xl border-2 ${pnl.netProfit >= 0 ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'}`}>
                                <div>
                                    <span className="block text-sm font-bold uppercase tracking-widest opacity-70">Net Income</span>
                                    <span className="text-xs opacity-60">Before Tax</span>
                                </div>
                                <span className={`font-mono text-2xl font-bold ${pnl.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    Rp {pnl.netProfit.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className={`space-y-6 ${activeTab === 'BALANCE' ? 'block' : 'hidden print:block print:mt-10'}`}>
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-8 shadow-sm backdrop-blur-sm print:border-none print:shadow-none">
                    <div className="text-center mb-8 pb-4 border-b border-[var(--card-border)] border-dashed">
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">Balance Sheet</h2>
                        <p className="text-gray-500 text-sm">As of {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        {/* Assets */}
                        <div>
                            <h4 className="text-lg font-bold text-[var(--primary)] border-b-2 border-[var(--primary)] pb-2 mb-4">Assets</h4>

                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-500 mb-2">Current Assets</h5>
                                    <div className="flex justify-between py-1 border-b border-[var(--card-border)] border-dashed">
                                        <span className="text-[var(--foreground)]">Cash on Hand</span>
                                        <span className="font-mono text-[var(--foreground)]">Rp {bs.assets.cash.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[var(--card-border)] border-dashed">
                                        <span className="text-[var(--foreground)]">Inventory</span>
                                        <span className="font-mono text-[var(--foreground)]">Rp {bs.assets.inventory.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h5 className="text-sm font-semibold text-gray-500 mb-2">Fixed Assets</h5>
                                    <div className="flex justify-between py-1 border-b border-[var(--card-border)] border-dashed">
                                        <span className="text-[var(--foreground)]">Equipment & Machinery</span>
                                        <span className="font-mono text-[var(--foreground)]">Rp {bs.assets.fixedAssets.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between py-3 bg-[var(--foreground)]/5 px-4 rounded-lg mt-6">
                                    <span className="font-bold text-[var(--foreground)]">Total Assets</span>
                                    <span className="font-mono font-bold text-[var(--foreground)]">Rp {bs.assets.total.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Liabilities & Equity */}
                        <div>
                            <h4 className="text-lg font-bold text-[var(--secondary)] border-b-2 border-[var(--secondary)] pb-2 mb-4">Liabilities & Equity</h4>

                            <div className="space-y-4">
                                <div>
                                    <h5 className="text-sm font-semibold text-gray-500 mb-2">Liabilities</h5>
                                    <div className="flex justify-between py-1 border-b border-[var(--card-border)] border-dashed">
                                        <span className="text-[var(--foreground)]">Accounts Payable</span>
                                        <span className="font-mono text-[var(--foreground)]">Rp {bs.liabilities.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <h5 className="text-sm font-semibold text-gray-500 mb-2">Equity</h5>
                                    <div className="flex justify-between py-1 border-b border-[var(--card-border)] border-dashed">
                                        <span className="text-[var(--foreground)]">Owner's Capital</span>
                                        <span className="font-mono text-[var(--foreground)]">Rp {bs.equity.capital.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between py-1 border-b border-[var(--card-border)] border-dashed">
                                        <span className="text-[var(--foreground)]">Retained Earnings</span>
                                        <span className="font-mono text-[var(--foreground)]">Rp {bs.equity.retainedEarnings.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex justify-between py-3 bg-[var(--foreground)]/5 px-4 rounded-lg mt-6">
                                    <span className="font-bold text-[var(--foreground)]">Total Liabilities & Equity</span>
                                    <span className="font-mono font-bold text-[var(--foreground)]">Rp {(bs.liabilities.total + bs.equity.total).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
