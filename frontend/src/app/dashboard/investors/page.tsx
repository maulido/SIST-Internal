'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function InvestorsPage() {
    const [investors, setInvestors] = useState<any[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/investors', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setInvestors(res.data))
                .catch(err => console.error(err));
        }
    }, [token]);

    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Investors</h3>
                <button className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Add Investor</button>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Total Investment</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Shares</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {investors.map((inv) => (
                            <tr key={inv.id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{inv.user?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{inv.user?.email}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Rp {inv.totalInvestment}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{inv.sharesParam}%</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                    <Link href={`/dashboard/investors/${inv.id}`} className="text-indigo-600 hover:text-indigo-900">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
