package com.docuflow.service;

import com.docuflow.dto.AuthDtos.*;
import com.docuflow.entity.Department;
import com.docuflow.entity.User;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.DepartmentRepository;
import com.docuflow.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserManagementService {
  private final UserRepository users;
  private final DepartmentRepository departments;
  private final PasswordEncoder encoder;

  public UserManagementService(UserRepository users, DepartmentRepository departments, PasswordEncoder encoder) {
    this.users = users;
    this.departments = departments;
    this.encoder = encoder;
  }

  public UserResponse create(CreateUserRequest request) {
    if (users.existsByEmailIgnoreCase(request.email())) {
      throw new ApiException(HttpStatus.CONFLICT, "A user with this email already exists");
    }
    Department dept = null;
    if (request.departmentId() != null) {
      dept = departments.findById(request.departmentId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Department not found"));
    } else {
      dept = departments.findAll().stream().findFirst().orElse(null);
    }
    User u = users.save(new User(
      request.fullName().trim(),
      request.email().trim().toLowerCase(),
      encoder.encode(request.password()),
      request.role(),
      dept
    ));
    return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), dept != null ? dept.getId() : null, dept != null ? dept.getName() : null);
  }

  public UserResponse update(Long id, UpdateUserRequest request) {
    User u = users.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    Department dept = null;
    if (request.departmentId() != null) {
      dept = departments.findById(request.departmentId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Department not found"));
    }
    u.update(request.fullName().trim(), request.role(), request.active(), dept);
    users.save(u);
    return new UserResponse(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), dept != null ? dept.getId() : null, dept != null ? dept.getName() : null);
  }
}
