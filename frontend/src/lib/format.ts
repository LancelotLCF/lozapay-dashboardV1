export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-PE", { maximumFractionDigits: 0 }).format(value);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "percent",
    maximumFractionDigits: 1,
  }).format(value);
}

export function shortDate(value: string): string {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short" }).format(new Date(`${value}T00:00:00`));
}
