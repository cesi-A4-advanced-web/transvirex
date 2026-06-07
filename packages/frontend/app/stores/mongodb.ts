import type { QueryResult, PagedResult } from './sql';

export const useMongoDBStore = defineStore('mongodb', () => {
    const command = ref('db.users.find({}).limit(10)');
    const results = ref<QueryResult | null>(null);
    const error = ref<string | null>(null);
    const loading = ref(false);

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

    const collections = ref<string[]>([]);
    const selectedCollection = ref<string | null>(null);
    const collectionData = ref<PagedResult | null>(null);
    const collectionPage = ref(1);
    const collectionPageSize = ref(25);
    const collectionsLoading = ref(false);
    const collectionDataLoading = ref(false);
    const collectionError = ref<string | null>(null);

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

    async function fetchCollectionData(collection: string, navigatePage?: number) {
        const page = navigatePage ?? collectionPage.value;
        collectionDataLoading.value = true;
        collectionError.value = null;
        selectedCollection.value = collection;
        try {
            const res = await fetch(`/api/debug/mongodb/collections/${encodeURIComponent(collection)}/data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ page, pageSize: collectionPageSize.value }),
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
