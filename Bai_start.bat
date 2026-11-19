@echo off
rem 姓名：白雨涵 | 学号：24001010326 | 时间：2026-11-19 | 大模型：DeepSeek-V4.1-Flash
rem 用途：一键启动「知乎的模仿和制作」后端服务（Express + MySQL），端口 8326
rem 说明：本文件正文仅使用 ASCII 字符，中文横幅由 backend/server.js 输出

chcp 65001 >nul
setlocal
title Bai Yuhan 24001010326 - Backend 8326

cd /d "%~dp0backend"

if exist "node_modules" goto Bai_ready

echo [INFO] node_modules not found, running "npm i" ...
call npm i
if errorlevel 1 goto Bai_fail

:Bai_ready
node server.js
echo.
echo [INFO] Server stopped.
pause
goto Bai_end

:Bai_fail
echo [ERROR] npm install failed. Check your network and retry.
pause

:Bai_end
endlocal
