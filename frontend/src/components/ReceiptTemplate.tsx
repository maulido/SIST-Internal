import React from 'react';

interface ReceiptProps {
    transaction: any;
}

export const ReceiptTemplate = React.forwardRef<HTMLDivElement, ReceiptProps>(({ transaction }, ref) => {
    if (!transaction) return null;

    return (
        <div ref={ref} className="hidden print:block p-4 text-xs font-mono w-[80mm] mx-auto">
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold">TOKOKU STORE</h2>
                <p>Jl. Teknologi No. 123, Jakarta</p>
                <p>Telp: (021) 555-0123</p>
            </div>

            <div className="border-b border-black pb-2 mb-2">
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Time:</span>
                    <span>{new Date(transaction.date).toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Receipt #:</span>
                    <span>{transaction.id.slice(-6)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Cashier:</span>
                    <span>{transaction.creator?.name || 'Staff'}</span>
                </div>
            </div>

            <table className="w-full mb-4">
                <thead>
                    <tr className="border-b border-black text-left">
                        <th className="py-1">Item</th>
                        <th className="py-1 text-right">Qty</th>
                        <th className="py-1 text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {transaction.items.map((item: any, index: number) => (
                        <tr key={index}>
                            <td className="py-1 max-w-[40mm] truncate">{item.product?.name || item.name}</td>
                            <td className="py-1 text-right">{item.quantity}</td>
                            <td className="py-1 text-right">{parseInt((item.price * item.quantity).toString()).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-t border-black pt-2 mb-4 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL</span>
                    <span>Rp {parseInt(transaction.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                    <span>Payment ({transaction.paymentMethod})</span>
                    <span>Rp {parseInt(transaction.amount).toLocaleString()}</span>
                </div>
            </div>

            <div className="text-center text-[10px]">
                <p>Thank you for shopping!</p>
                <p>Please keep this receipt for proof of purchase.</p>
            </div>
        </div>
    );
});

ReceiptTemplate.displayName = 'ReceiptTemplate';
