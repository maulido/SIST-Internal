'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { user, token } = useAuth();

    useEffect(() => {
        if (token) {
            console.log('Fetching dashboard stats...');
            axios.get('http://127.0.0.1:3000/reports/dashboard', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    console.log('Stats fetched:', res.data);
                    setStats(res.data);
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                    setError(err.response?.data?.message || err.message || 'Failed to fetch data');
                });
        } else {
            console.log('No token available yet');
        }
    }, [token]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    if (error) return (
        <div className="flex h-[50vh] flex-col items-center justify-center p-8 text-center text-red-500 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-800">
            <div className="bg-red-100 p-3 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold">Unable to Connect</h3>
            <p className="mt-2 text-sm opacity-80 mb-6 max-w-sm">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-all shadow-lg shadow-red-500/20"
            >
                Retry Connection
            </button>
        </div>
    );

    if (!stats) return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 rounded-2xl bg-gray-200 dark:bg-gray-800"></div>
            ))}
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Block */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--foreground)]">{getTimeGreeting()}, {user?.role === 'ADMIN' ? 'Admin' : user?.email?.split('@')[0]}</h2>
                    <p className="text-gray-500 mt-1">Here's what's happening with your business today.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/sales" className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl font-semibold shadow-lg shadow-[var(--primary)]/25 hover:opacity-90 transition-all flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        New Sale
                    </Link>
                </div>
            </div>

            {/* Stats Grid Blocks */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {/* Block 1: Revenue */}
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
                            <h3 className="text-2xl font-bold text-[var(--foreground)]">Rp {parseInt(stats.totalRevenue).toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600 dark:text-blue-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-500 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded-lg w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                        </svg>
                        <span>+12.5% vs last month</span>
                    </div>
                </div>

                {/* Block 2: Profit */}
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Net Profit</p>
                            <h3 className="text-2xl font-bold text-[var(--foreground)]">Rp {parseInt(stats.netProfit).toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-green-600 dark:text-green-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[65%] rounded-full"></div>
                    </div>
                </div>

                {/* Block 3: Sales Count */}
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Sales Today</p>
                            <h3 className="text-2xl font-bold text-[var(--foreground)]">Rp {parseInt(stats.salesToday).toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-purple-600 dark:text-purple-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        <span className="font-semibold text-[var(--foreground)]">148</span> transactions processed
                    </div>
                </div>

                {/* Block 4: Cash */}
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--card-border)] shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">Cash on Hand</p>
                            <h3 className="text-2xl font-bold text-[var(--foreground)]">Rp {parseInt(stats.cashOnHand).toLocaleString('id-ID')}</h3>
                        </div>
                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl text-amber-600 dark:text-amber-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                            </svg>
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-500">
                        Daily closing pending
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-3 gap-6">

                {/* Recent Transactions Block */}
                <div className="md:col-span-2 bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] overflow-hidden shadow-sm">
                    <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center">
                        <h3 className="text-lg font-bold text-[var(--foreground)]">Recent Transactions</h3>
                        <Link href="/dashboard/transactions" className="text-sm font-medium text-[var(--primary)] hover:underline">View All</Link>
                    </div>
                    <div>
                        {/* Mock Data for now - usually mapped from API */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-4 px-6 border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--background)] transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-[var(--foreground)]">Order #TRX-88{i}</p>
                                        <p className="text-xs text-gray-500">Today at 10:3{i} AM</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[var(--foreground)]">+Rp {(150000 * i).toLocaleString()}</p>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Completed</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions Block */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-32 h-32 transform rotate-12">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold relative z-10">Premium Plan</h3>
                        <p className="text-indigo-100 mt-2 relative z-10 text-sm">Unlock advanced analytics and multi-user support.</p>
                        <button className="mt-6 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-sm font-semibold transition-colors border border-white/30 relative z-10">
                            Upgrade Now
                        </button>
                    </div>

                    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] p-6 shadow-sm">
                        <h3 className="font-bold text-[var(--foreground)] mb-4">Quick Links</h3>
                        <div className="space-y-3">
                            <Link href="/dashboard/products" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--foreground)]/5 transition-colors group">
                                <div className="h-10 w-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM12 20.25a8.25 8.25 0 008.25-8.25M12 20.25a8.25 8.25 0 01-8.25-8.25m0 0v-4.5m0 4.5h4.5m4.5 0h4.5m-13.5-9h18" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Manage Inventory</p>
                                    <p className="text-xs text-gray-500">Update stock & prices</p>
                                </div>
                            </Link>

                            <Link href="/dashboard/users" className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--foreground)]/5 transition-colors group">
                                <div className="h-10 w-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">Staff Access</p>
                                    <p className="text-xs text-gray-500">Add or remove users</p>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
