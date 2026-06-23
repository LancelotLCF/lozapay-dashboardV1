import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SHEET_NAME = "Data";

const REQUIRED_COLUMNS = [
  "Periodo",
  "Fecha de Ingreso",
  "Fecha de Instalación",
  "Ruc",
  "Razón Social",
  "Tipo de Venta",
  "Producto",
  "Ejecutivo",
  "Supervisor",
  "Jefatura",
  "Vol M0",
  "Vol M1",
  "Vol M2",
  "Vol M3",
  "Ruc Activo",
] as const;

const TEXT_COLUMNS = [
  "Periodo",
  "Ruc",
  "Razón Social",
  "Tipo de Venta",
  "Producto",
  "Ejecutivo",
  "Supervisor",
  "Jefatura",
] as const;

const VOLUME_COLUMNS = ["Vol M0", "Vol M1", "Vol M2", "Vol M3"] as const;

type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];
type DataRow = Record<RequiredColumn, string | number | Date | null>;

type StoreStatus = {
  excelPath: string;
  sheet: string;
  lastModified: string | null;
  error: string | null;
  rows: number;
};

type StoreData = {
  rows: DataRow[];
  status: StoreStatus;
};

let cachedPath = "";
let cachedData: StoreData | null = null;

function emptyStatus(excelPath: string, error: string | null = null, lastModified: string | null = null): StoreData {
  return {
    rows: [],
    status: {
      excelPath,
      sheet: SHEET_NAME,
      lastModified,
      error,
      rows: 0,
    },
  };
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function cleanNumber(value: unknown): number {
  if (value === null || value === undefined || value === "") return 0;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function excelDate(value: unknown): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (!parsed) return null;
    return new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function periodValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 7);
  }
  const parsed = excelDate(value);
  if (parsed) return parsed.toISOString().slice(0, 7);
  return cleanText(value);
}

