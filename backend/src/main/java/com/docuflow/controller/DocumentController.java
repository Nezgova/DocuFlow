package com.docuflow.controller;

import com.docuflow.dto.DocumentDtos.*;
import com.docuflow.entity.User;
import com.docuflow.service.DocumentService;
import jakarta.validation.Valid;
import java.util.*;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/documents")
public class DocumentController {
 private final DocumentService s;

 public DocumentController(DocumentService s) {
  this.s = s;
 }

 @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
 @ResponseStatus(HttpStatus.CREATED)
 public DocumentResponse upload(@RequestPart("data") @Valid CreateRequest d, @RequestPart("file") MultipartFile f, @AuthenticationPrincipal User u) {
  return s.upload(d, f, u);
 }

 @PostMapping(value = "/{id}/restart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
 public DocumentResponse restart(@PathVariable Long id, @RequestPart("data") @Valid CreateRequest d, @RequestPart("file") MultipartFile f, @AuthenticationPrincipal User u) {
  return s.restart(id, d, f, u);
 }

 @GetMapping
 public Page<DocumentResponse> list(@AuthenticationPrincipal User u, @RequestParam(defaultValue = "") String q, @RequestParam(required = false) Long departmentId, @RequestParam(required = false) Long categoryId, @PageableDefault(size = 20) Pageable p) {
  return s.list(u, q, departmentId, categoryId, p);
 }

 @GetMapping("/{id}")
 public DocumentResponse get(@PathVariable Long id, @AuthenticationPrincipal User u) {
  return s.get(id, u);
 }

 @GetMapping("/{id}/file")
 public ResponseEntity<org.springframework.core.io.Resource> file(@PathVariable Long id, @AuthenticationPrincipal User u) {
  return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).body(s.file(id, u));
 }

 @PatchMapping("/{id}/decision")
 public DocumentResponse decide(@PathVariable Long id, @RequestBody @Valid DecisionRequest d, @AuthenticationPrincipal User u) {
  return s.decide(id, d, u);
 }

 @PostMapping("/{id}/sign")
 public DocumentResponse sign(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, Object> body, @AuthenticationPrincipal User u) {
  String sigName = body != null ? (String) body.get("signatureName") : null;
  return s.sign(id, u, sigName);
 }

 @PostMapping("/{id}/archive")
 public DocumentResponse archive(@PathVariable Long id, @AuthenticationPrincipal User u) {
  return s.archive(id, u);
 }

 @GetMapping("/{id}/comments")
 public List<CommentResponse> comments(@PathVariable Long id, @AuthenticationPrincipal User u) {
  return s.comments(id, u);
 }

 @PostMapping("/{id}/comments")
 public CommentResponse comment(@PathVariable Long id, @RequestBody @Valid CommentRequest req, @AuthenticationPrincipal User u) {
  return s.comment(id, req, u);
 }

 @DeleteMapping("/{id}")
 @ResponseStatus(HttpStatus.NO_CONTENT)
 public void delete(@PathVariable Long id, @AuthenticationPrincipal User u) {
  s.delete(id, u);
 }

 @PatchMapping("/{id}/rename")
 public DocumentResponse rename(@PathVariable Long id, @RequestBody @Valid RenameRequest req, @AuthenticationPrincipal User u) {
  return s.rename(id, req, u);
 }

 @GetMapping("/{id}/activity")
 public List<ActivityResponse> activity(@PathVariable Long id, @AuthenticationPrincipal User u) {
  return s.activity(id, u);
 }
}
