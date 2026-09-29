package com.docuflow.dto;

import com.docuflow.entity.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

public final class DocumentDtos {
  private DocumentDtos(){}

  public record CreateRequest(
    @NotBlank @Size(max=180) String title,
    @Size(max=2000) String description,
    Long categoryId,
    List<String> tags,
    String priority,
    LocalDate dueDate,
    @Size(max=1000) String changeNotes,
    @NotEmpty List<Long> reviewerIds
  ){}

  public record NewVersionRequest(
    @Size(max=1000) String changeNotes
  ){}

  public record RenameRequest(@NotBlank @Size(max=180) String title){}
  public record DecisionRequest(@NotNull ApprovalDecision decision){}
  public record CommentRequest(@NotBlank @Size(max=2000) String content){}

  public record DocumentResponse(
    Long id,
    String title,
    String description,
    String originalFileName,
    long fileSize,
    DocumentStatus status,
    String priority,
    LocalDate dueDate,
    Integer currentVersion,
    String owner,
    Long ownerId,
    Long departmentId,
    String departmentName,
    Long categoryId,
    String categoryName,
    List<String> tags,
    Instant createdAt,
    Instant archivedAt,
    String archivedBy,
    Long archivedById,
    String archiveReason,
    List<Reviewer> reviewers
  ){}

  public record VersionResponse(
    Long id,
    Integer versionNumber,
    String storedFileName,
    String originalFileName,
    long fileSize,
    String uploadedByName,
    Long uploadedById,
    String changeNotes,
    Instant createdAt
  ){}

  public record Reviewer(Long id, String name, ApprovalDecision decision, Instant decidedAt){}
  public record CommentResponse(String author, String content, Instant createdAt){}
  public record ActivityResponse(String actor, String action, String detail, Instant createdAt){}
}
