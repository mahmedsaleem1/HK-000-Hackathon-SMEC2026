@echo off
REM Start Receipt Scanner Backend Server
REM This script starts the Express.js server on port 5001

cd /d "c:\Users\dell\Desktop\HK-036-Hackathon-SMEC2026\Task03\SourceCode\Server"

echo.
echo ================================================
echo Receipt Scanner Backend - Starting Server
echo ================================================
echo.
echo Environment: Development
echo Port: 5001
echo.

node "src/server.js"

echo.
echo Server stopped.
pause
