@echo off
echo Starting Django Backend Server...
echo.

cd /d "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend"

echo Checking if Django backend is in the correct directory...
if not exist "manage.py" (
    echo ERROR: manage.py not found! 
    echo Make sure you're in the correct Django backend directory.
    pause
    exit /b 1
)

echo.
echo Starting Django development server on http://localhost:8000...
echo.
echo IMPORTANT: Keep this window open while using the frontend!
echo Press Ctrl+C to stop the Django server.
echo.

python manage.py runserver 8000
