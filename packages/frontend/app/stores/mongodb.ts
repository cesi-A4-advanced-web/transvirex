import type { QueryResult, PagedResult } from './sql';

/**
 * Pinia store for the MongoDB debug console.
 * Provides MongoDB command execution and collection browsing.
 */
export const useMongoDBStore = defineStore('mongodb', () => {
    /** The MongoDB command string to execute. */
    const command = ref('db.users.find({}).limit(10)');
    /** Results from the last command execution. */
    const results = ref<QueryResult | null>(null);
    /** Error message from the last failed operation. */
    const error = ref<string | null>(null);
    /** Whether a command is currently being executed. */
    const loading = ref(false);

    /**
     * Execute the current MongoDB command against the debug API.
     * Updates results or sets error on failure.
     */
    async function execute() {
        loading.value = true;
        error.value = null;
        results.value = null;

        try {
            const res = await fetch('/api/debug/mongodb', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command.value }),
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

    /** List of all MongoDB collection names. */
    const collections = ref<string[]>([]);
    /** Currently selected collection name. */
    const selectedCollection = ref<string | null>(null);
    /** Paginated data for the selected collection. */
    const collectionData = ref<PagedResult | null>(null);
    /** Current page for collection data browsing. */
    const collectionPage = ref(1);
    /** Number of items per page for collection browsing. */
    const collectionPageSize = ref(25);
    /** Whether collections list is loading. */
    const collectionsLoading = ref(false);
    /** Whether collection data is loading. */
    const collectionDataLoading = ref(false);
    /** Error message from collection operations. */
    const collectionError = ref<string | null>(null);

    /**
     * Fetch the list of all MongoDB collections.
     */
    async function fetchCollections() {
        collectionsLoading.value = true;
        collectionError.value = null;
        try {
            const res = await fetch('/api/debug/mongodb/collections');
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }
            const data = await res.json();
            collections.value = (data.collections ?? []).map((c: any) => c.name);
        } catch (e: any) {
            collectionError.value = e?.message ?? 'Erreur de connexion';
        } finally {
            collectionsLoading.value = false;
        }
    }

    /**
     * Fetch paginated data for a specific collection.
     * @param collection - The collection name.
     * @param navigatePage - Optional page number to navigate to.
     */
    async function fetchCollectionData(collection: string, navigatePage?: number) {
        const page = navigatePage ?? collectionPage.value;
        collectionDataLoading.value = true;
        collectionError.value = null;
        selectedCollection.value = collection;
        try {
            const res = await fetch(`/api/debug/mongodb/collections/${encodeURIComponent(collection)}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    page,
                    pageSize: collectionPageSize.value,
                }),
            });
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }
            const data = await res.json();
            collectionData.value = data;
            collectionPage.value = data.page;
        } catch (e: any) {
            collectionError.value = e?.message ?? 'Erreur de connexion';
        } finally {
            collectionDataLoading.value = false;
        }
    }

    /**
     * Navigate to a specific page in the currently selected collection.
     */
    function goToCollectionPage(page: number) {
        if (!selectedCollection.value) return;
        fetchCollectionData(selectedCollection.value, page);
    }

    return {
        command,
        results,
        error,
        loading,
        execute,
        collections,
        selectedCollection,
        collectionData,
        collectionPage,
        collectionPageSize,
        collectionsLoading,
        collectionDataLoading,
        collectionError,
        fetchCollections,
        fetchCollectionData,
        goToCollectionPage,
    };
});
