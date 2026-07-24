import { useCallback, useRef, useState } from "react";

const ALLOWED_EXTENSIONS = [".sql", ".sqlite", ".db"];
const MAX_FILE_SIZE_MB = 50;

const styles = {
    page: {
        background: "#f6f7fb",
        minHeight: "100vh",
    },
    badge: {
        width: 56,
        height: 56,
        borderRadius: 16,
        background: "#eef1ff",
        color: "#4f5fe0",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.5rem",
    },
    card: {
        borderRadius: 20,
    },
    dropzone: {
        border: "2px dashed #d5d9ea",
        background: "#fbfbfe",
        cursor: "pointer",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
    },
    dropzoneDragging: {
        borderColor: "#4f5fe0",
        background: "#eef1ff",
    },
    dropzoneHasFile: {
        borderStyle: "solid",
        borderColor: "#c7cdf5",
    },
    dropzoneIcon: {
        fontSize: "2.25rem",
        color: "#4f5fe0",
    },
    hint: {
        fontSize: "0.8125rem",
        color: "#8b90a3",
    },
    fileRow: {
        background: "#f8f9fc",
        border: "1px solid #eaecf5",
    },
    fileIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#eef1ff",
        color: "#4f5fe0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
    },
};

function formatFileSize(bytes) {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );
    const value = bytes / Math.pow(1024, exponent);
    return `${exponent === 0 ? value : value.toFixed(1)} ${units[exponent]}`;
}

function getFileExtension(fileName) {
    const parts = fileName.toLowerCase().split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
}

