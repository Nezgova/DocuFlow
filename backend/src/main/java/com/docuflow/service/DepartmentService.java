package com.docuflow.service;

import com.docuflow.dto.DepartmentDtos.*;
import com.docuflow.entity.Department;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.DepartmentRepository;
import com.docuflow.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class DepartmentService {
  private final DepartmentRepository departments;
  private final UserRepository users;

  public DepartmentService(DepartmentRepository departments, UserRepository users) {
    this.departments = departments;
    this.users = users;
  }

  @Transactional(readOnly = true)
  public List<DepartmentResponse> list() {
    return departments.findAll().stream().map(d -> {
      long count = users.findAll().stream().filter(u -> u.getDepartment() != null && u.getDepartment().getId().equals(d.getId())).count();
      return new DepartmentResponse(d.getId(), d.getName(), d.getDescription(), count, d.getCreatedAt());
    }).toList();
  }

  public DepartmentResponse create(CreateDepartmentRequest req) {
    if (departments.existsByNameIgnoreCase(req.name().trim())) {
      throw new ApiException(HttpStatus.CONFLICT, "A department with this name already exists");
    }
    Department d = departments.save(new Department(req.name().trim(), req.description()));
    return new DepartmentResponse(d.getId(), d.getName(), d.getDescription(), 0, d.getCreatedAt());
  }

  public DepartmentResponse update(Long id, CreateDepartmentRequest req) {
    Department d = departments.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found"));
    if (!d.getName().equalsIgnoreCase(req.name().trim()) && departments.existsByNameIgnoreCase(req.name().trim())) {
      throw new ApiException(HttpStatus.CONFLICT, "A department with this name already exists");
    }
    d.update(req.name().trim(), req.description());
    long count = users.findAll().stream().filter(u -> u.getDepartment() != null && u.getDepartment().getId().equals(d.getId())).count();
    return new DepartmentResponse(d.getId(), d.getName(), d.getDescription(), count, d.getCreatedAt());
  }

  public void delete(Long id) {
    Department d = departments.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Department not found"));
    long count = users.findAll().stream().filter(u -> u.getDepartment() != null && u.getDepartment().getId().equals(d.getId())).count();
    if (count > 0) {
      throw new ApiException(HttpStatus.CONFLICT, "Cannot delete department with active assigned users");
    }
    departments.delete(d);
  }
}
