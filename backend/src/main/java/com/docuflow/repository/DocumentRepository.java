package com.docuflow.repository;

import com.docuflow.entity.*;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.Instant;

public interface DocumentRepository extends JpaRepository<Document,Long> {
  @Query("select distinct d from Document d left join d.approvals a left join d.tags t where lower(d.title) like lower(concat('%',:q,'%')) " +
         "and (:admin=true or d.owner=:user or a.reviewer=:user) " +
         "and (:departmentId is null or d.department.id = :departmentId) " +
         "and (:categoryId is null or d.category.id = :categoryId) " +
         "and (:tagId is null or t.id = :tagId) " +
         "and (:status is null or d.status = :status) " +
         "and (:priority is null or d.priority = :priority) " +
         "and (:uploaderId is null or d.owner.id = :uploaderId) " +
         "and (:reviewerId is null or a.reviewer.id = :reviewerId) " +
         "and (:startDate is null or d.createdAt >= :startDate) " +
         "and (:endDate is null or d.createdAt <= :endDate)")
  Page<Document> visibleTo(
      @Param("user") User user, 
      @Param("admin") boolean admin, 
      @Param("q") String q, 
      @Param("departmentId") Long departmentId, 
      @Param("categoryId") Long categoryId, 
      @Param("tagId") Long tagId, 
      @Param("status") DocumentStatus status,
      @Param("priority") String priority,
      @Param("uploaderId") Long uploaderId,
      @Param("reviewerId") Long reviewerId,
      @Param("startDate") Instant startDate,
      @Param("endDate") Instant endDate,
      Pageable pageable
  );

  long countByOwner(User owner);
}
