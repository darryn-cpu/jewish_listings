# How to run the emulator

Run these commands from the project folder:

`C:\Users\Danks\Documents\GitHub\Jewish-Listngs`

The debug APK is:

`app\build\outputs\apk\debug\app-debug.apk`

## Start the emulator

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-emulator.ps1
```

Leave that terminal open. The first boot can take a few minutes. Wait until the Android home screen is visible before installing the app.

## Install the APK on the emulator

Open a second terminal in the project folder and run:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -e install -r app\build\outputs\apk\debug\app-debug.apk
```

`-e` installs onto the emulator. `-r` replaces an existing install.

When it finishes, open **Jewish Food** from the app drawer.

## Send the APK to a phone over USB

On the phone:

1. Settings → About phone → tap **Build number** 7 times.
2. Settings → Developer options → turn on **USB debugging**.
3. On Xiaomi or MIUI, also turn on **Install via USB** and **USB debugging (Security settings)**.
4. Plug in the cable. If the phone asks to allow USB debugging, tap **Allow**.

Build and install onto the phone (this ignores a running emulator):

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-phone.ps1
```

If the APK is already built, install that file only:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -d install -r app\build\outputs\apk\debug\app-debug.apk
```

`-d` sends it to the USB phone.

## Rebuild the APK

Use this when the app code has changed:

```powershell
powershell -ExecutionPolicy Bypass -File scripts\build-apk.ps1
```

Then run the emulator or USB install command again.

## See what is connected

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices -l
```

A ready emulator is listed as `emulator-5554`. A ready phone is listed as `device`. If it says `unauthorized`, unlock the phone and accept the USB debugging prompt.

## Open the app from the terminal

Emulator:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -e shell am start -n com.aistudio.applet.uxuaoz/com.example.MainActivity
```

USB phone:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -d shell am start -n com.aistudio.applet.uxuaoz/com.example.MainActivity
```

## If install says the signatures do not match

Remove the old copy, then install again.

Emulator:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -e uninstall com.aistudio.applet.uxuaoz
```

USB phone:

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" -d uninstall com.aistudio.applet.uxuaoz
```
