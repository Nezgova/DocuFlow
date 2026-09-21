package com.docuflow.repository;

import com.docuflow.entity.Approval;
import com.docuflow.entity.ApprovalDecision;
import com.docuflow.entity.User;
import java.time.Instant;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
  List<Approval> findByReviewer(User reviewer);
  List<Approval> findByDocumentId(Long documentId);
  long countByDecision(ApprovalDecision decision);
  long countByReviewerAndDecision(User reviewer, ApprovalDecision decision);
  
  @Query("select count(a) from Approval a where a.decision = :decision and a.decidedAt >= :since")
  long countByDecisionAndDecidedAtAfter(@Param("decision") ApprovalDecision decision, @Param("since") Instant since);
  
  @Query("select count(a) from Approval a where a.reviewer = :reviewer and a.decision = :decision and a.decidedAt >= :since")
  long countByReviewerAndDecisionAndDecidedAtAfter(@Param("reviewer") User reviewer, @Param("decision") ApprovalDecision decision, @Param("since") Instant since);
}
