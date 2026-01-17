'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';
import { Drawer } from '@/components/Drawer';
import { SystemModal } from '@/components/SystemModal';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CapitalGrowthChart({ history }: { history: any[], initialInvestment: number }) {
    if (!history || history.length === 0) return <div className="h-full w-full flex items-center justify-center text-gray-400">No data available</div>;

    // Process data: sort by date, then calculate cumulative total
    const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningTotal = 0;

    const data = sortedHistory.map(item => {
        const amount = Number(item.amount);
        if (item.type === 'CAPITAL_IN' || item.type === 'DIVIDEND_REINVEST') {
            runningTotal += amount;
        } else if (item.type === 'CAPITAL_OUT') {
            runningTotal -= amount;
        }
        // Note: Dividend payouts (cash out) usually don't reduce "Principal" unless explicitly withdrawn, 
        // but for "Capital Growth" we often track Net Asset Value. 
        // For simplicity, let's assume this tracks "Active Principal Invested".

        return {
            date: new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            amount: runningTotal,
            fullDate: new Date(item.date).toLocaleDateString()
        };
    });

    // Add current date point if needed, or start from 0? 
    // Let's just use the history points.

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `Rp ${value / 1000000}M`}
                />
                <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Total Capital']}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
            </AreaChart>
        </ResponsiveContainer>
    );
}

