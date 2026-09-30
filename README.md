# DocuFlow

DocuFlow is a full-stack document review and workflow management platform designed to centralize internal document lifecycles, structured approvals, versioning, and compliance audit logging.

---

## Overview

Organizations frequently manage internal document validation via fragmented channels—emails, shared network folders, and manual status tracking. This leads to version confusion, untraceable review bottlenecks, and lack of accountability.

**DocuFlow** solves these challenges by centralizing:
- Document submission & PDF management
- Multi-reviewer assignments & structured approval workflows
- Version history & revision tracking
- Document comments & real-time notifications
- Comprehensive activity audit trails with IP & browser logging
- Finalization & signed certificate generation
- Archival, retention, and search capabilities

> **Note**: DocuFlow is developed as a robust student/professional full-stack project inspired by real-world enterprise document workflow and digital trust use cases. It is not affiliated with any commercial production platform and does not claim to provide legal/qualified electronic signature services under eIDAS or equivalent legal frameworks.

---

## Main Features

### Document Management
- **PDF Document Upload**: Securely upload and store PDF files with automatic validation.
- **Organization**: Categorize documents by **Departments**, **Categories**, and flexible **Tags**.
- **Metadata**: Set **Priority** (Low, Medium, High, Urgent) and **Due Dates** for time-sensitive reviews.

### Workflow & Collaboration
- **Reviewer Assignment**: Assign one or more reviewers to evaluate documents.
- **Approval & Rejection**: Reviewers record structured decisions (Approved / Rejected) with instant notification dispatch.
- **Workflow Templates**: Reusable templates for standardized multi-reviewer pipelines.
- **Version History**: Upload new document versions, track revision notes, and restore/view historical files.
- **Workflow Restart**: Modify document details and restart review pipelines if rejected before review decisions lock.
- **Comments**: Threaded discussions directly attached to documents.

### Administration & Insights
- **Dashboard Analytics**: Real-time metrics on pending, approved, signed, and rejected documents.
- **Advanced Search & Saved Filters**: Filter, search, and save custom filter presets.
- **Reports**: Export document analytics and activity logs in CSV and PDF formats.
- **Archive Management**: Securely archive finalized documents with reason tracking and restore capabilities.
- **System Settings**: Configurable application parameters and audit log auditability.
- **Activity Logs**: Detailed audit trails capturing actor, action, timestamp, IP address, and browser user-agent.

### PDF Finalization
- **Apache PDFBox Integration**: Automatically appends a cryptographically simulated verification certificate and signature page to fully approved documents.

---

## Workflow

DocuFlow enforces a strict state machine governing document progression:

```
[ UPLOAD ] 
    ↓
[ PENDING ] (Reviewers assigned)
    ├──→ [ REJECTED ] → (Optional: Restart / New Version)
    └──→ [ READY_FOR_SIGNATURE ] (All reviewers approved)
           ↓
    [ SIGNED / FINALIZED ] (Manager/Admin sign & certify)
           ↓
    [ ARCHIVED ] (Optional long-term retention)
```

---

## Architecture

DocuFlow is built on a clean three-tier architecture:

```
React / Vite / Tailwind Frontend
            │
            ▼ (REST API / Axios)
Spring Boot 3.5 / Java 21 Backend
            │
            ▼ (Spring Data JPA / Hibernate)
MySQL Relational Database
```

### Key Architectural Characteristics
- **Separation of Concerns**: Business logic (`DocumentService`) is strictly decoupled from file storage operations (`DocumentStorageService`).
- **Spring Security & JWT**: Stateless authentication via JSON Web Tokens and BCrypt password hashing.
- **Data Transfer Objects (DTOs)**: Clean request/response boundaries preventing domain leakage.
- **Robust Exception Handling**: Centralized `GlobalExceptionHandler` and custom `ApiException` responses.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS, Lucide React icons
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Backend
- **Language & Runtime**: Java 21
- **Framework**: Spring Boot 3.5
- **Security**: Spring Security (JWT filter chain)
- **Data Access**: Spring Data JPA / Hibernate
- **Build Tool**: Maven
- **PDF Processing**: Apache PDFBox

### Database
- **Relational Database**: MySQL 8.x

---

## Project Structure

```
DocuFlow/
├── backend/                  # Spring Boot 3.5 / Java 21 API
│   ├── src/main/java/com/docuflow/
│   │   ├── controller/       # REST API endpoints
│   │   ├── dto/              # Request / Response records
│   │   ├── entity/           # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   ├── security/         # JWT authentication filters & config
│   │   └── service/          # Business logic & DocumentStorageService
│   └── pom.xml
├── frontend/                 # React / Vite / Tailwind UI
│   ├── src/
│   │   ├── components/       # UI components & views
│   │   ├── context/          # Auth & state context
│   │   └── api/              # Axios API client
│   └── package.json
├── database/                 # SQL schema and seed data
│   ├── docuflow_schema.sql
│   └── demo_users.sql
├── PFA/                      # Project Soutenance & Architecture Documentation
│   ├── PROJECT_FULL_SUMMARY.md
│   ├── PROJECT_ARCHITECTURE_INVESTIGATION.md
│   └── ARCHITECTURE_REFACTOR.md
├── run.ps1                   # Local orchestration script (Windows)
└── README.md
```

