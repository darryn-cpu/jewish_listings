# Boot the JewishFood emulator. Cold boot the first time can take a few minutes.
$ErrorActionPreference = "Stop"
. "$PSScriptRoot\android-env.ps1"

$running = & adb devices
if ($running -match "emulator-") {
    Write-Host "An emulator is already running."
    exit 0
}

& emulator -avd JewishFood -netdelay none -netspeed full
