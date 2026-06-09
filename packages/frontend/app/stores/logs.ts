export interface LogEntry {
    _id: string;
    level: string;
    message: string;
    context?: string;
    service?: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface LogsResponse {
    logs: LogEntry[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export const useLogsStore = defineStore('logs', () => {
    const backendLogs = ref<LogEntry[]>([]);
    const frontendLogs = ref<LogEntry[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const backendFilters = reactive({
        level: 'all',
        service: '',
        page: 1,
        pageSize: 50,
    });

    const frontendFilters = reactive({
        level: 'all',
        page: 1,
        pageSize: 50,
    });

    const backendTotalCount = ref(0);
    const backendTotalPages = ref(0);
    const frontendTotalCount = ref(0);
    const frontendTotalPages = ref(0);

    const backendServices = ref<string[]>([]);

    async function fetchBackendLogs() {
        loading.value = true;
        error.value = null;

        try {
            const params = new URLSearchParams({
                page: String(backendFilters.page),
                pageSize: String(backendFilters.pageSize),
            });
            if (backendFilters.level !== 'all') params.set('level', backendFilters.level);
            if (backendFilters.service) params.set('service', backendFilters.service);

            const res = await fetch(`/api/debug/logs/backend?${params}`);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }

            const data: LogsResponse = await res.json();
            backendLogs.value = data.logs;
            backendTotalCount.value = data.totalCount;
            backendTotalPages.value = data.totalPages;

            const services = new Set<string>();
            for (const log of data.logs) {
                if (log.service) services.add(log.service);
            }
            backendServices.value = [...services].sort();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de connexion';
        } finally {
            loading.value = false;
        }
    }

    async function fetchFrontendLogs() {
        loading.value = true;
        error.value = null;

        try {
            const params = new URLSearchParams({
                page: String(frontendFilters.page),
                pageSize: String(frontendFilters.pageSize),
            });
            if (frontendFilters.level !== 'all') params.set('level', frontendFilters.level);

            const res = await fetch(`/api/debug/logs/frontend?${params}`);
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }

            const data: LogsResponse = await res.json();
            frontendLogs.value = data.logs;
            frontendTotalCount.value = data.totalCount;
            frontendTotalPages.value = data.totalPages;
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de connexion';
        } finally {
            loading.value = false;
        }
    }

    async function clearBackendLogs() {
        try {
            await fetch('/api/debug/logs/backend', { method: 'DELETE' });
            await fetchBackendLogs();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de suppression';
        }
    }

    async function clearFrontendLogs() {
        try {
            await fetch('/api/debug/logs/frontend', { method: 'DELETE' });
            await fetchFrontendLogs();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de suppression';
        }
    }

    return {
        backendLogs,
        frontendLogs,
        loading,
        error,
        backendFilters,
        frontendFilters,
        backendTotalCount,
        backendTotalPages,
        frontendTotalCount,
        frontendTotalPages,
        backendServices,
        fetchBackendLogs,
        fetchFrontendLogs,
        clearBackendLogs,
        clearFrontendLogs,
    };
});
