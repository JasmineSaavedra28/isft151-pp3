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

    Write-Host 'Se abrieron las terminales de prueba del backend y del frontend.'
    Write-Host 'Cuando ambos estén activos, abre http://localhost:8081'
    exit
}

if ($Mode -eq 'Backend') {
    & (Join-Path $ProjectRoot 'usarbdtest.ps1')
    exit
}

if ($Mode -eq 'Frontend') {
    Set-Location -LiteralPath $FrontendPath
    $PythonCommand = Get-Command py, python -ErrorAction SilentlyContinue | Select-Object -First 1

    if (-not $PythonCommand) {
        throw 'No se encontró Python. Instálalo o inicia el frontend con otro servidor estático.'
    }

    Write-Host 'Frontend de prueba en http://localhost:8081'
    & $PythonCommand.Source -m http.server 8081
    exit
}
