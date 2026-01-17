'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopProducts } from '@/components/dashboard/TopProducts';
import { CategoryPieChart } from '@/components/dashboard/CategoryPieChart';
import { PaymentMethodChart } from '@/components/dashboard/PaymentMethodChart';
import RecentActivityWidget from '@/components/RecentActivityWidget';
import { CashierDashboard } from '@/components/CashierDashboard';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { user, token } = useAuth();
    const router = useRouter();

    // Render Cashier Dashboard specifically
    if (user?.role === 'KASIR') {
        return <CashierDashboard />;
    }

    useEffect(() => {
        if (token) {
            // Fetch stats
            axios.get('http://127.0.0.1:3000/reports/dashboard', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    console.log('Stats fetched:', res.data);
                    if (res.data.error || !res.data.revenueForecast) {
                        setError(res.data.error || 'Invalid data received from server');
                        return;
                    }
                    setStats(res.data);
                })
                .catch(err => {
                    console.error('Fetch error:', err);
                    // Don't show error for KASIR if redirect is pending (though return above should handle it)
                    if (user?.role !== 'KASIR') {
                        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
                    }
                });
        } else {
            // console.log('No token available yet');
        }
    }, [token, user, router]);

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
                    <div className={`mt-4 flex items-center gap-2 text-sm px-2 py-1 rounded-lg w-fit ${Number(stats.revenueGrowth) >= 0 ? 'text-green-500 bg-green-50 dark:bg-green-900/10' : 'text-red-500 bg-red-50 dark:bg-red-900/10'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d={Number(stats.revenueGrowth) >= 0 ? "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22" : "M2.25 6L9 12.75l4.306-4.307a11.95 11.95 0 005.814 5.519l2.74 1.22"} />
                        </svg>
                        <span>{Number(stats.revenueGrowth) >= 0 ? '+' : ''}{stats.revenueGrowth}% vs last month</span>
                    </div>
                </div>

                {/* Block 2: Profit (Unchanged) */}
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
                        <span className="font-semibold text-[var(--foreground)]">{stats.txCountToday}</span> transactions processed
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

                {/* Left Column: Recent Transactions & Revenue Chart */}
                <div className="md:col-span-2 space-y-6">

                    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] overflow-hidden shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--foreground)]">Revenue Trend</h3>
                                <p className="text-sm text-gray-500">Last 30 days performance</p>
                            </div>
                            <div className={`flex items-center gap-2 text-sm px-3 py-1 rounded-full ${stats.revenueForecast.trend === 'Upward' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {stats.revenueForecast.trend === 'Upward' ? 'Trending Up' : 'Trending Down'}
                            </div>
                        </div>
                        <RevenueChart data={stats.revenueForecast.forecast} />
                    </div>

                    {/* Advanced Analytics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Chart */}
                        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] p-6 shadow-sm">
                            <h3 className="font-bold text-[var(--foreground)] mb-4">Sales by Category</h3>
                            <CategoryPieChart data={stats.salesByCategory || []} />
                        </div>

                        {/* Payment Method Chart */}
                        <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] p-6 shadow-sm">
                            <h3 className="font-bold text-[var(--foreground)] mb-4">Payment Methods</h3>
                            <PaymentMethodChart data={stats.salesByPaymentMethod || []} />
                        </div>
                    </div>

                    {/* Recent Transactions Block */}
                    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-[var(--card-border)] flex justify-between items-center">
                            <h3 className="text-lg font-bold text-[var(--foreground)]">Recent Transactions</h3>
                            <Link href="/dashboard/transactions" className="text-sm font-medium text-[var(--primary)] hover:underline">View All</Link>
                        </div>
                        <div>
                            {stats.recentTransactions?.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No transactions found.</div>
                            ) : (
                                stats.recentTransactions?.map((tx: any) => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 px-6 border-b border-[var(--card-border)] last:border-0 hover:bg-[var(--background)] transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="font-medium text-[var(--foreground)]">Sale #{tx.id.slice(-4)}</p>
                                                <p className="text-xs text-gray-500">{new Date(tx.date).toLocaleString()} • {tx.creator?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[var(--foreground)]">+Rp {parseInt(tx.amount).toLocaleString()}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">Completed</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Top Products & Alerts */}
                <div className="space-y-6">

                    {/* Low Stock Alert */}
                    {stats.lowStockAlerts?.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-200 dark:border-red-800 p-6">
                            <h3 className="text-lg font-bold text-red-700 dark:text-red-400 mb-4 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
                                </svg>
                                Low Stock Alerts
                            </h3>
                            <div className="space-y-3">
                                {stats.lowStockAlerts.map((prod: any) => (
                                    <div key={prod.id} className="flex justify-between items-center bg-white dark:bg-black/20 p-3 rounded-xl">
                                        <span className="font-medium text-red-600 dark:text-red-300">{prod.name}</span>
                                        <span className="font-bold text-red-700 dark:text-red-400">{prod.stock} left</span>
                                    </div>
                                ))}
                            </div>
                            <button className="mt-4 w-full py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                                Restock Now
                            </button>
                        </div>
                    )}

                    {/* Top Products */}
                    <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--card-border)] p-6 shadow-sm">
                        <h3 className="font-bold text-[var(--foreground)] mb-4">Top Performing Products</h3>
                        <TopProducts products={stats.topProducts || []} />
                    </div>

                    {/* Recent Activity Widget */}
                    <div className="h-[400px]">
                        <RecentActivityWidget />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3 mt-4">
                                <Link href="/dashboard/products" className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-xl text-center text-sm font-medium transition-colors">
                                    Add Product
                                </Link>
                                {user?.role === 'OWNER' && (
                                    <Link href="/dashboard/users" className="bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 rounded-xl text-center text-sm font-medium transition-colors">
                                        Add User
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
