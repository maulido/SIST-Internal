'use client';

interface MetricCardProps {
    title: string;
    value: string | number;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    color: 'blue' | 'green' | 'violet' | 'orange';
}

function MetricCard({ title, value, subValue, trend, color }: MetricCardProps) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        violet: 'bg-violet-50 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    };

    return (
        <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] flex flex-col justify-between">
            <h5 className="text-sm font-medium text-gray-500">{title}</h5>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[var(--foreground)]">{value}</span>
                {subValue && <span className="text-xs text-gray-500">{subValue}</span>}
            </div>
            {trend && (
                <div className={`mt-2 text-xs font-medium w-fit px-2 py-1 rounded-full ${colorClasses[color]}`}>
                    {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '•'} Trend
                </div>
            )}
        </div>
    );
}

export default function FinancialHealthCards({ metrics }: { metrics: any }) {
    if (!metrics) return <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
                title="Gross Margin"
                value={`${metrics.grossMargin?.toFixed(1)}%`}
                color="blue"
            />
            <MetricCard
                title="Net Margin"
                value={`${metrics.netMargin?.toFixed(1)}%`}
                color="green"
            />
            <MetricCard
                title="Avg Order Value"
                value={`Rp ${(metrics.aov || 0).toLocaleString('id-ID', { maximumFractionDigits: 0 })}`}
                color="violet"
            />
            <MetricCard
                title="Sales Count"
                value={metrics.salesCount}
                color="orange"
            />
        </div>
    );
}
