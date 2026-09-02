package com.docuflow.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public final class CategoryDtos {
  private CategoryDtos() {}
  public record CategoryResponse(Long id, String name, String description, long documentCount, Instant createdAt) {}
  public record CreateCategoryRequest(@NotBlank @Size(max=100) String name, @Size(max=500) String description) {}
}
