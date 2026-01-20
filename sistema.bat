@echo off
setlocal
TITLE Launcher POS

:: ---------------------------------------------------------
:: CONFIGURACIÓN
:: ---------------------------------------------------------
SET PORT=5173

:: [Ruta Automática]
:: %~dp0 detecta la carpeta donde guardaste este archivo .bat
SET "PROJECT_PATH=%~dp0"

:: Carpeta temporal para el navegador
SET "CHROME_TEMP=%TEMP%\Chrome_POS_Profile"

:: Zoom (1.0 = 100% Normal)
SET ZOOM_FACTOR=1.0

:: ---------------------------------------------------------
:: 1. NAVEGAR A LA RUTA DETECTADA
:: ---------------------------------------------------------
cd /d "%PROJECT_PATH%"

:: ---------------------------------------------------------
:: 2. AUTO-INSTALACIÓN (SOLO SI FALTA)
:: ---------------------------------------------------------
:: Si no existe la carpeta node_modules, ejecuta la instalación.
:: Si ya existe, salta este paso para iniciar rápido.
if not exist "node_modules" (
    call npm install >nul 2>&1
)

:: ---------------------------------------------------------
:: 3. INICIAR SERVIDOR (FANTASMA / OCULTO)
:: ---------------------------------------------------------
:: Inicia el servidor Next.js en segundo plano sin ventana
start /B npm run dev >nul 2>&1

:: ---------------------------------------------------------
:: 4. ESPERA DE SEGURIDAD
:: ---------------------------------------------------------
:: 6 segundos para dar tiempo a que arranque el servidor
timeout /t 6 /nobreak >nul

:: ---------------------------------------------------------
:: 5. ABRIR CHROME (MODO KIOSCO/APP)
:: ---------------------------------------------------------
:: El script se pausa aquí hasta que cierres la ventana
start /WAIT chrome --app="http://localhost:%PORT%" --start-fullscreen --force-device-scale-factor=%ZOOM_FACTOR% --user-data-dir="%CHROME_TEMP%"

:: ---------------------------------------------------------
:: 6. APAGADO Y LIMPIEZA
:: ---------------------------------------------------------
:: Busca el proceso que ocupa el puerto 5173 y lo elimina
powershell -Command "Get-NetTCPConnection -LocalPort %PORT% -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }"

:: Espera breve y borrado de temporales
timeout /t 1 /nobreak >nul
rmdir /s /q "%CHROME_TEMP%" >nul 2>&1
exit