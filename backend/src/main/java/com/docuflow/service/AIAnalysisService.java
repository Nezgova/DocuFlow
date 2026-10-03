package com.docuflow.service;

import com.docuflow.dto.AIAnalysisDtos.AIAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;

@Service
public class AIAnalysisService {

    @Value("${app.gemini-api-key:}")
    private String geminiApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(20))
            .build();

    public AIAnalysisResponse analyzePdf(MultipartFile file) {
        String extractedText = "";
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            extractedText = stripper.getText(document);
            if (extractedText.length() > 10000) {
                extractedText = extractedText.substring(0, 10000);
            }
        } catch (Exception e) {
            extractedText = "Unable to extract text from PDF file.";
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "Uploaded Document";
        String defaultTitle = originalFilename.replaceAll("\\.[^.]+$", "");

        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equals("your-gemini-api-key-here")) {
            System.err.println("[DocuFlow AI] Warning: GEMINI_API_KEY is not configured or is set to placeholder.");
            return new AIAnalysisResponse(
                    defaultTitle,
                    "Automatically processed document with DocuFlow AI extraction (API key missing).",
                    "General",
                    "General",
                    List.of("document", "review"),
                    "MEDIUM"
            );
        }

        try {
            String prompt = "Analyze the following document text and return ONLY a valid JSON object with keys: " +
                    "title (string, suggested document title), " +
                    "description (string, concise summary), " +
                    "category (string, e.g., Contract, Invoice, Policy, Report, Memo), " +
                    "department (string, e.g., Legal, Finance, HR, IT, Operations, Executive), " +
                    "tags (array of 2-4 string keywords), " +
                    "priority (string, exactly one of: LOW, MEDIUM, HIGH, URGENT). " +
                    "Do NOT include markdown formatting or backticks, return ONLY raw JSON.\n\nDocument Text:\n" + extractedText;

            ObjectNodeRequest requestBodyObj = new ObjectNodeRequest(prompt);
            String jsonPayload = objectMapper.writeValueAsString(requestBodyObj);

            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + geminiApiKey.trim();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("[DocuFlow AI] Gemini API Response Status: " + response.statusCode());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode()) {
                    String rawText = textNode.asText().trim();
                    if (rawText.startsWith("```json")) {
                        rawText = rawText.substring(7);
                    }
                    if (rawText.startsWith("```")) {
                        rawText = rawText.substring(3);
                    }
                    if (rawText.endsWith("```")) {
                        rawText = rawText.substring(0, rawText.length() - 3);
                    }
                    rawText = rawText.trim();

                    JsonNode parsedJson = objectMapper.readTree(rawText);
                    String title = parsedJson.path("title").asText(defaultTitle);
                    String description = parsedJson.path("description").asText("AI analyzed document submission.");
                    String category = parsedJson.path("category").asText("General");
                    String department = parsedJson.path("department").asText("General");
                    String priority = parsedJson.path("priority").asText("MEDIUM");
                    
                    List<String> tags = new java.util.ArrayList<>();
                    JsonNode tagsNode = parsedJson.path("tags");
                    if (tagsNode.isArray()) {
                        for (JsonNode node : tagsNode) {
                            tags.add(node.asText());
                        }
                    }
                    if (tags.isEmpty()) {
                        tags.add("ai-analyzed");
                    }

                    return new AIAnalysisResponse(title, description, category, department, tags, priority);
                }
            } else {
                System.err.println("[DocuFlow AI Error] Body: " + response.body());
            }
        } catch (Exception e) {
            System.err.println("[DocuFlow AI Exception]: " + e.getMessage());
            e.printStackTrace();
        }

        // Fallback on error
        return new AIAnalysisResponse(
                defaultTitle,
                "AI analysis completed with fallback parameters.",
                "General",
                "General",
                List.of("analyzed"),
                "MEDIUM"
        );
    }

    private static class ObjectNodeRequest {
        public List<Content> contents;

        public ObjectNodeRequest(String text) {
            this.contents = List.of(new Content(List.of(new Part(text))));
        }
    }

    private static class Content {
        public List<Part> parts;
        public Content(List<Part> parts) { this.parts = parts; }
    }

    private static class Part {
        public String text;
        public Part(String text) { this.text = text; }
    }
}
