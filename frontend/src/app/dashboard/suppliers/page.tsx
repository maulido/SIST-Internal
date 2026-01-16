'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const { token, isLoading } = useAuth();

    // Drawer & Selection
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'VIEW'>('CREATE');
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        category: 'Raw Material'
    });

    const fetchSuppliers = async () => {
        if (token && !isLoading) {
            try {
                const res = await axios.get('http://localhost:3000/suppliers', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSuppliers(res.data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [token, isLoading]);

    const handleOpenCreate = () => {
        setFormData({
            name: '',
            contactPerson: '',
            email: '',
            phone: '',
            address: '',
            category: 'Raw Material'
        });
        setDrawerMode('CREATE');
        setIsDrawerOpen(true);
    };

    const handleOpenView = (supplier: any) => {
        setSelectedSupplier(supplier);
        // Pre-fill form for Edit (if we were doing edit) but for VIEW mode we just show details
        // Let's implement EDIT as well or stick to the pattern? 
        // Drawer supports any content. I will show details.

        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            category: supplier.category || 'Raw Material'
        });
        setDrawerMode('VIEW'); // VIEW actually behaves like "Details + Edit" usually?
        // Let's make it VIEW only for now, with an "Edit" button inside?
        // Or just allow Editing directly if it simplifies.
        // Let's follow Asset pattern: VIEW shows details.
        setIsDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (drawerMode === 'CREATE') {
                await axios.post('http://localhost:3000/suppliers', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Update logic
                await axios.patch(`http://localhost:3000/suppliers/${selectedSupplier.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            fetchSuppliers();
            setIsDrawerOpen(false);
        } catch (err) {
            console.error(err);
            alert('Failed to save supplier.');
        }
    };

    const handleDelete = async () => {
        if (!selectedSupplier) return;
        if (confirm('Are you sure you want to delete this supplier?')) {
            try {
                await axios.delete(`http://localhost:3000/suppliers/${selectedSupplier.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchSuppliers();
                setIsDrawerOpen(false);
            } catch (err) {
                console.error(err);
                alert('Failed to delete supplier.');
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Supplier Management</h3>
                    <p className="text-gray-500">Manage vendors and partners</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-xl font-bold shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Supplier
                </button>
            </div>

            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--foreground)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Company Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Contact Person</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {suppliers.map((supplier) => (
                                <tr key={supplier.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-[var(--foreground)]">{supplier.name}</div>
                                        <div className="text-xs text-gray-500">{supplier.email}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                                        {supplier.contactPerson || '-'}
                                        {supplier.phone && <span className="block text-xs text-gray-500">{supplier.phone}</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                            {supplier.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleOpenView(supplier)}
                                            className="text-amber-500 hover:text-amber-600 font-medium text-sm transition-colors"
                                        >
                                            View/Edit
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        No suppliers found. Start by adding one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={drawerMode === 'CREATE' ? 'Add Supplier' : 'Edit Supplier'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Company Name</label>
                        <input
                            type="text"
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Contact Person</label>
                            <input
                                type="text"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                                value={formData.contactPerson}
                                onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Category</label>
                            <select
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="Raw Material">Raw Material</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Logistics">Logistics</option>
                                <option value="Services">Services</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Email</label>
                            <input
                                type="email"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Phone</label>
                            <input
                                type="text"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                                value={formData.phone}
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-[var(--foreground)]">Address</label>
                        <textarea
                            className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-amber-500 focus:ring-1 focus:ring-amber-500 focus:outline-none transition-all"
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="pt-4 flex gap-3">
                        {drawerMode === 'VIEW' && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-4 py-3 rounded-lg border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsDrawerOpen(false)}
                            className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-lg bg-amber-500 text-white font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/30"
                        >
                            {drawerMode === 'CREATE' ? 'Add Supplier' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </Drawer>
        </div>
    );
}
