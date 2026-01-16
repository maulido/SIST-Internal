'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { Drawer } from '@/components/Drawer';
import { ReceiptTemplate } from '@/components/ReceiptTemplate';
import { SalesHistory } from '@/components/SalesHistory';

export default function SalesPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    const { token, isLoading } = useAuth();

    // Receipt Drawer State
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [lastTransaction, setLastTransaction] = useState<any>(null);

    // Search & Barcode State
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

    useEffect(() => {
        if (token && !isLoading) {
            axios.get('http://localhost:3000/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => {
                    setProducts(res.data);
                    setFilteredProducts(res.data);
                })
                .catch(err => console.error(err));
        }
    }, [token, isLoading]);

    // Filter Logic
    useEffect(() => {
        if (!searchQuery) {
            setFilteredProducts(products);
            return;
        }

        const lowerQuery = searchQuery.toLowerCase();

        // 1. Scan-to-Add Logic (Exact SKU Match)
        const exactMatch = products.find(p => p.sku?.toLowerCase() === lowerQuery || p.id === lowerQuery);
        if (exactMatch && exactMatch.stock > 0) {
            addToCart(exactMatch);
            setSearchQuery(''); // Clear after scan
            return;
        }

        // 2. Normal Filter
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.sku?.toLowerCase().includes(lowerQuery)
        );
        setFilteredProducts(filtered);
    }, [searchQuery, products]);

    // Keyboard Shortcut: Focus Search on "/"
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
                e.preventDefault();
                document.getElementById('pos-search')?.focus();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const addToCart = (product: any) => {
        // ... (existing logic)
        if (product.stock <= 0) return; // Prevent adding out of stock
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            // Check stock limit
            if (existing.quantity >= product.stock) {
                // Don't alert on scan, just ignore or play sound in future
                return;
            }
            setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1, stock: product.stock }]);
        }
    };

    // ... (rest of functions) 

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.productId === productId) {
                const newQty = item.quantity + delta;
                if (newQty <= 0) return item;
                if (newQty > item.stock) return item;
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = total * 0.11;
    const grandTotal = total + tax;

    const handleCheckout = async () => {
        // ... (existing checkout logic)
        setIsProcessing(true);

        // Mock Payment Gateway Delay
        if (paymentMethod !== 'CASH') {
            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        try {
            const payload = {
                items: cart,
                paymentMethod: paymentMethod,
                taxRate: 11,
                adminFee: 0
            };

            // In a real app, we'd get the ID back from the response to show in receipt
            const response = await axios.post('http://localhost:3000/transactions/sale', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Set receipt data
            setLastTransaction({
                id: response.data.id || `TRX-${Date.now()}`,
                date: new Date(),
                items: [...cart],
                total,
                tax,
                grandTotal,
                paymentMethod
            });

            setCart([]);
            setIsReceiptOpen(true);
        } catch (err) {
            console.error(err);
            alert('Failed to record sale');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6">
            {/* Product List */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h3 className="text-3xl font-bold text-[var(--foreground)]">Point of Sale</h3>
                        <p className="text-gray-500">Fast checkout system</p>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <input
                            id="pos-search"
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search or Scan Barcode... (/)"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--card-border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 transition-all outline-none"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(product => (
                            <div key={product.id}
                                onClick={() => addToCart(product)}
                                className={`
                                    relative p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-sm transition-all duration-200
                                    ${product.stock > 0
                                        ? 'cursor-pointer hover:border-[var(--primary)] hover:shadow-lg hover:-translate-y-1'
                                        : 'opacity-60 cursor-not-allowed grayscale'}
                                `}
                            >
                                <div className="aspect-square rounded-lg bg-[var(--background)] mb-3 flex items-center justify-center text-gray-400 text-xs">
                                    IMG
                                </div>
                                <div className="font-semibold text-[var(--foreground)] truncate">{product.name}</div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-gray-500">{product.stock} in stock</span>
                                    <span className="font-bold text-[var(--primary)] text-sm">Rp {product.price.toLocaleString('id-ID')}</span>
                                </div>
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                                        <span className="bg-red-500/80 text-white text-xs font-bold px-2 py-1 rounded">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Cart / Checkout Panel */}
            <div className="w-full lg:w-96 flex-shrink-0 flex flex-col rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md shadow-xl overflow-hidden h-[calc(100vh-140px)] sticky top-4">
                <div className="p-4 border-b border-[var(--card-border)] bg-[var(--primary)]/5">
                    <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        Current Order
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <p>Cart is empty</p>
                        </div>
                    )}
                    {cart.map(item => (
                        <div key={item.productId} className="flex items-center justify-between p-3 rounded-lg border border-[var(--card-border)] bg-[var(--background)]">
                            <div className="flex-1">
                                <div className="font-medium text-[var(--foreground)] text-sm">{item.name}</div>
                                <div className="text-xs text-gray-500">@ Rp {item.price.toLocaleString()}</div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center border border-[var(--card-border)] rounded-md">
                                    <button onClick={() => updateQuantity(item.productId, -1)} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/5 text-[var(--foreground)] text-xs font-bold">-</button>
                                    <span className="px-2 text-xs text-[var(--foreground)]">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.productId, 1)} className="px-2 py-1 hover:bg-gray-100 dark:hover:bg-white/5 text-[var(--foreground)] text-xs font-bold">+</button>
                                </div>
                                <span className="font-bold text-sm text-[var(--foreground)] w-20 text-right">
                                    {((item.price * item.quantity) / 1000).toFixed(0)}k
                                </span>
                                <button onClick={() => removeFromCart(item.productId)} className="text-red-400 hover:text-red-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Subtotal</span>
                            <span>Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Tax (11%)</span>
                            <span>Rp {tax.toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-[var(--primary)] border-t border-dashed border-[var(--card-border)] pt-2">
                            <span>Total</span>
                            <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full rounded-lg bg-[var(--background)] border border-[var(--card-border)] p-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none"
                            >
                                <option value="CASH">Cash Payment</option>
                                <option value="QRIS">QRIS / E-Wallet</option>
                                <option value="TRANSFER">Bank Transfer</option>
                                <option value="DEBIT">Debit Card</option>
                            </select>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className={`
                                w-full rounded-lg py-3 font-bold text-white shadow-lg transition-all flex justify-center items-center
                                ${cart.length === 0 || isProcessing
                                    ? 'bg-gray-500 cursor-not-allowed opacity-50'
                                    : 'bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] hover:opacity-90 hover:scale-[1.02]'}
                            `}
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                <span>Complete Sale</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Receipt Modal/Drawer */}
            <Drawer
                isOpen={isReceiptOpen}
                onClose={() => setIsReceiptOpen(false)}
                title="Transaction Receipt"
                width="max-w-md"
            >
                <div className="text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-[var(--foreground)]">Payment Successful!</h2>
                        <p className="text-gray-500 mt-1">Transaction recorded successfully.</p>
                    </div>

                    <div className="bg-[var(--background)] p-6 rounded-xl border border-[var(--card-border)] text-left space-y-4 font-mono text-sm relative overflow-hidden">
                        {/* Receipt zigzag decoration top */}
                        <div className="absolute top-0 left-0 right-0 h-2 bg-[var(--card-bg)]"
                            style={{ backgroundImage: 'linear-gradient(45deg, transparent 50%, var(--background) 50%), linear-gradient(-45deg, transparent 50%, var(--background) 50%)', backgroundSize: '10px 10px' }}></div>

                        <div className="flex justify-between border-b border-dashed border-gray-700 pb-2">
                            <span className="text-gray-500">TRX ID</span>
                            <span className="text-[var(--foreground)]">{lastTransaction?.id}</span>
                        </div>
                        <div className="flex justify-between border-b border-dashed border-gray-700 pb-2">
                            <span className="text-gray-500">Date</span>
                            <span className="text-[var(--foreground)]">{lastTransaction?.date?.toLocaleString()}</span>
                        </div>

                        <div className="space-y-1">
                            {lastTransaction?.items.map((item: any) => (
                                <div key={item.productId} className="flex justify-between">
                                    <span className="text-gray-500">{item.name} x{item.quantity}</span>
                                    <span className="text-[var(--foreground)]">{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-dashed border-gray-700 pt-2 space-y-1">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-[var(--foreground)]">{lastTransaction?.total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tax</span>
                                <span className="text-[var(--foreground)]">{lastTransaction?.tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg mt-2">
                                <span className="text-[var(--primary)]">TOTAL</span>
                                <span className="text-[var(--primary)]">Rp {lastTransaction?.grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                            onClick={() => window.print()}
                            className="w-full py-3 rounded-lg bg-[var(--primary)] text-white font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                            </svg>
                            Print Receipt
                        </button>
                        <button
                            onClick={() => setIsReceiptOpen(false)}
                            className="w-full py-3 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] font-medium hover:bg-[var(--card-border)] transition-colors"
                        >
                            Next Order
                        </button>
                    </div>
                </div>
            </Drawer>

            {/* Hidden Printable Receipt */}
            <div className="hidden print:block fixed inset-0 bg-white z-[9999] p-4 text-black font-mono text-xs leading-tight">
                <style jsx global>{`
                    @media print {
                        @page { margin: 0; size: 80mm auto; }
                        body * { visibility: hidden; }
                        #printable-receipt, #printable-receipt * { visibility: visible; }
                        #printable-receipt { position: absolute; left: 0; top: 0; width: 100%; }
                    }
                `}</style>
                <div id="printable-receipt" className="max-w-[80mm] mx-auto">
                    <div className="text-center mb-4">
                        <h1 className="text-xl font-bold uppercase">SIST Coffee</h1>
                        <p>Jl. Jendral Sudirman No. 1</p>
                        <p>Jakarta Pusat</p>
                        <p className="mt-2 text-[10px]">{lastTransaction?.date?.toLocaleString()}</p>
                        <p>TRX: {lastTransaction?.id}</p>
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    <div className="space-y-2">
                        {lastTransaction?.items.map((item: any) => (
                            <div key={item.productId} className="flex flex-col">
                                <div className="font-bold">{item.name}</div>
                                <div className="flex justify-between">
                                    <span>{item.quantity} x {item.price.toLocaleString()}</span>
                                    <span>{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    <div className="space-y-1">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{lastTransaction?.total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (11%)</span>
                            <span>{lastTransaction?.tax.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm mt-1">
                            <span>TOTAL</span>
                            <span>Rp {lastTransaction?.grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-[10px] mt-1">
                            <span>Pay ({lastTransaction?.paymentMethod})</span>
                            <span>Rp {lastTransaction?.grandTotal.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border-b border-black border-dashed my-2"></div>

                    <div className="text-center mt-4">
                        <p>Thank you for shopping!</p>
                        <p className="text-[10px] mt-1">Powered by SIST</p>
                    </div>
                </div>
            </div>
            {/* Sales History Drawer */}
            <SalesHistory
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                onReprint={(tx) => {
                    setLastTransaction(tx);
                    // Small delay to allow state update before print
                    setTimeout(() => window.print(), 100);
                }}
            />
        </div>
    );
}
