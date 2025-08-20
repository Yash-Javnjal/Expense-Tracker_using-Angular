@echo off
echo ========================================
echo Expense Tracker Setup Script
echo ========================================
echo.

echo Checking prerequisites...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js is installed
)

REM Check if Angular CLI is installed
ng version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Angular CLI is not installed. Installing now...
    npm install -g @angular/cli
) else (
    echo ✅ Angular CLI is installed
)

REM Check if Java is installed
java --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed. Please install Java JDK 17 or higher
    pause
    exit /b 1
) else (
    echo ✅ Java is installed
)

REM Check if Maven is installed
mvn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven is not installed. Please install Maven
    pause
    exit /b 1
) else (
    echo ✅ Maven is installed
)

echo.
echo ========================================
echo Installing Angular Dependencies
echo ========================================
echo.

cd back-frontend
echo Installing npm packages...
npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install npm packages
    pause
    exit /b 1
)

echo ✅ Angular dependencies installed successfully

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Make sure PostgreSQL is running and create database 'expense_db'
echo 2. Update database password in src/main/resources/application.properties
echo 3. Start the backend: mvn spring-boot:run
echo 4. Start the frontend: cd back-frontend && ng serve
echo 5. Open http://localhost:4200 in your browser
echo.
echo For detailed instructions, see INSTALLATION_GUIDE.md
echo.
pause
