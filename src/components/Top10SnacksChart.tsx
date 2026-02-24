"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface Top10SnacksChartProps {
    data: {
        name: string;
        quantity: number;
    }[];
}

export function Top10SnacksChart({ data }: Top10SnacksChartProps) {
    if (data.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-muted-foreground">
                ยังไม่มีข้อมูลออเดอร์
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <XAxis type="number" hide />
                <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'currentColor', fontSize: 12 }}
                    width={150}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar
                    dataKey="quantity"
                    fill="currentColor"
                    radius={[0, 4, 4, 0]}
                    className="fill-primary"
                    barSize={24}
                />
            </BarChart>
        </ResponsiveContainer>
    );
}
