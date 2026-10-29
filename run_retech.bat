@echo off
title RETECH - Platform Launcher
color 0b
echo ============================================================
echo   RETECH - Smart Device Resale, Exchange and Repair
echo   Starting Backend (Flask) and Frontend (Vite React)...
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Launching Flask Backend on http://127.0.0.1:5000 ...
start "RETECH Backend (Port 5000)" cmd /k "cd /d %~dp0 && set PYTHONPATH=%~dp0&& backend\venv\Scripts\python.exe -m backend.app"

echo [2/3] Waiting for Backend to initialize...
timeout /t 3 /nobreak >nul

echo [3/3] Launching Vite Frontend on http://localhost:5173 ...
set "PATH=%~dp0tools\nodejs;%PATH%"
start "RETECH Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ============================================================
echo   RETECH Platform is starting!
echo   - Frontend: http://localhost:5173
echo   - Backend : http://127.0.0.1:5000/api
echo ============================================================
echo.
echo Opening RETECH in your default browser...
timeout /t 2 /nobreak >nul
start http://localhost:5173

pause
