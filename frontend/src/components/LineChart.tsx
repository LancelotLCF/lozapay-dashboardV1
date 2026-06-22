"use client";

import { Area, CartesianGrid, Line, LineChart as ReLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/types/dashboard";
import { formatCurrency, shortDate } from "@/lib/format";

export function LineChart({ data, target }: { data: ChartPoint[]; target: number }) {
  const chartData = data.map((item) => ({ ...item, meta: target }));

  return (
    <section className="rounded-[8px] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
      <h2 className="text-base font-black text-[#2E2E2E]">Avance Diario M0</h2>
      <div className="mt-3 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={chartData} margin={{ left: 4, right: 20, top: 10, bottom: 8 }}>
            <defs>
              <linearGradient id="m0Area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#28D7D9" stopOpacity={0.32} />
                <stop offset="95%" stopColor="#28D7D9" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E7ECEF" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="date" tickFormatter={shortDate} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={78} />
            <Tooltip labelFormatter={(value) => shortDate(String(value))} formatter={(value: number, name: string) => [formatCurrency(value), name === "meta" ? "Meta" : "Vol M0"]} />
            <Area type="monotone" dataKey="value" fill="url(#m0Area)" stroke="none" />
            <Line type="monotone" dataKey="value" stroke="#28D7D9" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="meta" stroke="#8B9398" strokeDasharray="4 5" strokeWidth={2} dot={false} />
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
