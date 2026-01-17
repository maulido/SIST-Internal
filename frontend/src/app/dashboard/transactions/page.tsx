'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';
import { ReceiptModal } from '@/components/ReceiptModal';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const { token, isLoading, user } = useAuth();

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<any>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

    useEffect(() => {
        if (token && !isLoading) {
            axios.get('http://localhost:3000/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setTransactions(res.data);
                })
                .catch(err => console.error(err));
        }
    }, [token, isLoading]);

    // Filter Logic
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = (tx.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (tx.paymentMethod || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || tx.type === filterType;
        return matchesSearch && matchesType;
    });

    const { currentItems, currentPage, paginate, totalItems } = usePagination(filteredTransactions, 10);

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

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
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
                            {type === 'ALL' ? 'All' : type.replace('_', ' ')}
                        </button>
                    ))}
                </div>
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
                            {currentItems.map((tx) => (
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
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={paginate}
                />
            </div>

            {/* Transaction Detail Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title="Transaction Details"
                width="max-w-xl"
            >
                <div className="space-y-8 printable-receipt p-4">
                    {/* Header Receipt Style */}
                    <div className="text-center space-y-2 pb-6 border-b border-dashed border-[var(--card-border)]">
                        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${selectedTx?.type === 'SALE' ? 'bg-green-100 text-green-600 dark:bg-green-900/30' :
                            selectedTx?.type === 'EXPENSE' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                                'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                            }`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                                {selectedTx?.type === 'SALE' ? <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v2.251L2.25 18.75" /> :
                                    selectedTx?.type === 'EXPENSE' ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /> :
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />}
                            </svg>
                        </div>
                        <h2 className={`text-4xl font-bold font-mono tracking-tight ${selectedTx?.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                            {selectedTx?.amount > 0 ? '+' : ''} Rp {Math.abs(selectedTx?.amount || 0).toLocaleString('id-ID')}
                        </h2>
                        <div className="flex justify-center gap-2 text-sm text-gray-500 uppercase tracking-widest font-medium mt-2">
                            <span>{new Date(selectedTx?.createdAt || selectedTx?.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{new Date(selectedTx?.createdAt || selectedTx?.date).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-xs font-mono text-gray-400 mt-1 select-all">
                            ID: {selectedTx?.id}
                        </div>

                        {/* Print Button - Hidden when printing */}
                        <div className="pt-4 print:hidden flex gap-3 justify-center">
                            <button
                                onClick={() => setIsReceiptModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 rounded-lg text-sm font-medium transition-colors shadow-sm"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v4.072c0 .621.504 1.125 1.125 1.125h4.072c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H3.375zm6.975 0c-.621 0-1.125.504-1.125 1.125v4.072c0 .621.504 1.125 1.125 1.125h4.072c.621 0 1.125-.504 1.125-1.125V6.375c0-.621-.504-1.125-1.125-1.125H10.35zM3.375 13.5c-.621 0-1.125.504-1.125 1.125v4.072c0 .621.504 1.125 1.125 1.125h4.072c.621 0 1.125-.504 1.125-1.125V14.625c0-.621-.504-1.125-1.125-1.125H3.375z" />
                                </svg>
                                Struk Digital
                            </button>

                            <button
                                onClick={() => window.print()}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-[var(--foreground)] rounded-lg text-sm font-medium transition-colors border border-[var(--card-border)]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                                </svg>
                                Print Basic Receipt
                            </button>
                        </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] print:border-none print:p-0">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Payment Method</label>
                            <p className="font-medium text-[var(--foreground)]">{selectedTx?.paymentMethod || 'CASH'}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] print:border-none print:p-0">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Processed By</label>
                            <p className="font-medium text-[var(--foreground)] truncate">
                                {selectedTx?.creator?.name || selectedTx?.creator?.email || 'System/Admin'}
                            </p>
                        </div>
                        {selectedTx?.investor && (
                            <div className="col-span-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 print:bg-transparent print:border-none print:p-0">
                                <label className="text-xs text-blue-500 uppercase tracking-wide font-semibold block mb-1">Investor</label>
                                <p className="font-medium text-blue-700 dark:text-blue-300 print:text-black">{selectedTx.investor.name}</p>
                            </div>
                        )}
                        <div className="col-span-2 p-3 rounded-xl bg-[var(--background)] border border-[var(--card-border)] print:border-none print:p-0">
                            <label className="text-xs text-gray-500 uppercase tracking-wide font-semibold block mb-1">Description</label>
                            <p className="font-medium text-[var(--foreground)]">{selectedTx?.description || '-'}</p>
                        </div>
                    </div>

                    {/* Items Section */}
                    {selectedTx?.items && selectedTx.items.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="font-bold text-[var(--foreground)] border-l-4 border-[var(--primary)] pl-3 print:border-none print:pl-0">Items</h4>
                            <div className="rounded-xl border border-[var(--card-border)] overflow-hidden print:border-none">
                                <table className="w-full text-sm">
                                    <thead className="bg-[var(--foreground)]/5 print:bg-transparent print:border-b print:border-dashed print:border-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold text-gray-500 print:text-black print:px-0">Item</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-500 print:text-black print:px-0">Qty</th>
                                            <th className="px-4 py-3 text-right font-semibold text-gray-500 print:text-black print:px-0">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[var(--card-border)] bg-[var(--background)] print:bg-transparent print:divide-gray-200">
                                        {selectedTx.items.map((item: any, idx: number) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 print:px-0">
                                                    <div className="font-medium text-[var(--foreground)] print:text-black">{item.product?.name || item.productName || 'Product'}</div>
                                                    <div className="text-[10px] text-gray-500 print:text-gray-600">
                                                        {item.product?.sku}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-[var(--foreground)] print:text-black print:px-0">
                                                    {item.quantity} x Rp {(item.priceAtTime || item.price || 0).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-medium text-[var(--foreground)] print:text-black print:px-0">
                                                    Rp {(item.subtotal || (item.price * item.quantity)).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-[var(--foreground)]/5 border-t border-[var(--card-border)] font-bold print:bg-transparent print:border-t-2 print:border-gray-800">
                                        {/* Calculation Logic */}
                                        {(() => {
                                            const subtotal = selectedTx.items.reduce((acc: number, item: any) => {
                                                const val = item.subtotal || (Number(item.price) * Number(item.quantity));
                                                return acc + Number(val);
                                            }, 0);
                                            const total = Math.abs(Number(selectedTx.amount));
                                            const taxAndFees = total - subtotal;

                                            // Handle floating point precision issues
                                            const normalizedTax = Math.round(taxAndFees * 100) / 100;

                                            return (
                                                <>
                                                    <tr>
                                                        <td colSpan={2} className="px-4 py-2 text-right text-gray-500 print:px-0 print:text-black font-normal">Subtotal</td>
                                                        <td className="px-4 py-2 text-right text-[var(--foreground)] print:px-0 print:text-black">
                                                            Rp {subtotal.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                    {normalizedTax > 1 && (
                                                        <tr>
                                                            <td colSpan={2} className="px-4 py-2 text-right text-gray-500 print:px-0 print:text-black font-normal">Tax & Fees</td>
                                                            <td className="px-4 py-2 text-right text-[var(--foreground)] print:px-0 print:text-black">
                                                                Rp {normalizedTax.toLocaleString('id-ID')}
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr className="border-t border-[var(--card-border)] print:border-t print:border-dashed print:border-gray-800">
                                                        <td colSpan={2} className="px-4 py-3 text-right text-[var(--foreground)] print:px-0 print:text-black uppercase">Total</td>
                                                        <td className="px-4 py-3 text-right text-[var(--foreground)] print:px-0 print:text-black text-lg">
                                                            Rp {total.toLocaleString('id-ID')}
                                                        </td>
                                                    </tr>
                                                </>
                                            );
                                        })()}
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Profit Analysis (Owner Only) - Hidden on Print */}
                    {(user?.role === 'OWNER' || user?.role === 'ADMIN') && selectedTx?.type === 'SALE' && selectedTx?.items?.length > 0 && (
                        <div className="print:hidden bg-emerald-50 dark:bg-emerald-900/10 rounded-xl p-5 border border-emerald-100 dark:border-emerald-900/30">
                            <h4 className="text-emerald-800 dark:text-emerald-400 font-bold mb-3 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Profit Analysis (Admin/Owner)
                            </h4>
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-emerald-600 dark:text-emerald-500 uppercase tracking-wide">Total Cost (COGS)</div>
                                    <div className="font-mono font-medium text-emerald-900 dark:text-emerald-300">
                                        Rp {selectedTx.items.reduce((acc: number, item: any) => acc + (Number(item.product?.cost || 0) * Number(item.quantity)), 0).toLocaleString('id-ID')}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-emerald-600 dark:text-emerald-500 uppercase tracking-wide">Net Profit</div>
                                    <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                        Rp {(selectedTx.items.reduce((acc: number, item: any) => {
                                            const sub = item.subtotal || (Number(item.price) * Number(item.quantity));
                                            return acc + (Number(sub) - (Number(item.product?.cost || 0) * Number(item.quantity)));
                                        }, 0)).toLocaleString('id-ID')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Drawer>

            <ReceiptModal
                isOpen={isReceiptModalOpen && !!selectedTx}
                onClose={() => setIsReceiptModalOpen(false)}
                transaction={selectedTx}
            />
        </div>
    );
}
