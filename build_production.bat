@echo off
echo ========================================
echo    Building Pharmacy Management System
echo ========================================
echo.

echo Step 1: Building frontend...
cd /d "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE\frontend"
call npm run build
if %errorlevel% neq 0 (
    echo Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Step 2: Collecting static files...
cd /d "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE"
call venv\Scripts\activate
cd backend
python manage.py collectstatic --noinput
if %errorlevel% neq 0 (
    echo Static file collection failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Running backend server...
python manage.py runserver 0.0.0.0:8000

echo.
echo ========================================
echo    Production build complete!
echo    Access your app at: http://localhost:8000
echo ========================================
pause
