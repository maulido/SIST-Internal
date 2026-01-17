'use client';

interface TopProductsProps {
    products: {
        name: string;
        sku: string;
        quantity?: number;
        soldQuantity?: number;
        revenue?: number;
        price?: number;
    }[];
}

export function TopProducts({ products }: TopProductsProps) {
    return (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-6 h-full">
            <h4 className="text-xl font-bold text-[var(--foreground)] mb-4">Top Performing Products</h4>
            <div className="space-y-4">
                {products.map((product, index) => {
                    const qty = product.quantity || product.soldQuantity || 0;
                    const revenue = product.revenue ?? ((product.price || 0) * qty);

                    return (
                        <div key={product.sku || index} className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/5 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${index < 3 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'}`}>
                                    {index + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-[var(--foreground)]">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.sku}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-[var(--foreground)]">Rp {revenue.toLocaleString()}</p>
                                <p className="text-xs text-gray-500">{qty} sold</p>
                            </div>
                        </div>
                    );
                })}
                {products.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No sales data yet.</p>
                )}
            </div>
        </div>
    );
}
