@echo off
echo ==========================================
echo SIST Database Updater
echo ==========================================
echo.
echo [1/3] Stopping all running Node.js servers to unlock the database...
taskkill /F /IM node.exe
echo.
echo [2/3] Updating Database Schema...
call npx prisma db push
echo.
echo [3/3] Update Complete!
echo.
echo You can now restart your server by running:
echo npm run start:dev
echo.
pause
