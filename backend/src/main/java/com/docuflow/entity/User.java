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
  @ManyToOne(fetch = FetchType.LAZY) private Department department;
  @Column(nullable = false) private boolean active = true;
  @Column(nullable = false, updatable = false) private Instant createdAt = Instant.now();
  @Column(length = 500) private String avatar;
  @Column(length = 50) private String phone;
  @Column(length = 120) private String jobTitle;

  protected User() {}

  public User(String fullName, String email, String passwordHash, Role role, Department department) {
    this.fullName = fullName;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.department = department;
  }

  public Long getId(){return id;}
  public String getFullName(){return fullName;}
  public String getEmail(){return email;}
  public String getPasswordHash(){return passwordHash;}
  public Role getRole(){return role;}
  public Department getDepartment(){return department;}
  public boolean isActive(){return active;}
  public Instant getCreatedAt(){return createdAt;}

  public String getAvatar(){return avatar;}
  public String getPhone(){return phone;}
  public String getJobTitle(){return jobTitle;}

  public void setAvatar(String avatar){this.avatar = avatar;}
  public void setPhone(String phone){this.phone = phone;}
  public void setJobTitle(String jobTitle){this.jobTitle = jobTitle;}
  public void setPasswordHash(String passwordHash){this.passwordHash = passwordHash;}

  public void setDepartment(Department department) {
    this.department = department;
  }

  public void update(String name, Role newRole, boolean isActive, Department department){
    this.fullName = name;
    this.role = newRole;
    this.active = isActive;
    this.department = department;
  }

  public void updateProfile(String fullName, String phone, String jobTitle, String avatar) {
    if (fullName != null && !fullName.isBlank()) this.fullName = fullName;
    this.phone = phone;
    this.jobTitle = jobTitle;
    this.avatar = avatar;
  }
}
