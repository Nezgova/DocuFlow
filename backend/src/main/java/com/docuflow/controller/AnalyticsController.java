package com.docuflow.controller;

import com.docuflow.dto.AnalyticsDtos.*;
import com.docuflow.entity.User;
import com.docuflow.service.AnalyticsService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {
  private final AnalyticsService service;

  public AnalyticsController(AnalyticsService service) {
    this.service = service;
  }

  @GetMapping("/dashboard")
  public DashboardAnalyticsResponse getDashboardAnalytics(@AuthenticationPrincipal User user) {
    return service.getDashboardAnalytics(user);
  }
}
