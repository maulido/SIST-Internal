
'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface RevenueChartProps {
    data: { date: string; amount: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 30,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="var(--foreground)"
                        opacity={0.5}
                        fontSize={12}
                        tickFormatter={(value) => {
                            const date = new Date(value);
                            return `${date.getDate()}/${date.getMonth() + 1}`;
                        }}
                    />
                    <YAxis
                        stroke="var(--foreground)"
                        opacity={0.5}
                        fontSize={12}
                        tickFormatter={(value) => `Rp ${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'var(--card-bg)',
                            borderColor: 'var(--card-border)',
                            borderRadius: '12px',
                            color: 'var(--foreground)'
                        }}
                        formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="var(--primary)"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        strokeWidth={2}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
