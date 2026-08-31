package com.docuflow.dto;

import com.docuflow.entity.Role;
import jakarta.validation.constraints.*;

public final class AuthDtos {
  private AuthDtos() {}
  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record AuthResponse(String token, UserResponse user) {}
  public record UserResponse(Long id, String fullName, String email, Role role) {}
  public record CreateUserRequest(@NotBlank @Size(max=120) String fullName, @NotBlank @Email String email, @NotBlank @Size(min=8) String password, @NotNull Role role) {}
}
