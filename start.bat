@echo off
echo ===========================================
echo      DEMARRAGE APPLICATION PHARMACIE
echo ===========================================
echo.

echo [1/3] Demarrage du serveur Django...
cd backend
start "Django Server" cmd /k "call ..\venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:8000"
cd ..

echo [2/3] Attente de 3 secondes...
timeout /t 3 /nobreak > nul

echo [3/3] Demarrage du serveur React...
cd frontend
start "React Server" cmd /k "npx webpack serve --mode development --port 3000"
cd ..

echo.
echo ===========================================
echo   SERVEURS DEMARRES AVEC SUCCES !
echo   - Django Backend: http://127.0.0.1:8000
echo   - React Frontend: http://localhost:3000
echo ===========================================
echo.
pause
