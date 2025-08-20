@echo off
echo ========================================
echo Starting Expense Tracker Application
echo ========================================
echo.

echo Starting Spring Boot Backend...
start "Spring Boot Backend" cmd /k "mvn spring-boot:run"

echo Waiting for backend to start...
timeout /t 10 /nobreak >nul

echo Starting Angular Frontend...
cd back-frontend
start "Angular Frontend" cmd /k "ng serve"

echo.
echo ========================================
echo Application Starting...
echo ========================================
echo.
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo.
echo Please wait a few moments for both servers to start completely.
echo.
echo Press any key to open the application in your browser...
pause >nul

start http://localhost:4200

echo.
echo Application started successfully!
echo You can now access the Expense Tracker at http://localhost:4200
echo.
pause
