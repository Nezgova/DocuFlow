package com.docuflow.dto;

import java.util.Map;

public final class AnalyticsDtos {
  private AnalyticsDtos() {}

  public record DashboardAnalyticsResponse(
      long totalDocuments,
      long pendingDocuments,
      long signedToday,
      long readyForSignature,
      double approvalRate,
      double averageApprovalHours,
      Map<String, Long> statusCounts,
      Map<String, Long> categoryCounts,
      Map<String, Long> departmentCounts
  ) {}
}
