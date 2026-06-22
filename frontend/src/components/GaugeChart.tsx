"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { formatPercent } from "@/lib/format";

export function GaugeChart({ value, target }: { value: number; target: number }) {
  const percent = target > 0 ? Math.min(value / target, 1) : 0;
  const data = [
    { name: "Avance", value: percent },
    { name: "Pendiente", value: Math.max(1 - percent, 0) },
  ];

  return (
    <section className="rounded-[8px] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
      <h2 className="text-base font-black text-[#2E2E2E]">Cumplimiento de Cuota</h2>
      <div className="relative mt-5 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" startAngle={180} endAngle={0} innerRadius="65%" outerRadius="88%" stroke="none">
              <Cell fill="#28D7D9" />
              <Cell fill="#ECF0F2" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-x-0 bottom-10 text-center">
          <p className="text-4xl font-light text-[#2E2E2E]">{formatPercent(percent)}</p>
          <p className="mt-6 text-sm font-black text-[#596166]">Cuota GPV</p>
        </div>
        <div className="absolute bottom-6 left-2 right-2 flex justify-between text-xs font-bold text-[#747C81]">
          <span>0.00 %</span>
          <span>100.00 %</span>
        </div>
      </div>
    </section>
  );
}
