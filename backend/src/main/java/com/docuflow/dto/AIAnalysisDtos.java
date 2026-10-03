package com.docuflow.dto;

import java.util.List;

public class AIAnalysisDtos {
    public record AIAnalysisResponse(
        String title,
        String description,
        String category,
        String department,
        List<String> tags,
        String priority
    ) {}
}
