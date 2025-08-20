# Installation Guide - Angular + Bootstrap + Spring Boot Expense Tracker

## Prerequisites Installation

### 1. Install Node.js
1. Go to [https://nodejs.org/](https://nodejs.org/)
2. Download the LTS (Long Term Support) version for Windows
3. Run the installer and follow the installation wizard
4. Verify installation by opening Command Prompt and running:
   ```bash
   node --version
   npm --version
   ```

### 2. Install Angular CLI
After installing Node.js, install Angular CLI globally:
```bash
npm install -g @angular/cli
```
Verify installation:
```bash
ng version
```

### 3. Install Java Development Kit (JDK)
1. Download JDK 17 from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
2. Install and set JAVA_HOME environment variable
3. Verify installation:
   ```bash
   java --version
   ```

### 4. Install Maven
1. Download Maven from [https://maven.apache.org/download.cgi](https://maven.apache.org/download.cgi)
2. Extract to a directory (e.g., `C:\Program Files\Apache\maven`)
3. Add Maven to PATH environment variable
4. Verify installation:
   ```bash
   mvn --version
   ```

### 5. Install PostgreSQL
1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Remember the password you set for the postgres user
4. Create a database named `expense_db`

## Project Setup

### 1. Backend Setup (Spring Boot)
1. Navigate to the project root directory:
   ```bash
   cd yashh/yash
   ```

2. Update database configuration in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.password=YOUR_POSTGRES_PASSWORD
   ```

3. Build and run the Spring Boot application:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

4. The backend will start on a random port (check console output)

### 2. Frontend Setup (Angular)
1. Navigate to the Angular project directory:
   ```bash
   cd back-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Bootstrap:
   ```bash
   npm install bootstrap @ng-bootstrap/ng-bootstrap
   ```

4. Start the Angular development server:
   ```bash
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Project Structure

```
yashh/yash/
├── src/main/java/com/example/yash/     # Spring Boot backend
│   ├── Expense.java                    # Entity class
│   ├── ExpenseController.java          # REST API controller
│   ├── ExpenseService.java             # Business logic
│   ├── ExpenseRepository.java          # Data access layer
│   └── YashApplication.java            # Main application class
├── src/main/resources/
│   ├── application.properties          # Database configuration
│   └── static/                         # Static files (old frontend)
├── back-frontend/                      # Angular frontend
│   ├── src/app/
│   │   ├── components/                 # Angular components
│   │   ├── services/                   # Angular services
│   │   ├── models/                     # TypeScript interfaces
│   │   └── app.component.*             # Main app component
│   ├── src/assets/                     # Static assets
│   └── package.json                    # Angular dependencies
└── pom.xml                            # Maven configuration
```

## Running the Application

### Development Mode
1. Start the backend (Spring Boot):
   ```bash
   cd yashh/yash
   mvn spring-boot:run
   ```

2. Start the frontend (Angular) in a new terminal:
   ```bash
   cd yashh/yash/back-frontend
   ng serve
   ```

3. Access the application at `http://localhost:4200`

### Production Build
1. Build the Angular application:
   ```bash
   cd back-frontend
   ng build --configuration production
   ```

2. Copy the built files to Spring Boot's static directory:
   ```bash
   cp -r dist/* ../src/main/resources/static/
   ```

3. Build and run the Spring Boot application:
   ```bash
   mvn clean package
   java -jar target/yash-0.0.1-SNAPSHOT.jar
   ```

## Troubleshooting

### Common Issues

1. **Port already in use**: 
   - Change the port in `application.properties` or kill the process using the port

2. **Database connection failed**:
   - Ensure PostgreSQL is running
   - Check database credentials in `application.properties`
   - Verify database `expense_db` exists

3. **Angular build errors**:
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Update Angular CLI: `npm install -g @angular/cli@latest`

4. **CORS issues**:
   - The backend is configured with `@CrossOrigin(origins = "*")` to allow all origins

## Features

- ✅ Expense tracking with categories
- ✅ Real-time statistics and summaries
- ✅ Filtering and sorting capabilities
- ✅ Dark mode toggle
- ✅ Responsive design with Bootstrap
- ✅ RESTful API with Spring Boot
- ✅ PostgreSQL database integration
- ✅ Modern Angular frontend
- ✅ CRUD operations (Create, Read, Update, Delete)

## API Endpoints

- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
