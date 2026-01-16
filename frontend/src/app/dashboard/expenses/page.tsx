'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ExpensePage() {
    const { token } = useAuth();
    const router = useRouter();
    const [formData, setFormData] = useState({
        description: '',
        category: 'Operational', // Operational, Variable, Fixed, Investment
        amount: 0,
        paymentMethod: 'CASH'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/transactions/expense', {
                ...formData,
                amount: Number(formData.amount) * -1 // Store as negative for logic? Or keep positive and rely on type? Service stores absolute.
                // Logic check: Service creates transaction with type EXPENSE. Amount usually positive concept of "Cost", but P&L subtracts it.
                // Let's send positive amount, backend knows it is EXPENSE.
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Expense recorded!');
            router.push('/dashboard/transactions');
        } catch (err) {
            console.error(err);
            alert('Failed to record expense');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Record Expense</h3>

            <div className="rounded-lg bg-white p-6 shadow">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <input type="text" className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                            value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option value="Operational">Operational (Rutin)</option>
                                <option value="Fixed">Fixed Cost (Tetap)</option>
                                <option value="Variable">Variable Cost</option>
                                <option value="Investment">Investment</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                            <select className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                                value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}>
                                <option value="CASH">Cash</option>
                                <option value="TRANSFER">Transfer</option>
                                <option value="QRIS">QRIS</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Amount (Rp)</label>
                        <input type="number" className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                            value={formData.amount} onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })} required />
                    </div>

                    <button type="submit" className="w-full rounded bg-red-600 px-4 py-3 text-white font-bold hover:bg-red-700">
                        Record Expense
                    </button>
                </form>
            </div>
        </div>
    );
}
