'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const { token } = useAuth();

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setTransactions(res.data))
                .catch(err => console.error(err));
        }
    }, [token]);

    const exportToCSV = () => {
        if (!transactions.length) return;
        const headers = ['Date', 'Type', 'Description', 'Amount'].join(',');
        const rows = transactions.map(tx => [
            new Date(tx.date).toISOString(),
            tx.type,
            `"${tx.description}"`, // Escape quotes
            tx.amount
        ].join(','));

        const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "transactions.csv");
        document.body.appendChild(link);
        link.click();
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Transaction History</h3>
                <button onClick={exportToCSV} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">Export CSV</button>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Description</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {transactions.map((tx) => (
                            <tr key={tx.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-gray-700">
                                    <span className={`rounded-full px-2 py-1 text-xs ${tx.type === 'SALE' || tx.type === 'CAPITAL_IN' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>{tx.type}</span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{tx.description}</td>
                                <td className={`whitespace-nowrap px-6 py-4 text-sm font-bold text-right ${tx.type === 'SALE' || tx.type === 'CAPITAL_IN' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {tx.type === 'SALE' || tx.type === 'CAPITAL_IN' ? '+' : '-'} Rp {Number(tx.amount).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
