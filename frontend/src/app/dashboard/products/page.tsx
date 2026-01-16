'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: 0,
        cost: 0,
        stock: 0,
        category: 'General'
    });

    const fetchProducts = () => {
        if (token) {
            axios.get('http://localhost:3000/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setProducts(res.data))
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/products', {
                ...formData,
                price: Number(formData.price),
                cost: Number(formData.cost),
                stock: Number(formData.stock)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchProducts();
            setFormData({ name: '', sku: '', price: 0, cost: 0, stock: 0, category: 'General' }); // Reset
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">Products & Services</h3>
            </div>

            {/* Add Product Form */}
            <div className="mt-6 rounded-lg bg-white p-6 shadow">
                <h4 className="mb-4 font-semibold">Add New Product</h4>
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-6 items-end">
                    <div className="md:col-span-2">
                        <label className="mb-1 block text-sm">Product Name</label>
                        <input type="text" className="w-full rounded border p-2"
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">SKU</label>
                        <input type="text" className="w-full rounded border p-2"
                            value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Sale Price</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Cost (HPP)</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={formData.cost} onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })} />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm">Initial Stock</label>
                        <input type="number" className="w-full rounded border p-2"
                            value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                    </div>
                    <div className="md:col-start-6">
                        <button type="submit" className="w-full rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Save</button>
                    </div>
                </form>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">SKU</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Cost</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {products.map((p) => (
                            <tr key={p.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.sku}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">Rp {p.price}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">Rp {p.cost}</td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.stock}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
