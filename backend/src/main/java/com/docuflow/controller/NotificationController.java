package com.docuflow.controller;

import com.docuflow.dto.NotificationDtos.*;
import com.docuflow.entity.User;
import com.docuflow.service.NotificationService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
  private final NotificationService service;

  public NotificationController(NotificationService service) {
    this.service = service;
  }

  @GetMapping
  public List<NotificationResponse> list(@AuthenticationPrincipal User user) {
    return service.list(user);
  }

  @GetMapping("/unread-count")
  public UnreadCountResponse unreadCount(@AuthenticationPrincipal User user) {
    return service.unreadCount(user);
  }

  @PatchMapping("/{id}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAsRead(@PathVariable Long id, @AuthenticationPrincipal User user) {
    service.markAsRead(id, user);
  }

  @PatchMapping("/read-all")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markAllAsRead(@AuthenticationPrincipal User user) {
    service.markAllAsRead(user);
  }
}
