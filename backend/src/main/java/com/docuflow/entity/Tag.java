package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "tags", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Tag {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Tag() {}

  public Tag(String name) {
    this.name = name.toLowerCase().trim();
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public Instant getCreatedAt() { return createdAt; }

  public void setName(String name) {
    this.name = name.toLowerCase().trim();
  }
}
