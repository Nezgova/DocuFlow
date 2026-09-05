package com.docuflow.dto;

import java.time.Instant;

public final class NotificationDtos {
  private NotificationDtos() {}
  public record NotificationResponse(Long id, String title, String message, String type, boolean isRead, Instant createdAt) {}
  public record UnreadCountResponse(long count) {}
}
