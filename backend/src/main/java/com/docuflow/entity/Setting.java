package com.docuflow.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "settings")
public class Setting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "setting_key", nullable = false, unique = true, length = 100)
    private String settingKey;

    @Column(name = "setting_value", columnDefinition = "TEXT")
    private String settingValue;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    protected Setting() {}

    public Setting(String settingKey, String settingValue) {
        this.settingKey = settingKey;
        this.settingValue = settingValue;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public String getSettingKey() { return settingKey; }
    public void setSettingKey(String settingKey) { this.settingKey = settingKey; }
    public String getSettingValue() { return settingValue; }
    public void setSettingValue(String settingValue) { 
        this.settingValue = settingValue; 
        this.updatedAt = Instant.now();
    }
    public Instant getUpdatedAt() { return updatedAt; }
}
