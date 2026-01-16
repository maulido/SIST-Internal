'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function AnalysisPage() {
    const [fixedCost, setFixedCost] = useState(0);
    const [pricePerUnit, setPricePerUnit] = useState(0);
    const [variableCostPerUnit, setVariableCostPerUnit] = useState(0);
    const [bepUnits, setBepUnits] = useState<number | null>(null);
    const [bepRupiah, setBepRupiah] = useState<number | null>(null);

    const calculateBEP = (e: React.FormEvent) => {
        e.preventDefault();
        const margin = pricePerUnit - variableCostPerUnit;
        if (margin <= 0) {
            alert("Margin must be positive");
            return;
        }

        const units = fixedCost / margin;
        const rupiah = units * pricePerUnit;

        setBepUnits(units);
        setBepRupiah(rupiah);
    };

    return (
        <div className="max-w-xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Analysis: Break-Even Point (BEP)</h3>

            <div className="rounded-lg bg-white p-6 shadow">
                <form onSubmit={calculateBEP} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Fixed Costs (Biaya Tetap)</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={fixedCost} onChange={e => setFixedCost(Number(e.target.value))} required />
                        <p className="text-xs text-gray-500">Total expenses like rent, salaries (if fixed).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Price per Unit (Harga Jual)</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={pricePerUnit} onChange={e => setPricePerUnit(Number(e.target.value))} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Variable Cost per Unit (Biaya Variabel)</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={variableCostPerUnit} onChange={e => setVariableCostPerUnit(Number(e.target.value))} required />
                        <p className="text-xs text-gray-500">Cost to produce one unit (HPP + packaging etc).</p>
                    </div>

                    <button type="submit" className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Calculate BEP</button>
                </form>

                {bepUnits !== null && (
                    <div className="mt-6 border-t pt-4">
                        <h4 className="text-lg font-bold text-gray-700">Results</h4>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="text-sm text-blue-700 font-bold">BEP (Units)</div>
                                <div className="text-2xl text-blue-900">{Math.ceil(bepUnits)} units</div>
                            </div>
                            <div className="bg-green-50 p-3 rounded">
                                <div className="text-sm text-green-700 font-bold">BEP (Rupiah)</div>
                                <div className="text-2xl text-green-900">Rp {bepRupiah?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 rounded-lg bg-white p-6 shadow">
                <h4 className="text-lg font-bold text-gray-700 mb-4">Revenue Forecast (30 Days)</h4>
                <RevenueForecast />
            </div>

        </div>
    );
}

function RevenueForecast() {
    const [data, setData] = useState<any>(null);
    const { token } = useAuth(); // Need to move useAuth to top component or pass token?
    // Logic inside component for simplicity

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/reports/forecast', { headers: { Authorization: `Bearer ${token}` } })
                .then(res => setData(res.data)).catch(console.error);
        }
    }, [token]);

    if (!data) return <div>Loading forecast...</div>;
    if (data.error) return <div className="text-yellow-600">{data.error}</div>;

    return (
        <div>
            <div className={`text-lg font-semibold ${data.dailyGrowthRate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                Trend: {data.trend} (Approx. {Math.round(data.dailyGrowthRate)} growth/day)
            </div>

            <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Predicted Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.forecast.map((f: any) => (
                            <tr key={f.date}>
                                <td className="px-4 py-2">{f.date}</td>
                                <td className="px-4 py-2 font-medium">Rp {Math.round(f.amount).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
