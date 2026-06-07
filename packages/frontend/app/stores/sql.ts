export interface PagedResult {
    columns: string[];
    rows: any[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface TableInfo {
    table_name: string;
    table_schema: string;
}

export interface SavedQuery {
    id: string;
    name: string;
    query: string;
    createdAt: string;
}

export interface QueryResult {
    columns: string[];
    rows: any[];
    rowCount: number;
}

const STORAGE_KEY = 'transvirex:saved-queries';

function loadSaved(): SavedQuery[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function persistSaved(queries: SavedQuery[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
}

export const useSqlStore = defineStore('sql', () => {
    const query = ref('SELECT * FROM "User" LIMIT 10');
    const results = ref<QueryResult | null>(null);
    const error = ref<string | null>(null);
    const loading = ref(false);
    const savedQueries = ref<SavedQuery[]>(loadSaved());

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

    function loadQuery(id: string) {
        const saved = savedQueries.value.find((q) => q.id === id);
        if (saved) {
            query.value = saved.query;
        }
    }

    function deleteQuery(id: string) {
        savedQueries.value = savedQueries.value.filter((q) => q.id !== id);
        persistSaved(savedQueries.value);
    }

    function renameQuery(id: string, newName: string) {
        const saved = savedQueries.value.find((q) => q.id === id);
        if (saved) {
            saved.name = newName;
            persistSaved(savedQueries.value);
        }
    }

    const tables = ref<TableInfo[]>([]);
    const selectedTable = ref<string | null>(null);
    const tableData = ref<PagedResult | null>(null);
    const tablePage = ref(1);
    const tablePageSize = ref(25);
    const tablesLoading = ref(false);
    const tableDataLoading = ref(false);
    const tableError = ref<string | null>(null);

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

    async function fetchTableData(table: string, navigatePage?: number) {
        const page = navigatePage ?? tablePage.value;
        tableDataLoading.value = true;
        tableError.value = null;
        selectedTable.value = table;
        try {
            const res = await fetch(`/api/debug/postgresql/tables/${encodeURIComponent(table)}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page, pageSize: tablePageSize.value }),
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
