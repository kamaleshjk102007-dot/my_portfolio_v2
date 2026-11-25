@echo off
cd /d "%~dp0"
where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js and npm were not found. Install Node.js and try again.
  pause
  exit /b 1
)
call npm run dev
pause
