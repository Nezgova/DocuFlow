package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "activity_logs")
public class ActivityLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Document document;

    @ManyToOne(optional = false)
    private User actor;

    @Column(nullable = false, length = 80)
    private String action;

    @Column(length = 50)
    private String actionType;

    @Column(length = 500)
    private String detail;

    @Column(length = 100)
    private String ipAddress;

    @Column(length = 300)
    private String browser;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    protected ActivityLog() {}

    public ActivityLog(Document document, User actor, String action, String detail, String ipAddress, String browser) {
        this.document = document;
        this.actor = actor;
        this.action = action;
        this.detail = detail;
        this.ipAddress = ipAddress;
        this.browser = browser;
        this.actionType = action != null && action.contains(" ") ? action.substring(0, action.indexOf(' ')).toUpperCase() : "ACTION";
    }

    public Long getId() { return id; }
    public Document getDocument() { return document; }
    public User getActor() { return actor; }
    public String getAction() { return action; }
    public String getActionType() { return actionType; }
    public String getDetail() { return detail; }
    public String getIpAddress() { return ipAddress; }
    public String getBrowser() { return browser; }
    public Instant getCreatedAt() { return createdAt; }
}
