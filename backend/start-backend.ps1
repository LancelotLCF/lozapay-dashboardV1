$ErrorActionPreference = "Stop"

$projectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$python = "C:\Users\GLM-USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$packages = Join-Path $PSScriptRoot ".python-packages"

$env:PYTHONPATH = "$packages;$PSScriptRoot"
$env:IZIPAY_EXCEL_PATH = Join-Path $projectRoot "Data Izipay.xlsx"

& $python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
