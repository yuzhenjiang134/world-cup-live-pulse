param(
  [ValidateSet('A', 'B')]
  [string]$Variant = 'B'
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$demoDir = Join-Path $root 'demo-assets'
$ffmpeg = 'C:\Users\Administrator\AppData\Local\JianyingPro\Apps\10.8.0.14162\ffmpeg.exe'
$variantLower = $Variant.ToLowerInvariant()
$sourceVideo = Join-Path $demoDir "world-cup-live-pulse-demo-$variantLower.mp4"
$outputVideo = Join-Path $demoDir "world-cup-live-pulse-demo-$variantLower-narrated.mp4"
$workDir = Join-Path $demoDir "narration-$variantLower"

if (-not (Test-Path -LiteralPath $sourceVideo)) {
  throw "Source video not found: $sourceVideo"
}
if (-not (Test-Path -LiteralPath $ffmpeg)) {
  throw "ffmpeg not found: $ffmpeg"
}

Remove-Item -LiteralPath $workDir -Recurse -Force -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $workDir | Out-Null
$manifest = (& node scripts\record-demo-video.mjs "--variant=$Variant" --print-manifest | Out-String | ConvertFrom-Json)

Add-Type -AssemblyName System.Speech
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.Rate = 1
$concatLines = New-Object System.Collections.Generic.List[string]

try {
  for ($index = 0; $index -lt $manifest.scenes.Count; $index++) {
    $scene = $manifest.scenes[$index]
    $number = '{0:D2}' -f ($index + 1)
    $rawPath = Join-Path $workDir "raw-$number.wav"
    $paddedPath = Join-Path $workDir "scene-$number.wav"
    $spoken = "$($scene.title). $($scene.subtitle)"

    $voice.SetOutputToWaveFile($rawPath)
    $voice.Speak($spoken)
    $voice.SetOutputToNull()

    & $ffmpeg -y -hide_banner -loglevel error -i $rawPath -af "apad,atrim=duration=$($scene.seconds)" -ar 44100 -ac 2 $paddedPath
    if ($LASTEXITCODE -ne 0) {
      throw "Audio render failed for scene $number"
    }
    $escaped = $paddedPath.Replace("'", "'\''")
    $concatLines.Add("file '$escaped'")
  }
}
finally {
  $voice.Dispose()
}

$concatPath = Join-Path $workDir 'concat.txt'
[System.IO.File]::WriteAllLines($concatPath, $concatLines, [System.Text.UTF8Encoding]::new($false))
$joinedAudio = Join-Path $workDir 'narration.wav'
& $ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $concatPath -c:a pcm_s16le $joinedAudio
if ($LASTEXITCODE -ne 0) {
  throw 'Narration concatenation failed.'
}

& $ffmpeg -y -hide_banner -loglevel error -i $sourceVideo -i $joinedAudio -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k -movflags +faststart -shortest $outputVideo
if ($LASTEXITCODE -ne 0) {
  throw 'Narrated demo mux failed.'
}

$duration = [int](($manifest.scenes | Measure-Object -Property seconds -Sum).Sum)
$result = [ordered]@{
  variant = $Variant
  seconds = $duration
  output = $outputVideo
  bytes = (Get-Item -LiteralPath $outputVideo).Length
  audio = 'English Windows TTS narration'
}
$result | ConvertTo-Json -Compress
