@echo off
echo ==========================================
echo SIST Cleanup & Restart
echo ==========================================
echo.
echo [1/3] Killing ALL Node.js processes to free up ports 3000 & 3001...
taskkill /F /IM node.exe
echo.
echo [2/3] Ports cleared.
echo.
echo [3/3] Please restart your servers in this EXACT order:
echo    1. Open Terminal 1 -> cd backend -> npm run start:dev
echo       (Wait for "Nest application successfully started")
echo.
echo    2. Open Terminal 2 -> cd frontend -> npm run dev
echo.
pause
