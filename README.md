# DocuFlow

DocuFlow centralizes internal document review workflows: employees upload PDFs, managers review them, and the system preserves a complete audit trail.

## Applications

- `backend/` — Java 21, Spring Boot REST API, Spring Security, JWT, JPA/MySQL
- `frontend/` — React, Vite, Tailwind CSS dashboard

## Quick start on Windows

1. In phpMyAdmin, import [database/docuflow_schema.sql](database/docuflow_schema.sql) (or create a local MySQL database named `docuflow`).
2. In PowerShell, set the development configuration (replace the password):

   ```powershell
   $env:DB_PASSWORD = 'your-mysql-password'
   $env:SEED_ADMIN_EMAIL = 'admin@docuflow.local'
   $env:SEED_ADMIN_PASSWORD = 'ChangeMe123!'
   $env:JWT_SECRET = 'a-long-random-secret-of-at-least-32-characters'
   .\run.ps1
   ```

3. Open `http://localhost:5173` and sign in using the seeded administrator email and password.

The script opens separate API and frontend terminals. The API is at `http://localhost:8080/api`; the frontend proxies requests directly to it.

### Run manually

```powershell
# terminal 1
cd backend
mvn spring-boot:run

# terminal 2
cd frontend
npm install
npm run dev
```

To run the backend checks, use `cd backend; mvn test`. To create a production frontend build, use `cd frontend; npm run build`.

### Using the current application

- Sign in as the seeded administrator.
- Open **Documents** to see documents you own or are assigned to review.
- The REST API accepts `POST /api/documents` multipart data (`data` JSON plus a PDF `file`), reviewer approval decisions at `PATCH /api/documents/{id}/decision`, comments, and signature simulation at `POST /api/documents/{id}/sign`.

The development account is seeded only when `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are supplied.
