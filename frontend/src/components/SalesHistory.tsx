import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';

interface SalesHistoryProps {
    isOpen: boolean;
    onClose: () => void;
    onReprint: (transaction: any) => void;
}

export const SalesHistory: React.FC<SalesHistoryProps> = ({ isOpen, onClose, onReprint }) => {
    const { token, user } = useAuth();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && token) {
            setLoading(true);
            // Fetch today's transactions for this user
            // Ideally backend supports filtering by date & user
            // For now using standard endpoint and client filtering if needed, 
            // but for performance backend filtering is better.
            // Using existing endpoint mock behavior for now.
            axios.get('http://localhost:3000/transactions', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    // Filter client side for now if backend returns all
                    // Assuming backend returns all, we filter by user and date = today
                    const today = new Date().toDateString();
                    const mySales = res.data.filter((t: any) =>
                        new Date(t.date).toDateString() === today &&
                        (t.creatorId === user?.userId || t.creator?.email === user?.email)
                    );
                    setTransactions(mySales.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [isOpen, token, user]);

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Today's Sales">
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading sales history...</div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No sales found for today.</div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div key={tx.id} className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex justify-between items-center">
                                <div>
                                    <div className="font-bold text-[var(--foreground)]">#{tx.id.slice(-6)}</div>
                                    <div className="text-xs text-gray-500">{new Date(tx.date).toLocaleTimeString()}</div>
                                    <div className="text-xs text-gray-500 mt-1">{tx.items.length} items • {tx.paymentMethod}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-[var(--primary)]">Rp {parseInt(tx.amount).toLocaleString()}</div>
                                    <button
                                        onClick={() => {
                                            onReprint(tx);
                                            onClose();
                                        }}
                                        className="text-xs text-[var(--foreground)] underline mt-1 hover:text-[var(--primary)]"
                                    >
                                        Reprint Receipt
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Drawer>
    );
};
