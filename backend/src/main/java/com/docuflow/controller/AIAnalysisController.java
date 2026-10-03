package com.docuflow.controller;

import com.docuflow.dto.AIAnalysisDtos.AIAnalysisResponse;
import com.docuflow.entity.User;
import com.docuflow.service.AIAnalysisService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/ai")
public class AIAnalysisController {

    private final AIAnalysisService aiAnalysisService;

    public AIAnalysisController(AIAnalysisService aiAnalysisService) {
        this.aiAnalysisService = aiAnalysisService;
    }

    @PostMapping("/analyze-pdf")
    public ResponseEntity<AIAnalysisResponse> analyzePdf(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user
    ) {
        AIAnalysisResponse response = aiAnalysisService.analyzePdf(file);
        return ResponseEntity.ok(response);
    }
}
