/** Represents the health status of a single backend service. */
export interface ServiceHealth {
    /** Display name of the service. */
    name: string;
    /** Health check endpoint URL. */
    url: string;
    /** Current health status. */
    status: 'initializing' | 'pending' | 'ok' | 'error';
    /** Response time in milliseconds, or null if not checked. */
    responseTime: number | null;
    /** Additional detail about the health status. */
    detail: string | null;
}

/**
 * Pinia store for monitoring backend service health.
 * Provides reactive state and actions to check all defined services.
 */
export const useHealthStore = defineStore('health', () => {
    /** List of services with their current health status. */
    const services = ref<ServiceHealth[]>([
        {
            name: 'API Gateway',
            url: '/api/gateway/health',
            status: 'initializing',
            responseTime: null,
            detail: null,
        },
        {
            name: 'Auth Service',
            url: '/api/auth/health',
            status: 'initializing',
            responseTime: null,
            detail: null,
        },
        {
            name: 'Billing Service',
            url: '/api/billing/health',
            status: 'initializing',
            responseTime: null,
            detail: null,
        },
        {
            name: 'Stock Service',
            url: '/api/stock/health',
            status: 'initializing',
            responseTime: null,
            detail: null,
        },
        {
            name: 'Delivery Service',
            url: '/api/delivery/health',
            status: 'initializing',
            responseTime: null,
            detail: null,
        },
        {
            name: 'Users Service',
            url: '/api/users/health',
            status: 'initializing',
            responseTime: null,
            detail: null,
        },
    ]);

    /** Whether a health check is currently running. */
    const loading = ref(false);
    /** Timestamp of the last health check, or null. */
    const lastChecked = ref<string | null>(null);

    /** Number of services currently reporting OK status. */
    const servicesOk = computed(() => services.value.filter((s) => s.status === 'ok').length);
    /** Number of services currently reporting an error. */
    const servicesError = computed(() => services.value.filter((s) => s.status === 'error').length);

    /**
     * Check the health of a single service.
     * Updates the service's status, response time, and detail fields.
     */
    async function checkOne(service: ServiceHealth) {
        if (service.status === 'pending') return;

        service.status = 'pending';
        service.responseTime = null;
        service.detail = null;

        const start = Date.now();
        try {
            const res = await fetch(service.url);
            service.responseTime = Date.now() - start;
            const body = await res.json().catch(() => null);
            service.status = res.ok ? 'ok' : 'error';
            service.detail = body ? JSON.stringify(body) : String(res.status);
        } catch (e: any) {
            service.responseTime = Date.now() - start;
            service.status = 'error';
            service.detail = e?.message ?? 'Unreachable';
        }
    }

    /**
     * Check the health of all defined services concurrently.
     * Updates `lastChecked` with the current time when complete.
     */
    async function checkAll() {
        if (loading.value) return;

        loading.value = true;
        await Promise.all(services.value.map(checkOne));
        loading.value = false;
        lastChecked.value = new Date().toLocaleTimeString('fr-FR');
    }

    return {
        services,
        loading,
        lastChecked,
        servicesOk,
        servicesError,
        checkAll,
    };
});
