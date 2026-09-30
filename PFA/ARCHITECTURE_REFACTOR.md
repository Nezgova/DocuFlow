# DocuFlow Architecture Refactor & Storage Separation

This document records the targeted architectural cleanup performed prior to the introduction of the future AI metadata analysis feature.

---

## 1. Before: DocumentService Responsibilities

Previously, `DocumentService` acted as a monolithic service handling multiple distinct domains:
- Document business logic & validation
- Approval workflow state transitions
- Reviewer assignment & notifications
- Audit activity logging
- Direct filesystem operations (`Files.createDirectories`, `Files.copy`, `Files.deleteIfExists`, path resolution)
- Historical version file management

This high coupling caused low cohesion, mixing core domain logic with low-level storage details.

---

## 2. After: DocumentService + DocumentStorageService Separation

The architecture has been refactored into two clean, focused services:

### `DocumentStorageService` (`com.docuflow.service.DocumentStorageService`)
- **Responsibility**: Purely filesystem-related operations.
- **Operations**: Storing uploaded PDFs, generating unique UUID filenames, loading files as `Resource`, resolving storage paths, checking file existence, deleting stored files, and cleaning up version files.
- **Rules**: Contains **zero** business rules, zero workflow logic, zero authorization checks, and zero database entity manipulations.

### `DocumentService` (`com.docuflow.service.DocumentService`)
- **Responsibility**: Core document lifecycle, business rules, review workflows, approvals, rejections, version revisions, commenting, archiving, notifications, and audit logging.
- **Delegation**: Delegates all direct file storage and retrieval calls to `DocumentStorageService`.

---

## 3. Why the Separation Was Introduced

1. **Single Responsibility Principle (SRP)**: Separates storage mechanisms from business rules.
2. **Testability & Maintainability**: Makes unit testing document workflow rules simpler without relying on raw disk I/O mocking.
3. **AI Feature Readiness**: Prepares the storage layer to cleanly integrate future text extraction and AI metadata analysis pipelines.

---

## 4. Transaction & File I/O Consistency Handling

To prevent long-running database transactions from being held open during file I/O while ensuring consistency:
- **Compensating Rollback / Try-Catch Cleanup**: When uploading or restarting documents, files are stored to disk via `DocumentStorageService`. If subsequent database persistence operations fail, the exception handler catches the error and immediately invokes `storageService.deleteFile(...)` to clean up any potential orphaned files.
- **Separation**: Raw stream copying occurs outside active database transactions or safely wrapped so disk I/O does not block database connection pools unnecessarily.

---

## 5. Future AI Integration Boundary

The refactored architecture establishes a clear boundary for the upcoming AI metadata feature:

```
PDF Upload
    ↓
DocumentStorageService (Saves file to disk)
    ↓
PdfTextExtractionService (Extracts text via Apache PDFBox)
    ↓
AIAnalysisService (Sends text to LLM / AI Provider)
    ↓
Suggested Metadata (Category, Department, Tags, Priority, Summary)
    ↓
User Confirmation in UI
    ↓
Normal DocuFlow Workflow (DocumentService.upload)
```

- **Separation**: PDF text extraction (PDFBox) is separated from LLM integration (`AIAnalysisService`).
- **Optional & Asynchronous**: AI suggestions will remain optional and non-blocking, ensuring that AI service failures never disrupt core document upload or workflow execution.
- **Secrets Management**: Future AI API keys (`AI_API_KEY`) will be configured strictly via environment variables, keeping sensitive credentials out of the database settings table.
