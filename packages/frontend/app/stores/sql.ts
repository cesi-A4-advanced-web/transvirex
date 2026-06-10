/** Paginated result from database queries. */
export interface PagedResult {
    /** Column names. */
    columns: string[];
    /** Row data arrays. */
    rows: any[];
    /** Total number of matching rows. */
    totalCount: number;
    /** Current page number. */
    page: number;
    /** Number of rows per page. */
    pageSize: number;
    /** Total number of pages. */
    totalPages: number;
}

/** Information about a database table. */
export interface TableInfo {
    /** Table name. */
    table_name: string;
    /** Schema name (e.g. public). */
    table_schema: string;
}

/** A saved SQL query stored in localStorage. */
export interface SavedQuery {
    /** Unique identifier. */
    id: string;
    /** User-friendly name. */
    name: string;
    /** The SQL query text. */
    query: string;
    /** ISO timestamp of creation or last update. */
    createdAt: string;
}

/** Result from a single SQL query execution. */
export interface QueryResult {
    /** Column names. */
    columns: string[];
    /** Row data arrays. */
    rows: any[];
    /** Number of rows returned. */
    rowCount: number;
}

/** localStorage key for persisted saved queries. */
const STORAGE_KEY = 'transvirex:saved-queries';

/**
 * Load saved queries from localStorage.
 */
function loadSaved(): SavedQuery[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Persist saved queries to localStorage.
 */
function persistSaved(queries: SavedQuery[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
}

/**
 * Pinia store for the PostgreSQL debug console.
 * Provides SQL query execution, saved query management, and table browsing.
 */
export const useSqlStore = defineStore('sql', () => {
    /** The SQL query string to execute. */
    const query = ref('SELECT * FROM "User" LIMIT 10');
    /** Results from the last query execution. */
    const results = ref<QueryResult | null>(null);
    /** Error message from the last failed operation. */
    const error = ref<string | null>(null);
    /** Whether a query is currently being executed. */
    const loading = ref(false);
    /** List of saved queries loaded from localStorage. */
    const savedQueries = ref<SavedQuery[]>(loadSaved());

    /**
     * Execute the current SQL query against the debug API.
     * Updates results or sets error on failure.
     */
    async function execute() {
        loading.value = true;
        error.value = null;
        results.value = null;

        try {
            const res = await fetch('/api/debug/postgresql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query.value }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }

            results.value = await res.json();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de connexion';
        } finally {
            loading.value = false;
        }
    }

    /**
     * Save or update the current query with a given name.
     * If a query with the same name exists, it is updated.
     */
    function saveQuery(name: string) {
        const existing = savedQueries.value.find((q) => q.name === name);
        if (existing) {
            existing.query = query.value;
            existing.createdAt = new Date().toISOString();
        } else {
            savedQueries.value.push({
                id: crypto.randomUUID(),
                name,
                query: query.value,
                createdAt: new Date().toISOString(),
            });
        }
        persistSaved(savedQueries.value);
    }

    /**
     * Load a saved query by ID into the query editor.
     */
    function loadQuery(id: string) {
        const saved = savedQueries.value.find((q) => q.id === id);
        if (saved) {
            query.value = saved.query;
        }
    }

    /**
     * Delete a saved query by ID.
     */
    function deleteQuery(id: string) {
        savedQueries.value = savedQueries.value.filter((q) => q.id !== id);
        persistSaved(savedQueries.value);
    }

    /**
     * Rename a saved query.
     */
    function renameQuery(id: string, newName: string) {
        const saved = savedQueries.value.find((q) => q.id === id);
        if (saved) {
            saved.name = newName;
            persistSaved(savedQueries.value);
        }
    }

    /** List of all database tables. */
    const tables = ref<TableInfo[]>([]);
    /** Currently selected table name. */
    const selectedTable = ref<string | null>(null);
    /** Paginated data for the selected table. */
    const tableData = ref<PagedResult | null>(null);
    /** Current page for table data browsing. */
    const tablePage = ref(1);
    /** Number of rows per page for table browsing. */
    const tablePageSize = ref(25);
    /** Whether tables list is loading. */
    const tablesLoading = ref(false);
    /** Whether table data is loading. */
    const tableDataLoading = ref(false);
    /** Error message from table operations. */
    const tableError = ref<string | null>(null);

    /**
     * Fetch the list of all database tables.
     */
    async function fetchTables() {
        tablesLoading.value = true;
        tableError.value = null;
        try {
            const res = await fetch('/api/debug/postgresql/tables');
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }
            const data = await res.json();
            tables.value = data.tables ?? [];
        } catch (e: any) {
            tableError.value = e?.message ?? 'Erreur de connexion';
        } finally {
            tablesLoading.value = false;
        }
    }

    /**
     * Fetch paginated data for a specific table.
     * @param table - The table name.
     * @param navigatePage - Optional page number to navigate to.
     */
    async function fetchTableData(table: string, navigatePage?: number) {
        const page = navigatePage ?? tablePage.value;
        tableDataLoading.value = true;
        tableError.value = null;
        selectedTable.value = table;
        try {
            const res = await fetch(`/api/debug/postgresql/tables/${encodeURIComponent(table)}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page,
                    pageSize: tablePageSize.value,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }
            const data = await res.json();
            tableData.value = data;
            tablePage.value = data.page;
        } catch (e: any) {
            tableError.value = e?.message ?? 'Erreur de connexion';
        } finally {
            tableDataLoading.value = false;
        }
    }

    /**
     * Navigate to a specific page in the currently selected table.
     */
    function goToTablePage(page: number) {
        if (!selectedTable.value) return;
        fetchTableData(selectedTable.value, page);
    }

    return {
        query,
        results,
        error,
        loading,
        savedQueries,
        execute,
        saveQuery,
        loadQuery,
        deleteQuery,
        renameQuery,
        tables,
        selectedTable,
        tableData,
        tablePage,
        tablePageSize,
        tablesLoading,
        tableDataLoading,
        tableError,
        fetchTables,
        fetchTableData,
        goToTablePage,
    };
});

