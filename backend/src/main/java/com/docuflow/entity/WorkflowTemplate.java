package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "workflow_templates")
public class WorkflowTemplate {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 150)
  private String name;

  @Column(length = 500)
  private String description;

  @OneToMany(mappedBy = "workflowTemplate", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<WorkflowTemplateStep> steps = new ArrayList<>();

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();

  protected WorkflowTemplate() {}

  public WorkflowTemplate(String name, String description) {
    this.name = name;
    this.description = description;
  }

  public void update(String name, String description) {
    this.name = name;
    this.description = description;
  }

  public Long getId() { return id; }
  public String getName() { return name; }
  public String getDescription() { return description; }
  public List<WorkflowTemplateStep> getSteps() { return steps; }
  public Instant getCreatedAt() { return createdAt; }
}
