@echo off
title BargainBot Launcher
color 0A
echo ========================================
echo   Starting BargainBot Dashboard
echo ========================================
echo.

REM Get the directory where this batch file is located
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH!
    echo Please install Python and try again.
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

echo [1/2] Starting Flask Backend Server...
start "BargainBot Backend" cmd /k "cd /d %~dp0 && python main.py"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo [2/2] Starting React Frontend Server...
cd frontend-react

REM Check if node_modules exists
if not exist "node_modules" (
    echo [INFO] Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
)

start "BargainBot Frontend" cmd /k "cd /d %~dp0frontend-react && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173 (check terminal for actual port)
echo.
echo Two new windows have opened - one for each server.
echo Close those windows to stop the servers.
echo.
echo Press any key to close this launcher window...
echo (The servers will continue running in their own windows)
pause >nul
