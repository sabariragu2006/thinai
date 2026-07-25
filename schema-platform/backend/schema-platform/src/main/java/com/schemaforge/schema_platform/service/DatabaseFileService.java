package com.schemaforge.schema_platform.service;

import com.schemaforge.schema_platform.entity.DatabaseFile;
import com.schemaforge.schema_platform.repository.DatabaseFileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class DatabaseFileService {

    private final DatabaseFileRepository databaseFileRepository;

    private final Path uploadDirectory =
            Paths.get("uploads", "databases");

    public DatabaseFileService(DatabaseFileRepository databaseFileRepository) {
        this.databaseFileRepository = databaseFileRepository;
    }

    public DatabaseFile importDatabase(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Database file cannot be empty");
        }

        String originalFileName = file.getOriginalFilename();

        if (originalFileName == null || originalFileName.isBlank()) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String fileType = getFileType(originalFileName);

        if (!isSupportedFileType(fileType)) {
            throw new IllegalArgumentException(
                    "Unsupported database file type: " + fileType
            );
        }

        // Create upload directory
        Files.createDirectories(uploadDirectory);

        // Generate unique file name
        String storedFileName =
                UUID.randomUUID() + "_" + originalFileName;

        // Complete file path
        Path filePath =
                uploadDirectory.resolve(storedFileName);

        // Store physical file
        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING
        );

        // Create metadata
        DatabaseFile databaseFile = new DatabaseFile();

        databaseFile.setName(removeExtension(originalFileName));
        databaseFile.setOriginalFileName(originalFileName);
        databaseFile.setStoredFileName(storedFileName);
        databaseFile.setFileType(fileType);
        databaseFile.setFilePath(filePath.toString());
        databaseFile.setFileSize(file.getSize());
        databaseFile.setCreatedAt(LocalDateTime.now());

        // Store metadata in PostgreSQL
        return databaseFileRepository.save(databaseFile);
    }

    private String getFileType(String fileName) {

        int index = fileName.lastIndexOf(".");

        if (index == -1) {
            return "unknown";
        }

        return fileName
                .substring(index + 1)
                .toLowerCase();
    }

    private boolean isSupportedFileType(String fileType) {

        return fileType.equals("sqlite")
                || fileType.equals("db")
                || fileType.equals("sql");
    }

    private String removeExtension(String fileName) {

        int index = fileName.lastIndexOf(".");

        if (index == -1) {
            return fileName;
        }

        return fileName.substring(0, index);
    }
}