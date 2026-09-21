package com.docuflow.controller;

import com.docuflow.dto.SavedFilterDtos.*;
import com.docuflow.entity.User;
import com.docuflow.service.SavedFilterService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/saved-filters")
public class SavedFilterController {
  private final SavedFilterService service;

  public SavedFilterController(SavedFilterService service) {
    this.service = service;
  }

  @GetMapping
  public List<Response> list(@AuthenticationPrincipal User user) {
    return service.list(user);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public Response create(@RequestBody CreateRequest req, @AuthenticationPrincipal User user) {
    return service.create(req, user);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
    service.delete(id, user);
  }
}
