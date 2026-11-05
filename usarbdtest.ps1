$ErrorActionPreference = 'Stop'
$ProjectRoot = $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot 'backend'

Set-Location -LiteralPath $BackendPath

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw 'No se encontró Node.js. Instala Node.js 22 o superior y vuelve a intentarlo.'
}

$NodeVersion = (& node -p 'process.versions.node').Trim()
$NodeMajorVersion = [int]($NodeVersion.Split('.')[0])
if ($NodeMajorVersion -lt 22) {
    throw "Se requiere Node.js 22 o superior. Versión detectada: $NodeVersion"
}

if (-not (Test-Path -LiteralPath (Join-Path $BackendPath 'node_modules'))) {
    Write-Host 'Instalando dependencias del backend...'
    & npm install
    if ($LASTEXITCODE -ne 0) {
        throw 'Falló npm install.'
    }
}

$env:DB_PATH = '.\db-test.sqlite3'
Write-Host "Base de prueba: $env:DB_PATH"
Write-Host 'Backend en http://localhost:3000'
& node main.mjs
