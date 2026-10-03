package com.docuflow.controller;

import com.docuflow.dto.AnalyticsDtos.DashboardAnalyticsResponse;
import com.docuflow.entity.User;
import com.docuflow.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardAnalyticsResponse> getDashboardAnalytics(@AuthenticationPrincipal User user) {
        DashboardAnalyticsResponse analytics = analyticsService.getDashboardAnalytics(user);
        return ResponseEntity.ok(analytics);
    }
}
