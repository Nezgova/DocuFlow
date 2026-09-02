package com.docuflow.service;

import com.docuflow.dto.CategoryDtos.*;
import com.docuflow.entity.Category;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.CategoryRepository;
import com.docuflow.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class CategoryService {
  private final CategoryRepository categories;
  private final DocumentRepository documents;

  public CategoryService(CategoryRepository categories, DocumentRepository documents) {
    this.categories = categories;
    this.documents = documents;
  }

  @Transactional(readOnly = true)
  public List<CategoryResponse> list() {
    return categories.findAll().stream().map(c -> {
      long count = documents.findAll().stream().filter(d -> d.getCategory() != null && d.getCategory().getId().equals(c.getId())).count();
      return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), count, c.getCreatedAt());
    }).toList();
  }

  public CategoryResponse create(CreateCategoryRequest req) {
    if (categories.existsByNameIgnoreCase(req.name().trim())) {
      throw new ApiException(HttpStatus.CONFLICT, "A category with this name already exists");
    }
    Category c = categories.save(new Category(req.name().trim(), req.description()));
    return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), 0, c.getCreatedAt());
  }

  public CategoryResponse update(Long id, CreateCategoryRequest req) {
    Category c = categories.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
    if (!c.getName().equalsIgnoreCase(req.name().trim()) && categories.existsByNameIgnoreCase(req.name().trim())) {
      throw new ApiException(HttpStatus.CONFLICT, "A category with this name already exists");
    }
    c.update(req.name().trim(), req.description());
    long count = documents.findAll().stream().filter(d -> d.getCategory() != null && d.getCategory().getId().equals(c.getId())).count();
    return new CategoryResponse(c.getId(), c.getName(), c.getDescription(), count, c.getCreatedAt());
  }

  public void delete(Long id) {
    Category c = categories.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Category not found"));
    long count = documents.findAll().stream().filter(d -> d.getCategory() != null && d.getCategory().getId().equals(c.getId())).count();
    if (count > 0) {
      throw new ApiException(HttpStatus.CONFLICT, "Cannot delete category with active assigned documents");
    }
    categories.delete(c);
  }
}
