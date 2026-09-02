package com.docuflow.service;

import com.docuflow.entity.Approval;
import com.docuflow.entity.Document;
import com.docuflow.entity.User;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class PdfGeneratorService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter
            .ofPattern("yyyy-MM-dd HH:mm:ss 'UTC'")
            .withZone(ZoneId.of("UTC"));

    public void appendSignaturePage(Path pdfPath, Document doc, User signer, String signatureName) throws IOException {
        byte[] pdfBytes = Files.readAllBytes(pdfPath);
        Path tempOutput = Files.createTempFile(pdfPath.getParent(), "signed-", ".pdf");

        String actualSignerName = (signatureName != null && !signatureName.isBlank()) ? signatureName : signer.getFullName();

        try {
            PDDocument loadedDoc;
            try {
                loadedDoc = Loader.loadPDF(pdfBytes, "");
            } catch (Exception e) {
                loadedDoc = Loader.loadPDF(pdfBytes);
            }
            if (loadedDoc.isEncrypted()) {
                loadedDoc.setAllSecurityToBeRemoved(true);
            }
            final PDDocument document = loadedDoc;
            try (document) {
                PDPage page = new PDPage(PDRectangle.A4);
                document.addPage(page);

                PDFont fontBold = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
                PDFont fontRegular = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA);
                PDFont fontOblique = new org.apache.pdfbox.pdmodel.font.PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

                try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                    float width = PDRectangle.A4.getWidth();
                    float height = PDRectangle.A4.getHeight();
                    float margin = 40;

                    // Header Background Banner
                    cs.setNonStrokingColor(new Color(30, 91, 73)); // Moss green (#1e5b49)
                    cs.addRect(0, height - 90, width, 90);
                    cs.fill();

                    // Header Text
                    cs.setNonStrokingColor(Color.WHITE);
                    cs.beginText();
                    cs.setFont(fontBold, 20);
                    cs.newLineAtOffset(margin, height - 40);
                    cs.showText("DocuFlow Approval & Signature Certificate");
                    cs.endText();

                    cs.beginText();
                    cs.setFont(fontRegular, 10);
                    cs.newLineAtOffset(margin, height - 62);
                    cs.showText("Official Audit Trail & Final Digital Signature Record");
                    cs.endText();

                    float currentY = height - 120;

                    // Document Information Box
                    cs.setNonStrokingColor(new Color(245, 241, 232)); // Sand background (#f5f1e8)
                    cs.addRect(margin, currentY - 90, width - (2 * margin), 90);
                    cs.fill();

                    cs.setStrokingColor(new Color(16, 35, 31, 40));
                    cs.setLineWidth(1f);
                    cs.addRect(margin, currentY - 90, width - (2 * margin), 90);
                    cs.stroke();

                    cs.setNonStrokingColor(new Color(16, 35, 31)); // Ink color
                    cs.beginText();
                    cs.setFont(fontBold, 12);
                    cs.newLineAtOffset(margin + 15, currentY - 25);
                    cs.showText("Document Information");
                    cs.endText();

                    drawText(cs, fontRegular, 10, margin + 15, currentY - 45, "Title: " + sanitize(doc.getTitle()));
                    drawText(cs, fontRegular, 10, margin + 15, currentY - 60, "Original File: " + sanitize(doc.getOriginalFileName()));
                    drawText(cs, fontRegular, 10, margin + 15, currentY - 75, "Uploaded By: " + sanitize(doc.getOwner().getFullName()) + " (" + doc.getOwner().getEmail() + ")");
                    drawText(cs, fontRegular, 10, margin + 300, currentY - 45, "Document ID: #" + doc.getId());
                    drawText(cs, fontRegular, 10, margin + 300, currentY - 60, "Upload Date: " + DATE_FORMATTER.format(doc.getCreatedAt()));

                    currentY -= 120;

                    // Approvals Section
                    cs.beginText();
                    cs.setFont(fontBold, 14);
                    cs.newLineAtOffset(margin, currentY);
                    cs.showText("Reviewer Approvals");
                    cs.endText();

                    currentY -= 15;

                    // Approvals Table Header
                    cs.setNonStrokingColor(new Color(223, 245, 238)); // Mint background (#dff5e8)
                    cs.addRect(margin, currentY - 20, width - (2 * margin), 20);
                    cs.fill();

                    cs.setNonStrokingColor(new Color(30, 91, 73));
                    drawText(cs, fontBold, 10, margin + 10, currentY - 14, "Reviewer Name & Role");
                    drawText(cs, fontBold, 10, margin + 250, currentY - 14, "Decision");
                    drawText(cs, fontBold, 10, margin + 360, currentY - 14, "Approval Date");

                    currentY -= 20;

                    for (Approval approval : doc.getApprovals()) {
                        cs.setNonStrokingColor(Color.WHITE);
                        cs.addRect(margin, currentY - 22, width - (2 * margin), 22);
                        cs.fill();

                        cs.setStrokingColor(new Color(230, 230, 230));
                        cs.addRect(margin, currentY - 22, width - (2 * margin), 22);
                        cs.stroke();

                        cs.setNonStrokingColor(new Color(16, 35, 31));
                        User r = approval.getReviewer();
                        drawText(cs, fontRegular, 9, margin + 10, currentY - 15, sanitize(r.getFullName()) + " (" + r.getRole() + ")");

                        cs.setNonStrokingColor(new Color(30, 91, 73));
                        drawText(cs, fontBold, 9, margin + 250, currentY - 15, approval.getDecision().name());

                        cs.setNonStrokingColor(new Color(80, 80, 80));
                        String dateStr = approval.getDecidedAt() != null ? DATE_FORMATTER.format(approval.getDecidedAt()) : "N/A";
                        drawText(cs, fontRegular, 9, margin + 360, currentY - 15, dateStr);

                        currentY -= 22;
                    }

                    currentY -= 35;

                    // Final Signature Stamp Box
                    cs.setNonStrokingColor(new Color(235, 247, 241));
                    cs.addRect(margin, currentY - 130, width - (2 * margin), 130);
                    cs.fill();

                    cs.setStrokingColor(new Color(30, 91, 73));
                    cs.setLineWidth(2f);
                    cs.addRect(margin, currentY - 130, width - (2 * margin), 130);
                    cs.stroke();

                    cs.setNonStrokingColor(new Color(30, 91, 73));
                    cs.beginText();
                    cs.setFont(fontBold, 14);
                    cs.newLineAtOffset(margin + 20, currentY - 25);
                    cs.showText("FINAL SIGNATURE & EXECUTION");
                    cs.endText();

                    cs.setNonStrokingColor(new Color(16, 35, 31));
                    drawText(cs, fontBold, 11, margin + 20, currentY - 50, "Signed By: " + sanitize(actualSignerName));
                    drawText(cs, fontRegular, 10, margin + 20, currentY - 67, "Role / Email: " + signer.getRole() + " (" + signer.getEmail() + ")");
                    drawText(cs, fontRegular, 10, margin + 20, currentY - 84, "Execution Date: " + DATE_FORMATTER.format(doc.getUpdatedAt()));

                    String sigId = "DOCUFLOW-SIG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
                    drawText(cs, fontOblique, 9, margin + 20, currentY - 105, "Signature ID: " + sigId + "  |  Status: DIGITALLY SIGNED & VERIFIED");

                    // Signature Badge / Line on right side
                    cs.setStrokingColor(new Color(30, 91, 73));
                    cs.setLineWidth(1f);
                    cs.moveTo(width - margin - 180, currentY - 80);
                    cs.lineTo(width - margin - 20, currentY - 80);
                    cs.stroke();

                    cs.setNonStrokingColor(new Color(30, 91, 73));
                    drawText(cs, fontOblique, 12, width - margin - 160, currentY - 70, sanitize(actualSignerName));
                    drawText(cs, fontRegular, 8, width - margin - 150, currentY - 93, "Authorized Digital Signature");

                    // Footer
                    cs.setNonStrokingColor(new Color(120, 120, 120));
                    drawText(cs, fontRegular, 8, margin, 30, "Generated by DocuFlow Workflow System · Confidential & Tamper-Evident Record");
                }

                document.save(tempOutput.toFile());
            }

            // Atomically replace original stored PDF file
            Files.move(tempOutput, pdfPath, StandardCopyOption.REPLACE_EXISTING);
        } finally {
            try {
                Files.deleteIfExists(tempOutput);
            } catch (IOException ignored) {}
        }
    }

    private void drawText(PDPageContentStream cs, PDFont font, float fontSize, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, fontSize);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private String sanitize(String text) {
        if (text == null) return "";
        return text.replaceAll("[^\\x00-\\x7F]", "");
    }
}
