package com.docuflow.repository;

import com.docuflow.entity.Notification;
import com.docuflow.entity.User;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  List<Notification> findByUserOrderByCreatedAtDesc(User user);
  List<Notification> findByUserAndIsReadFalseOrderByCreatedAtDesc(User user);
  long countByUserAndIsReadFalse(User user);
}
