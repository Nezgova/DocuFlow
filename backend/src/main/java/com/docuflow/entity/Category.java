package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "categories", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Category {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 100)
  private String name;

  @Column(length = 500)
  private String description;

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected Category() {}

  public Category(String name, String description) {
    this.name = name;
    this.description = description;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getDescription() { return description; }
  public Instant getCreatedAt() { return createdAt; }

  public void update(String name, String description) {
    this.name = name;
    this.description = description;
  }
}
