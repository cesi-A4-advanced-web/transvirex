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
    };
});
