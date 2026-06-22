"use client";

import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  tone?: "turquoise" | "coral";
};

export function KpiCard({ title, value, subtitle, icon: Icon, tone = "turquoise" }: KpiCardProps) {
  const isCoral = tone === "coral";

  return (
    <section className="rounded-[8px] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
      <div className="flex items-center gap-4">
        <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-[8px] ${isCoral ? "bg-[#FF6B6B]" : "bg-[#28D7D9]"} text-white shadow-lg`}>
          <Icon size={29} strokeWidth={1.8} />
        </div>
        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-bold text-[#2E2E2E]">{title}</p>
          <p className="mt-1 text-3xl font-black tracking-normal text-[#2E2E2E]">{value}</p>
          <p className="mt-1 truncate text-sm font-medium text-[#6D7378]">{subtitle}</p>
        </div>
      </div>
    </section>
  );
}
