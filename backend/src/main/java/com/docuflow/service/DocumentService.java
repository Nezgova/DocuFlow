package com.docuflow.service;

import com.docuflow.dto.DocumentDtos.*;
import com.docuflow.entity.*;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional
public class DocumentService {
 private final DocumentRepository docs;
 private final UserRepository users;
 private final CommentRepository comments;
 private final ActivityLogRepository activity;
 private final CategoryRepository categories;
 private final TagRepository tagRepository;
 private final NotificationService notificationService;
 private final PdfGeneratorService pdfGenerator;
 private final Path storage;

 public DocumentService(DocumentRepository docs, UserRepository users, CommentRepository comments, ActivityLogRepository activity, CategoryRepository categories, TagRepository tagRepository, NotificationService notificationService, PdfGeneratorService pdfGenerator, @Value("${app.storage-dir}") String storage) {
  this.docs = docs;
  this.users = users;
  this.comments = comments;
  this.activity = activity;
  this.categories = categories;
  this.tagRepository = tagRepository;
  this.notificationService = notificationService;
  this.pdfGenerator = pdfGenerator;
  this.storage = Paths.get(storage).toAbsolutePath().normalize();
 }

 public DocumentResponse upload(CreateRequest req, MultipartFile file, User owner) {
  if (file.isEmpty() || !"application/pdf".equals(file.getContentType())) {
   throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF files are accepted");
  }
  try {
   Files.createDirectories(storage);
   String stored = UUID.randomUUID() + ".pdf";
   Files.copy(file.getInputStream(), storage.resolve(stored));
   var doc = new Document(req.title().trim(), req.description(), stored, Objects.requireNonNullElse(file.getOriginalFilename(), "document.pdf"), file.getSize(), owner);
   
   if (req.categoryId() != null) {
    Category cat = categories.findById(req.categoryId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Category not found"));
    doc.setCategory(cat);
   }

   Set<Tag> resolvedTags = new HashSet<>();
   if (req.tags() != null) {
    for (String tagName : req.tags()) {
     if (tagName != null && !tagName.isBlank()) {
      String normalized = tagName.toLowerCase().trim();
      Tag tag = tagRepository.findByNameIgnoreCase(normalized).orElseGet(() -> tagRepository.save(new Tag(normalized)));
      resolvedTags.add(tag);
     }
    }
   }
   doc.setTags(resolvedTags);

   var reviewers = users.findAllById(req.reviewerIds());
   if (reviewers.size() != new HashSet<>(req.reviewerIds()).size()) {
    throw new ApiException(HttpStatus.BAD_REQUEST, "One or more reviewers do not exist");
   }
   doc.setReviewers(reviewers);
   docs.save(doc);
   log(doc, owner, "DOCUMENT_UPLOADED", "Pending approval");
   reviewers.forEach(r -> notificationService.notifyUser(r, "Document Review Assigned", owner.getFullName() + " assigned you to review '" + doc.getTitle() + "'", "ASSIGNED"));
   return map(doc);
  } catch (IOException e) {
   throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store document");
  }
 }

 @Transactional(readOnly = true)
 public Page<DocumentResponse> list(User user, String search, Long departmentId, Long categoryId, Long tagId, Pageable page) {
  return docs.visibleTo(user, user.getRole() == Role.ADMINISTRATOR, search == null ? "" : search, departmentId, categoryId, tagId, page).map(this::map);
 }

 @Transactional(readOnly = true)
 public DocumentResponse get(Long id, User user) {
  return map(access(id, user));
 }

 public DocumentResponse decide(Long id, DecisionRequest req, User user) {
  var doc = access(id, user);
  var approval = doc.getApprovals().stream().filter(a -> a.getReviewer().getId().equals(user.getId())).findFirst().orElseThrow(() -> new ApiException(HttpStatus.FORBIDDEN, "You are not assigned as a reviewer"));
  if (approval.getDecision() != ApprovalDecision.PENDING) {
   throw new ApiException(HttpStatus.CONFLICT, "You have already decided");
  }
  approval.decide(req.decision());
  if (req.decision() == ApprovalDecision.REJECTED) {
   doc.setStatus(DocumentStatus.REJECTED);
  } else if (doc.getApprovals().stream().allMatch(a -> a.getDecision() == ApprovalDecision.APPROVED)) {
   doc.setStatus(DocumentStatus.READY_FOR_SIGNATURE);
  }
  String decisionText = req.decision() == ApprovalDecision.APPROVED ? "approved" : "rejected";
  log(doc, user, req.decision() == ApprovalDecision.APPROVED ? "APPROVED" : "REJECTED", "Document review decision recorded");
  notificationService.notifyUser(doc.getOwner(), "Review " + decisionText, user.getFullName() + " " + decisionText + " document '" + doc.getTitle() + "'", req.decision() == ApprovalDecision.APPROVED ? "APPROVED" : "REJECTED");
  return map(doc);
 }

 public DocumentResponse sign(Long id, User user, String signatureName) {
  var doc = access(id, user);
  if (doc.getStatus() != DocumentStatus.READY_FOR_SIGNATURE) {
   throw new ApiException(HttpStatus.CONFLICT, "Document is not ready for finalization");
  }
  if (user.getRole() != Role.ADMINISTRATOR && user.getRole() != Role.MANAGER) {
   throw new ApiException(HttpStatus.FORBIDDEN, "Only a manager or administrator may finalize");
  }
  try {
   Path pdfPath = storage.resolve(doc.getStoredFileName());
   pdfGenerator.appendSignaturePage(pdfPath, doc, user, signatureName);
   doc.updateFileSize(Files.size(pdfPath));
  } catch (IOException e) {
   throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to append signature certificate to PDF: " + e.getMessage());
  }
  doc.setStatus(DocumentStatus.SIGNED);
  log(doc, user, "DOCUMENT_FINALIZED", "Workflow completed and digitally signed certificate generated");
  notificationService.notifyUser(doc.getOwner(), "Document Signed", "Your document '" + doc.getTitle() + "' has been successfully finalized and signed.", "SIGNED");
  return map(doc);
 }

 public DocumentResponse archive(Long id, User user) {
  var doc = access(id, user);
  if (doc.getStatus() != DocumentStatus.SIGNED) {
   throw new ApiException(HttpStatus.CONFLICT, "Only finalized documents can be archived");
  }
  if (user.getRole() != Role.ADMINISTRATOR && user.getRole() != Role.MANAGER) {
   throw new ApiException(HttpStatus.FORBIDDEN, "Only a manager or administrator may archive");
  }
  doc.setStatus(DocumentStatus.ARCHIVED);
  log(doc, user, "DOCUMENT_ARCHIVED", "Document archived");
  return map(doc);
 }

 public DocumentResponse rename(Long id, RenameRequest request, User user) {
  var doc = access(id, user);
  if (!doc.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ADMINISTRATOR) {
   throw new ApiException(HttpStatus.FORBIDDEN, "Only the owner or administrator may rename");
  }
  doc.rename(request.title().trim());
  log(doc, user, "DOCUMENT_RENAMED", "Title changed");
  return map(doc);
 }

 public DocumentResponse restart(Long id, CreateRequest request, MultipartFile file, User user) {
  var doc = access(id, user);
  boolean hasDecisions = doc.getApprovals().stream().anyMatch(a -> a.getDecision() != ApprovalDecision.PENDING);
  if (hasDecisions || doc.getStatus() != DocumentStatus.PENDING) {
   throw new ApiException(HttpStatus.CONFLICT, "Document cannot be modified after review decisions have been made");
  }
  if (!doc.getOwner().getId().equals(user.getId()) && user.getRole() != Role.ADMINISTRATOR) {
   throw new ApiException(HttpStatus.FORBIDDEN, "Only the uploader or administrator may modify");
  }
  if (file.isEmpty() || !"application/pdf".equals(file.getContentType())) {
   throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF files are accepted");
  }
  try {
   String stored = UUID.randomUUID() + ".pdf";
   Files.copy(file.getInputStream(), storage.resolve(stored));
   Files.deleteIfExists(storage.resolve(doc.getStoredFileName()));
   doc.replaceFile(stored, Objects.requireNonNullElse(file.getOriginalFilename(), "document.pdf"), file.getSize());
   doc.rename(request.title().trim());
   
   if (request.categoryId() != null) {
    Category cat = categories.findById(request.categoryId()).orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Category not found"));
    doc.setCategory(cat);
   } else {
    doc.setCategory(null);
   }

   Set<Tag> resolvedTags = new HashSet<>();
   if (request.tags() != null) {
    for (String tagName : request.tags()) {
     if (tagName != null && !tagName.isBlank()) {
      String normalized = tagName.toLowerCase().trim();
      Tag tag = tagRepository.findByNameIgnoreCase(normalized).orElseGet(() -> tagRepository.save(new Tag(normalized)));
      resolvedTags.add(tag);
     }
    }
   }
   doc.setTags(resolvedTags);

   var reviewers = users.findAllById(request.reviewerIds());
   if (reviewers.size() != new HashSet<>(request.reviewerIds()).size()) {
    throw new ApiException(HttpStatus.BAD_REQUEST, "One or more reviewers do not exist");
   }
   doc.setReviewers(reviewers);
   log(doc, user, "DOCUMENT_MODIFIED", "Document version updated before review");
   reviewers.forEach(r -> notificationService.notifyUser(r, "Document Review Assigned", user.getFullName() + " assigned you to review '" + doc.getTitle() + "'", "ASSIGNED"));
   return map(doc);
  } catch (IOException e) {
   throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to replace PDF");
  }
 }

 public CommentResponse comment(Long id, CommentRequest req, User user) {
  var doc = access(id, user);
  var comment = comments.save(new Comment(doc, user, req.content().trim()));
  log(doc, user, "COMMENT_ADDED", "Comment added");
  if (!doc.getOwner().getId().equals(user.getId())) {
   notificationService.notifyUser(doc.getOwner(), "New Comment", user.getFullName() + " commented on '" + doc.getTitle() + "'", "COMMENT");
  }
  return new CommentResponse(user.getFullName(), comment.getContent(), comment.getCreatedAt());
 }

 @Transactional(readOnly = true)
 public List<CommentResponse> comments(Long id, User user) {
  access(id, user);
  return comments.findByDocumentIdOrderByCreatedAtAsc(id).stream().map(c -> new CommentResponse(c.getAuthor().getFullName(), c.getContent(), c.getCreatedAt())).toList();
 }

 public void delete(Long id, User user) {
  var doc = access(id, user);
  if (user.getRole() != Role.ADMINISTRATOR && !doc.getOwner().getId().equals(user.getId())) {
   throw new ApiException(HttpStatus.FORBIDDEN, "Only the owner or administrator may delete");
  }
  docs.delete(doc);
  try {
   Files.deleteIfExists(storage.resolve(doc.getStoredFileName()));
  } catch (IOException ignored) {}
 }

 @Transactional(readOnly = true)
 public org.springframework.core.io.Resource file(Long id, User user) {
  var doc = access(id, user);
  try {
   return new org.springframework.core.io.UrlResource(storage.resolve(doc.getStoredFileName()).toUri());
  } catch (java.net.MalformedURLException e) {
   throw new ApiException(HttpStatus.NOT_FOUND, "File not found");
  }
 }

 @Transactional(readOnly = true)
 public List<ActivityResponse> activity(Long id, User user) {
  access(id, user);
  return activity.findTop20ByDocumentIdOrderByCreatedAtDesc(id).stream().map(a -> new ActivityResponse(a.getActor().getFullName(), a.getAction(), a.getDetail(), a.getCreatedAt())).toList();
 }

 private Document access(Long id, User user) {
  var d = docs.findById(id).orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found"));
  boolean reviewer = d.getApprovals().stream().anyMatch(a -> a.getReviewer().getId().equals(user.getId()));
  if (user.getRole() != Role.ADMINISTRATOR && !d.getOwner().getId().equals(user.getId()) && !reviewer) {
   throw new ApiException(HttpStatus.FORBIDDEN, "You cannot access this document");
  }
  return d;
 }

 private void log(Document d, User u, String action, String detail) {
  activity.save(new ActivityLog(d, u, action, detail));
 }

 private DocumentResponse map(Document d) {
  return new DocumentResponse(
   d.getId(),
   d.getTitle(),
   d.getDescription(),
   d.getOriginalFileName(),
   d.getFileSize(),
   d.getStatus(),
   d.getOwner().getFullName(),
   d.getOwner().getId(),
   d.getDepartment() != null ? d.getDepartment().getId() : null,
   d.getDepartment() != null ? d.getDepartment().getName() : null,
   d.getCategory() != null ? d.getCategory().getId() : null,
   d.getCategory() != null ? d.getCategory().getName() : null,
   d.getTags().stream().map(Tag::getName).sorted().toList(),
   d.getCreatedAt(),
   d.getApprovals().stream().map(a -> new Reviewer(a.getReviewer().getId(), a.getReviewer().getFullName(), a.getDecision())).toList()
  );
 }
}
