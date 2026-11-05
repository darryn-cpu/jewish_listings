# Build the debug APK and install it on the phone connected by USB.
# On the phone: Settings > About phone > tap Build number 7 times,
# then Settings > Developer options > USB debugging ON.
# On Xiaomi/MIUI also turn on "Install via USB" and "USB debugging (Security settings)".
# When the phone asks to allow USB debugging, tap Allow.
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\android-env.ps1"
Set-Location (Resolve-Path "$PSScriptRoot\..")

& .\gradlew.bat :app:assembleDebug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$apk = Join-Path (Get-Location) "app\build\outputs\apk\debug\app-debug.apk"
if (-not (Test-Path $apk)) { throw "APK was not produced at $apk" }

Write-Host ""
Write-Host "Connected devices:"
& adb devices -l
Write-Host ""
Write-Host "Installing onto the USB device (-d ignores a running emulator)..."
& adb -d install -r $apk
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Installed com.aistudio.applet.uxuaoz"
