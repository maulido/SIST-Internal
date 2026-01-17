'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';
import { SystemModal } from '@/components/SystemModal';

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const { token, isLoading } = useAuth();

    // Drawer & Selection
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'VIEW' | 'EDIT'>('CREATE');
    const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
    const [modal, setModal] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'confirm' | 'info'; message: string; onConfirm?: () => void }>({ isOpen: false, type: 'info', message: '' });

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

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Filter Logic
    const filteredSuppliers = suppliers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || s.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...Array.from(new Set(suppliers.map(s => s.category || 'Raw Material')))];

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
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            category: supplier.category || 'Raw Material'
        });
        setDrawerMode('VIEW'); // VIEW actually behaves like "Details + Edit" usually?
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (supplier: any) => {
        setSelectedSupplier(supplier);
        setFormData({
            name: supplier.name,
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            category: supplier.category || 'Raw Material'
        });
        setDrawerMode('EDIT');
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
            setModal({ isOpen: true, type: 'success', message: drawerMode === 'CREATE' ? 'Supplier added successfully!' : 'Supplier updated successfully!' });
        } catch (err) {
            console.error(err);
            setModal({ isOpen: true, type: 'error', message: 'Failed to save supplier.' });
        }
    };

    const handleDelete = async () => {
        if (!selectedSupplier) return;
        setModal({
            isOpen: true,
            type: 'confirm',
            message: 'Are you sure you want to delete this supplier?',
            onConfirm: async () => {
                try {
                    await axios.delete(`http://localhost:3000/suppliers/${selectedSupplier.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    fetchSuppliers();
                    setIsDrawerOpen(false);
                    setModal({ isOpen: true, type: 'success', message: 'Supplier deleted successfully' });
                } catch (err) {
                    console.error(err);
                    setModal({ isOpen: true, type: 'error', message: 'Failed to delete supplier.' });
                }
            }
        });
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

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search by Company, Contact Person, or Email..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-amber-500 text-sm"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
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
                            {filteredSuppliers.map((supplier) => (
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
                                    <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => handleOpenView(supplier)}
                                            className="text-blue-500 hover:text-blue-600 font-medium text-sm transition-colors"
                                            title="View Details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleOpenEdit(supplier)}
                                            className="text-amber-500 hover:text-amber-600 font-medium text-sm transition-colors"
                                            title="Edit"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
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
                title={drawerMode === 'CREATE' ? 'Add Supplier' : drawerMode === 'EDIT' ? 'Edit Supplier' : 'Supplier Details'}
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
                        {(drawerMode === 'VIEW' || drawerMode === 'EDIT') && (
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

            <SystemModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ ...modal, isOpen: false })}
                type={modal.type}
                message={modal.message}
                onConfirm={modal.onConfirm}
            />
        </div>
    );
}
