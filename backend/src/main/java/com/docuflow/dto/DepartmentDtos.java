package com.docuflow.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public final class DepartmentDtos {
  private DepartmentDtos() {}
  public record DepartmentResponse(Long id, String name, String description, long userCount, Instant createdAt) {}
  public record CreateDepartmentRequest(@NotBlank @Size(max=100) String name, @Size(max=500) String description) {}
}