async function loadExcel(requestUrl: string): Promise<StoreData> {
  const excelPath = new URL("/Data Izipay.xlsx", requestUrl).toString();
  try {
    if (cachedData && cachedPath === excelPath) return cachedData;

    const response = await fetch(excelPath, { cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo leer el Excel desde ${excelPath}: ${response.status} ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[SHEET_NAME];
    if (!sheet) throw new Error(`No se encontrÃ³ la hoja: ${SHEET_NAME}`);

    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
    const missing = REQUIRED_COLUMNS.filter((column) => !rawRows.some((row) => column in row));
    if (missing.length) throw new Error(`Faltan columnas requeridas: ${missing.join(", ")}`);

    const rows = rawRows.map((rawRow) => {
      const row = Object.fromEntries(REQUIRED_COLUMNS.map((column) => [column, rawRow[column] ?? null])) as DataRow;
      TEXT_COLUMNS.forEach((column) => {
        row[column] = cleanText(row[column]);
      });
      VOLUME_COLUMNS.forEach((column) => {
        row[column] = cleanNumber(row[column]);
      });
      row["Ruc Activo"] = cleanNumber(row["Ruc Activo"]);
      row["Fecha de Ingreso"] = excelDate(row["Fecha de Ingreso"]);
      row["Fecha de Instalación"] = excelDate(row["Fecha de Instalación"]);
      row.Periodo = periodValue(row.Periodo);
      return row;
    });

    cachedPath = excelPath;
    cachedData = {
      rows,
      status: {
        excelPath,
        sheet: SHEET_NAME,
        lastModified: response.headers.get("last-modified"),
        error: null,
        rows: rows.length,
      },
    };
    return cachedData;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error inesperado leyendo el Excel.";
    cachedData = emptyStatus(excelPath, message);
    return cachedData;
  }
}

function optionValues(rows: DataRow[], column: RequiredColumn): string[] {
  return [...new Set(rows.map((row) => cleanText(row[column])).filter(Boolean))].sort();
}

function uniqueCount(rows: DataRow[], column: RequiredColumn): number {
  return new Set(rows.map((row) => cleanText(row[column])).filter(Boolean)).size;
}

function groupSum(rows: DataRow[], key: RequiredColumn, value: RequiredColumn, ascending = false) {
  const totals = new Map<string, number>();
  rows.forEach((row) => {
    const label = cleanText(row[key]);
    totals.set(label, (totals.get(label) ?? 0) + cleanNumber(row[value]));
  });
  return [...totals.entries()]
    .map(([label, total]) => ({ label, total }))
    .sort((a, b) => (ascending ? a.total - b.total : b.total - a.total));
}

function filterRows(rows: DataRow[], searchParams: URLSearchParams): DataRow[] {
  const filters: Array<[RequiredColumn, string | null]> = [
    ["Periodo", searchParams.get("periodo")],
    ["Tipo de Venta", searchParams.get("tipoVenta")],
    ["Jefatura", searchParams.get("jefatura")],
    ["Supervisor", searchParams.get("supervisor")],
  ];

  return filters.reduce(
    (filtered, [column, value]) => (value ? filtered.filter((row) => row[column] === value) : filtered),
    rows,
  );
}

export async function GET(request: Request) {
  const { rows, status } = await loadExcel(request.url);
  const filtered = filterRows(rows, new URL(request.url).searchParams);
  const qRuc = uniqueCount(filtered, "Ruc");
  const activeRows = filtered.filter((row) => cleanNumber(row["Ruc Activo"]) > 0);
  const qActivo = uniqueCount(activeRows, "Ruc");
  const executiveBase = filtered.filter((row) => cleanText(row.Ejecutivo));
  const totalExecutives = uniqueCount(filtered, "Ejecutivo");
  const executiveSales = groupSum(executiveBase, "Ejecutivo", "Vol M0");
  const executivesZero = executiveSales.filter((row) => row.total <= 0).length;
  const volM0 = filtered.reduce((total, row) => total + cleanNumber(row["Vol M0"]), 0);
  const volM1 = filtered.reduce((total, row) => total + cleanNumber(row["Vol M1"]), 0);

  const dailyMap = new Map<string, number>();
  filtered.forEach((row) => {
    const date = row["Fecha de Ingreso"];
    if (date instanceof Date) {
      const key = date.toISOString().slice(0, 10);
      dailyMap.set(key, (dailyMap.get(key) ?? 0) + cleanNumber(row["Vol M0"]));
    }
  });

  let runningTotal = 0;
  const dailyM0 = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => {
      runningTotal += value;
      return { date, value: runningTotal };
    });

  const executiveRows = new Map<string, { qRuc: Set<string>; volM0: number; volM1: number; volM2: number; volM3: number }>();
  executiveBase.forEach((row) => {
    const ejecutivo = cleanText(row.Ejecutivo);
    const current = executiveRows.get(ejecutivo) ?? { qRuc: new Set<string>(), volM0: 0, volM1: 0, volM2: 0, volM3: 0 };
    const ruc = cleanText(row.Ruc);
    if (ruc) current.qRuc.add(ruc);
    current.volM0 += cleanNumber(row["Vol M0"]);
    current.volM1 += cleanNumber(row["Vol M1"]);
    current.volM2 += cleanNumber(row["Vol M2"]);
    current.volM3 += cleanNumber(row["Vol M3"]);
    executiveRows.set(ejecutivo, current);
  });

  const executives = [...executiveRows.entries()]
    .map(([ejecutivo, row]) => ({
      ejecutivo: ejecutivo || "Sin ejecutivo",
      qRuc: row.qRuc.size,
      volM0: row.volM0,
      volM1: row.volM1,
      volM2: row.volM2,
      volM3: row.volM3,
      total: row.volM0 + row.volM1 + row.volM2 + row.volM3,
    }))
    .sort((a, b) => b.volM0 - a.volM0);

  const clients = [...filtered]
    .sort((a, b) => cleanNumber(b["Vol M0"]) - cleanNumber(a["Vol M0"]))
    .slice(0, 500)
    .map((row) => ({
      ruc: cleanText(row.Ruc),
      razonSocial: cleanText(row["Razón Social"]),
      supervisor: cleanText(row.Supervisor),
      ejecutivo: cleanText(row.Ejecutivo),
      volM0: cleanNumber(row["Vol M0"]),
      volM1: cleanNumber(row["Vol M1"]),
      volM2: cleanNumber(row["Vol M2"]),
      volM3: cleanNumber(row["Vol M3"]),
    }));

  return NextResponse.json({
    status,
    filters: {
      periodo: optionValues(rows, "Periodo"),
      tipoVenta: optionValues(rows, "Tipo de Venta"),
      jefatura: optionValues(rows, "Jefatura"),
      supervisor: optionValues(rows, "Supervisor"),
    },
    kpis: {
      qRuc,
      qActivo,
      pctActivo: qRuc ? qActivo / qRuc : 0,
      ejecutivosCeroVentas: executivesZero,
      pctEjecutivosCeroVentas: totalExecutives ? executivesZero / totalExecutives : 0,
      volM0,
      volM1,
    },
    charts: {
      supervisorM0: groupSum(filtered, "Supervisor", "Vol M0").map((row) => ({ supervisor: row.label || "Sin supervisor", value: row.total })),
      supervisorM1: groupSum(filtered, "Supervisor", "Vol M1", true).map((row) => ({ supervisor: row.label || "Sin supervisor", value: row.total })),
      dailyM0,
    },
    tables: {
      executives,
      clients,
    },
  });
}
