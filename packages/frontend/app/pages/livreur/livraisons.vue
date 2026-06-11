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

            <div class="flex flex-wrap items-center gap-2">
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
                <div class="ml-auto flex items-center gap-2">
                    <label class="text-xs text-muted-foreground">Du</label>
                    <input
                        type="date"
                        v-model="dateFrom"
                        @change="fetchData"
                        class="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-blue-400"
                    />
                    <label class="text-xs text-muted-foreground">Au</label>
                    <input
                        type="date"
                        v-model="dateTo"
                        @change="fetchData"
                        class="rounded-lg border border-border bg-background px-2 py-1.5 text-xs outline-none focus:border-blue-400"
                    />
                </div>
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
                                <TableRow
                                    v-for="d in filtered"
                                    :key="d.id"
                                    class="cursor-pointer hover:bg-muted/50 transition-colors"
                                    @click="openDetail(d.id)"
                                >
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.reference }}</TableCell>
                                    <TableCell class="font-medium">{{ d.client }}</TableCell>
                                    <TableCell class="text-xs">{{ d.destination }}</TableCell>
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

        <Dialog :open="!!selectedDelivery" @update:open="selectedDelivery = null">
            <DialogContent class="sm:max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Livraison {{ selectedDelivery?.reference }}</DialogTitle>
                    <DialogDescription>Détails complets de la livraison</DialogDescription>
                </DialogHeader>

                <div v-if="detailLoading" class="flex justify-center py-8">
                    <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
                </div>

                <template v-else-if="selectedDelivery">
                    <div class="space-y-4">
                        <!-- Infos générales -->
                        <div>
                            <h4 class="text-sm font-semibold text-muted-foreground mb-2">Informations générales</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <span class="text-muted-foreground">Référence</span>
                                <span class="font-mono">{{ selectedDelivery.reference }}</span>
                                <span class="text-muted-foreground">Statut</span>
                                <span><Badge :class="statusClass(selectedDelivery.status)">{{ statusLabel(selectedDelivery.status) }}</Badge></span>
                                <span v-if="selectedDelivery.driver?.user" class="text-muted-foreground">Chauffeur</span>
                                <span v-if="selectedDelivery.driver?.user">{{ selectedDelivery.driver.user.firstname }} {{ selectedDelivery.driver.user.lastname }}</span>
                            </div>
                        </div>

                        <!-- Client -->
                        <div v-if="selectedDelivery.invoice?.customer">
                            <h4 class="text-sm font-semibold text-muted-foreground mb-2">Client</h4>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <span class="text-muted-foreground">Nom</span>
                                <span>{{ selectedDelivery.invoice.customer.customer_name }}</span>
                                <span v-if="selectedDelivery.invoice.customer.contact_firstname" class="text-muted-foreground">Contact</span>
                                <span v-if="selectedDelivery.invoice.customer.contact_firstname">{{ selectedDelivery.invoice.customer.contact_firstname }} {{ selectedDelivery.invoice.customer.contact_lastname }}</span>
                                <span v-if="selectedDelivery.invoice.customer.phone_number" class="text-muted-foreground">Téléphone</span>
                                <span v-if="selectedDelivery.invoice.customer.phone_number">{{ selectedDelivery.invoice.customer.phone_number }}</span>
                            </div>
                        </div>

                        <!-- Adresse de livraison -->
                        <div v-if="selectedDelivery.invoice?.delivery_address">
                            <h4 class="text-sm font-semibold text-muted-foreground mb-2">Adresse de livraison</h4>
                            <p class="text-sm">
                                {{ selectedDelivery.invoice.delivery_address.address }}<br v-if="selectedDelivery.invoice.delivery_address.address" />
                                {{ selectedDelivery.invoice.delivery_address.postal_code }} {{ selectedDelivery.invoice.delivery_address.city }}
                            </p>
                        </div>

                        <!-- Colis -->
                        <div v-if="selectedDelivery.invoice?.parcels && selectedDelivery.invoice.parcels.length > 0">
                            <h4 class="text-sm font-semibold text-muted-foreground mb-2">Colis ({{ selectedDelivery.invoice.parcels.length }})</h4>
                            <div class="space-y-1">
                                <div
                                    v-for="p in selectedDelivery.invoice.parcels"
                                    :key="p.id"
                                    class="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-1.5 text-sm"
                                >
                                    <span class="font-mono text-xs">{{ p.reference }}</span>
                                    <span class="text-muted-foreground">{{ p.weight }} kg</span>
                                </div>
                            </div>
                        </div>

                        <!-- Timeline -->
                        <div v-if="selectedDelivery.delivery_events && selectedDelivery.delivery_events.length > 0">
                            <h4 class="text-sm font-semibold text-muted-foreground mb-2">Historique des événements</h4>
                            <div class="relative space-y-0">
                                <div class="absolute left-3.5 top-2 bottom-2 w-0.5 bg-border" />
                                <div
                                    v-for="evt in selectedDelivery.delivery_events"
                                    :key="evt.id"
                                    class="relative flex gap-3 pb-3 last:pb-0"
                                >
                                    <div
                                        class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 text-xs font-bold border-2"
                                        :class="eventDotClass(evt.type)"
                                    >
                                        {{ evt.type === 'info' ? 'i' : evt.type === 'warning' ? '!' : '•' }}
                                    </div>
                                    <div class="flex-1 min-w-0 pt-0.5">
                                        <p class="text-sm">{{ evt.description }}</p>
                                        <p class="text-xs text-muted-foreground mt-0.5">
                                            {{ evt.created_at ? new Date(evt.created_at).toLocaleString('fr-FR') : '—' }}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>

                <DialogFooter>
                    <Button variant="outline" @click="selectedDelivery = null">Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>

