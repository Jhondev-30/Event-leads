@echo off
title SpeakUp Events Command Center
cd /d "%~dp0"
echo Iniciando el Servidor del Calendario...
start http://localhost:3000
node server.mjs
pause
