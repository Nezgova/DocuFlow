package com.docuflow.repository;

import com.docuflow.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

public interface DocumentRepository extends JpaRepository<Document,Long> {
  @Query("select distinct d from Document d left join d.approvals a left join d.tags t where lower(d.title) like lower(concat('%',:q,'%')) and (:admin=true or d.owner=:user or a.reviewer=:user) and (:departmentId is null or d.department.id = :departmentId) and (:categoryId is null or d.category.id = :categoryId) and (:tagId is null or t.id = :tagId)")
  Page<Document> visibleTo(@Param("user") User user, @Param("admin") boolean admin, @Param("q") String q, @Param("departmentId") Long departmentId, @Param("categoryId") Long categoryId, @Param("tagId") Long tagId, Pageable pageable);

  long countByOwner(User owner);
}
