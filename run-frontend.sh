#!/bin/bash
# Script chạy Frontend - BenhVienABC
# Chạy lệnh này từ thư mục project

echo ""
echo "================================"
echo "  BenhVienABC Frontend Startup"
echo "================================"
echo ""

echo "Checking Node.js..."
node --version || { echo "ERROR: Node.js not installed!"; exit 1; }

echo ""
echo "Checking Yarn..."
if ! command -v yarn &> /dev/null; then
    echo "WARNING: Yarn not installed, using npm instead"
    PACKAGE_MANAGER="npm"
else
    PACKAGE_MANAGER="yarn"
fi

echo ""
echo "Step 1: Installing dependencies..."
$PACKAGE_MANAGER install || { echo "ERROR: Failed to install dependencies!"; exit 1; }

echo ""
echo "Step 2: Starting development server..."
echo ""
echo "================================"
echo "  Frontend URL: http://localhost:8000"
echo "  API Base URL: http://localhost:4000/api"
echo "================================"
echo ""

$PACKAGE_MANAGER start:dev

echo ""
echo "Frontend stopped."
