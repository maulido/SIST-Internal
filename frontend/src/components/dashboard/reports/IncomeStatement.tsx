'use client';

interface PnLProps {
    data: {
        revenue: number;
        cogs: number;
        grossProfit: number;
        grossMargin: number;
        operatingExpenses: number;
        operatingIncome: number; // EBIT
        netProfit: number;
        netMargin: number;
        expenseBreakdown: Record<string, number>;
    };
}

export function IncomeStatement({ data }: PnLProps) {
    if (!data) return null;

    return (
        <div className="space-y-6">
            <div className="text-center pb-6 border-b border-[var(--card-border)] border-dashed">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Income Statement</h2>
                <p className="text-gray-500 text-sm">Profit & Loss</p>
            </div>

            <div className="space-y-4">
                {/* Revenue */}
                <div className="space-y-2">
                    <h4 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wide">Revenue</h4>
                    <div className="flex justify-between text-sm pl-4">
                        <span className="text-gray-600 dark:text-gray-400">Gross Sales</span>
                        <span className="font-mono text-[var(--foreground)]">Rp {data.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm pl-4">
                        <span className="text-gray-600 dark:text-gray-400">Cost of Goods Sold</span>
                        <span className="font-mono text-red-500">- Rp {data.cogs.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold bg-[var(--foreground)]/5 p-3 rounded-lg">
                        <span>Gross Profit</span>
                        <div className="text-right">
                            <div className="font-mono">Rp {data.grossProfit.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 font-normal">{(data.grossMargin || 0).toFixed(1)}% Margin</div>
                        </div>
                    </div>
                </div>

                {/* Expenses */}
                <div className="space-y-2 pt-4">
                    <h4 className="text-sm font-bold text-orange-500 uppercase tracking-wide">Operating Expenses</h4>
                    {Object.entries(data.expenseBreakdown).map(([cat, amount]) => (
                        <div key={cat} className="flex justify-between text-sm pl-4 border-b border-[var(--card-border)] border-dashed py-1">
                            <span className="text-gray-600 dark:text-gray-400">{cat}</span>
                            <span className="font-mono text-[var(--foreground)]">Rp {amount.toLocaleString()}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-medium pt-2 px-3">
                        <span>Total Expenses</span>
                        <span className="font-mono text-red-500">- Rp {data.operatingExpenses.toLocaleString()}</span>
                    </div>
                </div>

                {/* Operating Income */}
                <div className="flex justify-between items-center py-3 border-t border-b border-[var(--card-border)]">
                    <span className="font-bold text-[var(--foreground)]">Operating Income (EBIT)</span>
                    <span className="font-mono font-bold text-[var(--foreground)]">Rp {data.operatingIncome.toLocaleString()}</span>
                </div>

                {/* Net Income */}
                <div className="pt-6">
                    <div className={`p-6 rounded-xl border-2 ${data.netProfit >= 0 ? 'border-green-500/20 bg-green-500/10' : 'border-red-500/20 bg-red-500/10'} flex justify-between items-center`}>
                        <div>
                            <h3 className="text-lg font-bold uppercase tracking-wider">Net Income</h3>
                            <p className="text-sm opacity-70">Bottom Line</p>
                        </div>
                        <div className="text-right">
                            <h3 className={`text-3xl font-bold font-mono ${data.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                Rp {data.netProfit.toLocaleString()}
                            </h3>
                            <p className="text-sm font-medium opacity-70">{(data.netMargin || 0).toFixed(1)}% Net Margin</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
