<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Mes livraisons</h1>
                    <p class="text-muted-foreground text-sm mt-1">Historique et suivi de vos missions</p>
                </div>
                <Button
                    class="bg-primary-dark hover:bg-primary text-white gap-2 shrink-0"
                    :disabled="generatingPdf"
                    @click="downloadMission"
                >
                    <Loader2 v-if="generatingPdf" class="w-4 h-4 animate-spin" />
                    <FileDown v-else class="w-4 h-4" />
                    Ordre de mission du jour
                </Button>
            </div>

            <div class="flex flex-wrap gap-2">
                <Button
                    v-for="tab in tabs"
                    :key="tab.value"
                    :variant="activeTab === tab.value ? 'default' : 'outline'"
                    size="sm"
                    @click="activeTab = tab.value"
                    :class="
                        activeTab === tab.value ? 'bg-secondary hover:bg-secondary-dark text-white border-secondary' : ''
                    "
                >
                    {{ tab.label }}
                </Button>
            </div>

            <Card>
                <CardContent class="p-0">
                    <div v-if="loading" class="flex items-center justify-center py-12">
                        <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                    <template v-else>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Colis</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Heure</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="d in filtered" :key="d.id">
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                    <TableCell class="font-medium">{{ d.client }}</TableCell>
                                    <TableCell>{{ d.destination }}</TableCell>
                                    <TableCell class="text-muted-foreground">{{ d.parcels }} colis</TableCell>
                                    <TableCell>
                                        <Badge :class="statusClass(d.status)">
                                            <span
                                                v-if="d.status === 'En cours'"
                                                class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse inline-block"
                                            ></span>
                                            {{ d.status }}
                                        </Badge>
                                    </TableCell>
                                    <TableCell class="text-muted-foreground font-mono text-xs">{{ d.time }}</TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="6" class="text-center text-muted-foreground py-6">
                                        Aucune livraison
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                            {{ filtered.length }} livraison(s)
                        </div>
                    </template>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useApi, type ApiDriverDashboard, type ApiDriverDashboardDelivery } from '@/composables/useApi';
import { exportOrdreMissionPdf, type MissionData } from '@/composables/usePdfExport';
import { FileDown, Loader2 } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Mes livraisons — Livreur' });

const { get } = useApi();

/** Decode a JWT payload without validation. */
function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}
const accessToken = useCookie('access_token');
/** Decoded JWT payload from the access token. */
const payload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));
/** Full driver name extracted from the JWT. */
const driverName = computed(() => {
    const f = (payload.value?.firstname as string) ?? '';
    const l = (payload.value?.lastname as string) ?? '';
    return `${f} ${l}`.trim() || 'Pierre Martin';
});

/** Currently selected tab. */
const activeTab = ref('all');
/** Whether the PDF generation is in progress. */
const generatingPdf = ref(false);
/** Whether the deliveries are being loaded. */
const loading = ref(true);

/** Tab definitions for filtering deliveries. */
const tabs = [
    { label: 'Toutes', value: 'all' },
    { label: 'En cours', value: 'ongoing' },
    { label: 'Terminées', value: 'done' },
    { label: 'Planifiées', value: 'planned' },
];

/** Map a backend delivery status to its French label. */
const STATUS_LABELS: Record<string, string> = {
    planned: 'Planifié',
    delivering: 'En cours',
    delivered: 'Livré',
    cancelled: 'Annulé',
    blocked: 'Bloqué',
    delayed: 'Retardé',
};

/** Raw deliveries returned by the backend. */
const rawDeliveries = ref<ApiDriverDashboardDelivery[]>([]);
/** Driver business reference (e.g. DRV-001). */
const driverReference = ref('DRV-001');

/** Format an ISO date into a HH:MM time label. */
function formatTime(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Deliveries mapped to the table view model. */
const deliveries = computed(() =>
    rawDeliveries.value.map((d) => ({
        id: d.id,
        ref: d.reference,
        rawStatus: d.status ?? '',
        client: d.customer ?? '—',
        destination: [d.postal_code, d.city].filter(Boolean).join(' ') || d.address || '—',
        parcels: d.parcels,
        status: STATUS_LABELS[d.status ?? ''] ?? d.status ?? '—',
        time: formatTime(d.due_date),
        address: d.address ?? '',
        city: d.city ?? '',
    })),
);

/** Deliveries filtered by active tab (matched on the backend status). */
const filtered = computed(() =>
    deliveries.value.filter(
        (d) =>
            activeTab.value === 'all' ||
            (activeTab.value === 'ongoing' && d.rawStatus === 'delivering') ||
            (activeTab.value === 'done' && d.rawStatus === 'delivered') ||
            (activeTab.value === 'planned' && d.rawStatus === 'planned'),
    ),
);

/** Load the driver's full delivery history via the gateway. */
async function fetchData() {
    loading.value = true;
    try {
        const res = await get<ApiDriverDashboard>('/deliveries/mine', { scope: 'all' });
        driverReference.value = res.driver?.reference ?? 'DRV-001';
        rawDeliveries.value = res.deliveries;
    } catch (e) {
        console.error('Failed to load deliveries', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);

/** Generate and download the daily mission order PDF. */
async function downloadMission() {
    generatingPdf.value = true;
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const ref = `OM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
    const mission: MissionData = {
        ref,
        driverName: driverName.value,
        driverId: driverReference.value,
        vehicle: '—',
        plate: '—',
        hub: '—',
        date: today,
        deliveries: deliveries.value.map((d, i) => ({
            stop: i + 1,
            ref: d.ref,
            address: d.address,
            city: d.city,
            client: d.client,
            time: d.time,
            parcels: d.parcels,
        })),
    };
    try {
        await exportOrdreMissionPdf(mission);
    } finally {
        generatingPdf.value = false;
    }
}

/** Return Tailwind badge classes for a delivery status (French label). */
function statusClass(s: string) {
    return (
        (
            {
                Livré: 'bg-green-100 text-green-700 border-green-100 hover:bg-green-100',
                'En cours': 'bg-blue-100 text-blue-700 border-blue-100 hover:bg-blue-100',
                Planifié: 'bg-muted text-muted-foreground border-border hover:bg-muted',
                Retardé: 'bg-orange-100 text-orange-700 border-orange-100 hover:bg-orange-100',
                Bloqué: 'bg-red-100 text-red-700 border-red-100 hover:bg-red-100',
                Annulé: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[s] ?? ''
    );
}
</script>

