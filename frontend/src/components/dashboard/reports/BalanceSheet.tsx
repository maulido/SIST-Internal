'use client';

interface BalanceSheetProps {
    data: {
        assets: {
            cash: number;
            inventory: number;
            fixedAssets: number;
            total: number;
        };
        liabilities: {
            accountsPayable: number;
            longTermDebt: number;
            total: number;
        };
        equity: {
            capital: number;
            retainedEarnings: number;
            total: number;
        };
    };
}

export function BalanceSheet({ data }: BalanceSheetProps) {
    if (!data) return null;

    return (
        <div className="space-y-8">
            <div className="text-center pb-6 border-b border-[var(--card-border)] border-dashed">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Balance Sheet</h2>
                <p className="text-gray-500 text-sm">Financial Position</p>
            </div>

            <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Assets Column */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-[var(--primary)] border-b-2 border-[var(--primary)] pb-2">Assets</h3>

                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase">Current Assets</h4>
                            <div className="pl-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Cash & Equivalents</span>
                                    <span className="font-mono">Rp {data.assets.cash.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Inventory</span>
                                    <span className="font-mono">Rp {data.assets.inventory.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-gray-500 mb-2 uppercase">Fixed Assets</h4>
                            <div className="pl-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Property, Plant & Equip</span>
                                    <span className="font-mono">Rp {data.assets.fixedAssets.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-3 bg-[var(--primary)]/10 px-4 rounded-lg border border-[var(--primary)]/20 mt-4">
                            <span className="font-bold text-[var(--primary)]">Total Assets</span>
                            <span className="font-bold font-mono text-[var(--foreground)]">Rp {data.assets.total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Liabilities & Equity Column */}
                <div className="space-y-8">
                    {/* Liabilities */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-red-500 border-b-2 border-red-500 pb-2">Liabilities</h3>
                        <div className="pl-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Accounts Payable</span>
                                <span className="font-mono">Rp {data.liabilities.accountsPayable.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 px-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <span className="font-medium text-red-600 dark:text-red-400">Total Liabilities</span>
                            <span className="font-mono font-bold text-[var(--foreground)]">Rp {data.liabilities.total.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Equity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-[var(--secondary)] border-b-2 border-[var(--secondary)] pb-2">Shareholder's Equity</h3>
                        <div className="pl-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Owner Capital</span>
                                <span className="font-mono">Rp {data.equity.capital.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Retained Earnings</span>
                                <span className="font-mono">Rp {data.equity.retainedEarnings.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 px-4 bg-[var(--secondary)]/10 rounded-lg">
                            <span className="font-medium text-[var(--secondary)]">Total Equity</span>
                            <span className="font-mono font-bold text-[var(--foreground)]">Rp {data.equity.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center py-3 bg-gray-100 dark:bg-gray-800 px-4 rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                        <span className="font-bold text-gray-600 dark:text-gray-300">Total Liab. & Equity</span>
                        <span className="font-bold font-mono text-[var(--foreground)]">Rp {(data.liabilities.total + data.equity.total).toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
