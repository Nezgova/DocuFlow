package com.docuflow.repository;

import com.docuflow.entity.ActivityLog;
import com.docuflow.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    List<ActivityLog> findTop20ByDocumentIdOrderByCreatedAtDesc(Long documentId);
    List<ActivityLog> findTop20ByActorOrderByCreatedAtDesc(User actor);
}
