'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function AnalysisPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Business Analytics</h3>
                    <p className="text-gray-500">Break-even simulation and revenue forecasting</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <BreakEvenSimulator />
                <RevenueForecast />
            </div>
        </div>
    );
}

function BreakEvenSimulator() {
    const [fixedCost, setFixedCost] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [variableCostPerUnit, setVariableCostPerUnit] = useState(0);
    const [bepUnits, setBepUnits] = useState<number | null>(null);
    const [bepRupiah, setBepRupiah] = useState<number | null>(null);

    const calculateBEP = (e: React.FormEvent) => {
        e.preventDefault();
        const margin = pricePerUnit - variableCostPerUnit;
        if (margin <= 0) {
            alert("Margin must be positive (Price > Variable Cost)");
            return;
        }

        const units = fixedCost / margin;
        const rupiah = units * pricePerUnit;

        setBepUnits(units);
        setBepRupiah(rupiah);
    };

    return (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm p-6 shadow-sm flex flex-col h-full">
            <h4 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-sky-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
                </svg>
                Break-Even Simulator
            </h4>

            <form onSubmit={calculateBEP} className="space-y-5 flex-1">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Fixed Costs (Biaya Tetap)</label>
                        <div className="relative">
                            <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                            <input
                                type="number"
                                className="w-full pl-10 rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all font-mono"
                                value={fixedCost} onChange={e => setFixedCost(Number(e.target.value))} required
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Price / Unit</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    className="w-full pl-10 rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all font-mono"
                                    value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} required
                                    placeholder="0"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Var Cost / Unit</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    className="w-full pl-10 rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all font-mono"
                                    value={variableCostPerUnit} onChange={e => setVariableCostPerUnit(Number(e.target.value))} required
                                    placeholder="0"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-3 text-white font-bold hover:from-sky-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-4"
                >
                    Calculate Targets
                </button>
            </form>

            {bepUnits !== null && (
                <div className="mt-8 pt-6 border-t border-[var(--card-border)] animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--card-border)] text-center">
                            <div className="text-xs text-sky-500 font-bold uppercase tracking-wider mb-1">Target Sales (Qty)</div>
                            <div className="text-2xl font-bold text-[var(--foreground)]">{Math.ceil(bepUnits).toLocaleString()} <span className="text-sm font-normal text-gray-500">units</span></div>
                        </div>
                        <div className="bg-[var(--background)] p-4 rounded-xl border border-[var(--card-border)] text-center">
                            <div className="text-xs text-green-500 font-bold uppercase tracking-wider mb-1">Target Revenue</div>
                            <div className="text-2xl font-bold text-[var(--foreground)]">Rp {bepRupiah?.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function RevenueForecast() {
    const [data, setData] = useState<any>(null);
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/reports/forecast', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    setData(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        }
    }, [token]);

    return (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm p-6 shadow-sm flex flex-col h-full">
            <h4 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-violet-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                </svg>
                AI Revenue Forecast
            </h4>

            {loading ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Loading forecast model...</div>
            ) : data && !data.error ? (
                <div className="flex-1 space-y-6">
                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Projected Growth</span>
                            <span className={`text-sm font-bold px-2 py-1 rounded ${data.dailyGrowthRate > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {data.trend}
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-[var(--foreground)] mt-2">
                            {data.dailyGrowthRate > 0 ? '+' : ''}{Math.round(data.dailyGrowthRate).toLocaleString()} <span className="text-lg font-normal text-gray-500">/ day</span>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h5 className="text-sm font-medium text-gray-500">Next 5 Days Projection</h5>
                        <div className="space-y-3">
                            {data.forecast.slice(0, 5).map((f: any, i: number) => {
                                const maxVal = Math.max(...data.forecast.map((d: any) => d.amount));
                                const percent = (f.amount / maxVal) * 100;

                                return (
                                    <div key={i} className="relative group">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span className="text-[var(--foreground)] font-medium">{f.date}</span>
                                            <span className="text-gray-500">Rp {Math.round(f.amount).toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 w-full bg-[var(--background)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full transition-all duration-500"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-[var(--background)] rounded-xl border border-[var(--card-border)] border-dashed">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400 mb-2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                    <p className="text-gray-500 font-medium">{data?.error || "Need more transaction data to generate forecast."}</p>
                    <p className="text-sm text-gray-400 mt-1">Record at least 3 days of sales.</p>
                </div>
            )}
        </div>
    );
}
