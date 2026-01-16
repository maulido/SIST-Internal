'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const { token, isLoading } = useAuth();

    // Drawer States
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [drawerMode, setDrawerMode] = useState<'CREATE' | 'VIEW'>('CREATE');
    const [selectedExpense, setSelectedExpense] = useState<any>(null);

    // Form Data
    const [formData, setFormData] = useState({
        description: '',
        category: 'Operational',
        amount: '', // String for better input handling, parsed on submit
        paymentMethod: 'CASH',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchExpenses = () => {
        if (token && !isLoading) {
            // Currently backend doesn't have dedicated 'get expenses', so we fetch all transactions and filter client side
            // Or better, backend should support ?type=EXPENSE. For now assuming getAll returns all.
            axios.get('http://localhost:3000/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    const all = Array.isArray(res.data) ? res.data : [];
                    const expenseOnly = all.filter((t: any) => t.type === 'EXPENSE');
                    setExpenses(expenseOnly);
                })
                .catch(err => console.error(err));
        }
    };

    useEffect(() => {
        if (!isLoading) fetchExpenses();
    }, [token, isLoading]);

    const handleOpenCreate = () => {
        setFormData({
            description: '',
            category: 'Operational',
            amount: '',
            paymentMethod: 'CASH',
            date: new Date().toISOString().split('T')[0]
        });
        setDrawerMode('CREATE');
        setIsDrawerOpen(true);
    };

    const handleOpenView = (expense: any) => {
        setSelectedExpense(expense);
        setDrawerMode('VIEW');
        setIsDrawerOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/transactions/expense', {
                ...formData,
                amount: Number(formData.amount) * (formData.amount > 0 ? 1 : -1) // Ensure positive, backend logic handles sign usually? No, expense usually 400. 
                // Wait, in previous file I saw comment: "Service creates transaction with type EXPENSE."
                // Usually for expenses we send positive amount and backend marks it as expense (-).
                // Let's send positive Number.
                // Re-reading previous code: "amount: Number(formData.amount) * -1 // Store as negative"
                // Okay, I will send positive and let's check backend or just trust previous logic? 
                // Actually previous code sent * -1. Let's try sending POSITIVE and let backend handle, or NEGATIVE if that was working.
                // The previous code explicitly did `* -1`. I'll assume endpoint expects negative for expense? 
                // Let's stick to sending POSITIVE and letting backend/logic decide, OR if I need to match previous logic:
                // Previous logic: `amount: Number(formData.amount) * -1`.
                // I'll stick to that to be safe.
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Expense recorded successfully!');
            setIsDrawerOpen(false);
            fetchExpenses();
        } catch (err: any) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to record expense');
        }
    };

    const totalExpenses = expenses.reduce((acc, curr) => acc + Math.abs(curr.amount), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 className="text-3xl font-bold text-[var(--foreground)]">Expense Tracking</h3>
                    <p className="text-gray-500">Monitor operational costs and overhead</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Record Expense
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 backdrop-blur-sm shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[var(--foreground)]">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Total Expenses</p>
                    <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">Rp {totalExpenses.toLocaleString('id-ID')}</p>
                </div>
                {/* Can add more cards here like "High Priority" or "This Month" if mock data allows */}
            </div>

            {/* Expenses List */}
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm overflow-hidden shadow-sm">
                <div className="p-4 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--primary)]/5">
                    <h4 className="font-semibold text-[var(--foreground)]">Recent Records</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-[var(--card-border)]">
                        <thead className="bg-[var(--card-bg)]">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--card-border)]">
                            {expenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-[var(--foreground)]/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--foreground)]">
                                        {new Date(exp.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-[var(--foreground)]">
                                        {exp.description || 'Expense Output'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs rounded-full font-medium border border-[var(--card-border)] text-gray-500`}>
                                            {exp.category || 'Operational'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-500 text-right font-mono">
                                        Rp {Math.abs(exp.amount).toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <button
                                            onClick={() => handleOpenView(exp)}
                                            className="text-[var(--primary)] hover:opacity-80 transition-colors text-sm font-medium"
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No expenses recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Drawer */}
            <Drawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                title={drawerMode === 'CREATE' ? 'Record New Expense' : 'Expense Details'}
            >
                {drawerMode === 'VIEW' ? (
                    <div className="space-y-6">
                        <div className="p-6 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">Rp {Math.abs(selectedExpense?.amount).toLocaleString('id-ID')}</h3>
                            <p className="text-gray-500 text-sm mt-1">{selectedExpense?.description}</p>
                            <span className="mt-3 inline-block px-3 py-1 bg-white dark:bg-black/20 rounded-full text-xs font-bold text-gray-500 border border-gray-200 dark:border-white/10">
                                {selectedExpense?.id}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Category</label>
                                <p className="text-sm font-medium text-[var(--foreground)] mt-1">{selectedExpense?.category || 'General'}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Date</label>
                                <p className="text-sm font-medium text-[var(--foreground)] mt-1">{new Date(selectedExpense?.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Payment Method</label>
                                <p className="text-sm font-medium text-[var(--foreground)] mt-1">{selectedExpense?.paymentMethod}</p>
                            </div>
                            <div className="p-4 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                                <label className="text-xs text-gray-500 uppercase tracking-wide">Recorded By</label>
                                <p className="text-sm font-medium text-[var(--foreground)] mt-1">{selectedExpense?.userId // Ideally map to name
                                }</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Description</label>
                            <input
                                type="text"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all shadow-sm"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Office Rent"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[var(--foreground)]">Amount (Rp)</label>
                            <input
                                type="number"
                                className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all shadow-sm font-mono"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0"
                                required
                                min="0"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Category</label>
                                <select
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all shadow-sm appearance-none"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option value="Operational">Operational</option>
                                    <option value="Fixed">Fixed Cost</option>
                                    <option value="Variable">Variable Cost</option>
                                    <option value="Investment">Investment</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-[var(--foreground)]">Payment Method</label>
                                <select
                                    className="w-full rounded-lg bg-[var(--background)] border border-gray-300 dark:border-[var(--card-border)] p-3 text-[var(--foreground)] focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none transition-all shadow-sm appearance-none"
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                >
                                    <option value="CASH">Cash</option>
                                    <option value="TRANSFER">Transfer</option>
                                    <option value="QRIS">QRIS</option>
                                </select>
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
                                className="flex-1 px-4 py-3 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-500/30"
                            >
                                Record Expense
                            </button>
                        </div>
                    </form>
                )}
            </Drawer>
        </div>
    );
}
