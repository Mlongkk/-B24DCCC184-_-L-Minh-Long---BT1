@echo off
REM Script chạy Frontend - BenhVienABC
REM Chạy lệnh này từ thư mục project: c:\Users\This MC\Documents\base-web-umi-main

echo.
echo ================================
echo   BenhVienABC Frontend Startup
echo ================================
echo.
echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    exit /b 1
)

echo.
echo Checking Yarn...
yarn --version
if errorlevel 1 (
    echo WARNING: Yarn not installed, using npm instead
    set PACKAGE_MANAGER=npm
) else (
    set PACKAGE_MANAGER=yarn
)

echo.
echo Step 1: Installing dependencies...
call %PACKAGE_MANAGER% install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo Step 2: Starting development server...
echo.
echo ================================
echo   Frontend URL: http://localhost:8000
echo   API Base URL: http://localhost:4000/api
echo ================================
echo.
call %PACKAGE_MANAGER% start:dev

echo.
echo Frontend stopped.
pause
