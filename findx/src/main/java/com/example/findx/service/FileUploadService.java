package com.example.findx.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileUploadService {

    @Value("${findx.upload.dir}")
    private String uploadDir;

    private static final List<String> ALLOWED_TYPES = List.of(
        "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_SIZE = 10 * 1024 * 1024; // 10 MB

    public String uploadFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        // Validate type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Invalid file type. Only JPG, PNG, WEBP, GIF allowed.");
        }

        // Validate size
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size exceeds 10MB limit.");
        }

        // Create upload directory if not exists
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            uploadDirectory.mkdirs();
        }

        // Generate unique filename
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;

        // Save file
        Path filePath = Paths.get(uploadDir, fileName);
        Files.write(filePath, file.getBytes());

        return fileName;
    }

    public String uploadMultipleFiles(MultipartFile[] files) throws IOException {
        List<String> fileNames = new ArrayList<>();
        if (files == null) return "";
        for (MultipartFile file : files) {
            if (file != null && !file.isEmpty()) {
                String name = uploadFile(file);
                if (name != null) fileNames.add(name);
            }
        }
        return String.join(",", fileNames);
    }

    public void deleteFile(String fileName) {
        if (fileName != null && !fileName.isEmpty()) {
            try {
                Path filePath = Paths.get(uploadDir, fileName);
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                // Log error
                System.err.println("Could not delete file: " + fileName);
            }
        }
    }
}
