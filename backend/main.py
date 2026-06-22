from __future__ import annotations

import math
import os
from datetime import datetime
from pathlib import Path
from threading import Lock
from typing import Any

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


BASE_DIR = Path(__file__).resolve().parent
DEFAULT_EXCEL_PATH = BASE_DIR.parent / "Data Izipay.xlsx"
EXCEL_PATH = Path(os.getenv("IZIPAY_EXCEL_PATH", DEFAULT_EXCEL_PATH)).resolve()
SHEET_NAME = "Data"

REQUIRED_COLUMNS = [
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
]

TEXT_COLUMNS = [
    "Periodo",
    "Ruc",
    "Razón Social",
    "Tipo de Venta",
    "Producto",
    "Ejecutivo",
    "Supervisor",
    "Jefatura",
]

VOLUME_COLUMNS = ["Vol M0", "Vol M1", "Vol M2", "Vol M3"]


app = FastAPI(title="Izipay Commercial Analytics API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ExcelStore:
    def __init__(self, path: Path) -> None:
        self.path = path
        self._lock = Lock()
        self._mtime: float | None = None
        self._data = pd.DataFrame(columns=REQUIRED_COLUMNS)
        self._error: str | None = None

    def load(self) -> tuple[pd.DataFrame, dict[str, Any]]:
        with self._lock:
            if not self.path.exists():
                self._data = pd.DataFrame(columns=REQUIRED_COLUMNS)
                self._mtime = None
                self._error = f"No se encontró el archivo: {self.path}"
                return self._data.copy(), self.status()

            mtime = self.path.stat().st_mtime
            if self._mtime != mtime:
                self._read_excel(mtime)
            return self._data.copy(), self.status()

    def status(self) -> dict[str, Any]:
        return {
            "excelPath": str(self.path),
            "sheet": SHEET_NAME,
            "lastModified": datetime.fromtimestamp(self._mtime).isoformat() if self._mtime else None,
            "error": self._error,
            "rows": int(len(self._data)),
        }

    def _read_excel(self, mtime: float) -> None:
        try:
            df = pd.read_excel(self.path, sheet_name=SHEET_NAME, engine="openpyxl")
            missing = [column for column in REQUIRED_COLUMNS if column not in df.columns]
            if missing:
                raise ValueError(f"Faltan columnas requeridas: {', '.join(missing)}")

            df = df[REQUIRED_COLUMNS].copy()
            for column in TEXT_COLUMNS:
                df[column] = df[column].fillna("").astype(str).str.strip()
            for column in VOLUME_COLUMNS + ["Ruc Activo"]:
                df[column] = pd.to_numeric(df[column], errors="coerce").fillna(0)

            df["Fecha de Ingreso"] = pd.to_datetime(df["Fecha de Ingreso"], errors="coerce")
            df["Fecha de Instalación"] = pd.to_datetime(df["Fecha de Instalación"], errors="coerce")
            periodo_date = pd.to_datetime(df["Periodo"], errors="coerce")
            df["Periodo"] = df["Periodo"].replace({"nan": ""})
            df.loc[periodo_date.notna(), "Periodo"] = periodo_date[periodo_date.notna()].dt.strftime("%Y-%m")

            self._data = df
            self._mtime = mtime
            self._error = None
        except Exception as exc:
            self._data = pd.DataFrame(columns=REQUIRED_COLUMNS)
            self._mtime = mtime
            self._error = str(exc)


store = ExcelStore(EXCEL_PATH)


def clean_number(value: Any) -> float:
    if value is None:
        return 0.0
    if isinstance(value, float) and (math.isnan(value) or math.isinf(value)):
        return 0.0
    return float(value)


def apply_filters(
    df: pd.DataFrame,
    periodo: str | None,
    tipo_venta: str | None,
    jefatura: str | None,
    supervisor: str | None,
) -> pd.DataFrame:
    filtered = df
    filter_map = {
        "Periodo": periodo,
        "Tipo de Venta": tipo_venta,
        "Jefatura": jefatura,
        "Supervisor": supervisor,
    }
    for column, value in filter_map.items():
        if value:
            filtered = filtered[filtered[column] == value]
    return filtered


def option_values(df: pd.DataFrame, column: str) -> list[str]:
    if column not in df:
        return []
    return sorted([str(value) for value in df[column].dropna().unique() if str(value).strip()])


def row_date(value: Any) -> str | None:
    if pd.isna(value):
        return None
    return pd.Timestamp(value).date().isoformat()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/dashboard")
def dashboard(
    periodo: str | None = None,
    tipoVenta: str | None = None,
    jefatura: str | None = None,
    supervisor: str | None = None,
) -> dict[str, Any]:
    df, status = store.load()
    filtered = apply_filters(df, periodo, tipoVenta, jefatura, supervisor)

    q_ruc = int(filtered["Ruc"].replace("", pd.NA).dropna().nunique()) if not filtered.empty else 0
    active_df = filtered[filtered["Ruc Activo"] > 0]
    q_activo = int(active_df["Ruc"].replace("", pd.NA).dropna().nunique()) if not filtered.empty else 0
    total_executives = int(filtered["Ejecutivo"].replace("", pd.NA).dropna().nunique()) if not filtered.empty else 0
    executive_base = filtered[filtered["Ejecutivo"].str.strip() != ""] if not filtered.empty else filtered
    executive_sales = executive_base.groupby("Ejecutivo", dropna=False)["Vol M0"].sum() if not executive_base.empty else pd.Series(dtype=float)
    executives_zero = int((executive_sales <= 0).sum())
    vol_m0 = clean_number(filtered["Vol M0"].sum()) if not filtered.empty else 0.0
    vol_m1 = clean_number(filtered["Vol M1"].sum()) if not filtered.empty else 0.0

    supervisor_m0 = (
        filtered.groupby("Supervisor", dropna=False)["Vol M0"].sum().reset_index().sort_values("Vol M0", ascending=False)
        if not filtered.empty
        else pd.DataFrame(columns=["Supervisor", "Vol M0"])
    )
    supervisor_m1 = (
        filtered.groupby("Supervisor", dropna=False)["Vol M1"].sum().reset_index().sort_values("Vol M1", ascending=True)
        if not filtered.empty
        else pd.DataFrame(columns=["Supervisor", "Vol M1"])
    )

    daily = filtered.dropna(subset=["Fecha de Ingreso"]).sort_values("Fecha de Ingreso")
    if not daily.empty:
        daily = daily.groupby(daily["Fecha de Ingreso"].dt.date)["Vol M0"].sum().reset_index()
        daily["acumulado"] = daily["Vol M0"].cumsum()
    else:
        daily = pd.DataFrame(columns=["Fecha de Ingreso", "Vol M0", "acumulado"])

    executives = (
        executive_base.groupby("Ejecutivo")
        .agg(
            qRuc=("Ruc", pd.Series.nunique),
            volM0=("Vol M0", "sum"),
            volM1=("Vol M1", "sum"),
            volM2=("Vol M2", "sum"),
            volM3=("Vol M3", "sum"),
        )
        .reset_index()
        if not executive_base.empty
        else pd.DataFrame(columns=["Ejecutivo", "qRuc", "volM0", "volM1", "volM2", "volM3"])
    )
    if not executives.empty:
        executives["total"] = executives[["volM0", "volM1", "volM2", "volM3"]].sum(axis=1)
        executives = executives.sort_values("volM0", ascending=False)

    clients = filtered.sort_values("Vol M0", ascending=False).head(500)

    return {
        "status": status,
        "filters": {
            "periodo": option_values(df, "Periodo"),
            "tipoVenta": option_values(df, "Tipo de Venta"),
            "jefatura": option_values(df, "Jefatura"),
            "supervisor": option_values(df, "Supervisor"),
        },
        "kpis": {
            "qRuc": q_ruc,
            "qActivo": q_activo,
            "pctActivo": q_activo / q_ruc if q_ruc else 0,
            "ejecutivosCeroVentas": executives_zero,
            "pctEjecutivosCeroVentas": executives_zero / total_executives if total_executives else 0,
            "volM0": vol_m0,
            "volM1": vol_m1,
        },
        "charts": {
            "supervisorM0": [
                {"supervisor": row["Supervisor"] or "Sin supervisor", "value": clean_number(row["Vol M0"])}
                for _, row in supervisor_m0.iterrows()
            ],
            "supervisorM1": [
                {"supervisor": row["Supervisor"] or "Sin supervisor", "value": clean_number(row["Vol M1"])}
                for _, row in supervisor_m1.iterrows()
            ],
            "dailyM0": [
                {
                    "date": pd.Timestamp(row["Fecha de Ingreso"]).date().isoformat(),
                    "value": clean_number(row["acumulado"]),
                }
                for _, row in daily.iterrows()
            ],
        },
        "tables": {
            "executives": [
                {
                    "ejecutivo": row["Ejecutivo"] or "Sin ejecutivo",
                    "qRuc": int(row["qRuc"]),
                    "volM0": clean_number(row["volM0"]),
                    "volM1": clean_number(row["volM1"]),
                    "volM2": clean_number(row["volM2"]),
                    "volM3": clean_number(row["volM3"]),
                    "total": clean_number(row["total"]),
                }
                for _, row in executives.iterrows()
            ],
            "clients": [
                {
                    "ruc": row["Ruc"],
                    "razonSocial": row["Razón Social"],
                    "supervisor": row["Supervisor"],
                    "ejecutivo": row["Ejecutivo"],
                    "volM0": clean_number(row["Vol M0"]),
                    "volM1": clean_number(row["Vol M1"]),
                    "volM2": clean_number(row["Vol M2"]),
                    "volM3": clean_number(row["Vol M3"]),
                }
                for _, row in clients.iterrows()
            ],
        },
    }
