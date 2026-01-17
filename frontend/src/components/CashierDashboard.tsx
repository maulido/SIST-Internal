'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export function CashierDashboard() {
    const { user, token } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/transactions/my-stats', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setStats(res.data);
                })
                .catch(err => console.error('Failed to fetch cashier stats', err))
                .finally(() => setIsLoading(false));
        }
    }, [token]);

    if (isLoading) return <div className="p-8 text-center text-gray-400">Loading dashboard...</div>;

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-[var(--foreground)]">Welcome back, {(user as any)?.name || user?.email?.split('@')[0]}!</h1>
                <p className="text-gray-500 mt-1">Ready to make some sales today?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
                <Link href="/dashboard/sales" className="group relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-3xl p-8 text-white shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02]">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-2">New Sale (POS)</h2>
                        <p className="text-blue-100 mb-6">Open the Point of Sale terminal to start a new transaction.</p>
                        <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg font-semibold group-hover:bg-white group-hover:text-[var(--primary)] transition-colors">
                            Launch POS
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </span>
                    </div>
                </Link>

                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-6">Today's Performance</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--card-border)]">
                            <p className="text-sm text-gray-500 mb-1">Total Sales</p>
                            <p className="text-2xl font-bold text-[var(--foreground)]">Rp {Number(stats?.revenueToday || 0).toLocaleString('id-ID')}</p>
                        </div>
                        <div className="p-4 bg-[var(--background)] rounded-2xl border border-[var(--card-border)]">
                            <p className="text-sm text-gray-500 mb-1">Transactions</p>
                            <p className="text-2xl font-bold text-[var(--foreground)]">{stats?.salesCountToday || 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] overflow-hidden shadow-sm">
                <div className="p-6 border-b border-[var(--card-border)]">
                    <h3 className="text-lg font-bold text-[var(--foreground)]">Your Recent Transactions</h3>
                </div>
                <div className="divide-y divide-[var(--card-border)]">
                    {stats?.recentTransactions?.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No transactions yet today.</div>
                    ) : (
                        stats?.recentTransactions?.map((tx: any) => (
                            <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-[var(--foreground)]/5 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--foreground)]">Sale #{tx.id.slice(-4)}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleTimeString()} • {tx.paymentMethod}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[var(--foreground)]">Rp {Number(tx.amount).toLocaleString('id-ID')}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Completed</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