function ImportDatabasePage({ onImport, onCreateNew }) {
    const fileInputRef = useRef(null);

    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importSuccess, setImportSuccess] = useState(false);

    const dragCounter = useRef(0);

    const validateFile = (file) => {
        const extension = getFileExtension(file.name);

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            return `"${file.name}" isn't a supported file type. Use ${ALLOWED_EXTENSIONS.join(", ")} instead.`;
        }

        const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
        if (file.size > maxBytes) {
            return `"${file.name}" is ${formatFileSize(file.size)}, which is over the ${MAX_FILE_SIZE_MB} MB limit.`;
        }

        return null;
    };

    const handleFileSelect = useCallback((file) => {
        if (!file) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            setSelectedFile(null);
            return;
        }

        setError(null);
        setImportSuccess(false);
        setSelectedFile(file);
    }, []);

    const handleInputChange = (event) => {
        handleFileSelect(event.target.files[0]);
        event.target.value = "";
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleDragEnter = (event) => {
        event.preventDefault();
        dragCounter.current += 1;
        setIsDragging(true);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleDragLeave = (event) => {
        event.preventDefault();
        dragCounter.current -= 1;
        if (dragCounter.current <= 0) {
            dragCounter.current = 0;
            setIsDragging(false);
        }
    };

    const handleDrop = (event) => {
        event.preventDefault();
        dragCounter.current = 0;
        setIsDragging(false);
        handleFileSelect(event.dataTransfer.files[0]);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setError(null);
        setImportSuccess(false);
    };

    const handleImportDatabase = async () => {
        if (!selectedFile) {
            setError("Select a database file before importing.");
            return;
        }

        setIsImporting(true);
        setError(null);

        try {
            if (onImport) {
                await onImport(selectedFile);
            }
            setImportSuccess(true);
        } catch (err) {
            setError(
                err?.message ||
                "Something went wrong while importing this file. Try again."
            );
        } finally {
            setIsImporting(false);
        }
    };

    const dropzoneStyle = {
        ...styles.dropzone,
        ...(isDragging ? styles.dropzoneDragging : {}),
        ...(selectedFile ? styles.dropzoneHasFile : {}),
    };

    return (
        <div className="py-5" style={styles.page}>
            <div className="container" style={{ maxWidth: "640px" }}>
                {/* Header */}
                <div className="text-center mb-4">
                    <div className="mb-3" style={styles.badge}>
                        <i className="bi bi-database" aria-hidden="true" />
                    </div>
                    <h1 className="h3 fw-semibold mb-2">Import an existing database</h1>
                    <p className="text-secondary mb-0">
                        Bring your schema into Schema Platform to start mapping tables,
                        relationships, and diagrams.
                    </p>
                </div>

                {/* Card */}
                <div className="card border-0 shadow-sm" style={styles.card}>
                    <div className="card-body p-4 p-md-5">
                        {/* Upload zone */}
                        <div
                            className="text-center rounded-3 p-4 p-md-5"
                            style={dropzoneStyle}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            role="button"
                            tabIndex={0}
                            onClick={handleBrowseClick}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" || event.key === " ") {
                                    event.preventDefault();
                                    handleBrowseClick();
                                }
                            }}
                            aria-label="Drag and drop a database file, or press enter to browse"
                        >
                            <div className="mb-3" style={styles.dropzoneIcon}>
                                <i className="bi bi-cloud-arrow-up" aria-hidden="true" />
                            </div>

                            <h2 className="h5 fw-semibold mb-1">
                                Drag &amp; drop your database file
                            </h2>
                            <p className="text-secondary mb-3">or click to browse</p>

                            <button
                                type="button"
                                className="btn btn-outline-primary px-4"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    handleBrowseClick();
                                }}
                            >
                                Browse files
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ALLOWED_EXTENSIONS.join(",")}
                                onChange={handleInputChange}
                                hidden
                            />

                            <p className="mt-3 mb-0" style={styles.hint}>
                                Supported formats: {ALLOWED_EXTENSIONS.join(", ")} · up to{" "}
                                {MAX_FILE_SIZE_MB} MB
                            </p>
                        </div>

                        {/* Error */}
                        {error && (
                            <div
                                className="alert alert-danger d-flex align-items-start gap-2 mt-3 mb-0"
                                role="alert"
                            >
                                <i className="bi bi-exclamation-triangle-fill mt-1" />
                                <div>{error}</div>
                            </div>
                        )}

                        {/* Success */}
                        {importSuccess && (
                            <div
                                className="alert alert-success d-flex align-items-start gap-2 mt-3 mb-0"
                                role="status"
                            >
                                <i className="bi bi-check-circle-fill mt-1" />
                                <div>
                                    <strong>{selectedFile?.name}</strong> imported
                                    successfully.
                                </div>
                            </div>
                        )}

                        {/* Selected file */}
                        {selectedFile && (
                            <div
                                className="d-flex align-items-center justify-content-between rounded-3 p-3 mt-3"
                                style={styles.fileRow}
                            >
                                <div className="d-flex align-items-center gap-3 text-truncate">
                                    <div
                                        className="flex-shrink-0"
                                        style={styles.fileIcon}
                                    >
                                        <i className="bi bi-file-earmark-binary" />
                                    </div>
                                    <div className="text-truncate">
                                        <div className="fw-semibold text-truncate">
                                            {selectedFile.name}
                                        </div>
                                        <div className="small text-secondary">
                                            {formatFileSize(selectedFile.size)}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-sm btn-link text-danger text-decoration-none flex-shrink-0"
                                    onClick={handleRemoveFile}
                                    disabled={isImporting}
                                >
                                    Remove
                                </button>
                            </div>
                        )}

                        {/* Import button */}
                        <button
                            type="button"
                            className="btn btn-primary w-100 py-2 mt-4 d-flex align-items-center justify-content-center gap-2"
                            onClick={handleImportDatabase}
                            disabled={!selectedFile || isImporting}
                        >
                            {isImporting ? (
                                <>
                                    <span
                                        className="spinner-border spinner-border-sm"
                                        aria-hidden="true"
                                    />
                                    Importing…
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-upload" aria-hidden="true" />
                                    Import database
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="d-flex align-items-center gap-3 my-4">
                    <hr className="flex-grow-1 my-0" />
                    <span className="text-secondary small text-uppercase">or</span>
                    <hr className="flex-grow-1 my-0" />
                </div>

                {/* Create new database */}
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 text-center">
                        <h2 className="h6 fw-semibold mb-1">Don't have a database yet?</h2>
                        <p className="text-secondary mb-3">
                            Create a new database and design your tables directly in
                            Schema Platform.
                        </p>
                        <button
                            type="button"
                            className="btn btn-outline-secondary px-4"
                            onClick={onCreateNew}
                        >
                            <i className="bi bi-plus-lg me-2" aria-hidden="true" />
                            Create database
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ImportDatabasePage;