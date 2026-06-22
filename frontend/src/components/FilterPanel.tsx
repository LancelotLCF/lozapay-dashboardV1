"use client";

import { RotateCcw } from "lucide-react";
import type { DashboardFilters, FilterOptions } from "@/types/dashboard";

type FilterPanelProps = {
  filters: DashboardFilters;
  options: FilterOptions;
  onChange: (filters: DashboardFilters) => void;
  onClear: () => void;
};

const controls: Array<{ key: keyof DashboardFilters; label: string; allLabel: string }> = [
  { key: "periodo", label: "Periodo", allLabel: "Todos" },
  { key: "tipoVenta", label: "Tipo de Venta", allLabel: "Todas" },
  { key: "jefatura", label: "Jefatura", allLabel: "Todas" },
  { key: "supervisor", label: "Supervisor", allLabel: "Todos" },
];

export function FilterPanel({ filters, options, onChange, onClear }: FilterPanelProps) {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[repeat(4,minmax(135px,1fr))_auto]">
      {controls.map((control) => (
        <label key={control.key} className="rounded-[8px] border border-black/5 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(26,39,48,0.08)]">
          <span className="block text-xs font-bold text-[#596166]">{control.label}</span>
          <select
            className="mt-2 h-10 w-full border border-[#E5E9EC] bg-white px-2 text-sm font-semibold text-[#2E2E2E] outline-none focus:border-[#28D7D9]"
            value={filters[control.key]}
            onChange={(event) => onChange({ ...filters, [control.key]: event.target.value })}
          >
            <option value="">{control.allLabel}</option>
            {options[control.key].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button
        type="button"
        onClick={onClear}
        className="flex min-h-[76px] items-center justify-center gap-2 rounded-[8px] bg-[#28D7D9] px-5 text-sm font-black text-white shadow-[0_10px_22px_rgba(40,215,217,0.35)] transition hover:brightness-95"
      >
        <RotateCcw size={19} />
        Limpiar filtros
      </button>
    </div>
  );
}
