package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import java.util.*;

@Entity @Table(name="documents")
public class Document {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false,length=180) private String title;
 @Column(length=2000) private String description;
 @Column(nullable=false) private String storedFileName;
 @Column(nullable=false) private String originalFileName;
 @Column(nullable=false) private long fileSize;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private DocumentStatus status=DocumentStatus.DRAFT;
 @Column(nullable=false,length=20) private String priority="NORMAL";
 @Column(name="due_date") private LocalDate dueDate;
 @ManyToOne(optional=false,fetch=FetchType.LAZY) private User owner;
 @ManyToOne(fetch=FetchType.LAZY) private Department department;
 @ManyToOne(fetch=FetchType.LAZY) private Category category;
 @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
 @JoinTable(
   name = "document_tags",
   joinColumns = @JoinColumn(name = "document_id"),
   inverseJoinColumns = @JoinColumn(name = "tag_id")
 )
 private Set<Tag> tags = new HashSet<>();
 @Column(nullable=false,updatable=false) private Instant createdAt=Instant.now();
 @Column(nullable=false) private Instant updatedAt=Instant.now();
 @OneToMany(mappedBy="document",cascade=CascadeType.ALL,orphanRemoval=true) private List<Approval> approvals=new ArrayList<>();

 protected Document(){}

 public Document(String title,String description,String stored,String original,long size,User owner){
   this.title=title;
   this.description=description;
   storedFileName=stored;
   originalFileName=original;
   fileSize=size;
   this.owner=owner;
   this.department=owner.getDepartment();
 }

 public Long getId(){return id;}
 public String getTitle(){return title;}
 public String getDescription(){return description;}
 public String getStoredFileName(){return storedFileName;}
 public String getOriginalFileName(){return originalFileName;}
 public long getFileSize(){return fileSize;}
  public DocumentStatus getStatus(){return status;}
  public String getPriority(){return priority;}
  public void setPriority(String priority){this.priority = priority != null ? priority : "NORMAL"; touch();}
  public LocalDate getDueDate(){return dueDate;}
  public void setDueDate(LocalDate dueDate){this.dueDate = dueDate; touch();}
  public User getOwner(){return owner;}
 public Department getDepartment(){return department;}
  public Category getCategory(){return category;}
  public void setCategory(Category category){this.category=category; touch();}
  public Set<Tag> getTags(){return tags;}
  public void setTags(Set<Tag> tags){this.tags=tags; touch();}
 public Instant getCreatedAt(){return createdAt;}
 public Instant getUpdatedAt(){return updatedAt;}
 public List<Approval> getApprovals(){return approvals;}

 public void setReviewers(List<User> reviewers){
   approvals.clear();
   reviewers.forEach(u->approvals.add(new Approval(this,u)));
   status=DocumentStatus.PENDING;
   touch();
 }

 public void rename(String value){title=value;touch();}
 public void setStatus(DocumentStatus value){status=value;touch();}
 private void touch(){updatedAt=Instant.now();}
 public void replaceFile(String stored,String original,long size){storedFileName=stored;originalFileName=original;fileSize=size;touch();}
 public void updateFileSize(long size){fileSize=size;touch();}
}
