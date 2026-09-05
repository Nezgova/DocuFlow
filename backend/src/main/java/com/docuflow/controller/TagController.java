package com.docuflow.controller;

import com.docuflow.dto.TagDtos.*;
import com.docuflow.service.TagService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tags")
public class TagController {
  private final TagService service;

  public TagController(TagService service) {
    this.service = service;
  }

  @GetMapping
  public List<TagResponse> list() {
    return service.list();
  }

  @PostMapping
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  @ResponseStatus(HttpStatus.CREATED)
  public TagResponse create(@Valid @RequestBody CreateTagRequest request) {
    return service.create(request);
  }

  @DeleteMapping("/{id}")
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }
}
