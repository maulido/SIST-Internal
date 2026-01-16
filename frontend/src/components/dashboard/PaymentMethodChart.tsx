'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface PaymentMethodChartProps {
    data: { name: string; value: number }[];
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--card-border)" />
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        tick={{ fill: 'var(--foreground)' }}
                        width={100}
                    />
                    <Tooltip
                        cursor={{ fill: 'var(--primary)', opacity: 0.1 }}
                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                        formatter={(value: any) => [`Rp ${value.toLocaleString()}`, 'Total Sales']}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill="var(--primary)" fillOpacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
