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
                    :disabled="generatingPdf || deliveries.length === 0"
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

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <Card>
                    <CardContent class="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="d in filtered" :key="d.id">
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.reference }}</TableCell>
                                    <TableCell class="font-medium">{{ d.client }}</TableCell>
                                    <TableCell>{{ d.destination }}</TableCell>
                                    <TableCell>
                                        <Badge :class="statusClass(d.status)">
                                            <span
                                                v-if="d.status === 'delivering'"
                                                class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse inline-block"
                                            ></span>
                                            {{ d.statusLabel }}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="4" class="text-center text-muted-foreground py-6">
                                        Aucune livraison trouvée
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                        <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                            {{ filtered.length }} livraison(s)
                        </div>
                    </CardContent>
                </Card>
            </template>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportOrdreMissionPdf, type MissionData } from '@/composables/usePdfExport';
import { FileDown, Loader2 } from '@lucide/vue';
import { useApi, type ApiDelivery } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Mes livraisons — Livreur' });

const { get } = useApi();

function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}
const accessToken = useCookie('access_token');
const payload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));
const userId = computed(() => (payload.value?.sub as string) || '');
const driverName = computed(() => {
    const f = (payload.value?.firstname as string) ?? '';
    const l = (payload.value?.lastname as string) ?? '';
    return `${f} ${l}`.trim() || 'Pierre Martin';
});

const loading = ref(true);
const deliveries = ref<ApiDelivery[]>([]);
const driverProfile = ref<{ reference: string; rating: number | null; vehicle: { type: string | null; license_plate: string | null } | null } | null>(null);

const activeTab = ref('all');
const generatingPdf = ref(false);

const tabs = [
    { label: 'Toutes', value: 'all' },
    { label: 'En cours', value: 'ongoing' },
    { label: 'Terminées', value: 'done' },
    { label: 'Planifiées', value: 'planned' },
];

async function fetchData() {
    loading.value = true;
    try {
        const [delRes, profileRes] = await Promise.all([
            get<{ data: ApiDelivery[]; total: number }>('/deliveries', { limit: 200 }),
            userId.value ? get<typeof driverProfile.value>(`/users/${userId.value}/driver`).catch(() => null) : Promise.resolve(null),
        ]);
        deliveries.value = delRes.data;
        driverProfile.value = profileRes;
    } catch (e) {
        console.error('Failed to load deliveries', e);
    } finally {
        loading.value = false;
    }
}

function statusLabel(status: string) {
    const labels: Record<string, string> = {
        planned: 'Planifiée',
        delivering: 'En cours',
        delivered: 'Livrée',
        cancelled: 'Annulée',
        blocked: 'Bloquée',
        delayed: 'Retardée',
    };
    return labels[status] ?? status;
}

const mappedDeliveries = computed(() =>
    deliveries.value.map((d) => ({
        id: d.id,
        reference: d.reference,
        client: d.invoice?.customer?.customer_name ?? '—',
        destination: d.invoice?.customer?.customer_name ?? '—',
        status: d.status,
        statusLabel: statusLabel(d.status),
    }))
);

const filtered = computed(() =>
    mappedDeliveries.value.filter((d) => {
        if (activeTab.value === 'all') return true;
        if (activeTab.value === 'ongoing') return d.status === 'delivering';
        if (activeTab.value === 'done') return d.status === 'delivered';
        if (activeTab.value === 'planned') return d.status === 'planned';
        return true;
    })
);

async function downloadMission() {
    generatingPdf.value = true;
    try {
        const today = new Date().toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
        const ref = `OM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
        const hubName = deliveries.value[0]?.invoice?.hub?.name ?? 'Hub principal';
        const vehicleType = driverProfile.value?.vehicle?.type ?? 'Véhicule';
        const plate = driverProfile.value?.vehicle?.license_plate ?? '—';
        const driverRef = driverProfile.value?.reference ?? '—';
        const mission: MissionData = {
            ref,
            driverName: driverName.value,
            driverId: driverRef,
            vehicle: vehicleType,
            plate,
            hub: hubName,
            date: today,
            deliveries: deliveries.value.map((d, i) => ({
                stop: i + 1,
                ref: d.reference,
                address: '',
                city: '',
                client: d.invoice?.customer?.customer_name ?? '—',
                time: '',
                parcels: 1,
            })),
        };
        await exportOrdreMissionPdf(mission);
    } finally {
        generatingPdf.value = false;
    }
}

function statusClass(s: string) {
    return (
        {
            delivered: 'bg-green-100 text-green-700 border-green-100 hover:bg-green-100',
            delivering: 'bg-blue-100 text-blue-700 border-blue-100 hover:bg-blue-100',
            planned: 'bg-muted text-muted-foreground border-border hover:bg-muted',
            cancelled: 'bg-gray-100 text-gray-500 border-gray-100 hover:bg-gray-100',
            blocked: 'bg-red-100 text-red-700 border-red-100 hover:bg-red-100',
            delayed: 'bg-orange-100 text-orange-700 border-orange-100 hover:bg-orange-100',
        } as Record<string, string>
    )[s] ?? '';
}

onMounted(fetchData);
</script>
