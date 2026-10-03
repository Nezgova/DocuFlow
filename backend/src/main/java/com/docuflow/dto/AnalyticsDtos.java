package com.docuflow.dto;

import java.util.Map;

public class AnalyticsDtos {
    public record DashboardAnalyticsResponse(
        long totalDocuments,
        long pendingCount,
        long approvedCount,
        long rejectedCount,
        long readyForSignatureCount,
        long signedCount,
        long archivedCount,
        double approvalRate,
        double averageApprovalHours,
        Map<String, Long> departmentBreakdown,
        Map<String, Long> categoryBreakdown,
        Map<String, Long> priorityBreakdown
    ) {}
}
