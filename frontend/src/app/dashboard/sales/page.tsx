'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [isProcessing, setIsProcessing] = useState(false);
    const { token } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (token) {
            axios.get('http://localhost:3000/products', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => setProducts(res.data))
                .catch(err => console.error(err));
        }
    }, [token]);

    const addToCart = (product: any) => {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
        }
    };

    const removeFromCart = (productId: string) => {
        setCart(cart.filter(item => item.productId !== productId));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        setIsProcessing(true);

        // Mock Payment Gateway Delay
        if (paymentMethod !== 'CASH') {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        try {
            await axios.post('http://localhost:3000/transactions/sale', {
                items: cart,
                paymentMethod: paymentMethod,
                taxRate: 11, // PPN 11%
                adminFee: 0
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Sale recorded successfully!');
            setCart([]);
            router.push('/dashboard/transactions');
        } catch (err) {
            console.error(err);
            alert('Failed to record sale');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex h-full gap-6">
            {/* Product List */}
            <div className="flex-1 overflow-y-auto rounded-lg bg-white p-6 shadow">
                <h3 className="mb-4 text-xl font-bold">Products</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                    {products.map(product => (
                        <div key={product.id}
                            onClick={() => addToCart(product)}
                            className="cursor-pointer rounded border p-4 hover:border-indigo-500 hover:shadow-md transition">
                            <div className="font-semibold text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-500">Stock: {product.stock}</div>
                            <div className="mt-2 font-bold text-indigo-600">Rp {product.price}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Cart / Checkout */}
            <div className="w-96 rounded-lg bg-white p-6 shadow flex flex-col">
                <h3 className="mb-4 text-xl font-bold">Current Sale</h3>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {cart.length === 0 && <p className="text-gray-500 text-center">Cart is empty</p>}
                    {cart.map(item => (
                        <div key={item.productId} className="flex items-center justify-between border-b pb-2">
                            <div>
                                <div className="font-medium">{item.name}</div>
                                <div className="text-xs text-gray-500">x{item.quantity} @ {item.price}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">Rp {item.price * item.quantity}</span>
                                <button onClick={() => removeFromCart(item.productId)} className="text-red-500 hover:text-red-700">&times;</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>Rp {total}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                        <span>Tax (11%)</span>
                        <span>Rp {total * 0.11}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-indigo-700 mt-2">
                        <span>Grand Total</span>
                        <span>Rp {total * 1.11}</span>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-indigo-700"
                        >
                            <option value="CASH">Cash</option>
                            <option value="QRIS">QRIS (Mock)</option>
                            <option value="TRANSFER">Bank Transfer</option>
                            <option value="EWALLET">E-Wallet</option>
                        </select>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0 || isProcessing}
                        className="mt-4 w-full rounded bg-indigo-600 py-3 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
                    >
                        {isProcessing ? (
                            <span>Processing Payment...</span>
                        ) : (
                            <span>Checkout</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
