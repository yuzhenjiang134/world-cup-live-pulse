param(
  [string]$FfmpegPath = $env:FFMPEG_PATH
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$demoDir = Join-Path $root "demo-assets"
$screensDir = Join-Path $demoDir "screenshots"
$generatedDir = Join-Path $demoDir "generated"
$outputPath = Join-Path $demoDir "world-cup-live-pulse-demo.mp4"
$silentVideo = Join-Path $generatedDir "demo-silent.mp4"
$narrationPath = Join-Path $generatedDir "demo-narration.wav"
$concatPath = Join-Path $generatedDir "demo-scenes.txt"
$durationSeconds = 186

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

$FfmpegPath = Resolve-FfmpegPath -RequestedPath $FfmpegPath

Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.Speech
New-Item -ItemType Directory -Force -Path $generatedDir | Out-Null

function New-DemoCard {
  param(
    [string]$Path,
    [string]$Kicker,
    [string]$Title,
    [string]$Subtitle,
    [string[]]$Bullets
  )

  $bitmap = New-Object System.Drawing.Bitmap 1280, 720
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear([System.Drawing.Color]::FromArgb(14, 31, 36))

  $teal = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(31, 162, 143))
  $gold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 205, 92))
  $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(205, 224, 220))
  $panel = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(23, 48, 54))
  $kickerFont = New-Object System.Drawing.Font "Arial", 18, ([System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font "Arial", 45, ([System.Drawing.FontStyle]::Bold)
  $subtitleFont = New-Object System.Drawing.Font "Arial", 23, ([System.Drawing.FontStyle]::Regular)
  $bulletFont = New-Object System.Drawing.Font "Arial", 21, ([System.Drawing.FontStyle]::Bold)
  $footerFont = New-Object System.Drawing.Font "Arial", 15, ([System.Drawing.FontStyle]::Bold)

  $graphics.FillRectangle($gold, 0, 0, 18, 720)
  $graphics.FillRectangle($panel, 62, 56, 1156, 606)
  $graphics.FillRectangle($teal, 92, 92, 54, 5)
  $graphics.DrawString($Kicker.ToUpperInvariant(), $kickerFont, $gold, 92, 112)
  $graphics.DrawString($Title, $titleFont, $white, (New-Object System.Drawing.RectangleF 90, 172, 1050, 120))
  $graphics.DrawString($Subtitle, $subtitleFont, $muted, (New-Object System.Drawing.RectangleF 92, 310, 1020, 110))

  $y = 450
  foreach ($bullet in $Bullets) {
    $graphics.FillEllipse($gold, 96, $y + 8, 13, 13)
    $graphics.DrawString($bullet, $bulletFont, $white, 128, $y)
    $y += 42
  }

  $graphics.DrawString("WORLD CUP LIVE PULSE  /  CONSUMER AND FAN EXPERIENCES", $footerFont, $teal, 92, 622)
  $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  foreach ($item in @($kickerFont, $titleFont, $subtitleFont, $bulletFont, $footerFont, $teal, $gold, $white, $muted, $panel, $graphics, $bitmap)) {
    $item.Dispose()
  }
}

$cards = @(
  @{ File = "00-intro.png"; Kicker = "Superteam Earn x TxODDS"; Title = "World Cup Live Pulse"; Subtitle = "A fan-first second screen that turns verified match data into a score challenge, live pulse, and replayable story."; Bullets = @("Working deployed product", "TxLINE-powered data boundary", "Public repository", "Demo under five minutes") },
  @{ File = "05-txline.png"; Kicker = "Official integration verified 2026-07-11"; Title = "TxLINE powers the live input"; Subtitle = "One adapter normalizes fixtures, score snapshots, match events, and odds into the same fan-facing MatchData model."; Bullets = @("POST /auth/guest/start", "GET /api/fixtures/snapshot", "GET /api/scores/snapshot/{fixtureId}", "GET /api/odds/snapshot/{fixtureId}") },
  @{ File = "06-truth.png"; Kicker = "Live / Delay / Seed / Replay"; Title = "Data truth is a product feature"; Subtitle = "Unknown teams stay pending, empty odds stay empty, historical fixtures stay in Replay, and every checked state carries a timestamp."; Bullets = @("7 fixture records verified", "41 score records verified", "0 odds means no invented odds", "Official FIFA+ links only") },
  @{ File = "07-commercial.png"; Kicker = "Original interaction + commercial path"; Title = "Built for fans and buyers"; Subtitle = "The score challenge creates repeat use. The trusted second-screen shell can serve media sites, communities, venues, and sponsors."; Bullets = @("Fan retention loop", "Community leaderboard path", "Media embed path", "Sponsor-safe presentation") },
  @{ File = "08-close.png"; Kicker = "Consumer and Fan Experiences"; Title = "Submission-ready and repeatable"; Subtitle = "No wallet custody, no trade advice, no prediction market, and no private API token in the public build."; Bullets = @("Deployed GitHub Pages", "Public repository", "Technical docs + API feedback", "Repeatable demo flow") }
)

foreach ($card in $cards) {
  New-DemoCard -Path (Join-Path $generatedDir $card.File) -Kicker $card.Kicker -Title $card.Title -Subtitle $card.Subtitle -Bullets $card.Bullets
}

$narration = @"
World Cup Live Pulse is a fan-first second screen for the Consumer and Fan Experiences track. It turns verified match data into a score challenge, live pulse, and replayable match story that ordinary fans can understand at a glance.

The first view answers three questions: what is happening, where did the data come from, and what can the fan do now? The score hero shows source state and checked time. Directly below it, every local session starts with one thousand test points. A score pick costs fifty points and is settled only from a verified final score. It has no cash value and never connects a wallet.

Because review may happen when no match is live, Replay preserves the complete product flow without mislabeling history as current data. The Argentina versus France story exposes goals, cards, extra time, pulse changes, final-score settlement, and A I style commentary. The same timeline works with authenticated TxLINE events during a current fixture.

Team and player context remains one click away instead of crowding the match view. The atlas currently contains twelve source-aware profiles, while compact key-player context appears inside Match Center when the loaded source provides it.

Language, local-point reset, refresh, and TxLINE diagnostics stay in Settings. The interface validates a shared set of labels across English, Chinese, Spanish, Portuguese, French, German, Japanese, and Arabic. Credentials remain local and are never rendered in the fan interface or committed to GitHub Pages.

TxLINE powers the live input. The adapter starts a guest session, loads the fixture snapshot, then requests score and odds snapshots for the selected fixture. Those responses are normalized into one MatchData model for the score hero, event timeline, A I style explanation, and score challenge.

Data truth is visible product behavior. Live, Delay, Seed, and Replay are separate states. Unknown teams remain pending confirmation. Empty odds stay empty. Historical fixtures stay in Replay. The July eleventh verification loaded seven fixtures and forty-one score records for the selected fixture. Its empty odds response was not replaced with invented official odds. Official match video rights are separate from TxLINE. The product links only to official FIFA Plus archive and highlights pages, with territory and rights limitations disclosed.

The score challenge creates a repeat-use loop for fan communities. The same source-aware second-screen shell can be licensed or embedded by sports media, Telegram communities, venues, and sponsors. A future shared leaderboard can add identity and social competition without turning the product into wagering.

World Cup Live Pulse is deployed, functional, documented, and repeatable for judges. It uses TxLINE as the live data boundary and remains a safe fan experience: no betting, no trade advice, no prediction market, no custody, and no private token in the public build.
"@

$speech = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speech.SelectVoice("Microsoft Zira Desktop")
$speech.Rate = -1
$speech.Volume = 100
$speech.SetOutputToWaveFile($narrationPath)
$speech.Speak($narration)
$speech.Dispose()

$scenes = @(
  @{ Path = (Join-Path $generatedDir "00-intro.png"); Duration = 14 },
  @{ Path = (Join-Path $screensDir "01-match-center.png"); Duration = 24 },
  @{ Path = (Join-Path $screensDir "02-replay-final.png"); Duration = 26 },
  @{ Path = (Join-Path $screensDir "03-teams.png"); Duration = 20 },
  @{ Path = (Join-Path $screensDir "04-settings.png"); Duration = 22 },
  @{ Path = (Join-Path $generatedDir "05-txline.png"); Duration = 24 },
  @{ Path = (Join-Path $generatedDir "06-truth.png"); Duration = 20 },
  @{ Path = (Join-Path $generatedDir "07-commercial.png"); Duration = 20 },
  @{ Path = (Join-Path $generatedDir "08-close.png"); Duration = 16 }
)

$concatLines = New-Object System.Collections.Generic.List[string]
foreach ($scene in $scenes) {
  $safePath = $scene.Path.Replace("'", "'\''").Replace("\", "/")
  $concatLines.Add("file '$safePath'")
  $concatLines.Add("duration $($scene.Duration)")
}
$lastPath = $scenes[-1].Path.Replace("'", "'\''").Replace("\", "/")
$concatLines.Add("file '$lastPath'")
[System.IO.File]::WriteAllLines($concatPath, $concatLines, (New-Object System.Text.UTF8Encoding $false))

& $FfmpegPath -y -hide_banner -loglevel warning -f concat -safe 0 -i $concatPath -vf "fps=24,scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=white,format=yuv420p" -t $durationSeconds -c:v h264_nvenc -preset p4 -b:v 5M -maxrate 7M -bufsize 10M -an $silentVideo
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while rendering the silent video." }

& $FfmpegPath -y -hide_banner -loglevel warning -i $silentVideo -i $narrationPath -filter_complex "[1:a]apad=pad_dur=$durationSeconds[a]" -map 0:v:0 -map "[a]" -c:v copy -c:a aac -b:a 192k -t $durationSeconds -movflags +faststart $outputPath
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed while muxing narration." }

$result = Get-Item -LiteralPath $outputPath
[pscustomobject]@{
  OutputPath = $result.FullName
  Bytes = $result.Length
  Seconds = $durationSeconds
  Narration = $narrationPath
}
