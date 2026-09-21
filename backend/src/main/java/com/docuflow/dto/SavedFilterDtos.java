package com.docuflow.dto;

import java.time.Instant;

public final class SavedFilterDtos {
  private SavedFilterDtos() {}

  public record CreateRequest(String name, String filterJson) {}
  public record Response(Long id, String name, String filterJson, Instant createdAt) {}
}
