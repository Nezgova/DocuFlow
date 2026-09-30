package com.docuflow.service;

import com.docuflow.exception.ApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class DocumentStorageService {
    private final Path storage;

    public DocumentStorageService(@Value("${app.storage-dir}") String storageDir) {
        this.storage = Paths.get(storageDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storage);
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not initialize storage directory");
        }
    }

    public String storeFile(MultipartFile file) {
        if (file.isEmpty() || !"application/pdf".equals(file.getContentType())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Only PDF files are accepted");
        }
        try {
            Files.createDirectories(storage);
            String storedFileName = UUID.randomUUID() + ".pdf";
            Files.copy(file.getInputStream(), storage.resolve(storedFileName));
            return storedFileName;
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store document file");
        }
    }

    public Resource loadAsResource(String storedFileName) {
        try {
            Path filePath = storage.resolve(storedFileName).normalize();
            if (!Files.exists(filePath)) {
                throw new ApiException(HttpStatus.NOT_FOUND, "File not found on storage");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ApiException(HttpStatus.NOT_FOUND, "File not readable");
            }
        } catch (MalformedURLException e) {
            throw new ApiException(HttpStatus.NOT_FOUND, "File path is invalid");
        }
    }

    public void deleteFile(String storedFileName) {
        if (storedFileName != null && !storedFileName.isBlank()) {
            try {
                Files.deleteIfExists(storage.resolve(storedFileName));
            } catch (IOException ignored) {}
        }
    }

    public Path resolvePath(String storedFileName) {
        return storage.resolve(storedFileName).normalize();
    }
}
