package com.docuflow.service;

import com.docuflow.dto.TagDtos.*;
import com.docuflow.entity.Tag;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.TagRepository;
import com.docuflow.repository.DocumentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class TagService {
  private final TagRepository tags;
  private final DocumentRepository documents;

  public TagService(TagRepository tags, DocumentRepository documents) {
    this.tags = tags;
    this.documents = documents;
  }

  @Transactional(readOnly = true)
  public List<TagResponse> list() {
    return tags.findAllByOrderByNameAsc().stream().map(t -> {
      long count = documents.findAll().stream().filter(d -> d.getTags() != null && d.getTags().stream().anyMatch(dt -> dt.getId().equals(t.getId()))).count();
      return new TagResponse(t.getId(), t.getName(), count, t.getCreatedAt());
    }).toList();
  }

  public TagResponse create(CreateTagRequest req) {
    String normalized = req.name().toLowerCase().trim();
    if (tags.findByNameIgnoreCase(normalized).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "Tag already exists");
    }
    Tag t = tags.save(new Tag(normalized));
    return new TagResponse(t.getId(), t.getName(), 0, t.getCreatedAt());
  }

  public void delete(Long id) {
    Tag t = tags.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Tag not found"));
    tags.delete(t);
  }
}
