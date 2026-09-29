package com.docuflow.service;

import com.docuflow.dto.AuthDtos.*;
import com.docuflow.entity.ApprovalDecision;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.*;
import com.docuflow.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
  private final UserRepository users;
  private final DocumentRepository documents;
  private final ApprovalRepository approvals;
  private final ActivityLogRepository activityLogs;
  private final PasswordEncoder encoder;
  private final JwtService jwt;

  public AuthService(UserRepository users, DocumentRepository documents, ApprovalRepository approvals, ActivityLogRepository activityLogs, PasswordEncoder encoder, JwtService jwt){
    this.users=users; this.documents=documents; this.approvals=approvals; this.activityLogs=activityLogs; this.encoder=encoder; this.jwt=jwt;
  }

  public AuthResponse login(LoginRequest request){
    var user=users.findByEmailIgnoreCase(request.email()).filter(u->u.isActive()&&encoder.matches(request.password(),u.getPasswordHash())).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"Invalid email or password"));
    return new AuthResponse(jwt.create(user),map(user));
  }

  public UserResponse me(String email){
    return users.findByEmailIgnoreCase(email).map(this::map).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));
  }

  public UserProfileResponse getProfile(String email){
    var user = users.findByEmailIgnoreCase(email).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));
    long uploaded = documents.countByOwner(user);
    long approved = approvals.countByReviewerAndDecision(user, ApprovalDecision.APPROVED);
    long pending = approvals.countByReviewerAndDecision(user, ApprovalDecision.PENDING);
    var recent = activityLogs.findTop20ByActorOrderByCreatedAtDesc(user).stream()
      .map(log -> new ActivityItemResponse(
        log.getAction(),
        log.getDetail(),
        log.getDocument().getTitle(),
        log.getDocument().getId(),
        log.getCreatedAt()
      )).toList();
    return new UserProfileResponse(map(user), uploaded, approved, pending, recent);
  }

  public UserResponse updateProfile(String email, UpdateProfileRequest request){
    var user = users.findByEmailIgnoreCase(email).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));
    if (request.currentPassword() != null && !request.currentPassword().isBlank()) {
      if (request.newPassword() == null || request.newPassword().isBlank() || request.newPassword().length() < 8) {
        throw new ApiException(HttpStatus.BAD_REQUEST, "New password must be at least 8 characters");
      }
      if (!encoder.matches(request.currentPassword(), user.getPasswordHash())) {
        throw new ApiException(HttpStatus.UNAUTHORIZED, "Current password is incorrect");
      }
      user.setPasswordHash(encoder.encode(request.newPassword()));
    }
    user.updateProfile(request.fullName(), request.phone(), request.jobTitle(), request.avatar());
    return map(user);
  }

  private UserResponse map(com.docuflow.entity.User u){
    return new UserResponse(
      u.getId(),
      u.getFullName(),
      u.getEmail(),
      u.getRole(),
      u.getDepartment() != null ? u.getDepartment().getId() : null,
      u.getDepartment() != null ? u.getDepartment().getName() : null,
      u.getAvatar(),
      u.getPhone(),
      u.getJobTitle(),
      u.getCreatedAt()
    );
  }
}
