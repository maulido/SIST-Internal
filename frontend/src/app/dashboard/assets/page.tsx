'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';

export default function AssetsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const { token, isLoading } = useAuth();

    // Drawer & Selection
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'VIEW'>('CREATE');
    const [selectedAsset, setSelectedAsset] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        category: 'Fixed',
        purchasePrice: '',
        usefulLife: 12,
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    const fetchAssets = () => {
        if (token && !isLoading) {
            axios.get('http://localhost:3000/assets', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setAssets(res.data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        if (!isLoading) fetchAssets();
    }, [token, isLoading]);

    const handleOpenCreate = () => {
        setFormData({
            name: '',
            category: 'Fixed',
            purchasePrice: '',
            usefulLife: 12,
            purchaseDate: new Date().toISOString().split('T')[0]
        });
        setDrawerMode('CREATE');
        setIsDrawerOpen(true);
    };

    const handleOpenView = (asset: any) => {
        setSelectedAsset(asset);
        setDrawerMode('VIEW');
        setIsDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/assets', {
                ...formData,
                purchaseDate: new Date(formData.purchaseDate),
                currentValue: Number(formData.purchasePrice), // Initial current value = Purchase Price
                purchasePrice: Number(formData.purchasePrice),
                usefulLife: Number(formData.usefulLife)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAssets();
            setIsDrawerOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save asset. Check console for details.');
        }
    };

    // Calculate Depreciation
    const calculateDepreciation = (asset: any) => {
        if (!asset) return { currentValue: 0, depreciatedAmount: 0, monthsElapsed: 0 };

        const purchaseDate = new Date(asset.purchaseDate);
        const now = new Date();
        const monthsElapsed = (now.getFullYear() - purchaseDate.getFullYear()) * 12 + (now.getMonth() - purchaseDate.getMonth());

        // Straight Line Depreciation
        // Monthly Dep = Price / Useful Life
        const monthlyDepreciation = asset.purchasePrice / Math.max(asset.usefulLife, 1);
        const totalDepreciation = Math.min(monthlyDepreciation * Math.max(monthsElapsed, 0), asset.purchasePrice);
        const currentValue = asset.purchasePrice - totalDepreciation;

        return {
            currentValue,
            depreciatedAmount: totalDepreciation,
            monthsElapsed: Math.max(monthsElapsed, 0)
        };
    };

    const totalAssetValue = assets.reduce((acc, curr) => acc + curr.purchasePrice, 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Asset Management</h3>
                    <p className="text-gray-500">Track equipment, inventory, and depreciation</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0ea5e9] text-white rounded-xl font-bold shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Register Asset
                </button>
            </div>

            {/* Asset Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 backdrop-blur-sm shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[var(--foreground)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Asset Value (Purchase)</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">Rp {totalAssetValue.toLocaleString('id-ID')}</p>
                </div>
            </div>


            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--foreground)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Asset Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Acquired</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Purchase Price</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {assets.map((asset) => (
                                <tr key={asset.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--foreground)]">
                                        {asset.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs rounded-full border border-[var(--card-border)] bg-[var(--background)] text-gray-500">
                                            {asset.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                                        {new Date(asset.purchaseDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[var(--foreground)] text-right font-mono">
                                        Rp {Number(asset.purchasePrice).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleOpenView(asset)}
                                            className="text-sky-500 hover:text-sky-600 font-medium text-sm transition-colors"
                                        >
                                            View & Depreciate
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {assets.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No assets registered yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Asset Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={drawerMode === 'CREATE' ? 'Register New Asset' : 'Asset Valuation'}
            >
                {drawerMode === 'VIEW' ? (
                    <div className="space-y-6">
                        {/* Valuation Card */}
                        {(() => {
                            const dep = calculateDepreciation(selectedAsset);
                            return (
                                <div className="space-y-6">
                                    <div className="p-6 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg relative overflow-hidden">
                                        <div className="relative z-10 text-center">
                                            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Current Book Value</p>
                                            <h3 className="text-4xl font-bold">Rp {dep.currentValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</h3>
                                            <div className="mt-4 flex justify-between text-xs text-slate-400 border-t border-slate-700 pt-4">
                                                <span>Original: Rp {Number(selectedAsset?.purchasePrice).toLocaleString('id-ID')}</span>
                                                <span className="text-red-400">Depreciated: -Rp {dep.depreciatedAmount.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                            <label className="text-xs text-gray-500 uppercase tracking-wide">Age</label>
                                            <p className="text-sm font-medium text-[var(--foreground)] mt-1">{dep.monthsElapsed} months</p>
                                        </div>
                                        <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                            <label className="text-xs text-gray-500 uppercase tracking-wide">Est. Useful Life</label>
                                            <p className="text-sm font-medium text-[var(--foreground)] mt-1">{selectedAsset?.usefulLife} months</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-3 pt-6 border-t border-[var(--card-border)]">
                            <h4 className="font-bold text-[var(--foreground)]">Details</h4>
                            <div className="flex justify-between py-2 border-b border-[var(--card-border)] border-dashed">
                                <span className="text-gray-500 text-sm">Category</span>
                                <span className="text-[var(--foreground)] text-sm">{selectedAsset?.category}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-[var(--card-border)] border-dashed">
                                <span className="text-gray-500 text-sm">Acquisition Date</span>
                                <span className="text-[var(--foreground)] text-sm">{new Date(selectedAsset?.purchaseDate).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Asset Name</label>
                            <input
                                type="text"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Espresso Machine / Office Laptop"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Category</label>
                                <select
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Fixed">Fixed Asset</option>
                                    <option value="Moving">Moving Asset</option>
                                    <option value="Equipment">Equipment</option>
                                    <option value="Intangible">Intangible</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Useful Life (Months)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
                                    value={formData.usefulLife}
                                    onChange={e => setFormData({ ...formData, usefulLife: Number(e.target.value) })}
                                    required
                                    min="1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Purchase Price (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all font-mono"
                                    value={formData.purchasePrice}
                                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Acquisition Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all"
                                    value={formData.purchaseDate}
                                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-lg bg-sky-500 text-white font-bold hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/30"
                            >
                                Save Asset
                            </button>
                        </div>
                    </form>
                )}
            </Drawer>
        </div>
    );
}
