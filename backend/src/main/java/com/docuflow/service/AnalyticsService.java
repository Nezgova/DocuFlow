package com.docuflow.service;

import com.docuflow.dto.AnalyticsDtos.*;
import com.docuflow.entity.*;
import com.docuflow.repository.*;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {
  private final DocumentRepository documentRepository;
  private final ApprovalRepository approvalRepository;

  public AnalyticsService(DocumentRepository documentRepository, ApprovalRepository approvalRepository) {
    this.documentRepository = documentRepository;
    this.approvalRepository = approvalRepository;
  }

  public DashboardAnalyticsResponse getDashboardAnalytics(User user) {
    boolean isAdmin = user.getRole() == Role.ADMINISTRATOR || user.getRole() == Role.MANAGER;
    List<Document> allVisible = documentRepository.visibleTo(user, isAdmin, "", null, null, null, null, null, null, null, null, null, Pageable.unpaged()).getContent();

    long totalDocuments = allVisible.size();
    long pendingDocuments = allVisible.stream().filter(d -> d.getStatus() == DocumentStatus.PENDING).count();
    long readyForSignature = allVisible.stream().filter(d -> d.getStatus() == DocumentStatus.READY_FOR_SIGNATURE).count();

    Instant startOfToday = LocalDate.now().atStartOfDay(ZoneId.systemDefault()).toInstant();
    
    long signedToday = allVisible.stream()
        .filter(d -> d.getStatus() == DocumentStatus.SIGNED && d.getUpdatedAt() != null && d.getUpdatedAt().isAfter(startOfToday))
        .count();

    Map<String, Long> statusCounts = allVisible.stream()
        .collect(Collectors.groupingBy(d -> d.getStatus().name(), Collectors.counting()));

    Map<String, Long> categoryCounts = allVisible.stream()
        .filter(d -> d.getCategory() != null)
        .collect(Collectors.groupingBy(d -> d.getCategory().getName(), Collectors.counting()));

    Map<String, Long> departmentCounts = allVisible.stream()
        .filter(d -> d.getDepartment() != null)
        .collect(Collectors.groupingBy(d -> d.getDepartment().getName(), Collectors.counting()));

    Set<Long> visibleDocIds = allVisible.stream().map(Document::getId).collect(Collectors.toSet());
    List<Approval> approvals = approvalRepository.findAll().stream()
        .filter(a -> a.getDocument() != null && visibleDocIds.contains(a.getDocument().getId()))
        .collect(Collectors.toList());

    long totalDecided = approvals.stream().filter(a -> a.getDecision() == ApprovalDecision.APPROVED || a.getDecision() == ApprovalDecision.REJECTED).count();
    long totalApproved = approvals.stream().filter(a -> a.getDecision() == ApprovalDecision.APPROVED).count();
    double approvalRate = totalDecided > 0 ? (double) totalApproved / totalDecided * 100.0 : 0.0;

    double totalHours = 0.0;
    long timedApprovals = 0;
    for (Approval a : approvals) {
      if (a.getDecision() != ApprovalDecision.PENDING && a.getDecidedAt() != null && a.getDocument() != null && a.getDocument().getCreatedAt() != null) {
        long minutes = Duration.between(a.getDocument().getCreatedAt(), a.getDecidedAt()).toMinutes();
        totalHours += minutes / 60.0;
        timedApprovals++;
      }
    }
    double averageApprovalHours = timedApprovals > 0 ? totalHours / timedApprovals : 0.0;

    return new DashboardAnalyticsResponse(
        totalDocuments,
        pendingDocuments,
        signedToday,
        readyForSignature,
        Math.round(approvalRate * 10.0) / 10.0,
        Math.round(averageApprovalHours * 10.0) / 10.0,
        statusCounts,
        categoryCounts,
        departmentCounts
    );
  }
}
