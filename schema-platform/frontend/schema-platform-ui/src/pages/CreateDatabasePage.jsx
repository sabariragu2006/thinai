import React, { useState } from "react";

const DATABASE_TYPES = [
    {
        value: ".sqlite",
        label: "SQLite (.sqlite)",
        icon: "bi-hdd-stack",
        hint: "Lightweight, file-based, great for local apps.",
    },
    {
        value: ".sql",
        label: "SQL (.sql)",
        icon: "bi-filetype-sql",
        hint: "Plain SQL script you can run against any engine.",
    },
    {
        value: ".mysql",
        label: "MySQL (.mysql)",
        icon: "bi-server",
        hint: "For projects backed by a MySQL server.",
    },
];

const NAME_PATTERN = /^[a-zA-Z0-9_-]+$/;
const MAX_DESCRIPTION_LENGTH = 240;

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
    backButton: {
        color: "#4f5fe0",
        fontWeight: 600,
    },
    card: {
        borderRadius: 20,
    },
    typeOption: {
        border: "1px solid #e3e5f0",
        borderRadius: 14,
        cursor: "pointer",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        background: "#fbfbfe",
    },
    typeOptionSelected: {
        borderColor: "#4f5fe0",
        background: "#eef1ff",
    },
    typeIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "#eef1ff",
        color: "#4f5fe0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.1rem",
        flexShrink: 0,
    },
    summaryCard: {
        background: "#f8f9fc",
        border: "1px solid #eaecf5",
        borderRadius: 14,
    },
    summaryIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        background: "#eef1ff",
        color: "#4f5fe0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
        flexShrink: 0,
    },
};

const CreateDatabasePage = ({ onBack, onDatabaseCreated }) => {
    const [databaseName, setDatabaseName] = useState("");
    const [databaseType, setDatabaseType] = useState(".sqlite");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const selectedType = DATABASE_TYPES.find((t) => t.value === databaseType);

    const validate = () => {
        const trimmedName = databaseName.trim();

        if (!trimmedName) {
            return "Please enter a database name.";
        }
        if (!NAME_PATTERN.test(trimmedName)) {
            return "Use only letters, numbers, hyphens, and underscores — no spaces or symbols.";
        }
        return "";
    };

    const handleCreateDatabase = async (e) => {
        e.preventDefault();

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError("");
        setIsCreating(true);

        const database = {
            name: databaseName.trim(),
            type: databaseType,
            description: description.trim(),
        };

        try {
            if (onDatabaseCreated) {
                await onDatabaseCreated(database);
            }
        } catch (err) {
            setError(
                err?.message || "Couldn't create the database. Please try again."
            );
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="py-5" style={styles.page}>
            <div className="container" style={{ maxWidth: "640px" }}>
                {/* Back link */}
                <button
                    type="button"
                    className="btn btn-link p-0 mb-4 text-decoration-none d-inline-flex align-items-center gap-1"
                    style={styles.backButton}
                    onClick={onBack}
                >
                    <i className="bi bi-arrow-left" aria-hidden="true" />
                    Back
                </button>

                {/* Header */}
                <div className="text-center mb-4">
                    <div className="mb-3" style={styles.badge}>
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                    </div>
                    <h1 className="h3 fw-semibold mb-2">Create a new database</h1>
                    <p className="text-secondary mb-0">
                        Set it up now and start designing your schema in Schema
                        Platform.
                    </p>
                </div>

                {/* Form card */}
                <div className="card border-0 shadow-sm" style={styles.card}>
                    <div className="card-body p-4 p-md-5">
                        <form onSubmit={handleCreateDatabase} noValidate>
                            {/* Database name */}
                            <div className="mb-4">
                                <label
                                    htmlFor="databaseName"
                                    className="form-label fw-semibold"
                                >
                                    Database name
                                </label>
                                <input
                                    id="databaseName"
                                    type="text"
                                    className={`form-control form-control-lg ${
                                        error && !databaseName.trim()
                                            ? "is-invalid"
                                            : ""
                                    }`}
                                    placeholder="e.g. inventory_db"
                                    value={databaseName}
                                    onChange={(e) => {
                                        setDatabaseName(e.target.value);
                                        if (error) setError("");
                                    }}
                                    autoFocus
                                />
                                <div className="form-text">
                                    Letters, numbers, hyphens, and underscores only.
                                </div>
                            </div>

                            {/* Database type */}
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    Database type
                                </label>
                                <div className="d-flex flex-column gap-2">
                                    {DATABASE_TYPES.map((type) => {
                                        const isSelected =
                                            databaseType === type.value;
                                        return (
                                            <div
                                                key={type.value}
                                                role="radio"
                                                aria-checked={isSelected}
                                                tabIndex={0}
                                                className="d-flex align-items-center gap-3 p-3"
                                                style={{
                                                    ...styles.typeOption,
                                                    ...(isSelected
                                                        ? styles.typeOptionSelected
                                                        : {}),
                                                }}
                                                onClick={() =>
                                                    setDatabaseType(type.value)
                                                }
                                                onKeyDown={(e) => {
                                                    if (
                                                        e.key === "Enter" ||
                                                        e.key === " "
                                                    ) {
                                                        e.preventDefault();
                                                        setDatabaseType(
                                                            type.value
                                                        );
                                                    }
                                                }}
                                            >
                                                <div style={styles.typeIcon}>
                                                    <i
                                                        className={`bi ${type.icon}`}
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="fw-semibold">
                                                        {type.label}
                                                    </div>
                                                    <div className="small text-secondary">
                                                        {type.hint}
                                                    </div>
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="form-check-input mt-0"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        setDatabaseType(
                                                            type.value
                                                        )
                                                    }
                                                    aria-label={type.label}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-baseline">
                                    <label
                                        htmlFor="description"
                                        className="form-label fw-semibold"
                                    >
                                        Description{" "}
                                        <span className="text-secondary fw-normal">
                                            (optional)
                                        </span>
                                    </label>
                                    <span className="small text-secondary">
                                        {description.length}/
                                        {MAX_DESCRIPTION_LENGTH}
                                    </span>
                                </div>
                                <textarea
                                    id="description"
                                    className="form-control"
                                    rows="4"
                                    placeholder="What is this database for?"
                                    value={description}
                                    maxLength={MAX_DESCRIPTION_LENGTH}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    className="alert alert-danger d-flex align-items-start gap-2"
                                    role="alert"
                                >
                                    <i className="bi bi-exclamation-triangle-fill mt-1" />
                                    <div>{error}</div>
                                </div>
                            )}

                            {/* Summary */}
                            <div
                                className="d-flex align-items-center gap-3 p-3 mb-4"
                                style={styles.summaryCard}
                            >
                                <div style={styles.summaryIcon}>
                                    <i
                                        className={`bi ${selectedType.icon}`}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="text-truncate">
                                    <div className="fw-semibold text-truncate">
                                        {databaseName.trim() || "Untitled database"}
                                    </div>
                                    <div className="small text-secondary">
                                        {selectedType.label}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="d-flex gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary flex-grow-1 py-2"
                                    onClick={onBack}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-grow-1 py-2 d-flex align-items-center justify-content-center gap-2"
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <>
                                            <span
                                                className="spinner-border spinner-border-sm"
                                                aria-hidden="true"
                                            />
                                            Creating…
                                        </>
                                    ) : (
                                        <>
                                            <i
                                                className="bi bi-check-lg"
                                                aria-hidden="true"
                                            />
                                            Create database
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDatabasePage;