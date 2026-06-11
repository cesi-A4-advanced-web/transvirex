<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold tracking-tight">Bonjour, {{ driverFirstName }} 👋</h2>
                <p class="text-muted-foreground text-sm mt-1">
                    {{ todayLabel }} — {{ totalAssigned }} livraisons assignées aujourd'hui
                </p>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card v-for="kpi in kpis" :key="kpi.label">
                        <CardHeader class="pb-2">
                            <CardDescription>{{ kpi.label }}</CardDescription>
                            <CardTitle class="text-2xl">{{ kpi.value }}</CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <Card class="xl:col-span-2">
                        <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle class="text-base">Ma tournée du jour</CardTitle>
                            <NuxtLink to="/livreur/livraisons" class="text-xs text-primary hover:underline"
                                >Voir détails →</NuxtLink
                            >
                        </CardHeader>
                        <CardContent>
                            <div v-if="myDeliveries.length === 0" class="text-center text-muted-foreground text-sm py-6">
                                Aucune livraison prévue aujourd'hui
                            </div>
                            <div v-else class="relative">
                                <div class="absolute left-4 top-3 bottom-3 w-0.5 bg-border" />
                                <div
                                    v-for="(delivery, i) in myDeliveries"
                                    :key="delivery.id"
                                    class="relative flex gap-4 mb-5 last:mb-0"
                                >
                                    <div
                                        class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold border-2"
                                        :class="dotClass(delivery.status)"
                                    >
                                        {{ i + 1 }}
                                    </div>
                                    <div
                                        class="flex-1 rounded-lg p-3 border"
                                        :class="
                                            delivery.status === 'En cours'
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-border bg-muted/30'
                                        "
                                    >
                                        <div class="flex items-start justify-between gap-2">
                                            <div>
                                                <p class="text-sm font-semibold">
                                                    {{ delivery.address }}
                                                </p>
                                                <p class="text-xs text-muted-foreground mt-0.5">
                                                    {{ delivery.client }}
                                                </p>
                                            </div>
                                            <div class="flex flex-col items-end gap-1 flex-shrink-0">
                                                <Badge :class="statusClass(delivery.status)">{{ delivery.status }}</Badge>
                                                <span class="text-xs text-muted-foreground font-mono">{{
                                                    delivery.time
                                                }}</span>
                                            </div>
                                        </div>
                                        <div
                                            v-if="delivery.note"
                                            class="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1"
                                        >
                                            ⚠ {{ delivery.note }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div class="space-y-4">
                        <Card>
                            <CardHeader class="flex-row items-center gap-2 space-y-0 pb-3">
                                <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                <CardTitle class="text-base">En cours</CardTitle>
                            </CardHeader>
                            <CardContent v-if="current" class="space-y-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                        <MapPin class="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold">
                                            {{ current.address }}
                                        </p>
                                        <p class="text-xs text-muted-foreground">
                                            {{ current.city }}
                                        </p>
                                    </div>
                                </div>
                                <div class="space-y-2 text-xs">
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">Client</span
                                        ><span class="font-medium">{{ current.client }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">Référence</span
                                        ><span class="font-mono text-muted-foreground">{{ current.ref }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">Heure prévue</span
                                        ><span class="font-semibold text-blue-600">{{ current.time }}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-muted-foreground">Colis</span
                                        ><span class="font-medium">{{ current.parcels }} colis</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardContent v-else>
                                <p class="text-sm text-muted-foreground text-center py-4">Aucune livraison en cours</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent class="p-4">
                                <div class="flex items-center gap-3 mb-3">
                                    <div
                                        class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold"
                                    >
                                        {{ driverFirstName.charAt(0) }}
                                    </div>
                                    <div>
                                        <p class="text-sm font-semibold">
                                            {{ driverFirstName }}
                                        </p>
                                        <p class="text-xs text-muted-foreground">Chauffeur · {{ driverReference }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                                    <span class="text-xs text-muted-foreground">Note moyenne</span>
                                    <div class="flex items-center gap-1">
                                        <span class="text-yellow-500 text-sm">★</span>
                                        <span class="text-sm font-bold">{{ ratingLabel }}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </template>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApi, type ApiDriverDashboard, type ApiDriverDashboardDelivery } from '@/composables/useApi';
import { Loader2, MapPin } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Livreur — Transvirex' });

const { get } = useApi();

const accessToken = useCookie('access_token');
/** Decode a JWT payload without validation. */
function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}
/** Decoded JWT payload from the access token. */
const payload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));
/** Driver's first name extracted from the JWT. */
const driverFirstName = computed(() => (payload.value?.firstname as string) || 'Livreur');

