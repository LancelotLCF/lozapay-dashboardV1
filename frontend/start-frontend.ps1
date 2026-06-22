$ErrorActionPreference = "Stop"

$nodeBin = "C:\Users\GLM-USER\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin"
$env:PATH = "$nodeBin;$env:PATH"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"

& .\node_modules\.bin\next.cmd dev --hostname 127.0.0.1 --port 3000
