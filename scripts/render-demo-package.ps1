$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$bundledPython = Join-Path $HOME '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
$python = if (Test-Path -LiteralPath $bundledPython) {
  $bundledPython
} else {
  (Get-Command python -ErrorAction Stop).Source
}

Push-Location $root
try {
  & $python scripts\render-demo-video.py --variant A
  if ($LASTEXITCODE -ne 0) { throw 'Variant A video render failed.' }
  & $python scripts\render-demo-video.py --variant B
  if ($LASTEXITCODE -ne 0) { throw 'Variant B video render failed.' }
  & .\scripts\render-demo-narration.ps1 -Variant A
  & .\scripts\render-demo-narration.ps1 -Variant B
  Write-Output 'Demo package complete. Upload candidate B: demo-assets/world-cup-live-pulse-demo-b-narrated.mp4'
}
finally {
  Pop-Location
}
