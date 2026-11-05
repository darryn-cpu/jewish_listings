# Build a debug APK. Output: app\build\outputs\apk\debug\app-debug.apk
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\android-env.ps1"
Set-Location (Resolve-Path "$PSScriptRoot\..")
& .\gradlew.bat :app:assembleDebug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
$apk = Join-Path (Get-Location) "app\build\outputs\apk\debug\app-debug.apk"
Write-Host ""
Write-Host "APK ready: $apk"
