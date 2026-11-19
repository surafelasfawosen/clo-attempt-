@echo off
title Enterprise OBE & CLO Attainment Analytics Platform
color 0B
cls
echo ==============================================================================
echo   HIGHER EDUCATION OUTCOME-BASED EDUCATION (OBE) & CLO PLATFORM
echo   Curriculum Architecture & Accreditation Analytics Engine
echo   College of Computing & Informatics - Dept. of Data Science & AI
echo ==============================================================================
echo.
cd /d "%~dp0"
echo [1/2] Checking Python environment and dependencies...
python -c "import fastapi, uvicorn, sqlalchemy; print('All core libraries verified.')"
if %errorlevel% neq 0 (
    echo [ERROR] Required libraries not found. Installing dependencies...
    pip install fastapi uvicorn sqlalchemy pydantic jinja2
)

echo.
echo [2/2] Initializing Database & Starting Enterprise Web Server...
echo.
echo Server running at: http://localhost:8000
echo API Documentation: http://localhost:8000/api/docs
echo.
echo Press Ctrl+C in this window to stop the server.
echo ==============================================================================
echo.
python main.py
pause
