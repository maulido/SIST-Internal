
'use client';

interface TopProductsProps {
    products: any[];
}

export function TopProducts({ products }: TopProductsProps) {
    return (
        <div className="space-y-4">
            {products.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/5 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-gray-500 text-sm">
                            {index + 1}
                        </div>
                        <div>
                            <p className="font-medium text-[var(--foreground)]">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-[var(--foreground)]">{product.soldQuantity} sold</p>
                        <p className="text-xs text-gray-500">Rp {(product.price * product.soldQuantity).toLocaleString()}</p>
                    </div>
                </div>
            ))}
            {products.length === 0 && (
                <p className="text-center text-gray-500 py-4">No sales data yet.</p>
            )}
        </div>
    );
}