<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportOrdreMissionPdf, type MissionData } from '@/composables/usePdfExport';
import { FileDown, Loader2 } from '@lucide/vue';
import { useApi, type ApiDelivery } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Mes livraisons — Livreur' });

const { get, post } = useApi();

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
const dateFrom = ref('');
const dateTo = ref('');
const selectedDelivery = ref<ApiDelivery | null>(null);
const detailLoading = ref(false);

const tabs = [
    { label: 'Toutes', value: 'all' },
    { label: 'En cours', value: 'ongoing' },
    { label: 'Terminées', value: 'done' },
    { label: 'Planifiées', value: 'planned' },
];

async function fetchData() {
    loading.value = true;
    try {
        const params: Record<string, any> = { limit: 200 };
        if (dateFrom.value) params.date_from = dateFrom.value;
        if (dateTo.value) params.date_to = dateTo.value;
        const [delRes, profileRes] = await Promise.all([
            get<{ data: ApiDelivery[]; total: number }>('/deliveries', params),
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

async function fetchDetail(id: string) {
    detailLoading.value = true;
    try {
        const delivery = await get<ApiDelivery>(`/deliveries/${id}`);
        selectedDelivery.value = delivery;
    } catch (e) {
        console.error('Failed to load delivery detail', e);
    } finally {
        detailLoading.value = false;
    }
}

function openDetail(id: string) {
    fetchDetail(id);
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
    deliveries.value.map((d) => {
        const addr = d.invoice?.delivery_address;
        const dest = addr
            ? [addr.address, addr.postal_code, addr.city].filter(Boolean).join(', ')
            : '—';
        return {
            id: d.id,
            reference: d.reference,
            client: d.invoice?.customer?.customer_name ?? '—',
            destination: dest,
            status: d.status,
            statusLabel: statusLabel(d.status),
        };
    })
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

function eventDotClass(type: string) {
    return (
        {
            info: 'bg-blue-100 border-blue-300 text-blue-600',
            warning: 'bg-orange-100 border-orange-300 text-orange-600',
            critical: 'bg-red-100 border-red-300 text-red-600',
            fatal: 'bg-red-200 border-red-400 text-red-700',
        } as Record<string, string>
    )[type] ?? 'bg-gray-100 border-gray-300 text-gray-500';
}

onMounted(fetchData);
</script>
