"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { ChartPoint } from "@/types/dashboard";
import { formatCurrency, formatPercent } from "@/lib/format";

const COLORS = ["#28D7D9", "#FF6B6B", "#3F474D", "#8C969B", "#7ADFE1", "#FF9A9A", "#C9D3D7"];

export function DonutChart({ data }: { data: ChartPoint[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <section className="rounded-[8px] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
      <h2 className="text-base font-black text-[#2E2E2E]">Volumen M0 por Supervisor</h2>
      <div className="mt-3 grid min-h-[260px] grid-cols-1 items-center gap-4 xl:grid-cols-[1fr_170px]">
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="supervisor" innerRadius="58%" outerRadius="86%" paddingAngle={2}>
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [`${formatCurrency(value)} (${formatPercent(total ? value / total : 0)})`, name]} />
              <text x="50%" y="47%" textAnchor="middle" dominantBaseline="middle" className="fill-[#2E2E2E] text-2xl font-black">
                {formatCurrency(total)}
              </text>
              <text x="50%" y="58%" textAnchor="middle" dominantBaseline="middle" className="fill-[#6D7378] text-sm font-bold">
                Total
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-black text-[#596166]">Supervisor</p>
          {data.map((item, index) => (
            <div key={item.supervisor} className="flex items-center justify-between gap-3 text-xs font-semibold text-[#596166]">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="truncate">{item.supervisor}</span>
              </span>
              <span>{formatPercent(total ? item.value / total : 0)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
