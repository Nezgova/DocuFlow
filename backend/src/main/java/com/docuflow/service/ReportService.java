package com.docuflow.service;

import com.docuflow.entity.ActivityLog;
import com.docuflow.entity.Document;
import com.docuflow.repository.ActivityLogRepository;
import com.docuflow.repository.DocumentRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class ReportService {

    private final DocumentRepository documentRepository;
    private final ActivityLogRepository activityLogRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss")
            .withZone(ZoneId.of("UTC"));

    public ReportService(DocumentRepository documentRepository, ActivityLogRepository activityLogRepository) {
        this.documentRepository = documentRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public byte[] generateDocumentsCsv() {
        List<Document> documents = documentRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Title,Category,Department,Status,Priority,Uploader,Created Date\n");

        for (Document doc : documents) {
            sb.append(doc.getId()).append(",");
            sb.append("\"").append(escapeCsv(doc.getTitle())).append("\",");
            sb.append("\"").append(doc.getCategory() != null ? escapeCsv(doc.getCategory().getName()) : "Uncategorized").append("\",");
            sb.append("\"").append(doc.getDepartment() != null ? escapeCsv(doc.getDepartment().getName()) : "General").append("\",");
            sb.append(doc.getStatus()).append(",");
            sb.append(doc.getPriority() != null ? doc.getPriority() : "MEDIUM").append(",");
            sb.append("\"").append(doc.getOwner() != null ? escapeCsv(doc.getOwner().getFullName()) : "Unknown").append("\",");
            sb.append(doc.getCreatedAt() != null ? DATE_FORMATTER.format(doc.getCreatedAt()) : "").append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] generateActivityCsv() {
        List<ActivityLog> logs = activityLogRepository.findAll();
        StringBuilder sb = new StringBuilder();
        sb.append("ID,Action,Document,Detail,Actor Email,Timestamp\n");

        for (ActivityLog log : logs) {
            sb.append(log.getId()).append(",");
            sb.append("\"").append(escapeCsv(log.getAction())).append("\",");
            sb.append("\"").append(escapeCsv(log.getDocument() != null ? log.getDocument().getTitle() : "")).append("\",");
            sb.append("\"").append(escapeCsv(log.getDetail() != null ? log.getDetail() : "")).append("\",");
            sb.append("\"").append(log.getActor() != null ? escapeCsv(log.getActor().getEmail()) : "System").append("\",");
            sb.append(log.getCreatedAt() != null ? DATE_FORMATTER.format(log.getCreatedAt()) : "").append("\n");
        }
        return sb.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] generateDocumentsPdf() throws IOException {
        List<Document> documents = documentRepository.findAll();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDFont fontBold = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont fontRegular = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                float width = PDRectangle.A4.getWidth();
                float height = PDRectangle.A4.getHeight();
                float margin = 40;

                // Header Banner
                cs.setNonStrokingColor(new Color(30, 91, 73));
                cs.addRect(0, height - 70, width, 70);
                cs.fill();

                cs.setNonStrokingColor(Color.WHITE);
                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.newLineAtOffset(margin, height - 35);
                cs.showText("DocuFlow Document Summary Report");
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, height - 52);
                cs.showText("Generated on: " + DATE_FORMATTER.format(java.time.Instant.now()) + " UTC | Total Documents: " + documents.size());
                cs.endText();

                float currentY = height - 95;
                // Table header
                cs.setNonStrokingColor(new Color(223, 245, 238));
                cs.addRect(margin, currentY - 18, width - (2 * margin), 18);
                cs.fill();

                cs.setNonStrokingColor(new Color(30, 91, 73));
                drawText(cs, fontBold, 9, margin + 5, currentY - 13, "ID");
                drawText(cs, fontBold, 9, margin + 45, currentY - 13, "Title");
                drawText(cs, fontBold, 9, margin + 250, currentY - 13, "Category");
                drawText(cs, fontBold, 9, margin + 350, currentY - 13, "Status");
                drawText(cs, fontBold, 9, margin + 430, currentY - 13, "Date");

                currentY -= 22;

                for (Document doc : documents) {
                    if (currentY < 50) {
                        break;
                    }
                    cs.setNonStrokingColor(new Color(16, 35, 31));
                    drawText(cs, fontRegular, 8, margin + 5, currentY, "#" + doc.getId());
                    drawText(cs, fontRegular, 8, margin + 45, currentY, truncate(doc.getTitle(), 40));
                    drawText(cs, fontRegular, 8, margin + 250, currentY, truncate(doc.getCategory() != null ? doc.getCategory().getName() : "None", 20));
                    drawText(cs, fontRegular, 8, margin + 350, currentY, doc.getStatus().name());
                    drawText(cs, fontRegular, 8, margin + 430, currentY, doc.getCreatedAt() != null ? doc.getCreatedAt().toString().substring(0, 10) : "");

                    currentY -= 16;
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public byte[] generateActivityPdf() throws IOException {
        List<ActivityLog> logs = activityLogRepository.findAll();
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            PDFont fontBold = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDFont fontRegular = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                float width = PDRectangle.A4.getWidth();
                float height = PDRectangle.A4.getHeight();
                float margin = 40;

                // Header Banner
                cs.setNonStrokingColor(new Color(30, 91, 73));
                cs.addRect(0, height - 70, width, 70);
                cs.fill();

                cs.setNonStrokingColor(Color.WHITE);
                cs.beginText();
                cs.setFont(fontBold, 18);
                cs.newLineAtOffset(margin, height - 35);
                cs.showText("DocuFlow Activity Audit Report");
                cs.endText();

                cs.beginText();
                cs.setFont(fontRegular, 10);
                cs.newLineAtOffset(margin, height - 52);
                cs.showText("Generated on: " + DATE_FORMATTER.format(java.time.Instant.now()) + " UTC | Total Logs: " + logs.size());
                cs.endText();

                float currentY = height - 95;
                // Table header
                cs.setNonStrokingColor(new Color(223, 245, 238));
                cs.addRect(margin, currentY - 18, width - (2 * margin), 18);
                cs.fill();

                cs.setNonStrokingColor(new Color(30, 91, 73));
                drawText(cs, fontBold, 9, margin + 5, currentY - 13, "Action");
                drawText(cs, fontBold, 9, margin + 150, currentY - 13, "Document");
                drawText(cs, fontBold, 9, margin + 300, currentY - 13, "Actor");
                drawText(cs, fontBold, 9, margin + 430, currentY - 13, "Timestamp");

                currentY -= 22;

                int count = 0;
                for (ActivityLog log : logs) {
                    if (currentY < 50 || count > 35) {
                        break;
                    }
                    cs.setNonStrokingColor(new Color(16, 35, 31));
                    drawText(cs, fontRegular, 8, margin + 5, currentY, truncate(log.getAction(), 25));
                    drawText(cs, fontRegular, 8, margin + 150, currentY, truncate(log.getDocument() != null ? log.getDocument().getTitle() : "N/A", 25));
                    drawText(cs, fontRegular, 8, margin + 300, currentY, truncate(log.getActor() != null ? log.getActor().getEmail() : "System", 20));
                    drawText(cs, fontRegular, 8, margin + 430, currentY, log.getCreatedAt() != null ? log.getCreatedAt().toString().substring(0, 16) : "");

                    currentY -= 16;
                    count++;
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }

    private String truncate(String val, int maxLen) {
        if (val == null) return "";
        if (val.length() <= maxLen) return val;
        return val.substring(0, maxLen - 3) + "...";
    }

    private static void drawText(PDPageContentStream cs, PDFont font, float fontSize, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, fontSize);
        cs.newLineAtOffset(x, y);
        cs.showText(text != null ? text : "");
        cs.endText();
    }
}