/** Formatted today's date in French locale. */
const todayLabel = computed(() =>
    new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }),
);

/** Map a backend delivery status to its French label. */
const STATUS_LABELS: Record<string, string> = {
    planned: 'Planifié',
    delivering: 'En cours',
    delivered: 'Livré',
    cancelled: 'Annulé',
    blocked: 'Bloqué',
    delayed: 'Retardé',
};

const loading = ref(true);
const dashboard = ref<ApiDriverDashboard | null>(null);

/** Format an ISO date into a HH:MM time label. */
function formatTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Driver business reference (e.g. DRV-001). */
const driverReference = computed(() => dashboard.value?.driver?.reference ?? '—');
/** Driver average rating label. */
const ratingLabel = computed(() => {
    const r = dashboard.value?.driver?.rating;
    return r != null ? r.toFixed(1) : '—';
});

const rawDeliveries = computed<ApiDriverDashboardDelivery[]>(() => dashboard.value?.deliveries ?? []);
/** Total deliveries assigned today. */
const totalAssigned = computed(() => rawDeliveries.value.length);

/** KPI metric cards for the driver dashboard. */
const kpis = computed(() => [
    { label: 'Assignées', value: String(totalAssigned.value) },
    { label: 'Terminées', value: String(rawDeliveries.value.filter((d) => d.status === 'delivered').length) },
    { label: 'En cours', value: String(rawDeliveries.value.filter((d) => d.status === 'delivering').length) },
    { label: 'Ma note', value: dashboard.value?.driver?.rating != null ? `${ratingLabel.value} ★` : '—' },
]);

/** Today's delivery stops mapped to the timeline view model. */
const myDeliveries = computed(() =>
    rawDeliveries.value.map((d) => ({
        id: d.id,
        ref: d.reference,
        address: d.address ?? '—',
        city: [d.postal_code, d.city].filter(Boolean).join(' ') || '—',
        client: d.customer ?? '—',
        status: STATUS_LABELS[d.status ?? ''] ?? d.status ?? '—',
        time: formatTime(d.due_date),
        note: d.notes ?? undefined,
        parcels: d.parcels,
    })),
);

/** Currently active delivery being performed (first one in `delivering` status). */
const current = computed(() => myDeliveries.value.find((d) => d.status === 'En cours') ?? null);

async function fetchData() {
    loading.value = true;
    try {
        dashboard.value = await get<ApiDriverDashboard>('/deliveries/mine');
    } catch (e) {
        console.error('Failed to load driver dashboard', e);
    } finally {
        loading.value = false;
    }
}

/** Return Tailwind classes for the timeline dot. */
function dotClass(status: string) {
    return (
        (
            {
                Livré: 'bg-green-500 border-green-300 text-white',
                'En cours': 'bg-blue-500 border-blue-300 text-white animate-pulse',
                Planifié: 'bg-background border-border text-muted-foreground',
                Retardé: 'bg-orange-500 border-orange-300 text-white',
                Bloqué: 'bg-red-500 border-red-300 text-white',
                Annulé: 'bg-gray-400 border-gray-300 text-white',
            } as Record<string, string>
        )[status] ?? 'bg-background border-border text-muted-foreground'
    );
}
/** Return Tailwind badge classes for a delivery status. */
function statusClass(s: string) {
    return (
        (
            {
                Livré: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
                'En cours': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                Planifié: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
                Retardé: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
                Bloqué: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
                Annulé: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[s] ?? 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
    );
}

onMounted(fetchData);
</script>
