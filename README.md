# DocuFlow

DocuFlow centralizes internal document review workflows: employees upload PDFs, managers review them, and the system preserves a complete audit trail.

## Applications

- `backend/` — Java 21, Spring Boot REST API, Spring Security, JWT, JPA/MySQL
- `frontend/` — React, Vite, Tailwind CSS dashboard

## Local setup

1. Create a MySQL database named `docuflow`.
2. Copy `backend/.env.example` values into your environment and set `DB_PASSWORD` and a long `JWT_SECRET`.
3. Run `mvn spring-boot:run` from `backend` (requires Java 21 and Maven).
4. Run `npm install` then `npm run dev` from `frontend`.

The development account is seeded only when `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD` are supplied.
