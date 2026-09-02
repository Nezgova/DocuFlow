package com.docuflow.controller;

import com.docuflow.dto.CategoryDtos.*;
import com.docuflow.service.CategoryService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
public class CategoryController {
  private final CategoryService service;

  public CategoryController(CategoryService service) {
    this.service = service;
  }

  @GetMapping
  public List<CategoryResponse> list() {
    return service.list();
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  @ResponseStatus(HttpStatus.CREATED)
  public CategoryResponse create(@Valid @RequestBody CreateCategoryRequest request) {
    return service.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  public CategoryResponse update(@PathVariable Long id, @Valid @RequestBody CreateCategoryRequest request) {
    return service.update(id, request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
