@echo off
echo Creating desktop shortcut for Emirates of Deals...
echo.

REM Get the current directory
set SCRIPT_DIR=%~dp0
set BAT_FILE=%SCRIPT_DIR%start-all.bat

REM Create VBScript to make shortcut
set SHORTCUT=%USERPROFILE%\Desktop\Emirates of Deals.lnk
set VBS=%TEMP%\CreateShortcut.vbs

(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%SHORTCUT%"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%BAT_FILE%"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%"
echo oLink.Description = "Start Emirates of Deals Dashboard"
echo oLink.Save
) > "%VBS%"

cscript //nologo "%VBS%"
del "%VBS%"

if exist "%SHORTCUT%" (
    echo.
    echo [SUCCESS] Shortcut created on Desktop!
    echo You can now double-click "Emirates of Deals" on your desktop to start the app.
) else (
    echo.
    echo [ERROR] Failed to create shortcut.
)

echo.
pause
