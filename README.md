# Izipay Commercial Dashboard

Aplicacion web profesional para analizar el Excel `Data Izipay.xlsx`, usando exclusivamente Next.js y la hoja `Data`.

## Estructura

- `frontend`: Dashboard Next.js 15 con API Route, React, TypeScript, Tailwind CSS, Recharts, Lucide React y xlsx.
- `EXCEL_URL`: enlace directo al Excel usado por la API Route.

## Ejecutar localmente

Desde la raiz del proyecto:

```powershell
cd frontend
.\start-frontend.ps1
```

Alternativa manual:

```powershell
cd frontend
npm install
npm run dev
```

Abre:

```text
http://localhost:3000
```

## API

- `GET /api/dashboard`

Filtros soportados por query string:

- `periodo`
- `tipoVenta`
- `jefatura`
- `supervisor`
