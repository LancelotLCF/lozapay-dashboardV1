"use client";

import { ArrowDownUp, Search } from "lucide-react";
import { useMemo, useState } from "react";

export type Column<T> = {
  key: keyof T;
  label: string;
  align?: "left" | "right";
  format?: (value: T[keyof T], row: T) => string;
};

type DataTableProps<T> = {
  title: string;
  rows: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
};

export function DataTable<T extends Record<string, string | number>>({ title, rows, columns, searchable, searchPlaceholder }: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof T>(columns[0]?.key);
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const visibleRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = normalized
      ? rows.filter((row) => Object.values(row).some((value) => String(value).toLowerCase().includes(normalized)))
      : rows;

    return [...filtered].sort((a, b) => {
      const first = a[sortKey];
      const second = b[sortKey];
      const result = typeof first === "number" && typeof second === "number" ? first - second : String(first).localeCompare(String(second));
      return direction === "asc" ? result : -result;
    });
  }, [direction, query, rows, sortKey]);

  function changeSort(key: keyof T) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection("desc");
  }

  return (
    <section className="rounded-[8px] border border-black/5 bg-white p-4 shadow-[0_10px_28px_rgba(26,39,48,0.08)]">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-black text-[#2E2E2E]">{title}</h2>
        {searchable ? (
          <label className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#80898E]" size={16} />
            <input
              className="h-10 w-full border border-[#E5E9EC] bg-[#F9FAFB] pl-9 pr-3 text-sm outline-none focus:border-[#28D7D9]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder ?? "Buscar"}
            />
          </label>
        ) : null}
      </div>
      <div className="thin-scrollbar max-h-[320px] overflow-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-[#28D7D9] text-white">
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className={`px-3 py-2 font-black ${column.align === "right" ? "text-right" : "text-left"}`}>
                  <button type="button" className="inline-flex items-center gap-1" onClick={() => changeSort(column.key)}>
                    {column.label}
                    <ArrowDownUp size={13} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b border-[#E6EAED] odd:bg-white even:bg-[#FAFBFC]">
                {columns.map((column) => (
                  <td key={String(column.key)} className={`px-3 py-2 font-semibold text-[#3E464B] ${column.align === "right" ? "text-right" : "text-left"}`}>
                    {column.format ? column.format(row[column.key], row) : String(row[column.key])}
                  </td>
                ))}
              </tr>
            ))}
            {visibleRows.length === 0 ? (
              <tr>
                <td className="px-3 py-8 text-center font-semibold text-[#80898E]" colSpan={columns.length}>
                  Sin registros para mostrar
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
