export interface ServiceHealth {
    name: string;
    url: string;
    status: 'initializing' | 'pending' | 'ok' | 'error';
    responseTime: number | null;
    detail: string | null;
}

export const useHealthStore = defineStore('health', () => {
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

    const loading = ref(false);
    const lastChecked = ref<string | null>(null);

    const servicesOk = computed(
        () => services.value.filter((s) => s.status === 'ok').length,
    );
    const servicesError = computed(
        () => services.value.filter((s) => s.status === 'error').length,
    );

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
