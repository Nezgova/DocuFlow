package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity @Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
  @Column(nullable = false, length = 120) private String fullName;
  @Column(nullable = false, length = 190) private String email;
  @Column(nullable = false) private String passwordHash;
  @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private Role role;
  @Column(nullable = false) private boolean active = true;
  @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
  protected User() {}
  public User(String fullName, String email, String passwordHash, Role role) { this.fullName=fullName; this.email=email; this.passwordHash=passwordHash; this.role=role; }
  public Long getId(){return id;} public String getFullName(){return fullName;} public String getEmail(){return email;} public String getPasswordHash(){return passwordHash;} public Role getRole(){return role;} public boolean isActive(){return active;}
  public void update(String name, Role newRole, boolean isActive){fullName=name;role=newRole;active=isActive;}
}
