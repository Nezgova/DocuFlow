package com.docuflow.service;

import com.docuflow.dto.NotificationDtos.*;
import com.docuflow.entity.Notification;
import com.docuflow.entity.User;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.NotificationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class NotificationService {
  private final NotificationRepository repository;

  public NotificationService(NotificationRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<NotificationResponse> list(User user) {
    return repository.findByUserOrderByCreatedAtDesc(user).stream()
        .map(n -> new NotificationResponse(n.getId(), n.getTitle(), n.getMessage(), n.getType(), n.isRead(), n.getCreatedAt()))
        .toList();
  }

  @Transactional(readOnly = true)
  public UnreadCountResponse unreadCount(User user) {
    return new UnreadCountResponse(repository.countByUserAndIsReadFalse(user));
  }

  public void markAsRead(Long id, User user) {
    Notification n = repository.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Notification not found"));
    if (!n.getUser().getId().equals(user.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
    }
    n.markAsRead();
  }

  public void markAllAsRead(User user) {
    List<Notification> unread = repository.findByUserAndIsReadFalseOrderByCreatedAtDesc(user);
    unread.forEach(Notification::markAsRead);
  }

  public void notifyUser(User user, String title, String message, String type) {
    if (user != null) {
      repository.save(new Notification(user, title, message, type));
    }
  }
}
