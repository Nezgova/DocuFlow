package com.docuflow.service;

import com.docuflow.entity.Setting;
import com.docuflow.repository.SettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class SettingService {
    private final SettingRepository settingRepository;

    public SettingService(SettingRepository settingRepository) {
        this.settingRepository = settingRepository;
        initDefaults();
    }

    private void initDefaults() {
        setDefaultIfAbsent("companyName", "DocuFlow Enterprise");
        setDefaultIfAbsent("maxUploadSizeMb", "25");
        setDefaultIfAbsent("allowedFileTypes", "pdf,docx,png,jpg");
        setDefaultIfAbsent("systemTheme", "moss");
        setDefaultIfAbsent("emailNotificationsEnabled", "true");
        setDefaultIfAbsent("logoUrl", "");
    }

    private void setDefaultIfAbsent(String key, String value) {
        if (settingRepository.findBySettingKey(key).isEmpty()) {
            settingRepository.save(new Setting(key, value));
        }
    }

    @Transactional(readOnly = true)
    public Map<String, String> getAllSettings() {
        List<Setting> settings = settingRepository.findAll();
        Map<String, String> map = new HashMap<>();
        for (Setting s : settings) {
            map.put(s.getSettingKey(), s.getSettingValue());
        }
        return map;
    }

    @Transactional(readOnly = true)
    public String getSetting(String key, String defaultValue) {
        return settingRepository.findBySettingKey(key)
                .map(Setting::getSettingValue)
                .orElse(defaultValue);
    }

    @Transactional
    public void updateSetting(String key, String value) {
        Setting setting = settingRepository.findBySettingKey(key)
                .orElse(new Setting(key, value));
        setting.setSettingValue(value);
        settingRepository.save(setting);
    }

    @Transactional
    public void updateSettings(Map<String, String> settingsMap) {
        for (Map.Entry<String, String> entry : settingsMap.entrySet()) {
            updateSetting(entry.getKey(), entry.getValue());
        }
    }
}
