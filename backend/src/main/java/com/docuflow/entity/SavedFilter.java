package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "saved_filters")
public class SavedFilter {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  private User user;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(name = "filter_json", nullable = false, length = 2000)
  private String filterJson;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected SavedFilter() {}

  public SavedFilter(User user, String name, String filterJson) {
    this.user = user;
    this.name = name;
    this.filterJson = filterJson;
  }

  public Long getId() { return id; }
  public User getUser() { return user; }
  public String getName() { return name; }
  public String getFilterJson() { return filterJson; }
  public Instant getCreatedAt() { return createdAt; }

  public void setName(String name) { this.name = name; }
  public void setFilterJson(String filterJson) { this.filterJson = filterJson; }
}
