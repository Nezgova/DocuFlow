package com.docuflow.dto;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.List;

public final class WorkflowTemplateDtos {
  private WorkflowTemplateDtos() {}

  public record CreateWorkflowTemplateRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 500) String description,
    @NotEmpty List<Long> reviewerIds
  ) {}

  public record TemplateStepResponse(
    Long reviewerId,
    String reviewerName,
    Integer stepOrder
  ) {}

  public record WorkflowTemplateResponse(
    Long id,
    String name,
    String description,
    List<TemplateStepResponse> steps,
    Instant createdAt
  ) {}
}
