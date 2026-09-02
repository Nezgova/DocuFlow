package com.docuflow.dto;

import com.docuflow.entity.*;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;

public final class DocumentDtos {
  private DocumentDtos(){}
   public record CreateRequest(@NotBlank @Size(max=180) String title,@Size(max=2000) String description,Long categoryId,@NotEmpty List<Long> reviewerIds){}
   public record RenameRequest(@NotBlank @Size(max=180) String title){}
   public record DecisionRequest(@NotNull ApprovalDecision decision){}
   public record CommentRequest(@NotBlank @Size(max=2000) String content){}
   public record DocumentResponse(Long id,String title,String description,String originalFileName,long fileSize,DocumentStatus status,String owner,Long ownerId,Long departmentId,String departmentName,Long categoryId,String categoryName,Instant createdAt,List<Reviewer> reviewers){}
  public record Reviewer(Long id,String name,ApprovalDecision decision){}
  public record CommentResponse(String author,String content,Instant createdAt){}
  public record ActivityResponse(String actor,String action,String detail,Instant createdAt){}
}