export default function InvestorDetailPage() {
    const { id } = useParams();
    const [investor, setInvestor] = useState<any>(null);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    // Transaction State
    const [isTransactionDrawerOpen, setIsTransactionDrawerOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'CAPITAL_IN' | 'CAPITAL_OUT'>('CAPITAL_IN');
    const [transactionAmount, setTransactionAmount] = useState('');

    // Edit Profile State
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        status: 'ACTIVE',
        notes: ''
    });

    const [modal, setModal] = useState<any>({ isOpen: false, type: 'info', message: '' });

    const fetchInvestor = () => {
        if (token && id) {
            setLoading(true);
            axios.get(`http://localhost:3000/investors/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setInvestor(res.data);
                    // Init edit form
                    setEditFormData({
                        bankName: res.data.bankName || '',
                        accountNumber: res.data.accountNumber || '',
                        accountHolder: res.data.accountHolder || '',
                        status: res.data.status || 'ACTIVE',
                        notes: res.data.notes || ''
                    });
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    };

    useEffect(() => {
        fetchInvestor();
    }, [token, id]);

    const handleOpenTransaction = (type: 'CAPITAL_IN' | 'CAPITAL_OUT') => {
        setTransactionType(type);
        setTransactionAmount('');
        setIsTransactionDrawerOpen(true);
    };

    const handleTransactionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = Number(transactionAmount);

        if (isNaN(amount) || amount <= 0) {
            setModal({ isOpen: true, type: 'error', message: 'Invalid amount' });
            return;
        }

        try {
            await axios.post('http://localhost:3000/transactions', {
                type: transactionType,
                amount: amount,
                paymentMethod: 'TRANSFER',
                investorId: id,
                description: `Manual ${transactionType} recording`
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setModal({
                isOpen: true,
                type: 'success',
                message: 'Transaction recorded successfully!',
                onClose: () => fetchInvestor()
            });
            setIsTransactionDrawerOpen(false);

        } catch (err) {
            console.error(err);
            setModal({ isOpen: true, type: 'error', message: 'Failed to record transaction' });
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:3000/investors/${id}`, editFormData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModal({
                isOpen: true,
                type: 'success',
                message: 'Profile updated successfully!',
                onClose: () => fetchInvestor()
            });
            setIsEditDrawerOpen(false);
        } catch (error) {
            console.error(error);
            setModal({ isOpen: true, type: 'error', message: 'Failed to update profile' });
        }
    };

    if (loading && !investor) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!investor) return <div className="p-8 text-center text-red-500">Investor not found</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">{investor.user?.name}</h3>
                    <p className="text-gray-500">{investor.user?.email}</p>
                    <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-bold ${Number(investor.totalInvestment) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {investor.status || 'ACTIVE'}
                    </span>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditDrawerOpen(true)}
                        className="px-4 py-2 border border-[var(--card-border)] bg-[var(--card-bg)] rounded-lg text-sm font-medium hover:bg-[var(--foreground)]/5 transition-all"
                    >
                        Edit Profile
                    </button>
                    <div className="flex gap-2">
                        <button onClick={() => handleOpenTransaction('CAPITAL_IN')} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 shadow-lg shadow-green-500/20 transition-all">
                            + Invest
                        </button>
                        <button onClick={() => handleOpenTransaction('CAPITAL_OUT')} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all">
                            - Withdraw
                        </button>
                    </div>
                </div>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Investment Stats */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-24 h-24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider">Total Capital</p>
                    <h2 className="text-4xl font-bold mt-2">Rp {Number(investor.totalInvestment).toLocaleString('id-ID')}</h2>
                    <div className="mt-4 flex items-center gap-2 text-indigo-100 text-sm">
                        <span className="font-bold">{investor.sharesParam}%</span>
                        <span>Ownership Share</span>
                    </div>
                </div>

                <div className="md:col-span-2 p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                    <h4 className="text-lg font-bold text-[var(--foreground)] mb-4">Capital Growth</h4>
                    <div className="h-64 w-full">
                        <CapitalGrowthChart history={investor.capitalHistory} initialInvestment={0} />
                    </div>
                </div>

                {/* Bank Information */}
                <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                    <h4 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                        Financial Details
                    </h4>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs">Bank Name</p>
                            <p className="font-medium text-[var(--foreground)]">{investor.bankName || '-'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Account Number</p>
                            <p className="font-medium text-[var(--foreground)] font-mono">{investor.accountNumber || '-'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs">Account Holder</p>
                            <p className="font-medium text-[var(--foreground)]">{investor.accountHolder || '-'}</p>
                        </div>
                    </div>
                </div>

                {/* Notes / Meta */}
                <div className="p-6 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm">
                    <h4 className="text-lg font-bold text-[var(--foreground)] mb-4">Notes</h4>
                    <p className="text-sm text-gray-500 italic whitespace-pre-wrap">
                        {investor.notes || 'No notes available.'}
                    </p>
                    <div className="mt-6 pt-4 border-t border-[var(--card-border)]">
                        <p className="text-xs text-gray-400">Joined: {new Date(investor.joinedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>

            {/* Capital History Table */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[var(--card-border)]">
                    <h4 className="text-lg font-bold text-[var(--foreground)]">Transaction History</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--foreground)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {investor.capitalHistory?.length > 0 ? (
                                investor.capitalHistory.map((tx: any) => (
                                    <tr key={tx.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(tx.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${tx.type === 'CAPITAL_IN' ? 'bg-green-100 text-green-800' :
                                                tx.type === 'CAPITAL_OUT' ? 'bg-red-100 text-red-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {tx.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                                            {tx.description || '-'}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right font-mono ${tx.type === 'CAPITAL_IN' ? 'text-green-600' : 'text-red-600'}`}>
                                            {tx.type === 'CAPITAL_IN' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No transaction history recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Edit Profile Drawer */}
            <Drawer
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
                title="Edit Investor Profile"
            >
                <form onSubmit={handleEditSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Bank Name</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:outline-none"
                            placeholder="e.g. BCA, Mandiri"
                            value={editFormData.bankName}
                            onChange={e => setEditFormData({ ...editFormData, bankName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Account Number</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:outline-none font-mono"
                            placeholder="e.g. 1234567890"
                            value={editFormData.accountNumber}
                            onChange={e => setEditFormData({ ...editFormData, accountNumber: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Account Holder</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:outline-none"
                            placeholder="Name on the bank account"
                            value={editFormData.accountHolder}
                            onChange={e => setEditFormData({ ...editFormData, accountHolder: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Status</label>
                        <select
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:outline-none"
                            value={editFormData.status}
                            onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Notes</label>
                        <textarea
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:outline-none h-24"
                            placeholder="Additional notes..."
                            value={editFormData.notes}
                            onChange={e => setEditFormData({ ...editFormData, notes: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsEditDrawerOpen(false)}
                            className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-lg bg-violet-600 text-white font-bold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/30"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </Drawer>

            {/* Transaction Drawer */}
            <Drawer
                isOpen={isTransactionDrawerOpen}
                onClose={() => setIsTransactionDrawerOpen(false)}
                title={transactionType === 'CAPITAL_IN' ? 'Record New Investment' : 'Record Withdrawal'}
            >
                <form onSubmit={handleTransactionSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Amount (Rp)</label>
                        <input
                            type="number"
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 focus:outline-none transition-all font-mono"
                            value={transactionAmount}
                            onChange={e => setTransactionAmount(e.target.value)}
                            required
                            min="1"
                            placeholder="0"
                            autoFocus
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={() => setIsTransactionDrawerOpen(false)}
                            className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-3 rounded-lg text-white font-bold transition-all shadow-lg ${transactionType === 'CAPITAL_IN'
                                ? 'bg-green-600 hover:bg-green-700 shadow-green-500/30'
                                : 'bg-red-600 hover:bg-red-700 shadow-red-500/30'
                                }`}
                        >
                            Confirm {transactionType === 'CAPITAL_IN' ? 'Investment' : 'Withdrawal'}
                        </button>
                    </div>
                </form>
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
