package com.docuflow.service;

import com.docuflow.dto.SavedFilterDtos.*;
import com.docuflow.entity.*;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.SavedFilterRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SavedFilterService {
  private final SavedFilterRepository repository;

  public SavedFilterService(SavedFilterRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<Response> list(User user) {
    return repository.findByUserOrderByIdDesc(user).stream()
        .map(f -> new Response(f.getId(), f.getName(), f.getFilterJson(), f.getCreatedAt()))
        .collect(Collectors.toList());
  }

  public Response create(CreateRequest req, User user) {
    if (req.name() == null || req.name().isBlank() || req.filterJson() == null || req.filterJson().isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Filter name and filter data are required");
    }
    SavedFilter saved = new SavedFilter(user, req.name().trim(), req.filterJson());
    saved = repository.save(saved);
    return new Response(saved.getId(), saved.getName(), saved.getFilterJson(), saved.getCreatedAt());
  }

  public void delete(Long id, User user) {
    SavedFilter filter = repository.findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Saved filter not found"));
    if (!filter.getUser().getId().equals(user.getId())) {
      throw new ApiException(HttpStatus.FORBIDDEN, "Access denied");
    }
    repository.delete(filter);
  }
}
