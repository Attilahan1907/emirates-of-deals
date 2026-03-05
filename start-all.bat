@echo off
title Emirates of Deals Launcher
color 0A
echo ========================================
echo   Starting Emirates of Deals Dashboard
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

REM Check if node_modules exists
if not exist "frontend-react\node_modules" (
    echo [INFO] Installing frontend dependencies...
    cd frontend-react
    call npm install
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies!
        pause
        exit /b 1
    )
    cd /d "%~dp0"
)

echo [1/2] Starting Flask Backend Server...
echo [2/2] Starting React Frontend Server...
echo.

REM Start both in one Windows Terminal window with tabs
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
wt -w Emirates new-tab --title Backend -d "%ROOT%" cmd /k "python main.py" ^; new-tab --title Frontend -d "%ROOT%\frontend-react" cmd /k "npm run dev"

echo ========================================
echo   All systems are starting!
echo ========================================
echo.
echo Backend:        http://localhost:5000
echo Frontend:       http://localhost:5173
echo.
echo Both servers run as tabs in one Windows Terminal window.
echo.
timeout /t 3 /nobreak >nul
