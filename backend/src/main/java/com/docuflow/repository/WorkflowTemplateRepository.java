package com.docuflow.repository;

import com.docuflow.entity.WorkflowTemplate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WorkflowTemplateRepository extends JpaRepository<WorkflowTemplate, Long> {
  boolean existsByNameIgnoreCase(String name);
  Optional<WorkflowTemplate> findByNameIgnoreCase(String name);

  @Override
  @EntityGraph(attributePaths = {"steps", "steps.reviewer"})
  List<WorkflowTemplate> findAll();
}
