package com.schemaforge.schema_platform.controller;

import com.schemaforge.schema_platform.entity.DatabaseFile;
import com.schemaforge.schema_platform.service.DatabaseFileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/databases")
@CrossOrigin(origins = "http://localhost:5173")
public class DatabaseController {

    private final DatabaseFileService databaseFileService;

    public DatabaseController(
            DatabaseFileService databaseFileService
    ) {
        this.databaseFileService = databaseFileService;
    }

    @PostMapping("/import")
    public ResponseEntity<DatabaseFile> importDatabase(
            @RequestParam("file") MultipartFile file
    ) {

        try {

            DatabaseFile savedDatabase =
                    databaseFileService.importDatabase(file);

            return ResponseEntity.ok(savedDatabase);

        } catch (Exception e) {

            return ResponseEntity
                    .badRequest()
                    .build();
        }
    }
}