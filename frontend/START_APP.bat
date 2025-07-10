@echo off
echo ====================================
echo  PHARMACY MANAGEMENT SYSTEM STARTER
echo ====================================
echo.

echo Starting Frontend (React)...
cd /d "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE\frontend"
start "Frontend Server" cmd /k "npm start"

echo.
echo Frontend will start on: http://localhost:3000
echo.

echo To start backend (optional):
echo 1. Open new terminal
echo 2. cd "c:\Users\mohammed\Documents\APPLICATION_PHARMACIE\backend"
echo 3. python manage.py runserver
echo.

echo ====================================
echo  TESTING URLS
echo ====================================
echo Dashboard: http://localhost:3000/
echo Database Test: http://localhost:3000/test/database
echo Production Test: http://localhost:3000/test/production
echo Sales Form: http://localhost:3000/sales/new
echo Purchase Form: http://localhost:3000/purchases/new
echo Exchange Form: http://localhost:3000/exchanges/create
echo ====================================

pause
