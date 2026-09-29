package com.docuflow.dto;

import com.docuflow.entity.Role;
import jakarta.validation.constraints.*;

public final class AuthDtos {
  private AuthDtos() {}
  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record AuthResponse(String token, UserResponse user) {}
  public record UserResponse(Long id, String fullName, String email, Role role, Long departmentId, String departmentName, String avatar, String phone, String jobTitle, java.time.Instant createdAt) {}
  public record CreateUserRequest(@NotBlank @Size(max=120) String fullName, @NotBlank @Email String email, @NotBlank @Size(min=8) String password, @NotNull Role role, Long departmentId) {}
  public record UpdateUserRequest(@NotBlank @Size(max=120) String fullName, @NotNull Role role, Long departmentId, boolean active) {}
  public record UpdateProfileRequest(@NotBlank @Size(max=120) String fullName, @Size(max=50) String phone, @Size(max=120) String jobTitle, @Size(max=500) String avatar, String currentPassword, String newPassword) {}
  public record ActivityItemResponse(String action, String detail, String documentTitle, Long documentId, java.time.Instant createdAt) {}
  public record UserProfileResponse(UserResponse user, long uploadedDocumentsCount, long approvedDocumentsCount, long pendingApprovalsCount, java.util.List<ActivityItemResponse> recentActivity) {}
}
