package com.docuflow.controller;

import com.docuflow.dto.AuthDtos.*;
import com.docuflow.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/auth")
public class AuthController {
  private final AuthService auth; public AuthController(AuthService auth){this.auth=auth;}
  @PostMapping("/login") public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request){return ResponseEntity.ok(auth.login(request));}
  @GetMapping("/me") public UserResponse me(@AuthenticationPrincipal com.docuflow.entity.User user){return auth.me(user.getEmail());}
  @GetMapping("/profile") public UserProfileResponse profile(@AuthenticationPrincipal com.docuflow.entity.User user){return auth.getProfile(user.getEmail());}
  @PutMapping("/profile") public UserResponse updateProfile(@AuthenticationPrincipal com.docuflow.entity.User user, @Valid @RequestBody UpdateProfileRequest request){return auth.updateProfile(user.getEmail(), request);}
}
