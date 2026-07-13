param(
  [string]$VoiceProfileId = $env:WCLP_VOICE_PROFILE_ID,
  [string]$WorkbenchBaseUrl = 'http://127.0.0.1:8010',
  [string]$Only = ''
)

$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($VoiceProfileId)) {
  throw 'Set WCLP_VOICE_PROFILE_ID locally before generating commentary audio.'
}

$root = Split-Path -Parent $PSScriptRoot
$outputDir = Join-Path $root 'public\audio\commentary'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

function Decode-Utf8([string]$Value) {
  return [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($Value))
}

$clips = @(
  @{ file = 'fra-mar-fulltime-en-call.wav'; text = 'Full-time: France 2-0 Morocco. The final score and event sequence are confirmed.'; tone = 'energetic sports commentary'; note = 'Confident full-time football call with restrained excitement.' },
  @{ file = 'fra-mar-fulltime-en-why.wav'; text = 'The replay is ready to be shared as a complete fan story.'; tone = 'warm analytical'; note = 'Warm, concise explanation for a football fan.' },
  @{ file = 'fra-mar-fulltime-en-recap.wav'; text = 'Quick catch-up: France 2-0 Morocco. 2 goals and 1 card are verified. Latest: Full-time; the verified score is 2-0.'; tone = 'friendly catch-up'; note = 'Helpful and empathetic recap, clear numbers.' },
  @{ file = 'fra-mar-fulltime-zh-call.wav'; text = (Decode-Utf8 '5YWo5Zy657uT5p2f77ya5rOV5Zu95LqM5q+U6Zu25pGp5rSb5ZOl77yM5pyA57uI5q+U5YiG5ZKM5q+U6LWb5LqL5Lu25bey56Gu6K6k44CC'); tone = (Decode-Utf8 '5pyJ5oSf5p+T5Yqb55qE5L2T6IKy6Kej6K+0'); note = (Decode-Utf8 '5a6M5Zy65pKt5oql5pyJ5Li05Zy65oSf77yM5L2G5LiN6L+H5bqm5aS45byg44CC') },
  @{ file = 'fra-mar-fulltime-zh-why.wav'; text = (Decode-Utf8 '5Zue5pS+5bey5a6M5oiQ77yM5Y+v5Lul5L2c5Li65a6M5pW055qE55CD6L+35pWF5LqL5p+l55yL44CC'); tone = (Decode-Utf8 '5rip5pqW5YiG5p6Q'); note = (Decode-Utf8 '5YOP5pyL5Y+L5LiA5qC3566A5rSB6Kej6YeK5q+U6LWb5Lu35YC844CC') },
  @{ file = 'fra-mar-fulltime-zh-recap.wav'; text = (Decode-Utf8 '5b+r6YCf6KGl6K++77ya5rOV5Zu95LqM5q+U6Zu25pGp5rSb5ZOl44CC5bey56Gu6K6k5Lik5Liq6L+b55CD5ZKM5LiA5byg54mM44CC5pyA5paw6IqC54K577ya5YWo5Zy657uT5p2f77yM5pyA57uI5q+U5YiG5LqM5q+U6Zu244CC'); tone = (Decode-Utf8 '6Ieq54S26KGl6K++'); note = (Decode-Utf8 '5riF5pmw44CB5Y+L5aW944CB5pyJ5YWx5oOF77yM5pWw5a2X5LiN6KaB5ZCr57OK44CC') }
)

foreach ($clip in $clips) {
  if ($Only -and $clip.file -ne $Only) { continue }
  $payload = [ordered]@{
    text = $clip.text
    voice_profile_id = $VoiceProfileId
    speed = 0.95
    max_mel_tokens = 1800
    interval_silence_ms = 220
    style_role = 'natural football companion'
    style_tone = $clip.tone
    style_note = $clip.note
  }
  $json = $payload | ConvertTo-Json -Compress
  $result = Invoke-RestMethod -Uri "$WorkbenchBaseUrl/api/audio/clone" -Method Post -ContentType 'application/json; charset=utf-8' -Body ([Text.Encoding]::UTF8.GetBytes($json)) -TimeoutSec 1200
  if (-not $result.ok -or -not $result.audios -or -not $result.audios[0].url) {
    throw "Voice clone failed for $($clip.file)"
  }
  Invoke-WebRequest -Uri ($WorkbenchBaseUrl + [string]$result.audios[0].url) -OutFile (Join-Path $outputDir $clip.file) -TimeoutSec 120
  Write-Output "Generated $($clip.file)"
}
