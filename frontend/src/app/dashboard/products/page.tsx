'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';
import { Pagination } from '@/components/Pagination';
import { usePagination } from '@/hooks/usePagination';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const { token, isLoading } = useAuth();

    // Drawer States
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'EDIT' | 'VIEW'>('CREATE');
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Form Data
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: 0,
        cost: 0,
        stock: 0,
        category: 'General',
        description: '',
        image: '',
        type: 'GOODS' // Default to GOODS
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const fetchProducts = () => {
        if (token && !isLoading) {
            axios.get('http://localhost:3000/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setProducts(Array.isArray(res.data) ? res.data : []))
                .catch(err => console.error(err));
        }
    };

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('All');

    // Filter Logic
    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'General')))];

    // Pagination Logic
    const { currentItems, currentPage, paginate, totalItems } = usePagination(filteredProducts, 10);

    useEffect(() => {
        if (!isLoading) fetchProducts();
    }, [token, isLoading]);

    const handleOpenCreate = () => {
        setFormData({ name: '', sku: '', price: 0, cost: 0, stock: 0, category: 'General', description: '', image: '', type: 'GOODS' });
        setSelectedFile(null);
        setDrawerMode('CREATE');
        setIsDrawerOpen(true);
    };

    const handleOpenEdit = (product: any) => {
        setSelectedProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku || '',
            price: product.price,
            cost: product.cost || 0,
            stock: product.stock,
            category: product.category || 'General',
            description: product.description || '',
            image: product.image || '',
            type: product.type || 'GOODS'
        });
        setSelectedFile(null);
        setDrawerMode('EDIT');
        setIsDrawerOpen(true);
    };

    const handleOpenView = (product: any) => {
        setSelectedProduct(product);
        setDrawerMode('VIEW');
        setIsDrawerOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await axios.delete(`http://localhost:3000/products/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Product deleted successfully');
            fetchProducts();
        } catch (err) {
            console.error(err);
            alert('Failed to delete product');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('sku', formData.sku);
            data.append('price', String(formData.price));
            data.append('cost', String(formData.cost));
            data.append('stock', String(formData.stock));
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('type', formData.type);
            if (formData.image) data.append('image', formData.image); // Keep existing URL if no new file
            if (selectedFile) data.append('file', selectedFile);

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            if (drawerMode === 'CREATE') {
                await axios.post('http://localhost:3000/products', data, config);
                alert('Product created successfully!');
            } else if (drawerMode === 'EDIT' && selectedProduct) {
                await axios.put(`http://localhost:3000/products/${selectedProduct.id}`, data, config);
                alert('Product updated successfully!');
            }
            setIsDrawerOpen(false);
            fetchProducts();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Operation failed');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Product Inventory</h3>
                    <p className="text-gray-500">Manage catalog, pricing, and stock levels</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-[var(--primary)] text-[var(--background)] px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Product
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
                        placeholder="Search products by name or SKU..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] text-sm"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--primary)]/5">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Price (IDR)</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {currentItems.map((p) => (
                                <tr key={p.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-[var(--background)] border border-[var(--card-border)] overflow-hidden flex items-center justify-center">
                                                {p.image ? (
                                                    <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-[var(--foreground)]">{p.name}</div>
                                                <div className="text-xs text-gray-500">{p.category}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                        {p.sku || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)] text-right font-mono">
                                        {p.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${p.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            p.stock > 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3 justify-center">
                                        <button onClick={() => handleOpenView(p)} className="text-blue-400 hover:text-blue-500 transition-colors" title="View">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleOpenEdit(p)} className="text-[var(--primary)] hover:opacity-80 transition-colors" title="Edit">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                            </svg>
                                        </button>
                                        <button onClick={() => handleDelete(p.id)} className="text-red-400 hover:text-red-500 transition-colors" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zM12 20.25a8.25 8.25 0 008.25-8.25M12 20.25a8.25 8.25 0 01-8.25-8.25m0 0v-4.5m0 4.5h4.5m4.5 0h4.5m-13.5-9h18" />
                                            </svg>
                                        </div>
                                        <p className="font-medium">No products found</p>
                                        <p className="text-sm mt-1">Add items to your inventory to start selling.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={10}
                    onPageChange={paginate}
                />
            </div>

            {/* Product Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={drawerMode === 'CREATE' ? 'Add Inventory Item' : drawerMode === 'EDIT' ? 'Edit Product' : 'Product Details'}
                width="max-w-xl"
            >
                {drawerMode === 'VIEW' ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-gradient-to-br from-[var(--card-bg)] to-[var(--background)] rounded-xl border border-[var(--card-border)] text-center">
                            <h3 className="text-2xl font-bold text-[var(--foreground)]">{selectedProduct?.name}</h3>
                            <p className="text-[var(--primary)] text-lg font-medium mt-1">Rp {selectedProduct?.price.toLocaleString('id-ID')}</p>
                            <span className="mt-2 inline-block px-3 py-1 bg-[var(--foreground)]/5 rounded-full text-sm text-gray-500">
                                SKU: {selectedProduct?.sku || 'N/A'}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Stock Level</label>
                                <p className="text-xl font-bold text-[var(--foreground)] mt-1">{selectedProduct?.stock}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Base Cost</label>
                                <p className="text-xl font-bold text-[var(--foreground)] mt-1">Rp {selectedProduct?.cost.toLocaleString('id-ID')}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Category</label>
                                <p className="text-lg font-medium text-[var(--foreground)] mt-1">{selectedProduct?.category}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Margin</label>
                                <p className="text-lg font-medium text-green-500 mt-1">
                                    {selectedProduct?.price > selectedProduct?.cost
                                        ? `${Math.round(((selectedProduct.price - selectedProduct.cost) / selectedProduct.price) * 100)}%`
                                        : '0%'}
                                </p>
                            </div>
                        </div>

                        {selectedProduct?.description && (
                            <div>
                                <h4 className="font-medium text-[var(--foreground)] mb-2">Description</h4>
                                <p className="text-gray-500 text-sm leading-relaxed">{selectedProduct.description}</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Product Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Wireless Mouse"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">SKU Code</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                    value={formData.sku}
                                    onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                    placeholder="Auto-generated if empty"
                                />
                                <p className="text-xs text-gray-400 mt-1">Leave blank to auto-generate unique SKU.</p>
                            </div>

                            <div className="col-span-2 space-y-2">
                                <label className="block text-sm font-medium text-[var(--foreground)]">Product Image</label>
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                // Create a local preview URL
                                                const url = URL.createObjectURL(file);
                                                setFormData({ ...formData, image: url });
                                            }
                                        }}
                                        className="w-full text-sm text-[var(--foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[var(--primary)] file:text-[var(--background)] hover:file:opacity-90 transition-all"
                                    />
                                </div>
                                <div className="text-xs text-center text-gray-500">- OR -</div>
                                <input
                                    type="url"
                                    placeholder="Paste Image URL"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all"
                                    value={formData.image}
                                    onChange={e => {
                                        setFormData({ ...formData, image: e.target.value });
                                        setSelectedFile(null); // Clear file if user types URL
                                    }}
                                />
                                {formData.image && (
                                    <div className="mt-2 h-40 w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] overflow-hidden flex items-center justify-center relative bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${formData.image})` }}>
                                        {/* Preview Container */}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Product Type</label>
                                <select
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm appearance-none"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="GOODS">Physical Goods (Stok)</option>
                                    <option value="SERVICE">Service (Jasa/Billing)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Category</label>
                                <select
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="General">General</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Food & Bev">Food & Bev</option>
                                    <option value="Services">Services</option>
                                    <option value="Digital">Digital</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Sale Price (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    required
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Base Cost (Rp)</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                    value={formData.cost}
                                    onChange={e => setFormData({ ...formData, cost: Number(e.target.value) })}
                                    min="0"
                                />
                            </div>

                            {formData.type === 'GOODS' && (
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Current Stock</label>
                                    <input
                                        type="number"
                                        className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] focus:outline-none transition-all shadow-sm"
                                        value={formData.stock}
                                        onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        min="0"
                                    />
                                    <p className="text-xs text-gray-400 mt-1">Set to 0 if out of stock.</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setIsDrawerOpen(false)}
                                className="flex-1 px-4 py-3 rounded-lg border border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--foreground)]/5 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 rounded-lg bg-[var(--primary)] text-[var(--background)] font-bold hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                            >
                                {drawerMode === 'CREATE' ? 'Add Product' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                )}
            </Drawer>
        </div >
    );
}
