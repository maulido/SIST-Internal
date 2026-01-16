'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function AssetsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        category: 'Fixed',
        purchasePrice: 0,
        usefulLife: 12,
        purchaseDate: new Date().toISOString().split('T')[0]
    });

    const fetchAssets = () => {
        if (token) {
            axios.get('http://localhost:3000/assets', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setAssets(res.data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchAssets();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/assets', {
                ...formData,
                purchaseDate: new Date(formData.purchaseDate),
                currentValue: Number(formData.purchasePrice),
                purchasePrice: Number(formData.purchasePrice),
                usefulLife: Number(formData.usefulLife)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchAssets();
            // Reset form or close modal
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Assets</h3>
            </div>

            {/* Simple Add Form */}
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h4 className="mb-4 font-semibold">Register New Asset</h4>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-5 items-end">
                    <div>
                        <label className="mb-1 block text-sm">Name</label>
                        <input type="text" className="w-full rounded border p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Category</label>
                        <select className="w-full rounded border p-2"
                            value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                            <option value="Fixed">Fixed Asset</option>
                            <option value="Moving">Moving Asset</option>
                            <option value="Equipment">Equipment</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Price</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={formData.purchasePrice} onChange={e => setFormData({ ...formData, purchasePrice: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Useful Life (Mos)</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={formData.usefulLife} onChange={e => setFormData({ ...formData, usefulLife: Number(e.target.value) })} required />
                    </div>
                    <button type="submit" className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Add</button>
                </form>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Acquisition Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Purchase Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Est. Life</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {assets.map((asset) => (
                            <tr key={asset.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{asset.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{asset.category}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Rp {asset.purchasePrice}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{asset.usefulLife} months</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
