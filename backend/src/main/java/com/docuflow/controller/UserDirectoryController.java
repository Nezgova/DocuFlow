package com.docuflow.controller;

import com.docuflow.dto.AuthDtos.*;
import com.docuflow.repository.UserRepository;
import com.docuflow.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

/** Lightweight directory for choosing workflow reviewers. */
@RestController
@RequestMapping("/users")
@Transactional
public class UserDirectoryController {
  private final UserRepository users;
  private final UserManagementService management;
  public UserDirectoryController(UserRepository users, UserManagementService management) { this.users = users; this.management = management; }
  @GetMapping
  public List<UserResponse> list(@AuthenticationPrincipal com.docuflow.entity.User currentUser) {
    return users.findAll().stream().filter(user -> user.isActive() && !user.getId().equals(currentUser.getId()))
      .map(user -> new UserResponse(
        user.getId(),
        user.getFullName(),
        user.getEmail(),
        user.getRole(),
        user.getDepartment() != null ? user.getDepartment().getId() : null,
        user.getDepartment() != null ? user.getDepartment().getName() : null
      )).toList();
  }
  @PostMapping
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  public UserResponse create(@Valid @RequestBody CreateUserRequest request) { return management.create(request); }

  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  public UserResponse update(@PathVariable Long id, @Valid @RequestBody UpdateUserRequest request) { return management.update(id, request); }
}
