@echo off
:: sistema.bat
setlocal

:: CONFIGURACION
SET PORT=5173
SET "PROJECT_PATH=D:\PROYECTOS REACT\pos-updated"
SET "CHROME_TEMP=%TEMP%\Chrome_POS_Profile"

cd /d "%PROJECT_PATH%"

:: INSTALACION SILENCIOSA (Si hace falta)
if not exist "node_modules" (
    call npm install
)

:: INICIAR SERVIDOR
start "POS_BACKEND_SERVICE" /MIN npm run dev

:: ESPERA SEGURA (5 seg para que cargue Vite)
timeout /t 5 /nobreak >nul

:: ABRIR CHROME EN MODO APP (BLOQUEANTE)
:: Al estar oculto el BAT, este comando mantiene vivo el proceso fantasma
start /WAIT chrome --app="http://localhost:%PORT%" --start-fullscreen --user-data-dir="%CHROME_TEMP%"

:: LIMPIEZA FINAL (Cuando cierras Chrome, se ejecuta esto)
taskkill /FI "WINDOWTITLE eq POS_BACKEND_SERVICE" /T /F >nul
rmdir /s /q "%CHROME_TEMP%" >nul 2>&1
exit