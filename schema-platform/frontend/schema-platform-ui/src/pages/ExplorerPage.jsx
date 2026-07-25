import React, { useMemo, useRef, useState } from "react";

const COLUMN_TYPES = [
    "INTEGER",
    "TEXT",
    "REAL",
    "BOOLEAN",
    "DATETIME",
    "BLOB",
];

let columnIdCounter = 0;
const nextColumnId = () => `col_${++columnIdCounter}`;

const makeColumn = (overrides = {}) => ({
    id: nextColumnId(),
    name: "",
    type: "INTEGER",
    primaryKey: false,
    notNull: false,
    unique: false,
    ...overrides,
});

const DEFAULT_TABLES = [
    {
        name: "users",
        rowCount: 128,
        columns: [
            makeColumn({ name: "id", type: "INTEGER", primaryKey: true, notNull: true }),
            makeColumn({ name: "name", type: "TEXT", notNull: true }),
            makeColumn({ name: "email", type: "TEXT", notNull: true, unique: true }),
            makeColumn({ name: "created_at", type: "DATETIME", notNull: true }),
        ],
    },
    {
        name: "products",
        rowCount: 342,
        columns: [
            makeColumn({ name: "id", type: "INTEGER", primaryKey: true, notNull: true }),
            makeColumn({ name: "title", type: "TEXT", notNull: true }),
            makeColumn({ name: "price", type: "REAL", notNull: true }),
        ],
    },
    {
        name: "orders",
        rowCount: 76,
        columns: [
            makeColumn({ name: "id", type: "INTEGER", primaryKey: true, notNull: true }),
            makeColumn({ name: "user_id", type: "INTEGER", notNull: true }),
            makeColumn({ name: "total", type: "REAL", notNull: true }),
            makeColumn({ name: "created_at", type: "DATETIME", notNull: true }),
        ],
    },
    {
        name: "customers",
        rowCount: 54,
        columns: [
            makeColumn({ name: "id", type: "INTEGER", primaryKey: true, notNull: true }),
            makeColumn({ name: "full_name", type: "TEXT", notNull: true }),
            makeColumn({ name: "phone", type: "TEXT" }),
        ],
    },
];

const styles = {
    page: {
        background: "#f6f7fb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    header: {
        background: "#ffffff",
        borderBottom: "1px solid #e9eaf2",
    },
    dbIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: "linear-gradient(135deg, #4f5fe0, #6f7ff0)",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.75rem",
        fontWeight: 700,
        letterSpacing: "0.03em",
        flexShrink: 0,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: "#2fb872",
        display: "inline-block",
    },
    sidebar: {
        width: 280,
        background: "#ffffff",
        borderRight: "1px solid #e9eaf2",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
    },
    addTableBtn: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: "#eef1ff",
        color: "#4f5fe0",
        border: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1rem",
    },
    sidebarItem: {
        border: "none",
        background: "transparent",
        borderRadius: 10,
        textAlign: "left",
        width: "100%",
        color: "#3d4152",
    },
    sidebarItemActive: {
        background: "#eef1ff",
        color: "#4f5fe0",
    },
    sidebarIconBox: {
        width: 26,
        height: 26,
        borderRadius: 7,
        background: "#f1f2f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "0.8rem",
        flexShrink: 0,
    },
    sidebarIconBoxActive: {
        background: "#dfe3ff",
        color: "#4f5fe0",
    },
    countBadge: {
        fontSize: "0.7rem",
        background: "#f1f2f8",
        color: "#7c8093",
        borderRadius: 20,
        padding: "1px 8px",
    },
    workspace: {
        flex: 1,
        minWidth: 0,
        overflow: "auto",
    },
    editorShell: {
        background: "#1e2030",
        borderRadius: 14,
        overflow: "hidden",
        border: "1px solid #2a2d42",
    },
    editorTopBar: {
        background: "#252842",
        padding: "8px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #2a2d42",
    },
    trafficDot: (color) => ({
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: color,
        display: "inline-block",
    }),
    editorBody: {
        display: "flex",
        fontFamily:
            "'Fira Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
        fontSize: "0.9rem",
        lineHeight: "1.6rem",
    },
    gutter: {
        background: "#1a1c2a",
        color: "#4d5170",
        textAlign: "right",
        padding: "12px 10px",
        userSelect: "none",
        minWidth: 44,
    },
    codeArea: {
        flex: 1,
        background: "#1e2030",
        color: "#e3e5f5",
        border: "none",
        outline: "none",
        resize: "none",
        padding: "12px 16px",
        fontFamily: "inherit",
        fontSize: "inherit",
        lineHeight: "inherit",
        width: "100%",
    },
    kbd: {
        background: "#2f3350",
        color: "#c7cbe8",
        borderRadius: 5,
        padding: "1px 6px",
        fontSize: "0.7rem",
        fontFamily: "ui-monospace, monospace",
    },
    resultPanel: {
        background: "#ffffff",
        border: "1px solid #e9eaf2",
        borderRadius: 14,
    },
    typeBadge: {
        fontSize: "0.7rem",
        fontFamily: "ui-monospace, monospace",
        background: "#eef1ff",
        color: "#4f5fe0",
        borderRadius: 6,
        padding: "2px 8px",
        fontWeight: 600,
    },
    pkBadge: {
        fontSize: "0.65rem",
        background: "#fff4e0",
        color: "#b8790a",
        borderRadius: 6,
        padding: "2px 6px",
        fontWeight: 700,
    },
    modalBackdrop: {
        position: "fixed",
        inset: 0,
        background: "rgba(20, 22, 40, 0.45)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "48px 16px",
        overflowY: "auto",
        zIndex: 1050,
    },
    modalCard: {
        background: "#fff",
        borderRadius: 18,
        width: "100%",
        maxWidth: 640,
    },
    columnRow: {
        border: "1px solid #eaecf5",
        borderRadius: 12,
        background: "#fbfbfe",
    },
};

