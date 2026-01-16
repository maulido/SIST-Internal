'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [filterType, setFilterType] = useState('ALL');
    const { token, isLoading } = useAuth();

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);

    useEffect(() => {
        if (token && !isLoading) {
            axios.get('http://localhost:3000/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setTransactions(res.data);
                    setFilteredTransactions(res.data);
                })
                .catch(err => console.error(err));
        }
    }, [token, isLoading]);

    useEffect(() => {
        if (filterType === 'ALL') {
            setFilteredTransactions(transactions);
        } else {
            setFilteredTransactions(transactions.filter(tx => tx.type === filterType));
        }
    }, [filterType, transactions]);

    const handleRowClick = (tx: any) => {
        setSelectedTx(tx);
        setIsDrawerOpen(true);
    };

    const exportToCSV = () => {
        if (!transactions.length) return;
        const headers = ['Date', 'Type', 'Description', 'Amount', 'Payment Method'].join(',');
        const rows = transactions.map(tx => [
            new Date(tx.createdAt || tx.date).toISOString(),
            tx.type,
            `"${tx.description || ''}"`,
            tx.amount,
            tx.paymentMethod
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const getStatusColor = (type: string) => {
        switch (type) {
            case 'SALE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'EXPENSE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
            case 'CAPITAL_IN': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            case 'CAPITAL_OUT': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Transactions</h3>
                    <p className="text-gray-500">History of all financial activities</p>
                </div>
                <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/5 transition-colors shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Export CSV
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {['ALL', 'SALE', 'EXPENSE', 'CAPITAL_IN', 'CAPITAL_OUT'].map(type => (
                    <button
                        key={type}
                        onClick={() => setFilterType(type)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border
                            ${filterType === type
                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary)]/20'
                                : 'bg-[var(--card-bg)] text-gray-500 border-[var(--card-border)] hover:bg-[var(--foreground)]/5'}
                        `}
                    >
                        {type === 'ALL' ? 'All Transactions' : type.replace('_', ' ')}
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--foreground)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {filteredTransactions.map((tx) => (
                                <tr
                                    key={tx.id}
                                    onClick={() => handleRowClick(tx)}
                                    className="hover:bg-[var(--foreground)]/5 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                                        <div className="font-medium">{new Date(tx.createdAt || tx.date).toLocaleDateString()}</div>
                                        <div className="text-xs text-gray-500">{new Date(tx.createdAt || tx.date).toLocaleTimeString()}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-bold border ${getStatusColor(tx.type)}`}>
                                            {tx.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--foreground)] max-w-xs truncate">
                                        {tx.description || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {tx.paymentMethod || 'CASH'}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right font-mono
                                        ${tx.amount > 0 ? 'text-green-500' : 'text-red-500'}
                                    `}>
                                        {tx.amount > 0 ? '+' : ''} Rp {Math.abs(tx.amount).toLocaleString('id-ID')}
                                    </td>
                                </tr>
                            ))}
                            {filteredTransactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-4 opacity-50">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                            <p>No transactions found for this filter.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transaction Detail Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Transaction Details"
            >
                <div className="space-y-6">
                    <div className={`p-6 rounded-xl border text-center ${getStatusColor(selectedTx?.type)}`}>
                        <p className="text-sm opacity-80 uppercase tracking-widest">{selectedTx?.type}</p>
                        <h3 className="text-3xl font-bold mt-2">
                            {selectedTx?.amount > 0 ? '+' : '-'} Rp {Math.abs(selectedTx?.amount || 0).toLocaleString('id-ID')}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Description</label>
                            <p className="text-sm font-medium text-[var(--foreground)] mt-1">{selectedTx?.description || 'No description found'}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Date</label>
                                <p className="text-sm font-medium text-[var(--foreground)] mt-1">
                                    {selectedTx ? new Date(selectedTx.createdAt || selectedTx.date).toLocaleDateString() : ''}
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</label>
                                <p className="text-sm font-medium text-[var(--foreground)] mt-1">{selectedTx?.paymentMethod || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                            <label className="text-xs text-gray-500 uppercase tracking-wide">Transaction ID</label>
                            <p className="text-xs font-mono text-gray-500 mt-1 break-all">{selectedTx?.id}</p>
                        </div>
                    </div>

                    {selectedTx?.items && selectedTx.items.length > 0 && (
                        <div className="border-t border-[var(--card-border)] pt-4">
                            <h4 className="font-bold text-[var(--foreground)] mb-3">Items</h4>
                            <div className="space-y-2">
                                {selectedTx.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-gray-500">{item.quantity}x {item.productName || 'Product'}</span>
                                        <span className="text-[var(--foreground)]">Rp {item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>
        </div>
    );
}
