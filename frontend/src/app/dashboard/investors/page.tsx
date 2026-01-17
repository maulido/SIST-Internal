'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';
import { SystemModal } from '@/components/SystemModal';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

export default function InvestorsPage() {
    const [investors, setInvestors] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { token, isLoading } = useAuth();

    // Drawer State
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'VIEW' | 'DISTRIBUTE'>('CREATE');
    const [selectedInvestor, setSelectedInvestor] = useState<any>(null);
    const [distributeAmount, setDistributeAmount] = useState('');
    const [modal, setModal] = useState<any>({ isOpen: false, type: 'info', message: '' });

    // Form Data
    const [formData, setFormData] = useState({
        userId: '',
        totalInvestment: '',
        sharesParam: ''
    });

    const fetchData = async () => {
        if (token && !isLoading) {
            try {
                const [invRes, userRes] = await Promise.all([
                    axios.get('http://localhost:3000/investors', { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get('http://localhost:3000/users', { headers: { Authorization: `Bearer ${token}` } })
                ]);
                setInvestors(invRes.data);
                setUsers(userRes.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [token, isLoading]);

    // Filter Logic
    const filteredInvestors = investors.filter(inv => {
        const name = (inv.user?.name || '').toLowerCase();
        const email = (inv.user?.email || '').toLowerCase();
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const { currentItems, currentPage, paginate, totalItems } = usePagination(filteredInvestors, 10);

    // ... handlers ...

    const handleOpenCreate = () => {
        setFormData({ userId: '', totalInvestment: '', sharesParam: '' });
        setDrawerMode('CREATE');
        setIsDrawerOpen(true);
    };

    const handleOpenDistribute = () => {
        setDistributeAmount('');
        setDrawerMode('DISTRIBUTE');
        setIsDrawerOpen(true);
    };

    // ... (rest of handlers)

    const handleOpenView = (inv: any) => {
        setSelectedInvestor(inv);
        setDrawerMode('VIEW');
        setIsDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/investors', {
                ...formData,
                totalInvestment: Number(formData.totalInvestment),
                sharesParam: Number(formData.sharesParam)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
            setIsDrawerOpen(false);
            setModal({
                isOpen: true,
                type: 'success',
                message: 'Investor added successfully!'
            });
        } catch (err: any) {
            console.error(err);
            setModal({
                isOpen: true,
                type: 'error',
                message: err.response?.data?.message || 'Failed to add investor'
            });
        }
    };

    const handleDistributeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(distributeAmount);

        if (isNaN(amount) || amount <= 0) {
            setModal({ isOpen: true, type: 'error', message: 'Invalid amount' });
            return;
        }

        // Close drawer first, then show confirm modal
        setIsDrawerOpen(false);

        setModal({
            isOpen: true,
            type: 'confirm',
            message: `Are you sure you want to distribute Rp ${amount.toLocaleString()} to all investors based on their capital share?`,
            onConfirm: async () => {
                try {
                    const res = await axios.post('http://localhost:3000/investors/distribute', { amount }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    const { totalDistributed, distributions } = res.data;
                    let msg = `Successfully distributed Rp ${totalDistributed.toLocaleString()}!`;
                    setModal({
                        isOpen: true,
                        type: 'success',
                        message: msg
                    });

                    fetchData();
                } catch (err: any) {
                    console.error(err);
                    setModal({
                        isOpen: true,
                        type: 'error',
                        message: 'Distribution failed.'
                    });
                }
            }
        });
    };

    const totalManagedFund = investors.reduce((acc, curr) => acc + Number(curr.totalInvestment || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Investor Relations</h3>
                    <p className="text-gray-500">Manage capital and profit sharing</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenDistribute}
                        className="flex items-center gap-2 px-5 py-2.5 border border-violet-500 text-violet-500 rounded-xl font-bold hover:bg-violet-500/10 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Distribute Profit
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 hover:bg-violet-700 transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Investor
                    </button>
                </div>
            </div>

            {/* Total Fund & Search */}
            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 backdrop-blur-sm shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[var(--foreground)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Managed Capital</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">Rp {totalManagedFund.toLocaleString('id-ID')}</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                    type="text"
                    placeholder="Search investors by Name or Email..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-violet-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Investor List */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--foreground)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Investment</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Total Returns</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Share (%)</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {currentItems.map((inv) => {
                                // Calculate Returns (Dividends + Withdrawals)
                                const returns = inv.capitalHistory?.reduce((sum: number, tx: any) => {
                                    return (tx.type === 'CAPITAL_OUT' || tx.type === 'DIVIDEND_PAYOUT') ? sum + Number(tx.amount) : sum;
                                }, 0) || 0;

                                return (
                                    <tr key={inv.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 flex items-center justify-center font-bold text-xs">
                                                    {inv.user?.name?.charAt(0) || 'I'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-[var(--foreground)]">
                                                        <a href={`/dashboard/investors/${inv.id}`} className="hover:text-violet-500 hover:underline">
                                                            {inv.user?.name || 'Unknown'}
                                                        </a>
                                                    </div>
                                                    <div className="text-xs text-gray-500">{inv.user?.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${inv.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {inv.status || 'ACTIVE'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--foreground)] text-right font-mono">
                                            Rp {Number(inv.totalInvestment).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600 text-right font-mono">
                                            Rp {returns.toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] text-right">
                                            {inv.sharesParam}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => handleOpenView(inv)}
                                                className="text-violet-500 hover:text-violet-600 font-medium text-sm transition-colors"
                                            >
                                                View ROI
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {investors.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No investors recorded.
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

            {/* Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={drawerMode === 'CREATE' ? 'Add Investor' : (drawerMode === 'DISTRIBUTE' ? 'Distribute Profit' : 'Investment Analysis')}
            >
                {drawerMode === 'VIEW' ? (
                    <div className="space-y-6">
                        {/* ROI Card */}
                        <div className="p-6 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-lg relative overflow-hidden">
                            <div className="relative z-10 text-center">
                                <p className="text-indigo-200 text-xs uppercase tracking-widest mb-1">Projected ROI (Yearly)</p>
                                <h3 className="text-4xl font-bold">
                                    Rp {(Number(selectedInvestor?.totalInvestment) * 0.15).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                                </h3>
                                <p className="text-xs text-indigo-200 mt-2">Based on conservative 15% return rate</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-[var(--foreground)]">Details</h4>
                            <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                                <span className="text-gray-500">Investor</span>
                                <span className="font-medium text-[var(--foreground)]">{selectedInvestor?.user?.name}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                                <span className="text-gray-500">Principal Investment</span>
                                <span className="font-medium text-[var(--foreground)]">Rp {Number(selectedInvestor?.totalInvestment).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-[var(--card-border)]">
                                <span className="text-gray-500">Equity Share</span>
                                <span className="font-medium text-[var(--foreground)]">{selectedInvestor?.sharesParam}%</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-[var(--background)] border border-[var(--card-border)] text-sm text-gray-500">
                            <p><strong>Note:</strong> ROI calculation is simulated based on current system parameters. Dividends are subject to monthly/yearly profit reporting.</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Select User</label>
                            <select
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all appearance-none"
                                value={formData.userId}
                                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                required
                            >
                                <option value="">-- Choose Account --</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500">User must be registered first.</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Total Investment (Rp)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all font-mono"
                                value={formData.totalInvestment}
                                onChange={e => setFormData({ ...formData, totalInvestment: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Ownership Share (%)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all"
                                value={formData.sharesParam}
                                onChange={e => setFormData({ ...formData, sharesParam: e.target.value })}
                                required
                                step="0.1"
                                max="100"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30"
                            >
                                Register Investment
                            </button>
                        </div>
                    </form>
                )}

                {drawerMode === 'DISTRIBUTE' && (
                    <form onSubmit={handleDistributeSubmit} className="space-y-6">
                        <div className="p-4 bg-violet-50 dark:bg-violet-900/10 rounded-lg border border-violet-100 dark:border-violet-900/30 text-sm text-center">
                            <p className="font-medium text-violet-800 dark:text-violet-300">Profit Distribution</p>
                            <p className="text-violet-600 dark:text-violet-400 mt-1">
                                Profit will be distributed to {investors.length} investors proportional to their share ownership.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Total Profit to Distribute (Rp)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all font-mono"
                                value={distributeAmount}
                                onChange={e => setDistributeAmount(e.target.value)}
                                required
                                min="1"
                                placeholder="0"
                                autoFocus
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30"
                            >
                                Distribute
                            </button>
                        </div>
                    </form>
                )}
            </Drawer>

            <SystemModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                message={modal.message}
                onConfirm={modal.onConfirm}
            />
        </div>
    );
}
