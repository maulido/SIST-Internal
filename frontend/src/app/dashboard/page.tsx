'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const { token, user } = useAuth();

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/reports/dashboard', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setStats(res.data)).catch(console.error);
        }
    }, [token]);

    if (!stats) return <div>Loading Dashboard...</div>;

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800">Welcome, {user?.email}</h3>
            <p className="mt-2 text-gray-600">Overview of your business performance.</p>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-white p-6 shadow border-l-4 border-indigo-500">
                    <h4 className="font-semibold text-gray-700">Sales Today</h4>
                    <p className="mt-2 text-3xl font-bold text-indigo-600">Rp {Number(stats.salesToday).toLocaleString()}</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow border-l-4 border-green-500">
                    <h4 className="font-semibold text-gray-700">Net Profit (All Time)</h4>
                    <p className="mt-2 text-3xl font-bold text-green-600">Rp {Number(stats.netProfit).toLocaleString()}</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow border-l-4 border-blue-500">
                    <h4 className="font-semibold text-gray-700">Cash on Hand</h4>
                    <p className="mt-2 text-3xl font-bold text-blue-600">Rp {Number(stats.cashOnHand).toLocaleString()}</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow border-l-4 border-purple-500">
                    <h4 className="font-semibold text-gray-700">Total Equity</h4>
                    <p className="mt-2 text-3xl font-bold text-purple-600">Rp {Number(stats.totalEquity).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
