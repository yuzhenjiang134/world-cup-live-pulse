param(
  [ValidateSet('A', 'B')]
  [string]$Variant = 'B',
  [string]$VoiceProfileId = $env:WCLP_VOICE_PROFILE_ID,
  [string]$FfmpegPath = $env:FFMPEG_PATH,
  [string]$WorkbenchBaseUrl = 'http://127.0.0.1:8010',
  [switch]$ReuseExistingAudio,
  [int[]]$RegenerateScenes = @()
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$demoDir = Join-Path $root 'demo-assets'
$variantLower = $Variant.ToLowerInvariant()
$sourceVideo = Join-Path $demoDir "world-cup-live-pulse-demo-$variantLower.mp4"
$outputVideo = Join-Path $demoDir "world-cup-live-pulse-demo-$variantLower-narrated.mp4"
$workDir = Join-Path $demoDir "narration-$variantLower"

function Resolve-FfmpegPath {
  param([string]$RequestedPath)

  if (-not [string]::IsNullOrWhiteSpace($RequestedPath) -and (Test-Path -LiteralPath $RequestedPath)) {
    return (Resolve-Path -LiteralPath $RequestedPath).Path
  }

  $command = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  $appsRoot = if ($env:LOCALAPPDATA) { Join-Path $env:LOCALAPPDATA 'JianyingPro\Apps' } else { $null }
  if ($appsRoot -and (Test-Path -LiteralPath $appsRoot)) {
    $bundled = Get-ChildItem -LiteralPath $appsRoot -Filter ffmpeg.exe -File -Recurse -ErrorAction SilentlyContinue |
      Sort-Object FullName -Descending |
      Select-Object -First 1
    if ($bundled) {
      return $bundled.FullName
    }
  }

  throw 'FFmpeg was not found. Set FFMPEG_PATH or add ffmpeg to PATH.'
}

$ffmpeg = Resolve-FfmpegPath -RequestedPath $FfmpegPath

if (-not (Test-Path -LiteralPath $sourceVideo)) {
  throw "Source video not found: $sourceVideo"
}

if (-not $ReuseExistingAudio) {
  Remove-Item -LiteralPath $workDir -Recurse -Force -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $workDir -Force | Out-Null
$manifest = (& node scripts\record-demo-video.mjs "--variant=$Variant" --print-manifest | Out-String | ConvertFrom-Json)

$useClone = -not [string]::IsNullOrWhiteSpace($VoiceProfileId)
$voice = $null
if (-not $useClone) {
  Add-Type -AssemblyName System.Speech
  $voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
  $voice.Rate = 1
}
$concatLines = New-Object System.Collections.Generic.List[string]

try {
  for ($index = 0; $index -lt $manifest.scenes.Count; $index++) {
    $scene = $manifest.scenes[$index]
    $number = '{0:D2}' -f ($index + 1)
    $rawPath = Join-Path $workDir "raw-$number.wav"
    $paddedPath = Join-Path $workDir "scene-$number.wav"
    $spoken = if ($scene.narration) { [string]$scene.narration } else { "$($scene.title). $($scene.subtitle)" }

    $sceneNumber = $index + 1
    $keepExisting = (Test-Path -LiteralPath $rawPath) -and -not ($RegenerateScenes -contains $sceneNumber) -and (
      $ReuseExistingAudio -or
      ($RegenerateScenes.Count -gt 0 -and -not ($RegenerateScenes -contains $sceneNumber))
    )

    if ($keepExisting) {
      # Keep the approved clone take and rebuild only scene padding/timing.
    }
    elseif ($useClone) {
      $payload = [ordered]@{
        text = $spoken
        voice_profile_id = $VoiceProfileId
        speed = 0.95
        max_mel_tokens = 4200
        interval_silence_ms = 240
        seed = 260713 + $index
        style_role = 'natural English football product storyteller'
        style_tone = if ($scene.voiceTone) { [string]$scene.voiceTone } else { 'clear and natural' }
        style_note = if ($scene.voiceNote) { [string]$scene.voiceNote } else { 'Use natural phrasing, moderate energy, and avoid a mechanical or promotional delivery.' }
      }
      $json = $payload | ConvertTo-Json -Compress
      $result = Invoke-RestMethod -Uri "$WorkbenchBaseUrl/api/audio/clone" -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 1200
      if (-not $result.ok -or -not $result.audios -or -not $result.audios[0].url) {
        throw "Voice clone failed for scene $number"
      }
      Invoke-WebRequest -Uri ("$WorkbenchBaseUrl" + [string]$result.audios[0].url) -OutFile $rawPath -TimeoutSec 120
    }
    else {
      $voice.SetOutputToWaveFile($rawPath)
      $voice.Speak($spoken)
      $voice.SetOutputToNull()
    }

    & $ffmpeg -y -hide_banner -loglevel error -i $rawPath -af "apad,atrim=duration=$($scene.seconds)" -ar 44100 -ac 2 $paddedPath
    if ($LASTEXITCODE -ne 0) {
      throw "Audio render failed for scene $number"
    }
    $escaped = $paddedPath.Replace("'", "'\''")
    $concatLines.Add("file '$escaped'")
  }
}
finally {
  if ($voice) { $voice.Dispose() }
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
  audio = if ($useClone) { 'Local authorized IndexTTS2 voice-profile narration' } else { 'English Windows TTS narration' }
}
$result | ConvertTo-Json -Compress
