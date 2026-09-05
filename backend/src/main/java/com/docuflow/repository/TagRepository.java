package com.docuflow.repository;

import com.docuflow.entity.Tag;
import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TagRepository extends JpaRepository<Tag, Long> {
  Optional<Tag> findByNameIgnoreCase(String name);
  List<Tag> findAllByOrderByNameAsc();
}
