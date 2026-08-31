package com.docuflow.dto;

import com.docuflow.entity.Role;
import jakarta.validation.constraints.*;

public final class AuthDtos {
  private AuthDtos() {}
  public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
  public record AuthResponse(String token, UserResponse user) {}
  public record UserResponse(Long id, String fullName, String email, Role role) {}
}
