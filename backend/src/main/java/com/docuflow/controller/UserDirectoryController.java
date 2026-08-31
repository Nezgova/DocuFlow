package com.docuflow.controller;

import com.docuflow.dto.AuthDtos.*;
import com.docuflow.repository.UserRepository;
import com.docuflow.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Lightweight directory for choosing workflow reviewers. */
@RestController
@RequestMapping("/users")
public class UserDirectoryController {
  private final UserRepository users;
  private final UserManagementService management;
  public UserDirectoryController(UserRepository users, UserManagementService management) { this.users = users; this.management = management; }
  @GetMapping
  public List<UserResponse> list(@AuthenticationPrincipal com.docuflow.entity.User currentUser) {
    return users.findAll().stream().filter(user -> user.isActive() && !user.getId().equals(currentUser.getId()))
      .map(user -> new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole())).toList();
  }
  @PostMapping
  @PreAuthorize("hasRole('ADMINISTRATOR')")
  public UserResponse create(@Valid @RequestBody CreateUserRequest request) { return management.create(request); }
}
