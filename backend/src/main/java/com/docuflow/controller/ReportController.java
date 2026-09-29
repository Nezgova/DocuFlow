package com.docuflow.controller;

import com.docuflow.entity.User;
import com.docuflow.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/documents/csv")
    public ResponseEntity<byte[]> exportDocumentsCsv(@AuthenticationPrincipal User user) {
        byte[] data = reportService.generateDocumentsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"documents-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping("/documents/pdf")
    public ResponseEntity<byte[]> exportDocumentsPdf(@AuthenticationPrincipal User user) throws IOException {
        byte[] data = reportService.generateDocumentsPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"documents-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }

    @GetMapping("/activity/csv")
    public ResponseEntity<byte[]> exportActivityCsv(@AuthenticationPrincipal User user) {
        byte[] data = reportService.generateActivityCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"activity-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(data);
    }

    @GetMapping("/activity/pdf")
    public ResponseEntity<byte[]> exportActivityPdf(@AuthenticationPrincipal User user) throws IOException {
        byte[] data = reportService.generateActivityPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"activity-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
