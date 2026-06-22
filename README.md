# Izipay Commercial Dashboard

Aplicacion web profesional para analizar el Excel `Data Izipay.xlsx`, usando exclusivamente la hoja `Data`.

## Estructura

- `backend`: API FastAPI con Pandas y OpenPyXL.
- `frontend`: Dashboard Next.js 15 con React, TypeScript, Tailwind CSS, Recharts y Lucide React.
- `Data Izipay.xlsx`: archivo fuente usado por defecto.

## Ejecutar backend

Desde la raiz del proyecto:

```powershell
.\backend\start-backend.ps1
```

Alternativa manual:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

El backend vuelve a leer el Excel automaticamente cuando cambia la fecha de modificacion del archivo.

## Ejecutar frontend

En otra terminal:

```powershell
cd frontend
.\start-frontend.ps1
```

Alternativa manual:

```powershell
cd frontend
npm install
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"
npm run dev
```

Abre:

```text
http://localhost:3000
```

## API

- `GET http://localhost:8000/api/health`
- `GET http://localhost:8000/api/dashboard`

Filtros soportados por query string:

- `periodo`
- `tipoVenta`
- `jefatura`
- `supervisor`
