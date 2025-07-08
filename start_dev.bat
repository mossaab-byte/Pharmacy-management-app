@echo off
echo ========================================
echo    Pharmacy Management System Startup
echo ========================================
echo.

echo Starting backend server...
echo Activating virtual environment...
cd /d "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE"
start "Django Server" cmd /k "call venv\Scripts\activate.bat && cd backend && python manage.py runserver 0.0.0.0:8000"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend development server...
cd /d "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE\frontend"
start "React Server" cmd /k "npx webpack serve --mode development"

echo.
echo ========================================
echo    Both servers are starting up!
echo    Backend: http://localhost:8000
echo    Frontend: http://localhost:3000
echo    API Health: http://localhost:8000/api/utils/health/
echo ========================================
echo.
echo Press any key to open the application in your browser...
pause >nul

echo Opening application...
start http://localhost:3000

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
pause
