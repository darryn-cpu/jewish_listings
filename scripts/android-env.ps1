# Session environment for Gradle, adb, and the emulator.
$ErrorActionPreference = "Stop"

$jdk = Get-ChildItem "C:\Program Files\Microsoft" -Directory -Filter "jdk-21*" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    Select-Object -First 1
if (-not $jdk) {
    throw "JDK 21 was not found under C:\Program Files\Microsoft. Install Microsoft OpenJDK 21 and try again."
}

$env:JAVA_HOME = $jdk.FullName
$env:ANDROID_HOME = Join-Path $env:LOCALAPPDATA "Android\Sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
$env:ANDROID_AVD_HOME = Join-Path $env:USERPROFILE ".android\avd"

$prepend = @(
    (Join-Path $env:JAVA_HOME "bin"),
    (Join-Path $env:ANDROID_HOME "platform-tools"),
    (Join-Path $env:ANDROID_HOME "emulator")
) -join ";"
$env:Path = "$prepend;$env:Path"