function sqlPreviewFor(table) {
    if (!table.columns.length) return `CREATE TABLE ${table.name || "table_name"} (\n\n);`;
    const lines = table.columns
        .filter((c) => c.name.trim())
        .map((c) => {
            const parts = [`  ${c.name.trim()} ${c.type}`];
            if (c.primaryKey) parts.push("PRIMARY KEY");
            if (c.notNull && !c.primaryKey) parts.push("NOT NULL");
            if (c.unique && !c.primaryKey) parts.push("UNIQUE");
            return parts.join(" ");
        });
    return `CREATE TABLE ${table.name || "table_name"} (\n${lines.join(",\n")}\n);`;
}

function AddTableModal({ onClose, onCreate }) {
    const [name, setName] = useState("");
    const [columns, setColumns] = useState([
        makeColumn({ name: "id", type: "INTEGER", primaryKey: true, notNull: true }),
    ]);
    const [error, setError] = useState("");

    const updateColumn = (id, changes) => {
        setColumns((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...changes } : c))
        );
    };

    const removeColumn = (id) => {
        setColumns((prev) => prev.filter((c) => c.id !== id));
    };

    const addColumn = () => {
        setColumns((prev) => [...prev, makeColumn()]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const trimmedName = name.trim();
        if (!trimmedName) {
            setError("Give your table a name.");
            return;
        }
        const validColumns = columns.filter((c) => c.name.trim());
        if (validColumns.length === 0) {
            setError("Add at least one column.");
            return;
        }

        onCreate({
            name: trimmedName,
            rowCount: 0,
            columns: validColumns,
        });
    };

    const previewTable = { name: name.trim(), columns };

    return (
        <div
            style={styles.modalBackdrop}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="shadow-lg" style={styles.modalCard}>
                <form onSubmit={handleSubmit}>
                    <div className="d-flex align-items-center justify-content-between p-4 pb-3 border-bottom">
                        <div>
                            <h2 className="h5 fw-semibold mb-1">Create table</h2>
                            <p className="text-secondary small mb-0">
                                Define columns and Schema Platform will generate the
                                SQL for you.
                            </p>
                        </div>
                        <button
                            type="button"
                            className="btn-close"
                            aria-label="Close"
                            onClick={onClose}
                        />
                    </div>

                    <div className="p-4" style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <div className="mb-4">
                            <label className="form-label fw-semibold" htmlFor="tableName">
                                Table name
                            </label>
                            <input
                                id="tableName"
                                type="text"
                                className="form-control"
                                placeholder="e.g. invoices"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    if (error) setError("");
                                }}
                                autoFocus
                            />
                        </div>

                        <div className="d-flex align-items-center justify-content-between mb-2">
                            <label className="form-label fw-semibold mb-0">Columns</label>
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                                onClick={addColumn}
                            >
                                <i className="bi bi-plus-lg" />
                                Add column
                            </button>
                        </div>

                        <div className="d-flex flex-column gap-2 mb-4">
                            {columns.map((col) => (
                                <div
                                    key={col.id}
                                    className="p-3"
                                    style={styles.columnRow}
                                >
                                    <div className="d-flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm"
                                            placeholder="column_name"
                                            value={col.name}
                                            onChange={(e) =>
                                                updateColumn(col.id, {
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                        <select
                                            className="form-select form-select-sm"
                                            style={{ maxWidth: 140 }}
                                            value={col.type}
                                            onChange={(e) =>
                                                updateColumn(col.id, {
                                                    type: e.target.value,
                                                })
                                            }
                                        >
                                            {COLUMN_TYPES.map((t) => (
                                                <option key={t} value={t}>
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-link text-danger"
                                            onClick={() => removeColumn(col.id)}
                                            disabled={columns.length === 1}
                                            title="Remove column"
                                        >
                                            <i className="bi bi-trash3" />
                                        </button>
                                    </div>

                                    <div className="d-flex gap-3 flex-wrap">
                                        <div className="form-check form-check-sm">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`${col.id}-pk`}
                                                checked={col.primaryKey}
                                                onChange={(e) =>
                                                    updateColumn(col.id, {
                                                        primaryKey: e.target.checked,
                                                    })
                                                }
                                            />
                                            <label
                                                className="form-check-label small"
                                                htmlFor={`${col.id}-pk`}
                                            >
                                                Primary key
                                            </label>
                                        </div>
                                        <div className="form-check form-check-sm">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`${col.id}-nn`}
                                                checked={col.notNull}
                                                onChange={(e) =>
                                                    updateColumn(col.id, {
                                                        notNull: e.target.checked,
                                                    })
                                                }
                                            />
                                            <label
                                                className="form-check-label small"
                                                htmlFor={`${col.id}-nn`}
                                            >
                                                Not null
                                            </label>
                                        </div>
                                        <div className="form-check form-check-sm">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id={`${col.id}-uq`}
                                                checked={col.unique}
                                                onChange={(e) =>
                                                    updateColumn(col.id, {
                                                        unique: e.target.checked,
                                                    })
                                                }
                                            />
                                            <label
                                                className="form-check-label small"
                                                htmlFor={`${col.id}-uq`}
                                            >
                                                Unique
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="alert alert-danger py-2 small mb-3">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="form-label fw-semibold small text-secondary">
                                SQL preview
                            </label>
                            <pre
                                className="mb-0 p-3 rounded-3"
                                style={{
                                    background: "#1e2030",
                                    color: "#9fe3a0",
                                    fontSize: "0.8rem",
                                    fontFamily: "ui-monospace, monospace",
                                    whiteSpace: "pre-wrap",
                                }}
                            >
                                {sqlPreviewFor(previewTable)}
                            </pre>
                        </div>
                    </div>

                    <div className="d-flex gap-2 p-4 pt-3 border-top">
                        <button
                            type="button"
                            className="btn btn-outline-secondary flex-grow-1"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-grow-1">
                            Create table
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const ExplorerPage = ({ database, onBack, onRunQuery }) => {
    const [activeView, setActiveView] = useState("sql");
    const [tables, setTables] = useState(DEFAULT_TABLES);
    const [selectedTableName, setSelectedTableName] = useState(null);
    const [tableSubTab, setTableSubTab] = useState("data");
    const [searchTerm, setSearchTerm] = useState("");
    const [sqlQuery, setSqlQuery] = useState("SELECT *\nFROM users\nLIMIT 50;");
    const [isRunning, setIsRunning] = useState(false);
    const [queryResult, setQueryResult] = useState(null);
    const [showAddTableModal, setShowAddTableModal] = useState(false);

    const textareaRef = useRef(null);

    const selectedTable = tables.find((t) => t.name === selectedTableName);

    const filteredTables = useMemo(
        () =>
            tables.filter((t) =>
                t.name.toLowerCase().includes(searchTerm.toLowerCase())
            ),
        [tables, searchTerm]
    );

    const lineCount = sqlQuery.split("\n").length;

    const handleTableClick = (tableName) => {
        setSelectedTableName(tableName);
        setTableSubTab("data");
        setActiveView("table");
    };

    const handleSqlEditorClick = () => {
        setSelectedTableName(null);
        setActiveView("sql");
    };

    const handleCreateTable = (table) => {
        setTables((prev) => [...prev, table]);
        setShowAddTableModal(false);
        handleTableClick(table.name);
    };

    const handleRunQuery = async () => {
        setIsRunning(true);
        const startedAt = performance.now();
        try {
            if (onRunQuery) {
                const result = await onRunQuery(sqlQuery);
                setQueryResult({
                    ...result,
                    ms: Math.max(1, Math.round(performance.now() - startedAt)),
                });
            } else {
                // No backend wired up yet — surface that clearly instead of
                // pretending the query executed.
                setQueryResult({
                    notConnected: true,
                });
            }
        } catch (err) {
            setQueryResult({ error: err?.message || "Query failed." });
        } finally {
            setIsRunning(false);
        }
    };

    const handleEditorKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            handleRunQuery();
        }
    };

    return (
        <div style={styles.page}>
            {showAddTableModal && (
                <AddTableModal
                    onClose={() => setShowAddTableModal(false)}
                    onCreate={handleCreateTable}
                />
            )}

            {/* Header */}
            <header style={styles.header} className="px-4 py-3">
                <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
                            style={{ width: 34, height: 34, borderRadius: 9 }}
                            onClick={onBack}
                            title="Back"
                        >
                            <i className="bi bi-arrow-left" />
                        </button>

                        <div style={styles.dbIcon}>DB</div>

                        <div>
                            <div className="d-flex align-items-center gap-2">
                                <h2 className="h6 fw-semibold mb-0">
                                    {database?.name || "My Database"}
                                </h2>
                                <span
                                    className="badge rounded-pill text-bg-light border"
                                    style={{ fontSize: "0.7rem" }}
                                >
                                    {database?.type || ".sqlite"}
                                </span>
                            </div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                                <span style={styles.statusDot} />
                                <span className="small text-secondary">Connected</span>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                        <button
                            className={`btn btn-sm d-flex align-items-center gap-1 ${
                                activeView === "sql"
                                    ? "btn-primary"
                                    : "btn-outline-secondary"
                            }`}
                            onClick={handleSqlEditorClick}
                        >
                            <i className="bi bi-code-slash" />
                            SQL Editor
                        </button>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                            <i className="bi bi-arrow-clockwise" />
                            Refresh
                        </button>
                    </div>
                </div>
            </header>

            <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
                {/* Sidebar */}
                <aside style={styles.sidebar} className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div>
                            <h3 className="h6 fw-semibold mb-0">Explorer</h3>
                            <span className="small text-secondary">
                                {tables.length} table
                                {tables.length === 1 ? "" : "s"}
                            </span>
                        </div>
                        <button
                            type="button"
                            style={styles.addTableBtn}
                            onClick={() => setShowAddTableModal(true)}
                            title="Create table"
                        >
                            <i className="bi bi-plus-lg" />
                        </button>
                    </div>

                    <div className="input-group input-group-sm mb-3">
                        <span className="input-group-text bg-white border-end-0">
                            <i className="bi bi-search text-secondary" />
                        </span>
                        <input
                            type="text"
                            className="form-control border-start-0"
                            placeholder="Search tables…"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="text-secondary small fw-semibold mb-2 px-1">
                        TABLES
                    </div>

                    <div className="d-flex flex-column gap-1">
                        <button
                            type="button"
                            className="d-flex align-items-center gap-2 px-2 py-2"
                            style={{
                                ...styles.sidebarItem,
                                ...(activeView === "sql"
                                    ? styles.sidebarItemActive
                                    : {}),
                            }}
                            onClick={handleSqlEditorClick}
                        >
                            <span
                                style={{
                                    ...styles.sidebarIconBox,
                                    ...(activeView === "sql"
                                        ? styles.sidebarIconBoxActive
                                        : {}),
                                }}
                            >
                                <i className="bi bi-terminal" />
                            </span>
                            <span className="fw-medium small">SQL Editor</span>
                        </button>

                        {filteredTables.map((table) => {
                            const isActive =
                                activeView === "table" &&
                                selectedTableName === table.name;
                            return (
                                <button
                                    key={table.name}
                                    type="button"
                                    className="d-flex align-items-center gap-2 px-2 py-2"
                                    style={{
                                        ...styles.sidebarItem,
                                        ...(isActive
                                            ? styles.sidebarItemActive
                                            : {}),
                                    }}
                                    onClick={() => handleTableClick(table.name)}
                                >
                                    <span
                                        style={{
                                            ...styles.sidebarIconBox,
                                            ...(isActive
                                                ? styles.sidebarIconBoxActive
                                                : {}),
                                        }}
                                    >
                                        <i className="bi bi-table" />
                                    </span>
                                    <span className="small fw-medium text-truncate flex-grow-1 text-start">
                                        {table.name}
                                    </span>
                                    <span style={styles.countBadge}>
                                        {table.rowCount}
                                    </span>
                                </button>
                            );
                        })}

                        {filteredTables.length === 0 && (
                            <div className="text-center text-secondary small py-4">
                                No tables found
                            </div>
                        )}
                    </div>
                </aside>

                {/* Workspace */}
                <main style={styles.workspace} className="p-4">
                    {activeView === "sql" && (
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h2 className="h5 fw-semibold mb-1">SQL Editor</h2>
                                    <p className="text-secondary small mb-0">
                                        Write and execute SQL against{" "}
                                        <strong>{database?.name || "this database"}</strong>
                                    </p>
                                </div>
                                <button
                                    className="btn btn-primary d-flex align-items-center gap-2"
                                    onClick={handleRunQuery}
                                    disabled={isRunning}
                                >
                                    {isRunning ? (
                                        <span
                                            className="spinner-border spinner-border-sm"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <i className="bi bi-play-fill" />
                                    )}
                                    Run query
                                    <span style={styles.kbd}>⌘⏎</span>
                                </button>
                            </div>

                            <div style={styles.editorShell} className="mb-3">
                                <div style={styles.editorTopBar}>
                                    <div className="d-flex align-items-center gap-2">
                                        <span style={styles.trafficDot("#ff5f57")} />
                                        <span style={styles.trafficDot("#febc2e")} />
                                        <span style={styles.trafficDot("#28c840")} />
                                        <span
                                            className="small ms-2"
                                            style={{ color: "#8b8fb0" }}
                                        >
                                            query.sql
                                        </span>
                                    </div>
                                    <span className="small" style={{ color: "#6d7196" }}>
                                        {lineCount} line{lineCount === 1 ? "" : "s"}
                                    </span>
                                </div>
                                <div style={styles.editorBody}>
                                    <div style={styles.gutter}>
                                        {Array.from({ length: lineCount }).map((_, i) => (
                                            <div key={i}>{i + 1}</div>
                                        ))}
                                    </div>
                                    <textarea
                                        ref={textareaRef}
                                        style={styles.codeArea}
                                        rows={Math.max(6, lineCount)}
                                        value={sqlQuery}
                                        spellCheck="false"
                                        onChange={(e) => setSqlQuery(e.target.value)}
                                        onKeyDown={handleEditorKeyDown}
                                        placeholder="Write your SQL query here…"
                                    />
                                </div>
                            </div>

                            <div style={styles.resultPanel}>
                                <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
                                    <span className="small fw-semibold text-secondary">
                                        QUERY RESULT
                                    </span>
                                    <span className="small text-secondary">
                                        {isRunning
                                            ? "Running…"
                                            : queryResult?.ms
                                                ? `${queryResult.ms} ms`
                                                : "Ready"}
                                    </span>
                                </div>

                                {!queryResult && !isRunning && (
                                    <div className="text-center py-5 px-3">
                                        <div
                                            className="mx-auto mb-3 d-flex align-items-center justify-content-center"
                                            style={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 12,
                                                background: "#eef1ff",
                                                color: "#4f5fe0",
                                            }}
                                        >
                                            <i
                                                className="bi bi-lightning-charge"
                                                style={{ fontSize: "1.4rem" }}
                                            />
                                        </div>
                                        <h3 className="h6 fw-semibold mb-1">Run a query</h3>
                                        <p className="text-secondary small mb-0">
                                            Execute your SQL query to see the results here.
                                        </p>
                                    </div>
                                )}

                                {queryResult?.notConnected && (
                                    <div className="alert alert-warning m-3 mb-0 small">
                                        No backend is wired up to run this query yet. Pass an{" "}
                                        <code>onRunQuery</code> handler to connect one.
                                    </div>
                                )}

                                {queryResult?.error && (
                                    <div className="alert alert-danger m-3 mb-0 small">
                                        {queryResult.error}
                                    </div>
                                )}

                                {queryResult?.rows && (
                                    <div className="table-responsive">
                                        <table className="table table-sm mb-0">
                                            <thead>
                                            <tr>
                                                {queryResult.columns.map((col) => (
                                                    <th
                                                        key={col}
                                                        className="small text-secondary fw-semibold px-3"
                                                    >
                                                        {col}
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {queryResult.rows.map((row, i) => (
                                                <tr key={i}>
                                                    {queryResult.columns.map((col) => (
                                                        <td key={col} className="px-3 small">
                                                            {String(row[col])}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeView === "table" && selectedTable && (
                        <div>
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <h2 className="h5 fw-semibold mb-1">
                                        {selectedTable.name}
                                    </h2>
                                    <p className="text-secondary small mb-0">
                                        {selectedTable.rowCount} rows ·{" "}
                                        {selectedTable.columns.length} columns
                                    </p>
                                </div>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                                        <i className="bi bi-plus-lg" />
                                        Add row
                                    </button>
                                    <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
                                        <i className="bi bi-pencil" />
                                        Edit table
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1">
                                        <i className="bi bi-trash3" />
                                        Delete
                                    </button>
                                </div>
                            </div>

                            <ul className="nav nav-tabs mb-3">
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${
                                            tableSubTab === "data" ? "active" : ""
                                        }`}
                                        onClick={() => setTableSubTab("data")}
                                    >
                                        Data
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link ${
                                            tableSubTab === "structure" ? "active" : ""
                                        }`}
                                        onClick={() => setTableSubTab("structure")}
                                    >
                                        Structure
                                    </button>
                                </li>
                            </ul>

                            {tableSubTab === "data" && (
                                <div className="card border-0 shadow-sm">
                                    <div className="table-responsive">
                                        <table className="table table-hover mb-0">
                                            <thead className="table-light">
                                            <tr>
                                                <th className="small text-secondary">#</th>
                                                {selectedTable.columns.map((col) => (
                                                    <th key={col.id} className="small">
                                                        <div className="d-flex align-items-center gap-2">
                                                            {col.name}
                                                            {col.primaryKey && (
                                                                <span style={styles.pkBadge}>
                                                                        PK
                                                                    </span>
                                                            )}
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <tr>
                                                <td className="text-secondary small">1</td>
                                                {selectedTable.columns.map((col) => (
                                                    <td key={col.id} className="small text-secondary">
                                                        —
                                                    </td>
                                                ))}
                                            </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="text-center text-secondary small py-3 border-top">
                                        Connect a backend to load real rows for this table.
                                    </div>
                                </div>
                            )}

                            {tableSubTab === "structure" && (
                                <div className="card border-0 shadow-sm">
                                    <div className="table-responsive">
                                        <table className="table mb-0">
                                            <thead className="table-light">
                                            <tr>
                                                <th className="small">Column</th>
                                                <th className="small">Type</th>
                                                <th className="small">Not null</th>
                                                <th className="small">Unique</th>
                                                <th className="small">Key</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {selectedTable.columns.map((col) => (
                                                <tr key={col.id}>
                                                    <td className="fw-medium small">
                                                        {col.name}
                                                    </td>
                                                    <td>
                                                            <span style={styles.typeBadge}>
                                                                {col.type}
                                                            </span>
                                                    </td>
                                                    <td className="small">
                                                        {col.notNull ? (
                                                            <i className="bi bi-check-lg text-success" />
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="small">
                                                        {col.unique ? (
                                                            <i className="bi bi-check-lg text-success" />
                                                        ) : (
                                                            "—"
                                                        )}
                                                    </td>
                                                    <td className="small">
                                                        {col.primaryKey && (
                                                            <span style={styles.pkBadge}>
                                                                    PK
                                                                </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ExplorerPage;