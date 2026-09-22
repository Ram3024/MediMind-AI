@echo off
title MediMind AI - Server
color 0A
echo.
echo  ==========================================
echo    MediMind AI - Healthcare Platform
echo  ==========================================
echo.
echo  Starting server...
echo.
set PATH=C:\Program Files\nodejs;%PATH%
npm run dev
echo.
pause
