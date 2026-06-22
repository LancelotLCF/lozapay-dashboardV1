"use client";

import { Bar, BarChart as ReBarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ChartPoint } from "@/types/dashboard";
import { formatCurrency } from "@/lib/format";

export function BarChart({ data }: { data: ChartPoint[] }) {
  return (
    <section className="rounded-[8px] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
      <h2 className="text-base font-black text-[#2E2E2E]">Volumen M1 por Supervisor</h2>
      <div className="mt-4 h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <ReBarChart data={data} layout="vertical" margin={{ left: 8, right: 42, top: 6, bottom: 6 }}>
            <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="supervisor" type="category" width={115} tick={{ fontSize: 12, fill: "#2E2E2E" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="value" fill="#28D7D9" radius={[0, 6, 6, 0]} background={{ fill: "#EEF2F4" }} />
          </ReBarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
