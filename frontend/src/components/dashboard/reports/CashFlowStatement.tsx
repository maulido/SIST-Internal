'use client';

interface CashFlowStatementProps {
    data: {
        operating: { inflow: number; outflow: number; net: number };
        investing: { inflow: number; outflow: number; net: number };
        financing: { inflow: number; outflow: number; net: number };
        netCashFlow: number;
        endingCash: number;
    };
}

export function CashFlowStatement({ data }: CashFlowStatementProps) {
    if (!data) return null;

    const sections = [
        {
            title: 'Operating Activities',
            items: [
                { label: 'Cash Receipts from Sales', value: data.operating.inflow, type: 'plus' },
                { label: 'Cash Paid for Expenses', value: data.operating.outflow, type: 'minus' }
            ],
            subtotal: data.operating.net
        },
        {
            title: 'Investing Activities',
            items: [
                { label: 'Sale of Assets', value: data.investing.inflow, type: 'plus' },
                { label: 'Purchase of Assets', value: data.investing.outflow, type: 'minus' }
            ],
            subtotal: data.investing.net
        },
        {
            title: 'Financing Activities',
            items: [
                { label: 'Capital Contributions', value: data.financing.inflow, type: 'plus' },
                { label: 'Dividends / Withdrawals', value: data.financing.outflow, type: 'minus' }
            ],
            subtotal: data.financing.net
        }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center pb-6 border-b border-[var(--card-border)] border-dashed">
                <h2 className="text-2xl font-bold text-[var(--foreground)]">Statement of Cash Flows</h2>
                <p className="text-gray-500 text-sm">Direct Method</p>
            </div>

            <div className="space-y-8">
                {sections.map((section, idx) => (
                    <div key={idx} className="space-y-3">
                        <h4 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-wide border-b border-[var(--card-border)] pb-2">{section.title}</h4>
                        <div className="space-y-2 pl-4">
                            {section.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                                    <span className={`font-mono ${item.value > 0 ? '' : 'text-gray-400'}`}>
                                        {item.type === 'minus' && item.value > 0 ? '-' : ''} Rp {item.value.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between pt-2 pr-2 font-medium bg-[var(--foreground)]/5 rounded-lg px-4 py-2 mt-2">
                            <span>Net Cash from {section.title.replace('Activities', '')}</span>
                            <span className={`font-mono ${section.subtotal >= 0 ? 'text-[var(--foreground)]' : 'text-red-500'}`}>
                                Rp {section.subtotal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}

                <div className="pt-6 border-t-2 border-[var(--foreground)]/10">
                    <div className="flex justify-between items-center text-lg font-bold">
                        <span className="text-[var(--primary)]">Net Increase in Cash</span>
                        <span className="font-mono text-[var(--foreground)]">Rp {data.netCashFlow.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
