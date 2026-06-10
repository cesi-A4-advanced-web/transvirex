<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p class="text-muted-foreground text-sm mt-1">Opérations en temps réel</p>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card v-for="kpi in kpis" :key="kpi.label">
                        <CardHeader class="pb-2">
                            <CardDescription>{{ kpi.label }}</CardDescription>
                            <CardTitle class="text-3xl">{{ kpi.value }}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p class="text-xs" :class="kpi.urgentColor ?? 'text-muted-foreground'">
                                {{ kpi.sub }}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
                    <Card class="xl:col-span-2">
                        <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                            <div class="flex items-center gap-2">
                                <CardTitle class="text-base">À assigner</CardTitle>
                                <Badge class="bg-red-100 text-red-600 border-red-200 hover:bg-red-100">{{
                                    pendingDeliveries.length
                                }}</Badge>
                            </div>
                            <NuxtLink to="/dispatcher/livraisons" class="text-xs text-primary hover-underline"
                                >Voir tout →</NuxtLink>
                        </CardHeader>
                        <CardContent class="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Référence</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Destination</TableHead>
                                        <TableHead>Priorité</TableHead>
                                        <TableHead>Échéance</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="d in pendingDeliveries" :key="d.id">
                                        <TableCell class="font-mono text-xs text-muted-foreground">{{ d.reference }}</TableCell>
                                        <TableCell class="font-medium">{{ d.client }}</TableCell>
                                        <TableCell>{{ d.destination }}</TableCell>
                                        <TableCell>
                                            <Badge :class="priorityClass(d.priority)">{{ d.priority }}</Badge>
                                        </TableCell>
                                        <TableCell class="text-muted-foreground text-xs">{{ d.due }}</TableCell>
                                        <TableCell>
                                            <Button variant="link" size="sm" class="p-0 h-auto text-primary" @click="openAssign(d)"
                                                >Assigner</Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow v-if="pendingDeliveries.length === 0">
                                        <TableCell colspan="6" class="text-center text-muted-foreground py-6">
                                            Aucune livraison en attente d'assignation
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <div class="space-y-4">
                        <Card>
                            <CardHeader class="pb-3">
                                <CardTitle class="text-base">Chauffeurs disponibles</CardTitle>
                            </CardHeader>
                            <CardContent class="space-y-2">
                                <div
                                    v-for="driver in availableDrivers"
                                    :key="driver.id"
                                    class="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50"
                                >
                                    <div class="flex items-center gap-2.5">
                                        <div
                                            class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                        >
                                            {{ driver.initials }}
                                        </div>
                                        <div>
                                            <p class="text-sm font-medium">{{ driver.name }}</p>
                                            <p class="text-xs text-muted-foreground">{{ driver.vehicle }}</p>
                                        </div>
                                    </div>
                                    <span class="text-yellow-500 text-xs font-semibold">★ {{ driver.rating }}</span>
                                </div>
                                <div v-if="availableDrivers.length === 0" class="text-center text-muted-foreground text-sm py-4">
                                    Aucun chauffeur disponible
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle class="text-base">Alertes</CardTitle>
                                <Badge class="bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-100">{{
                                    alerts.length
                                }}</Badge>
                            </CardHeader>
                            <CardContent class="space-y-2">
                                <div
                                    v-for="alert in alerts"
                                    :key="alert.ref"
                                    class="flex items-start gap-2.5 py-2 px-3 rounded-lg"
                                    :class="alert.bg"
                                >
                                    <component :is="alert.icon" class="w-4 h-4 flex-shrink-0 mt-0.5" :class="alert.color" />
                                    <div>
                                        <p class="text-xs font-semibold" :class="alert.color">{{ alert.ref }}</p>
                                        <p class="text-xs text-muted-foreground mt-0.5">{{ alert.message }}</p>
                                    </div>
                                </div>
                                <div v-if="alerts.length === 0" class="text-center text-muted-foreground text-sm py-4">
                                    Aucune alerte
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </template>
        </div>

        <Dialog v-if="assignTarget" :open="!!assignTarget" @update:open="closeAssign">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Assigner un chauffeur</DialogTitle>
                    <DialogDescription>
                        Livraison {{ assignTarget.reference }} — {{ assignTarget.client }}
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
                                <p class="text-xs text-muted-foreground">{{ driver.vehicle }}</p>
                            </div>
                        </div>
                        <span class="text-yellow-500 text-xs font-semibold">★ {{ driver.rating }}</span>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="closeAssign">Annuler</Button>
                    <Button :disabled="!selectedDriverId || assigning" @click="confirmAssign">
                        <Loader2 v-if="assigning" class="w-4 h-4 mr-2 animate-spin" />
                        Assigner
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Loader2, Package, XCircle } from '@lucide/vue';
import { useApi, type ApiDelivery, type ApiUser } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Dispatcher — Transvirex' });

