package com.docuflow.entity;

import jakarta.persistence.*; import java.time.Instant; import java.util.*;
@Entity @Table(name="documents")
public class Document {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=180) private String title; @Column(nullable=false) private String storedFileName; @Column(nullable=false) private String originalFileName; @Column(nullable=false) private long fileSize;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private DocumentStatus status=DocumentStatus.DRAFT;
 @ManyToOne(optional=false,fetch=FetchType.LAZY) private User owner; @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now(); @Column(nullable=false) private Instant updatedAt=Instant.now();
 @OneToMany(mappedBy="document",cascade=CascadeType.ALL,orphanRemoval=true) private List<Approval> approvals=new ArrayList<>();
 protected Document(){} public Document(String title,String stored,String original,long size,User owner){this.title=title;storedFileName=stored;originalFileName=original;fileSize=size;this.owner=owner;}
 public Long getId(){return id;} public String getTitle(){return title;} public String getStoredFileName(){return storedFileName;} public String getOriginalFileName(){return originalFileName;} public long getFileSize(){return fileSize;} public DocumentStatus getStatus(){return status;} public User getOwner(){return owner;} public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;} public List<Approval> getApprovals(){return approvals;}
 public void setReviewers(List<User> reviewers){approvals.clear();reviewers.forEach(u->approvals.add(new Approval(this,u)));status=DocumentStatus.PENDING;touch();} public void rename(String value){title=value;touch();} public void setStatus(DocumentStatus value){status=value;touch();} private void touch(){updatedAt=Instant.now();}
}
