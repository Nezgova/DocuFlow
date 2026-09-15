package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "document_versions")
public class DocumentVersion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private Document document;

    @Column(name = "version_number", nullable = false)
    private Integer versionNumber;

    @Column(name = "stored_file_name", nullable = false)
    private String storedFileName;

    @Column(name = "original_file_name", nullable = false)
    private String originalFileName;

    @Column(name = "file_size", nullable = false)
    private long fileSize;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_id", nullable = false)
    private User uploadedBy;

    @Column(name = "change_notes", length = 1000)
    private String changeNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected DocumentVersion() {}

    public DocumentVersion(Document document, Integer versionNumber, String storedFileName, String originalFileName, long fileSize, User uploadedBy, String changeNotes) {
        this.document = document;
        this.versionNumber = versionNumber;
        this.storedFileName = storedFileName;
        this.originalFileName = originalFileName;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.changeNotes = changeNotes;
        this.createdAt = Instant.now();
    }

    public Long getId() { return id; }
    public Document getDocument() { return document; }
    public Integer getVersionNumber() { return versionNumber; }
    public String getStoredFileName() { return storedFileName; }
    public String getOriginalFileName() { return originalFileName; }
    public long getFileSize() { return fileSize; }
    public User getUploadedBy() { return uploadedBy; }
    public String getChangeNotes() { return changeNotes; }
    public Instant getCreatedAt() { return createdAt; }
}

