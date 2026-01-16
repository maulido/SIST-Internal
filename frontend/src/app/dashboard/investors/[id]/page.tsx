'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

export default function InvestorDetailPage() {
    const { id } = useParams();
    const [investor, setInvestor] = useState<any>(null);
    const { token } = useAuth();

    useEffect(() => {
        if (token && id) {
            axios.get(`http://localhost:3000/investors/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setInvestor(res.data))
                .catch(err => console.error(err));
        }
    }, [token, id]);

    if (!investor) return <div>Loading...</div>;

    return (
        <div>
            <h3 className="text-2xl font-bold text-gray-800">Investor Profile</h3>

            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Name</label>
                        <div className="mt-1 text-lg text-gray-900">{investor.user?.name}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 text-lg text-gray-900">{investor.user?.email}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Total Capital</label>
                        <div className="mt-1 text-lg font-bold text-green-600">Rp {investor.totalInvestment}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ownership</label>
                        <div className="mt-1 text-lg text-gray-900">{investor.sharesParam}%</div>
                    </div>
                </div>
            </div>

            <h4 className="mt-8 text-xl font-bold text-gray-800">Capital History</h4>
            <div className="mt-4 overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {investor.capitalHistory?.map((tx: any) => (
                            <tr key={tx.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{tx.type}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">Rp {tx.amount}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{tx.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!investor.capitalHistory || investor.capitalHistory.length === 0) && (
                    <div className="p-4 text-center text-gray-500">No transactions recorded.</div>
                )}
            </div>
        </div>
    );
}
