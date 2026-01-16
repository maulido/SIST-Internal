'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function ReportsPage() {
    const { token } = useAuth();
    const [pnl, setPnl] = useState<any>(null);
    const [bs, setBs] = useState<any>(null);

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/reports/pnl', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setPnl(res.data)).catch(console.error);

            axios.get('http://localhost:3000/reports/balance-sheet', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setBs(res.data)).catch(console.error);
        }
    }, [token]);

    if (!pnl || !bs) return <div>Loading Reports...</div>;

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gray-800">Financial Reports</h3>

            {/* P&L Card */}
            <div className="rounded-lg bg-white p-6 shadow">
                <h4 className="mb-4 text-xl font-bold text-gray-700 border-b pb-2">Profit & Loss</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600">Revenue</span>
                            <span className="font-semibold text-green-600">Rp {pnl.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span className="text-gray-600">COGS</span>
                            <span className="font-semibold text-red-500">- Rp {pnl.cogs.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-t mt-2 pt-2">
                            <span className="font-bold text-gray-700">Gross Profit</span>
                            <span className="font-bold text-gray-900">Rp {pnl.grossProfit.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="border-l pl-4">
                        <div className="text-sm font-semibold text-gray-500 mb-2">Expenses Breakdown</div>
                        {Object.entries(pnl.expenseBreakdown).map(([cat, amount]) => (
                            <div key={cat} className="flex justify-between py-1 text-sm">
                                <span>{cat}</span>
                                <span className="text-red-500">- Rp {(amount as number).toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between py-1 border-t mt-2 pt-2">
                            <span className="font-bold text-gray-700">Net Profit</span>
                            <span className={`font-bold ${pnl.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Rp {pnl.netProfit.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Balance Sheet Card */}
            <div className="rounded-lg bg-white p-6 shadow">
                <h4 className="mb-4 text-xl font-bold text-gray-700 border-b pb-2">Balance Sheet (Estimates)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h5 className="font-bold text-indigo-600 mb-2">Assets</h5>
                        <div className="flex justify-between py-1">
                            <span>Cash</span>
                            <span>Rp {bs.assets.cash.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>Inventory</span>
                            <span>Rp {bs.assets.inventory.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1">
                            <span>Fixed Assets</span>
                            <span>Rp {bs.assets.fixedAssets.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1 border-t mt-2 pt-2 font-bold">
                            <span>Total Assets</span>
                            <span>Rp {bs.assets.total.toLocaleString()}</span>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-bold text-indigo-600 mb-2">Liabilities & Equity</h5>
                        <div className="flex justify-between py-1">
                            <span>Liabilities</span>
                            <span>Rp {bs.liabilities.total.toLocaleString()}</span>
                        </div>
                        <div className="mt-4">
                            <div className="font-semibold text-gray-600">Equity</div>
                            <div className="flex justify-between py-1 text-sm pl-2">
                                <span>Capital</span>
                                <span>Rp {bs.equity.capital.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between py-1 text-sm pl-2">
                                <span>Retained Earnings</span>
                                <span>Rp {bs.equity.retainedEarnings.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between py-1 border-t mt-2 pt-2 font-bold">
                            <span>Total Liab. & Equity</span>
                            <span>Rp {(bs.liabilities.total + bs.equity.total).toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
