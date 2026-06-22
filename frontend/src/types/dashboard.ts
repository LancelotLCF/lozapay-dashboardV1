export type Kpis = {
  qRuc: number;
  qActivo: number;
  pctActivo: number;
  ejecutivosCeroVentas: number;
  pctEjecutivosCeroVentas: number;
  volM0: number;
  volM1: number;
};

export type FilterOptions = {
  periodo: string[];
  tipoVenta: string[];
  jefatura: string[];
  supervisor: string[];
};

export type ChartPoint = {
  supervisor?: string;
  date?: string;
  value: number;
};

export type ExecutiveRow = {
  ejecutivo: string;
  qRuc: number;
  volM0: number;
  volM1: number;
  volM2: number;
  volM3: number;
  total: number;
};

export type ClientRow = {
  ruc: string;
  razonSocial: string;
  supervisor: string;
  ejecutivo: string;
  volM0: number;
  volM1: number;
  volM2: number;
  volM3: number;
};

export type DashboardData = {
  status: {
    excelPath: string;
    sheet: string;
    lastModified: string | null;
    error: string | null;
    rows: number;
  };
  filters: FilterOptions;
  kpis: Kpis;
  charts: {
    supervisorM0: ChartPoint[];
    supervisorM1: ChartPoint[];
    dailyM0: ChartPoint[];
  };
  tables: {
    executives: ExecutiveRow[];
    clients: ClientRow[];
  };
};

export type DashboardFilters = {
  periodo: string;
  tipoVenta: string;
  jefatura: string;
  supervisor: string;
};
