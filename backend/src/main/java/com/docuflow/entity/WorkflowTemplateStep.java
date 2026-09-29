package com.docuflow.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "workflow_template_steps")
public class WorkflowTemplateStep {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  private WorkflowTemplate workflowTemplate;

  @ManyToOne(optional = false)
  private User reviewer;

  @Column(nullable = false)
  private Integer stepOrder;

  protected WorkflowTemplateStep() {}

  public WorkflowTemplateStep(WorkflowTemplate workflowTemplate, User reviewer, Integer stepOrder) {
    this.workflowTemplate = workflowTemplate;
    this.reviewer = reviewer;
    this.stepOrder = stepOrder;
  }

  public Long getId() { return id; }
  public WorkflowTemplate getWorkflowTemplate() { return workflowTemplate; }
  public User getReviewer() { return reviewer; }
  public Integer getStepOrder() { return stepOrder; }
}