const { get, patch } = useApi();

const loading = ref(true);
const deliveries = ref<ApiDelivery[]>([]);
const drivers = ref<ApiUser[]>([]);

const assignTarget = ref<{ id: string; reference: string; client: string } | null>(null);
const selectedDriverId = ref<string | null>(null);
const assigning = ref(false);

const driverOptions = computed(() =>
    drivers.value.map((d) => ({
        id: d.id,
        name: `${d.firstname ?? ''} ${d.lastname ?? ''}`.trim() || d.email || '',
        initials: ((d.firstname?.[0] ?? '') + (d.lastname?.[0] ?? '')).toUpperCase() || '?',
        vehicle: d.reference,
        rating: '-',
    }))
);

const kpis = computed(() => [
    {
        label: 'À assigner',
        value: unassignedCount.value,
        sub: `${urgentUnassigned.value} urgents`,
        urgentColor: 'text-red-500',
    },
    {
        label: 'En cours',
        value: deliveringCount.value,
        sub: 'En livraison',
        urgentColor: 'text-blue-500',
    },
    {
        label: 'Retardées',
        value: delayedCount.value,
        sub: 'Nécessitent attention',
        urgentColor: 'text-orange-500',
    },
    {
        label: 'Terminées',
        value: deliveredCount.value,
        sub: 'Au total',
        urgentColor: 'text-green-500',
    },
]);

const unassignedCount = computed(() => deliveries.value.filter((d) => d.status === 'planned' && !d.driver_id).length);
const urgentUnassigned = computed(() => deliveries.value.filter((d) => d.status === 'planned' && !d.driver_id && d.invoice?.priority === 'urgent').length);
const deliveringCount = computed(() => deliveries.value.filter((d) => d.status === 'delivering').length);
const delayedCount = computed(() => deliveries.value.filter((d) => d.status === 'delayed' || d.status === 'blocked').length);
const deliveredCount = computed(() => deliveries.value.filter((d) => d.status === 'delivered').length);

const pendingDeliveries = computed(() =>
    deliveries.value
        .filter((d) => d.status === 'planned' && !d.driver_id)
        .slice(0, 10)
        .map((d) => ({
            id: d.id,
            reference: d.reference,
            client: d.invoice?.customer?.customer_name ?? '—',
            destination: d.invoice?.customer?.customer_name ?? '—',
            priority: d.invoice?.priority ?? 'standard',
            due: d.invoice?.due_date ? new Date(d.invoice.due_date).toLocaleDateString('fr-FR') : '—',
        }))
);

const availableDrivers = computed(() =>
    drivers.value
        .filter((d) => d.status === 'active')
        .slice(0, 10)
        .map((d) => ({
            id: d.id,
            name: `${d.firstname ?? ''} ${d.lastname ?? ''}`.trim() || d.email || '',
            initials: ((d.firstname?.[0] ?? '') + (d.lastname?.[0] ?? '')).toUpperCase() || '?',
            vehicle: d.reference,
            rating: '—',
        }))
);

const alerts = computed(() => {
    const result: { ref: string; message: string; icon: unknown; color: string; bg: string }[] = [];
    for (const d of deliveries.value) {
        if (d.status === 'blocked') {
            result.push({
                ref: d.reference,
                message: `Livraison bloquée — ${d.notes || 'aucun détail'}`,
                icon: XCircle,
                color: 'text-red-600',
                bg: 'bg-red-50',
            });
        }
        if (d.status === 'delayed') {
            result.push({
                ref: d.reference,
                message: `Retard signalé — ${d.notes || 'aucun détail'}`,
                icon: AlertTriangle,
                color: 'text-orange-500',
                bg: 'bg-orange-50',
            });
        }
    }
    return result.slice(0, 5);
});

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
        console.error('Failed to load dashboard data', e);
    } finally {
        loading.value = false;
    }
}

function openAssign(d: { id: string; reference: string; client: string }) {
    assignTarget.value = d;
    selectedDriverId.value = null;
}

function closeAssign() {
    assignTarget.value = null;
    selectedDriverId.value = null;
}

async function confirmAssign() {
    if (!assignTarget.value || !selectedDriverId.value) return;
    assigning.value = true;
    try {
        await patch(`/deliveries/${assignTarget.value.id}`, { driver_id: selectedDriverId.value });
        closeAssign();
        await fetchData();
    } catch (e) {
        console.error('Failed to assign driver', e);
    } finally {
        assigning.value = false;
    }
}

function priorityClass(p: string) {
    return (
        {
            urgent: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
            high: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
            standard: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
            low: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
        } as Record<string, string>
    )[p] ?? ''
}

onMounted(fetchData);
</script>
