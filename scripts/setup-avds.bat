@echo off
REM ======== AJUSTE SE PRECISAR ========
set "SDK=C:\Users\thiago\AppData\Local\Android\Sdk"
set "CLI=%SDK%\cmdline-tools\latest\bin"
set "EMU=%SDK%\emulator"
REM ====================================

if not exist "%CLI%\sdkmanager.bat" (
  echo ERRO: Nao encontrei %CLI%\sdkmanager.bat
  echo -> Instale/extrai-a os Command-line tools em:
  echo    %SDK%\cmdline-tools\latest\
  echo    (deve existir a pasta \bin com sdkmanager.bat e avdmanager.bat)
  exit /b 1
)

REM Instalar pacotes essenciais
"%CLI%\sdkmanager.bat" "platform-tools" "emulator" "system-images;android-35;google_apis;x86_64"

REM Aceitar licencas (se pedir, rode manualmente: "%CLI%\sdkmanager.bat" --licenses)

REM Criar AVD de celular (Pixel 6)
"%CLI%\avdmanager.bat" create avd -n Pixel_6 -k "system-images;android-35;google_apis;x86_64" -d pixel_6 --force

REM Criar AVD de tablet (Pixel Tablet; troque o -d caso nao exista esse profile)
"%CLI%\avdmanager.bat" create avd -n Pixel_Tablet -k "system-images;android-35;google_apis;x86_64" -d pixel_tablet --force

REM Abrir os dois emuladores
start "" "%EMU%\emulator.exe" -avd Pixel_6 -no-snapshot-load
start "" "%EMU%\emulator.exe" -avd Pixel_Tablet -no-snapshot-load
