param(
    [ValidateSet('Backend', 'Frontend')]
    [string]$Mode
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = $PSScriptRoot
$BackendPath = Join-Path $ProjectRoot 'backend'
$FrontendPath = Join-Path $ProjectRoot 'frontend'

if (-not $Mode) {
    $PowerShellPath = (Get-Process -Id $PID).Path
    $ScriptPath = $PSCommandPath

    Start-Process -FilePath $PowerShellPath `
        -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$ScriptPath`" -Mode Backend" `
        -WorkingDirectory $ProjectRoot
    Start-Process -FilePath $PowerShellPath `
        -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$ScriptPath`" -Mode Frontend" `
        -WorkingDirectory $ProjectRoot

    Write-Host 'Se abrieron las terminales del backend y del frontend.'
    Write-Host 'Cuando ambos estén activos, abre http://localhost:8081'
    exit
}

if ($Mode -eq 'Backend') {
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

    Write-Host 'Backend en http://localhost:3000'
    & node main.mjs
    exit
}

if ($Mode -eq 'Frontend') {
    Set-Location -LiteralPath $FrontendPath
    $PythonCommand = Get-Command py, python -ErrorAction SilentlyContinue | Select-Object -First 1

    if (-not $PythonCommand) {
        throw 'No se encontró Python. Instálalo o inicia el frontend con otro servidor estático.'
    }

    Write-Host 'Frontend en http://localhost:8081'
    & $PythonCommand.Source -m http.server 8081
    exit
}