package com.docuflow.service;

import com.docuflow.dto.WorkflowTemplateDtos.*;
import com.docuflow.entity.WorkflowTemplate;
import com.docuflow.entity.WorkflowTemplateStep;
import com.docuflow.entity.User;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.WorkflowTemplateRepository;
import com.docuflow.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class WorkflowTemplateService {
  private final WorkflowTemplateRepository templates;
  private final UserRepository users;

  public WorkflowTemplateService(WorkflowTemplateRepository templates, UserRepository users) {
    this.templates = templates;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<WorkflowTemplateResponse> list() {
    return templates.findAll().stream().map(this::map).toList();
  }

  public WorkflowTemplateResponse create(CreateWorkflowTemplateRequest req) {
    if (templates.existsByNameIgnoreCase(req.name().trim())) {
      throw new ApiException(HttpStatus.CONFLICT, "A workflow template with this name already exists");
    }
    WorkflowTemplate t = templates.save(new WorkflowTemplate(req.name().trim(), req.description()));
    int order = 1;
    for (Long userId : req.reviewerIds()) {
      User u = users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reviewer user not found: " + userId));
      t.getSteps().add(new WorkflowTemplateStep(t, u, order++));
    }
    templates.save(t);
    return map(t);
  }

  public WorkflowTemplateResponse update(Long id, CreateWorkflowTemplateRequest req) {
    WorkflowTemplate t = templates.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Workflow template not found"));
    if (!t.getName().equalsIgnoreCase(req.name().trim()) && templates.existsByNameIgnoreCase(req.name().trim())) {
      throw new ApiException(HttpStatus.CONFLICT, "A workflow template with this name already exists");
    }
    t.update(req.name().trim(), req.description());
    t.getSteps().clear();
    int order = 1;
    for (Long userId : req.reviewerIds()) {
      User u = users.findById(userId).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reviewer user not found: " + userId));
      t.getSteps().add(new WorkflowTemplateStep(t, u, order++));
    }
    templates.save(t);
    return map(t);
  }

  public void delete(Long id) {
    WorkflowTemplate t = templates.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Workflow template not found"));
    templates.delete(t);
  }

  private WorkflowTemplateResponse map(WorkflowTemplate t) {
    List<TemplateStepResponse> steps = t.getSteps().stream()
      .map(s -> new TemplateStepResponse(s.getReviewer().getId(), s.getReviewer().getFullName(), s.getStepOrder()))
      .toList();
    return new WorkflowTemplateResponse(t.getId(), t.getName(), t.getDescription(), steps, t.getCreatedAt());
  }
}
