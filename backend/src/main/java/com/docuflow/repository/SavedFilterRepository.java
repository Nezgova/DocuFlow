package com.docuflow.repository;

import com.docuflow.entity.SavedFilter;
import com.docuflow.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedFilterRepository extends JpaRepository<SavedFilter, Long> {
  List<SavedFilter> findByUserOrderByIdDesc(User user);
}
