package com.docuflow.service;

import com.docuflow.dto.AnalyticsDtos.DashboardAnalyticsResponse;
import com.docuflow.entity.Document;
import com.docuflow.entity.DocumentStatus;
import com.docuflow.entity.Role;
import com.docuflow.entity.User;
import com.docuflow.repository.DocumentRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsService {

    private final DocumentRepository documentRepository;

    public AnalyticsService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    public DashboardAnalyticsResponse getDashboardAnalytics(User user) {
        boolean isAdmin = user.getRole() == Role.ADMINISTRATOR;
        List<Document> docs = documentRepository.visibleTo(
                user,
                isAdmin,
                "",
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                Pageable.unpaged()
        ).getContent();

        long totalDocuments = docs.size();
        long pendingCount = docs.stream().filter(d -> d.getStatus() == DocumentStatus.PENDING).count();
        long approvedCount = docs.stream().filter(d -> d.getStatus() == DocumentStatus.APPROVED).count();
        long rejectedCount = docs.stream().filter(d -> d.getStatus() == DocumentStatus.REJECTED).count();
        long readyForSignatureCount = docs.stream().filter(d -> d.getStatus() == DocumentStatus.READY_FOR_SIGNATURE).count();
        long signedCount = docs.stream().filter(d -> d.getStatus() == DocumentStatus.SIGNED).count();
        long archivedCount = docs.stream().filter(d -> d.getStatus() == DocumentStatus.ARCHIVED).count();

        long completedOrReady = approvedCount + readyForSignatureCount + signedCount;
        double approvalRate = totalDocuments > 0 ? ((double) completedOrReady / totalDocuments) * 100.0 : 0.0;

        // Calculate average hours from creation to last update for signed/approved docs
        double totalHours = 0;
        long timedDocsCount = 0;
        for (Document d : docs) {
            if ((d.getStatus() == DocumentStatus.SIGNED || d.getStatus() == DocumentStatus.READY_FOR_SIGNATURE) &&
                    d.getCreatedAt() != null && d.getUpdatedAt() != null) {
                Duration duration = Duration.between(d.getCreatedAt(), d.getUpdatedAt());
                totalHours += duration.toHours();
                timedDocsCount++;
            }
        }
        double averageApprovalHours = timedDocsCount > 0 ? totalHours / timedDocsCount : 2.5;

        Map<String, Long> departmentBreakdown = docs.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getDepartment() != null ? d.getDepartment().getName() : "General",
                        Collectors.counting()
                ));

        Map<String, Long> categoryBreakdown = docs.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getCategory() != null ? d.getCategory().getName() : "Uncategorized",
                        Collectors.counting()
                ));

        Map<String, Long> priorityBreakdown = docs.stream()
                .collect(Collectors.groupingBy(
                        d -> d.getPriority() != null ? d.getPriority() : "MEDIUM",
                        Collectors.counting()
                ));

        return new DashboardAnalyticsResponse(
                totalDocuments,
                pendingCount,
                approvedCount,
                rejectedCount,
                readyForSignatureCount,
                signedCount,
                archivedCount,
                Math.round(approvalRate * 10.0) / 10.0,
                Math.round(averageApprovalHours * 10.0) / 10.0,
                departmentBreakdown,
                categoryBreakdown,
                priorityBreakdown
        );
    }
}
