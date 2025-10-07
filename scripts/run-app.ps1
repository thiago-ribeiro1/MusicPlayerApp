# Aguarda o adb subir
Start-Process -NoNewWindow "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" -ArgumentList "start-server" | Out-Null
Start-Sleep -Seconds 8

$devices = & "$env:ANDROID_SDK_ROOT\platform-tools\adb.exe" devices |
  Select-String -Pattern '^emulator-\d+\s+device' |
  ForEach-Object { ($_ -split '\s+')[0] }

if (-not $devices) {
  Write-Host "Nenhum emulador online. Abra com scripts\setup-avds.bat primeiro."
  exit 1
}

Write-Host "Dispositivos detectados:`n$($devices -join "`n")"
foreach ($d in $devices) {
  Write-Host "Instalando no $d..."
  cmd /c "npx react-native run-android --deviceId $d"
}
