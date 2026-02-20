@echo off
echo Creating desktop shortcut for BargainBot...
echo.

REM Get the current directory
set SCRIPT_DIR=%~dp0
set BAT_FILE=%SCRIPT_DIR%start-all.bat

REM Create VBScript to make shortcut
set SHORTCUT=%USERPROFILE%\Desktop\BargainBot.lnk
set VBS=%TEMP%\CreateShortcut.vbs

(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%SHORTCUT%"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%BAT_FILE%"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%"
echo oLink.Description = "Start BargainBot Dashboard"
echo oLink.Save
) > "%VBS%"

cscript //nologo "%VBS%"
del "%VBS%"

if exist "%SHORTCUT%" (
    echo.
    echo [SUCCESS] Shortcut created on Desktop!
    echo You can now double-click "BargainBot" on your desktop to start the app.
) else (
    echo.
    echo [ERROR] Failed to create shortcut.
)

echo.
pause
