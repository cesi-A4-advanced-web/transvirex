/** A single log entry from any source. */
export interface LogEntry {
    /** Unique identifier. */
    _id: string;
    /** Severity level. */
    level: string;
    /** Log message. */
    message: string;
    /** Optional context or origin. */
    context?: string;
    /** Optional service name. */
    service?: string;
    /** ISO timestamp of the log entry. */
    timestamp: string;
    /** Optional structured metadata. */
    metadata?: Record<string, unknown>;
}

/** Paginated response from the logs API. */
export interface LogsResponse {
    /** Array of log entries for the current page. */
    logs: LogEntry[];
    /** Total number of matching log entries. */
    totalCount: number;
    /** Current page number. */
    page: number;
    /** Number of entries per page. */
    pageSize: number;
    /** Total number of pages. */
    totalPages: number;
}

/**
 * Pinia store for managing backend and frontend logs.
 * Provides paginated fetching, filtering, and clearing of logs.
 */
export const useLogsStore = defineStore('logs', () => {
    /** Backend server logs. */
    const backendLogs = ref<LogEntry[]>([]);
    /** Frontend client logs. */
    const frontendLogs = ref<LogEntry[]>([]);
    /** Whether a fetch operation is in progress. */
    const loading = ref(false);
    /** Error message from the last failed operation, or null. */
    const error = ref<string | null>(null);

    /** Filters applied to backend log queries. */
    const backendFilters = reactive({
        level: 'all',
        service: '',
        page: 1,
        pageSize: 50,
    });

    /** Filters applied to frontend log queries. */
    const frontendFilters = reactive({
        level: 'all',
        page: 1,
        pageSize: 50,
    });

    /** Total backend log count from the last response. */
    const backendTotalCount = ref(0);
    /** Total backend pages from the last response. */
    const backendTotalPages = ref(0);
    /** Total frontend log count from the last response. */
    const frontendTotalCount = ref(0);
    /** Total frontend pages from the last response. */
    const frontendTotalPages = ref(0);

    /** Unique list of service names found in backend logs. */
    const backendServices = ref<string[]>([]);

    /**
     * Fetch backend logs from the API using current filters.
     * Updates backend logs, pagination info, and available services.
     */
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

    /**
     * Fetch frontend logs from the API using current filters.
     * Updates frontend logs and pagination info.
     */
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

    /**
     * Delete all backend logs and refresh the list.
     */
    async function clearBackendLogs() {
        try {
            await fetch('/api/debug/logs/backend', { method: 'DELETE' });
            await fetchBackendLogs();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de suppression';
        }
    }

    /**
     * Delete all frontend logs and refresh the list.
     */
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
