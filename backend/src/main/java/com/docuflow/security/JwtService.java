package com.docuflow.security;

import com.docuflow.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/** Creates and verifies the short-lived bearer token used by the REST API. */
@Service
public class JwtService {
  private final SecretKey key; private final long expiration;
  public JwtService(@Value("${app.jwt.secret}") String secret, @Value("${app.jwt.expiration-ms}") long expiration) { this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expiration=expiration; }
  public String create(User user) { return Jwts.builder().subject(user.getEmail()).claim("role",user.getRole().name()).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+expiration)).signWith(key).compact(); }
  public String subject(String token) { return claims(token).getSubject(); }
  public boolean valid(String token) { try { claims(token); return true; } catch (Exception ignored) { return false; } }
  private Claims claims(String token) { return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload(); }
}
