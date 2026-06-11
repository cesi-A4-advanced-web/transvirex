<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Livraisons</h1>
                    <p class="text-muted-foreground text-sm mt-1">Suivi et assignation</p>
                </div>
                <Button @click="openPlanifier"><Plus class="w-4 h-4 mr-2" />Planifier</Button>
            </div>

            <div class="flex flex-wrap gap-2">
                <Button
                    v-for="tab in tabs"
                    :key="tab.value"
                    :variant="activeTab === tab.value ? 'default' : 'outline'"
                    size="sm"
                    @click="activeTab = tab.value"
                >
                    {{ tab.label }}
                    <Badge
                        v-if="tab.count"
                        class="ml-1.5 text-[10px]"
                        :class="activeTab === tab.value
                            ? 'bg-white/20 text-white border-transparent'
                            : 'bg-muted text-muted-foreground border-transparent'"
                    >{{ tab.count }}</Badge>
                </Button>
            </div>

            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence, client..." class="pl-9" />
                    </div>
                </CardContent>
            </Card>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <Card>
                    <CardContent class="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Priorité</TableHead>
                                    <TableHead>Chauffeur</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="d in filtered" :key="d.id">
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.reference }}</TableCell>
                                    <TableCell class="font-medium">{{ d.client }}</TableCell>
                                    <TableCell>{{ d.destination }}</TableCell>
                                    <TableCell>
                                        <Badge :class="priorityClass(d.priority)">{{ d.priority }}</Badge>
                                    </TableCell>
                                    <TableCell class="text-muted-foreground">{{ d.driver || '—' }}</TableCell>
                                    <TableCell>
                                        <Badge :class="statusClass(d.status)">{{ d.statusLabel }}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            v-if="!d.driver"
                                            variant="link"
                                            size="sm"
                                            class="p-0 h-auto font-semibold text-primary"
                                            @click="openAssign(d)"
                                        >Assigner</Button>
                                        <Button
                                            v-else
                                            variant="ghost"
                                            size="sm"
                                            class="p-0 h-auto text-muted-foreground"
                                            @click="openDetails(d)"
                                        >Détails</Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="7" class="text-center text-muted-foreground py-6">
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

        <Dialog :open="showPlanifier" @update:open="showPlanifier = false">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Planifier une livraison</DialogTitle>
                    <DialogDescription>Créer une nouvelle livraison</DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div class="space-y-2">
                        <Label>Sélectionner une facture</Label>
                        <div class="relative">
                            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input v-model="invoiceSearch" placeholder="Rechercher par référence ou client..." class="pl-9" />
                        </div>
                        <div v-if="invoiceOptions.length > 0" class="border rounded-lg max-h-48 overflow-y-auto divide-y">
                            <div
                                v-for="inv in invoiceOptions"
                                :key="inv.id"
                                class="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                                :class="planForm.invoices_id === inv.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'"
                                @click="planForm.invoices_id = inv.id"
                            >
                                <div>
                                    <p class="font-mono text-xs font-medium">{{ inv.ref }}</p>
                                    <p class="text-xs text-muted-foreground">{{ inv.client }}</p>
                                </div>
                                <Badge v-if="planForm.invoices_id === inv.id" variant="outline" class="text-[10px]">Sélectionné</Badge>
                            </div>
                        </div>
                        <div v-else-if="loadingInvoices" class="flex items-center justify-center py-4">
                            <Loader2 class="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                        <div v-else class="text-center text-xs text-muted-foreground py-4">
                            Aucune facture trouvée
                        </div>
                    </div>
                    <div class="space-y-2">
                        <Label>Référence livraison</Label>
                        <Input v-model="planForm.reference" readonly placeholder="Généré automatiquement" />
                    </div>
                    <div class="space-y-2">
                        <Label>Chauffeur (optionnel)</Label>
                        <div v-if="driverOptions.length > 0" class="border rounded-lg max-h-36 overflow-y-auto divide-y">
                            <div
                                v-for="driver in driverOptions"
                                :key="driver.id"
                                class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                                :class="planForm.driver_id === driver.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'"
                                @click="planForm.driver_id = planForm.driver_id === driver.id ? '' : driver.id"
                            >
                                <div>
                                    <p class="text-xs font-medium">{{ driver.name }}</p>
                                    <p class="text-xs text-muted-foreground">{{ driver.email }}</p>
                                </div>
                                <Badge v-if="planForm.driver_id === driver.id" variant="outline" class="text-[10px]">Sélectionné</Badge>
                            </div>
                            <div
                                class="flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                                :class="!planForm.driver_id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'"
                                @click="planForm.driver_id = ''"
                            >
                                <span class="text-xs text-muted-foreground">Non assigné</span>
                                <Badge v-if="!planForm.driver_id" variant="outline" class="text-[10px] ml-auto">Sélectionné</Badge>
                            </div>
                        </div>
                        <div v-else class="text-center text-xs text-muted-foreground py-2">Aucun chauffeur disponible</div>
                    </div>
                    <div class="space-y-2">
                        <Label>Date planifiée (optionnel)</Label>
                        <Input v-model="planForm.scheduled_at" type="datetime-local" />
                    </div>
                    <div class="space-y-2">
                        <Label>Notes (optionnel)</Label>
                        <Textarea v-model="planForm.notes" placeholder="Instructions particulières..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showPlanifier = false">Annuler</Button>
                    <Button :disabled="!planForm.invoices_id || creating" @click="confirmPlanifier">
                        <Loader2 v-if="creating" class="w-4 h-4 mr-2 animate-spin" />
                        Créer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog :open="showAssign" @update:open="showAssign = false">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assigner un chauffeur</DialogTitle>
                    <DialogDescription v-if="assignData">
                        Livraison {{ assignData.reference }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-3 py-4">
                    <div
                        v-for="driver in driverOptions"
                        :key="driver.id"
                        class="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                        :class="selectedDriverId === driver.id ? 'border-primary bg-primary/5' : ''"
                        @click="selectedDriverId = driver.id"
                    >
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold">
                                {{ driver.initials }}
                            </div>
                            <div>
                                <p class="text-sm font-medium">{{ driver.name }}</p>
                                <p class="text-xs text-muted-foreground">{{ driver.email }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-if="driverOptions.length === 0" class="text-center text-muted-foreground text-sm py-4">
                        Aucun chauffeur disponible
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showAssign = false">Annuler</Button>
                    <Button :disabled="!selectedDriverId || assigning" @click="confirmAssign">
                        <Loader2 v-if="assigning" class="w-4 h-4 mr-2 animate-spin" />
                        Assigner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog :open="showDetails" @update:open="showDetails = false">
            <DialogContent class="sm:max-w-lg" v-if="detailData">
                <DialogHeader>
                    <DialogTitle>Détails livraison</DialogTitle>
                    <DialogDescription>{{ detailData.reference }}</DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-muted-foreground">Statut</p>
                            <p class="font-medium">{{ statusLabel(detailData.status) }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Chauffeur</p>
                            <p class="font-medium">{{ detailData.driverName || 'Non assigné' }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Client</p>
                            <p class="font-medium">{{ detailData.client }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Priorité</p>
                            <p class="font-medium capitalize">{{ detailData.priority }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Facture</p>
                            <p class="font-medium font-mono text-xs">{{ detailData.invoiceRef }}</p>
                        </div>
                        <div>
                            <p class="text-muted-foreground">Montant</p>
                            <p class="font-medium">{{ detailData.amount }}</p>
                        </div>
                    </div>
                    <div v-if="detailData.notes">
                        <p class="text-muted-foreground text-sm">Notes</p>
                        <p class="text-sm mt-1">{{ detailData.notes }}</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showDetails = false">Fermer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Search } from '@lucide/vue';
import { useApi, type ApiDelivery, type ApiInvoice, type ApiUser } from '@/composables/useApi';
import { useRealtime } from '@/composables/useRealtime';

definePageMeta({ layout: false });
useHead({ title: 'Livraisons — Dispatcher' });

const { get, post, patch } = useApi();

const loading = ref(true);
const deliveries = ref<ApiDelivery[]>([]);
const drivers = ref<ApiUser[]>([]);
const search = ref('');
const activeTab = ref('all');

const showPlanifier = ref(false);
const showAssign = ref(false);
const showDetails = ref(false);
const creating = ref(false);
const assigning = ref(false);
const invoices = ref<ApiInvoice[]>([]);
const invoiceSearch = ref('');
const loadingInvoices = ref(false);
const selectedDriverId = ref<string | null>(null);
const assignData = ref<{ id: string; reference: string } | null>(null);
const detailData = ref<{
    reference: string;
    status: string;
    driverName: string;
    client: string;
    priority: string;
    invoiceRef: string;
    amount: string;
    notes: string | null;
} | null>(null);

const planForm = ref({ invoices_id: '', reference: '', notes: '', driver_id: '', scheduled_at: '' });

function generateRef(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LIV-${date}-${rand}`;
}

const tabs = computed(() => [
    { label: 'Toutes', value: 'all', count: deliveries.value.length },
    { label: 'À assigner', value: 'unassigned', count: deliveries.value.filter((d) => d.status === 'planned' && !d.driver_id).length },
    { label: 'En cours', value: 'ongoing', count: deliveries.value.filter((d) => d.status === 'delivering').length },
    { label: 'Terminées', value: 'done', count: deliveries.value.filter((d) => d.status === 'delivered').length },
]);

const driverOptions = computed(() =>
    drivers.value
        .filter((d) => d.status === 'active')
        .map((d) => ({
            id: d.driver?.id ?? d.id,
            name: `${d.firstname ?? ''} ${d.lastname ?? ''}`.trim() || d.email || '',
            initials: ((d.firstname?.[0] ?? '') + (d.lastname?.[0] ?? '')).toUpperCase() || '?',
            email: d.email ?? '',
        }))
);

const invoiceOptions = computed(() => {
    const all = invoices.value
        .filter((inv) => inv.status === 'invoice')
        .map((inv) => ({
            id: inv.id,
            ref: inv.reference,
            client: inv.customer?.customer_name ?? '—',
        }));
    if (!invoiceSearch.value) return all;
    const q = invoiceSearch.value.toLowerCase();
    return all.filter((inv) => inv.ref.toLowerCase().includes(q) || inv.client.toLowerCase().includes(q));
});

const mappedDeliveries = computed(() =>
    deliveries.value.map((d) => ({
        id: d.id,
        reference: d.reference,
        client: d.invoice?.customer?.customer_name ?? '—',
        destination: d.invoice?.customer?.customer_name ?? '—',
        priority: d.invoice?.priority ?? 'standard',
        driver: d.driver ? `${d.driver.user.firstname ?? ''} ${d.driver.user.lastname ?? ''}`.trim() : null,
        status: d.status,
        statusLabel: statusLabel(d.status),
    }))
);

const filtered = computed(() =>
    mappedDeliveries.value.filter((d) => {
        const tabOk =
            activeTab.value === 'all' ||
            (activeTab.value === 'unassigned' && !d.driver) ||
            (activeTab.value === 'ongoing' && d.status === 'delivering') ||
            (activeTab.value === 'done' && d.status === 'delivered');
        const searchOk =
            !search.value ||
            [d.reference, d.client, d.driver].some((v) =>
                String(v || '').toLowerCase().includes(search.value.toLowerCase())
            );
        return tabOk && searchOk;
    })
);

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

function priorityClass(p: string) {
    return ({
        urgent: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
        high: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
        standard: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
        low: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
    } as Record<string, string>)[p] ?? ''
}

function statusClass(s: string) {
    return ({
        delivered: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
        delivering: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
        planned: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
        delayed: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
        blocked: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
        cancelled: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
    } as Record<string, string>)[s] ?? ''
}

async function fetchData() {
    loading.value = true;
    try {
        const [delRes, driverRes] = await Promise.all([
            get<{ data: ApiDelivery[]; total: number }>('/deliveries', { limit: 100 }),
            get<{ data: ApiUser[]; total: number }>('/users', { role: 'driver', limit: 50 }),
        ]);
        deliveries.value = delRes.data;
        drivers.value = driverRes.data;
    } catch (e) {
        console.error('Failed to load deliveries', e);
    } finally {
        loading.value = false;
    }
}

async function openPlanifier() {
    planForm.value = { invoices_id: '', reference: generateRef(), notes: '', driver_id: '', scheduled_at: '' };
    invoiceSearch.value = '';
    showPlanifier.value = true;
    if (invoices.value.length === 0) {
        loadingInvoices.value = true;
        try {
            const res = await get<{ data: ApiInvoice[]; total: number }>('/invoices', { limit: 200 });
            invoices.value = res.data;
        } catch (e) {
            console.error('Failed to load invoices', e);
        } finally {
            loadingInvoices.value = false;
        }
    }
}

async function confirmPlanifier() {
    if (!planForm.value.invoices_id) return;
    creating.value = true;
    try {
        const payload: Record<string, unknown> = {
            invoices_id: planForm.value.invoices_id,
            notes: planForm.value.notes || undefined,
        };
        if (planForm.value.driver_id) payload.driver_id = planForm.value.driver_id;
        if (planForm.value.scheduled_at) payload.scheduled_at = new Date(planForm.value.scheduled_at).toISOString();
        await post('/deliveries', payload);
        showPlanifier.value = false;
        await fetchData();
    } catch (e) {
        console.error('Failed to create delivery', e);
    } finally {
        creating.value = false;
    }
}

function openAssign(d: { id: string; reference: string }) {
    assignData.value = d;
    selectedDriverId.value = null;
    showAssign.value = true;
}

async function confirmAssign() {
    if (!assignData.value || !selectedDriverId.value) return;
    assigning.value = true;
    try {
        await patch(`/deliveries/${assignData.value.id}`, { driver_id: selectedDriverId.value });
        showAssign.value = false;
        await fetchData();
    } catch (e) {
        console.error('Failed to assign driver', e);
    } finally {
        assigning.value = false;
    }
}

async function openDetails(d: { id: string }) {
    showDetails.value = true;
    detailData.value = null;
    try {
        const res = await get<ApiDelivery>(`/deliveries/${d.id}`);
        detailData.value = {
            reference: res.reference,
            status: res.status,
            driverName: res.driver ? `${res.driver.user.firstname ?? ''} ${res.driver.user.lastname ?? ''}`.trim() : 'Non assigné',
            client: res.invoice?.customer?.customer_name ?? '—',
            priority: res.invoice?.priority ?? '—',
            invoiceRef: res.invoice?.reference ?? '—',
            amount: res.invoice?.amount != null ? `€ ${res.invoice.amount.toFixed(2)}` : '—',
            notes: res.notes,
        };
    } catch (e) {
        console.error('Failed to load delivery details', e);
        showDetails.value = false;
    }
}

onMounted(async () => {
    await fetchData();

    const realtime = useRealtime();
    realtime.on('delivery:status', () => fetchData());
    realtime.on('delivery:assigned', () => fetchData());
    realtime.connect();
});
</script>
