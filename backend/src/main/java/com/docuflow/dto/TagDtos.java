package com.docuflow.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;

public final class TagDtos {
  private TagDtos() {}
  public record TagResponse(Long id, String name, long documentCount, Instant createdAt) {}
  public record CreateTagRequest(@NotBlank @Size(max=100) String name) {}
}
