"use client";

import { BarChart3, CircleGauge, ClipboardList, FileText, Info, LayoutDashboard, Target, UserRound, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart } from "@/components/BarChart";
import { Column, DataTable } from "@/components/DataTable";
import { DonutChart } from "@/components/DonutChart";
import { FilterPanel } from "@/components/FilterPanel";
import { GaugeChart } from "@/components/GaugeChart";
import { KpiCard } from "@/components/KpiCard";
import { LineChart } from "@/components/LineChart";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/format";
import type { ClientRow, DashboardData, DashboardFilters, ExecutiveRow } from "@/types/dashboard";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const EMPTY_FILTERS: DashboardFilters = { periodo: "", tipoVenta: "", jefatura: "", supervisor: "" };

const executiveColumns: Array<Column<ExecutiveRow>> = [
  { key: "ejecutivo", label: "Ejecutivo" },
  { key: "qRuc", label: "Q RUC", align: "right", format: (value) => formatNumber(Number(value)) },
  { key: "volM0", label: "Vol M0", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "volM1", label: "Vol M1", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "volM2", label: "Vol M2", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "volM3", label: "Vol M3", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "total", label: "Total", align: "right", format: (value) => formatCurrency(Number(value)) },
];

const clientColumns: Array<Column<ClientRow>> = [
  { key: "ruc", label: "RUC" },
  { key: "razonSocial", label: "Razón Social" },
  { key: "supervisor", label: "Supervisor" },
  { key: "ejecutivo", label: "Ejecutivo" },
  { key: "volM0", label: "Vol M0", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "volM1", label: "Vol M1", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "volM2", label: "Vol M2", align: "right", format: (value) => formatCurrency(Number(value)) },
  { key: "volM3", label: "Vol M3", align: "right", format: (value) => formatCurrency(Number(value)) },
];

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_FILTERS);
  const [goal, setGoal] = useState(800000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    try {
      const response = await fetch(`${API_URL}/api/dashboard?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo cargar la información comercial.");
      setData((await response.json()) as DashboardData);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Error inesperado.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchDashboard();
    const timer = window.setInterval(() => void fetchDashboard(), 15000);
    return () => window.clearInterval(timer);
  }, [fetchDashboard]);

  const kpis = data?.kpis;
  const lastUpdated = useMemo(() => {
    if (!data?.status.lastModified) return "Sin actualización";
    return new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" }).format(new Date(data.status.lastModified));
  }, [data?.status.lastModified]);

  return (
    <main className="min-h-screen bg-[#F5F6F8] text-[#2E2E2E]">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-20 border-r border-black/5 bg-white shadow-[8px_0_24px_rgba(26,39,48,0.06)] md:block">
        <div className="h-36 bg-[#FF6B6B] p-3">
          <div className="grid h-16 place-items-center rounded-[8px] bg-[#28D7D9] text-white shadow-lg">
            <BarChart3 size={30} />
          </div>
        </div>
        <nav className="mt-10 grid gap-10 text-[#8A9297]">
          {[LayoutDashboard, UserRound, UsersRound, ClipboardList, Target].map((Icon, index) => (
            <button key={index} className="mx-auto grid h-10 w-10 place-items-center rounded-[8px] transition hover:bg-[#E9FBFB] hover:text-[#28D7D9]" aria-label="Navegación">
              <Icon size={24} />
            </button>
          ))}
        </nav>
      </aside>

      <div className="px-4 py-4 md:ml-20 lg:px-7">
        <header className="rounded-[8px] border border-black/5 bg-white p-5 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
          <div className="grid gap-5 xl:grid-cols-[1fr_minmax(620px,1.45fr)] xl:items-center">
            <div>
              <h1 className="text-3xl font-black tracking-normal text-[#2E2E2E]">REPORTE DE VENTAS</h1>
              <p className="mt-2 text-base font-semibold text-[#8A9297]">Resumen general del desempeño comercial</p>
            </div>
            <FilterPanel filters={filters} options={data?.filters ?? { periodo: [], tipoVenta: [], jefatura: [], supervisor: [] }} onChange={setFilters} onClear={() => setFilters(EMPTY_FILTERS)} />
          </div>
        </header>

        {error || data?.status.error ? (
          <div className="mt-4 rounded-[8px] border border-[#FFB3B3] bg-white p-4 text-sm font-semibold text-[#B44141]">
            {error ?? data?.status.error}
          </div>
        ) : null}

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <KpiCard title="Q RUC" value={formatNumber(kpis?.qRuc ?? 0)} subtitle="Total registrados" icon={FileText} />
          <KpiCard title="Q Activo" value={formatNumber(kpis?.qActivo ?? 0)} subtitle="Con ventas" icon={UserRound} />
          <KpiCard title="% Activo" value={formatPercent(kpis?.pctActivo ?? 0)} subtitle="RUC con ventas" icon={CircleGauge} />
          <KpiCard title="Ejecutivos 0 Ventas" value={formatNumber(kpis?.ejecutivosCeroVentas ?? 0)} subtitle="Sin ventas" icon={UserRound} tone="coral" />
          <KpiCard title="% Ejecutivos 0 Ventas" value={formatPercent(kpis?.pctEjecutivosCeroVentas ?? 0)} subtitle="Del total ejecutivos" icon={Target} tone="coral" />
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_1.1fr_1fr_0.82fr]">
          <DonutChart data={data?.charts.supervisorM0 ?? []} />
          <BarChart data={data?.charts.supervisorM1 ?? []} />
          <LineChart data={data?.charts.dailyM0 ?? []} target={goal} />
          <div>
            <GaugeChart value={kpis?.volM0 ?? 0} target={goal} />
            <label className="mt-3 block rounded-[8px] border border-black/5 bg-white p-3 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
              <span className="text-xs font-black text-[#596166]">Meta configurable</span>
              <input
                type="number"
                min={0}
                value={goal}
                onChange={(event) => setGoal(Number(event.target.value))}
                className="mt-2 h-10 w-full border border-[#E5E9EC] px-3 text-sm font-bold outline-none focus:border-[#28D7D9]"
              />
            </label>
          </div>
        </section>

        <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_1fr]">
          <DataTable title="Desempeño por Ejecutivo" rows={data?.tables.executives ?? []} columns={executiveColumns} />
          <DataTable title="Clientes" rows={data?.tables.clients ?? []} columns={clientColumns} searchable searchPlaceholder="Buscar RUC, razón social o ejecutivo" />
        </section>

        <footer className="flex items-center gap-3 px-1 py-5 text-xs font-semibold text-[#8A9297]">
          <Info size={18} className="text-[#28D7D9]" />
          <span>
            Información actualizada al último cambio del Excel. Filas: {data?.status.rows ?? 0}. Última lectura: {lastUpdated}.
            {loading ? " Cargando..." : ""}
          </span>
        </footer>
      </div>
    </main>
  );
}
