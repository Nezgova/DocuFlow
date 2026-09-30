package com.docuflow.repository;

import com.docuflow.entity.Approval;
import com.docuflow.entity.ApprovalDecision;
import com.docuflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApprovalRepository extends JpaRepository<Approval, Long> {
    long countByReviewerAndDecision(User reviewer, ApprovalDecision decision);
}
