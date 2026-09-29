package com.docuflow.controller;

import com.docuflow.dto.WorkflowTemplateDtos.*;
import com.docuflow.entity.User;
import com.docuflow.service.WorkflowTemplateService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/workflow-templates")
public class WorkflowTemplateController {
  private final WorkflowTemplateService service;

  public WorkflowTemplateController(WorkflowTemplateService service) {
    this.service = service;
  }

  @GetMapping
  public List<WorkflowTemplateResponse> list(@AuthenticationPrincipal User user) {
    return service.list();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public WorkflowTemplateResponse create(@RequestBody @Valid CreateWorkflowTemplateRequest req, @AuthenticationPrincipal User user) {
    return service.create(req);
  }

  @PutMapping("/{id}")
  public WorkflowTemplateResponse update(@PathVariable Long id, @RequestBody @Valid CreateWorkflowTemplateRequest req, @AuthenticationPrincipal User user) {
    return service.update(id, req);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
    service.delete(id);
  }
}
