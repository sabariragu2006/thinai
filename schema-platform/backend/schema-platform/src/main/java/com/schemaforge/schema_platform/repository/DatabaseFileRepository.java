package com.schemaforge.schema_platform.repository;

import com.schemaforge.schema_platform.entity.DatabaseFile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DatabaseFileRepository extends JpaRepository<DatabaseFile, Long> {
}