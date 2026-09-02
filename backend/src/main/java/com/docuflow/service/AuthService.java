package com.docuflow.service;

import com.docuflow.dto.AuthDtos.*;
import com.docuflow.exception.ApiException;
import com.docuflow.repository.UserRepository;
import com.docuflow.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
  private final UserRepository users; private final PasswordEncoder encoder; private final JwtService jwt;
  public AuthService(UserRepository users, PasswordEncoder encoder, JwtService jwt){this.users=users;this.encoder=encoder;this.jwt=jwt;}
  public AuthResponse login(LoginRequest request){var user=users.findByEmailIgnoreCase(request.email()).filter(u->u.isActive()&&encoder.matches(request.password(),u.getPasswordHash())).orElseThrow(()->new ApiException(HttpStatus.UNAUTHORIZED,"Invalid email or password"));return new AuthResponse(jwt.create(user),map(user));}
  public UserResponse me(String email){return users.findByEmailIgnoreCase(email).map(this::map).orElseThrow(()->new ApiException(HttpStatus.NOT_FOUND,"User not found"));}
  private UserResponse map(com.docuflow.entity.User u){
    return new UserResponse(
      u.getId(),
      u.getFullName(),
      u.getEmail(),
      u.getRole(),
      u.getDepartment() != null ? u.getDepartment().getId() : null,
      u.getDepartment() != null ? u.getDepartment().getName() : null
    );
  }
}
