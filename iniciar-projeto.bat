@echo off
title Conecta+ Servidor (TCC)
color 0A
cls
echo ==============================================================
echo            INICIANDO O PROJETO CONECTA+ (TCC)
echo ==============================================================
echo.
echo [1/2] Abrindo o site no seu navegador em http://localhost:3000...
cd /d "%~dp0"
start http://localhost:3000
echo.
echo [2/2] Ligando o servidor Node.js com MySQL...
echo.
echo ==============================================================
echo  Servidor Ativo! Mantenha esta janela aberta enquanto usar.
echo ==============================================================
echo.
node server.js
pause

