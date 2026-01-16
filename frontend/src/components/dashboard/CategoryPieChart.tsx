'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

interface CategoryPieChartProps {
    data: { name: string; value: number }[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
    if (!data || data.length === 0) {
        return <div className="h-[300px] flex items-center justify-center text-gray-400">No data available</div>;
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `Rp ${value.toLocaleString()}`}
                        contentStyle={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--foreground)' }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
