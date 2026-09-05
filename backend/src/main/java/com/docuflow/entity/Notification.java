package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = {
  @Index(name = "idx_notifications_user_read", columnList = "user_id, is_read"),
  @Index(name = "idx_notifications_created", columnList = "created_at")
})
public class Notification {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false, length = 180)
  private String title;

  @Column(nullable = false, length = 500)
  private String message;

  @Column(nullable = false, length = 50)
  private String type; // e.g. ASSIGNED, APPROVED, REJECTED, SIGNED, COMMENT

  @Column(nullable = false)
  private boolean isRead = false;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Notification() {}

  public Notification(User user, String title, String message, String type) {
    this.user = user;
    this.title = title;
    this.message = message;
    this.type = type;
  }

  public Long getId() { return id; }
  public User getUser() { return user; }
  public String getTitle() { return title; }
  public String getMessage() { return message; }
  public String getType() { return type; }
  public boolean isRead() { return isRead; }
  public Instant getCreatedAt() { return createdAt; }

  public void markAsRead() {
    this.isRead = true;
  }
}