---

## Security

DocuFlow implements rigorous security measures:
- **Stateless Authentication**: Signed JWT tokens issued upon login.
- **Password Security**: Strong cryptographic hashing via Spring Security `BCryptPasswordEncoder`.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `EMPLOYEE`, `MANAGER`, and `ADMINISTRATOR` roles.
- **Resource Ownership & Authorization**: Backend checks ensure users only access documents they own, are assigned to review, or have administrative privilege to inspect.
- **Protected File Access**: Direct filesystem reads require authenticated session validation.

---

## Installation / Running Locally

### Prerequisites
- Java 21 JDK installed and configured (`JAVA_HOME`)
- Node.js (v18+) and npm
- MySQL Server running locally

### 1. Database Setup
Create a MySQL database named `docuflow` and import the base schema:
```sql
CREATE DATABASE docuflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
Import `database/docuflow_schema.sql` (and optionally `database/demo_users.sql` for test accounts).

### 2. Configure & Run (Windows PowerShell)
Use the orchestration script `run.ps1` or run services manually.
```powershell
$env:DB_URL = 'jdbc:mysql://localhost:3306/docuflow?useSSL=false&serverTimezone=UTC'
$env:DB_USERNAME = 'root'
$env:DB_PASSWORD = 'your-mysql-password'
$env:SEED_ADMIN_EMAIL = 'admin@docuflow.local'
$env:SEED_ADMIN_PASSWORD = 'ChangeMe123!'
$env:JWT_SECRET = 'a-long-random-secret-of-at-least-32-characters-long'
.\run.ps1
```

### 3. Run Manually (Alternative)
**Backend:**
```powershell
cd backend
mvn spring-boot:run
```
**Frontend:**
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## Configuration

Environment variables used by the backend (`application.properties`):
- `DB_URL`: MySQL connection URL
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `JWT_SECRET`: Secret key for JWT signing (minimum 32 characters)
- `SEED_ADMIN_EMAIL`: Initial admin account email (optional seeding)
- `SEED_ADMIN_PASSWORD`: Initial admin account password (optional seeding)
- `app.storage-dir`: Directory for uploaded PDF storage (defaults to `backend/uploads`)

---

## Database

Key JPA entities mapped in MySQL:
- **`User`**: System users with role assignments (`EMPLOYEE`, `MANAGER`, `ADMINISTRATOR`).
- **`Document`**: Core document records holding metadata, status, version, category, department, and storage pointers.
- **`DocumentVersion`**: Historical revision records tracking every uploaded PDF version.
- **`Department` & `Category` & `Tag`**: Organizational classification entities.
- **`Approval`**: Reviewer assignment tracking decision states.
- **`Comment`**: Threaded document comments.
- **`ActivityLog`**: Audit trails capturing actor actions, IP addresses, and browsers.
- **`Notification`**: In-app user notifications.

---

## Screenshots

*(Screenshots can be added here upon final UI polishing for the soutenance presentation.)*

---

## PFA Documentation

Detailed technical investigations, architecture overviews, and refactoring records are available under the `PFA/` folder:
- **`PFA/PROJECT_FULL_SUMMARY.md`**: Comprehensive summary of all implemented features and technical design.
- **`PFA/PROJECT_ARCHITECTURE_INVESTIGATION.md`**: Deep-dive architectural analysis of the system.
- **`PFA/ARCHITECTURE_REFACTOR.md`**: Record of the `DocumentStorageService` refactoring and transaction consistency design.

---

## Planned AI Feature — Intelligent Metadata

The next planned architectural extension for DocuFlow is an **AI-Powered Intelligent Metadata Extraction** module.

### Planned Concept
When a user selects a PDF for upload, DocuFlow will optionally trigger an AI pipeline:
1. **Text Extraction**: Apache PDFBox extracts raw text streams from the uploaded PDF.
2. **AI Analysis**: The extracted text is submitted to an external LLM / AI provider service.
3. **Structured Suggestions**: The AI returns suggested metadata (Category, Department, Tags, Priority, Summary).
4. **User Review & Confirmation**: The frontend displays suggestions in an interactive review modal. The user retains absolute control to accept, reject, or modify suggestions.
5. **Workflow Continuation**: Upon user confirmation, normal DocuFlow upload and review workflows proceed.

### Architectural Boundary & Principles
- **User-in-the-Loop**: AI suggestions **never** automatically approve documents, reject workflows, assign permissions, or bypass security rules.
- **Decoupled Services**: Future architecture will cleanly separate text extraction (`PdfTextExtractionService`) from LLM integration (`AIAnalysisService`).
- **Secrets Management**: AI API keys (`AI_API_KEY`) will be managed exclusively via environment variables, never stored in the database.

---

## Current Project Status

DocuFlow is a **completed, fully functional full-stack document workflow prototype** ready for academic presentation and soutenance evaluation.
