
'use client';

import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}

export const ReceiptModal = ({ isOpen, onClose, transaction }: ReceiptModalProps) => {
    const receiptRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    if (!isOpen || !transaction) return null;

    const handleDownload = async () => {
        if (!receiptRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await html2canvas(receiptRef.current, {
                scale: 2, // Better quality
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true
            });

            const link = document.createElement('a');
            link.download = `SIST-Receipt-${transaction.id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to generate receipt image', error);
            alert('Gagal mengunduh struk.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const subtotal = transaction.items.reduce((acc: number, item: any) => {
        const val = item.subtotal || (Number(item.price) * Number(item.quantity));
        return acc + Number(val);
    }, 0);
    const total = Math.abs(Number(transaction.amount));
    const taxAndFees = total - subtotal;
    const normalizedTax = Math.round(taxAndFees * 100) / 100;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm print:p-0 print:bg-white print:static">

            {/* Modal Content */}
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden print:shadow-none print:w-auto print:max-w-none">

                {/* Header Actions (Hidden on Print/Capture) */}
                <div className="flex justify-between items-center p-4 border-b border-gray-100 print:hidden" data-html2canvas-ignore>
                    <h3 className="font-bold text-gray-800">Digital Receipt</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Receipt Area (Target for Capture) */}
                <div
                    ref={receiptRef}
                    className="p-6 bg-white text-gray-900 font-mono text-sm leading-relaxed printable-receipt relative"
                    style={{ minHeight: '400px' }}
                >
                    {/* Watermark/Background Decoration */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center overflow-hidden">
                        <div className="rotate-[-45deg] text-6xl font-black uppercase tracking-widest text-black">
                            SIST APP
                        </div>
                    </div>

                    {/* Receipt Content */}
                    <div className="relative z-10">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold uppercase tracking-wider mb-1">SIST APP</h2>
                            <p className="text-[10px] text-gray-500 uppercase">Integrated System Technology</p>
                            <div className="my-3 border-b-2 border-dashed border-gray-300"></div>
                            <p className="text-xs text-gray-500">
                                {new Date(transaction.createdAt || transaction.date).toLocaleDateString('id-ID', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                            <p className="text-xs text-gray-500">
                                {new Date(transaction.createdAt || transaction.date).toLocaleTimeString('id-ID')}
                            </p>
                        </div>

                        {/* Transaction Info */}
                        <div className="mb-4 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-500">ID:</span>
                                <span className="font-bold uppercase">#{transaction.id.toString().slice(-6)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Cashier:</span>
                                <span className="uppercase">{transaction.creator?.name || 'Admin'}</span>
                            </div>
                            {transaction.paymentMethod && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Payment:</span>
                                    <span className="uppercase">{transaction.paymentMethod}</span>
                                </div>
                            )}
                        </div>

                        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                        {/* Items */}
                        <div className="space-y-2 mb-4">
                            {transaction.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-col">
                                    <span className="font-semibold">{item.product?.name || item.productName || 'Item'}</span>
                                    <div className="flex justify-between text-gray-600">
                                        <span>{item.quantity} x {Number(item.priceAtTime || item.price).toLocaleString('id-ID')}</span>
                                        <span>{(Number(item.subtotal || (Number(item.price) * Number(item.quantity)))).toLocaleString('id-ID')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-b-2 border-dashed border-gray-300 my-4"></div>

                        {/* Totals */}
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            {normalizedTax > 1 && (
                                <div className="flex justify-between">
                                    <span>Tax & Fees</span>
                                    <span>Rp {normalizedTax.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-gray-900 border-dashed">
                                <span>TOTAL</span>
                                <span>Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        <div className="mt-8 text-center text-[10px] text-gray-500">
                            <p>Thank you for your business!</p>
                            <p>Please keep this receipt for your records.</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Hidden on Print/Capture) */}
                <div className="p-4 bg-gray-50 flex gap-3 print:hidden" data-html2canvas-ignore>
                    <button
                        onClick={handlePrint}
                        className="flex-1 py-2.5 px-4 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                        </svg>
                        Print
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="flex-1 py-2.5 px-4 border border-gray-300 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isDownloading ? (
                            <svg className="animate-spin h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                        )}
                        save Image
                    </button>
                </div>
            </div>
        </div>
    );
};
