package com.docuflow.controller;

import com.docuflow.dto.DepartmentDtos.*;
import com.docuflow.service.DepartmentService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/departments")
public class DepartmentController {
  private final DepartmentService service;

  public DepartmentController(DepartmentService service) {
    this.service = service;
  }

  @GetMapping
  public List<DepartmentResponse> list() {
    return service.list();
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  @ResponseStatus(HttpStatus.CREATED)
  public DepartmentResponse create(@Valid @RequestBody CreateDepartmentRequest request) {
    return service.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  public DepartmentResponse update(@PathVariable Long id, @Valid @RequestBody CreateDepartmentRequest request) {
    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
