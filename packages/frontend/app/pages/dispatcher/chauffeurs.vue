<template>
    <AppLayout>
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Chauffeurs</h1>
                <p class="text-muted-foreground text-sm mt-1">Disponibilité et assignation</p>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card v-for="stat in stats" :key="stat.label">
                        <CardContent class="p-4 flex items-center gap-4">
                            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="stat.bg">
                                <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
                            </div>
                            <div>
                                <p class="text-2xl font-bold">{{ stat.value }}</p>
                                <p class="text-xs text-muted-foreground">{{ stat.label }}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardContent class="p-4">
                        <div class="relative max-w-sm">
                            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input v-model="search" placeholder="Nom, hub..." class="pl-9" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent class="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Chauffeur</TableHead>
                                    <TableHead>Hub</TableHead>
                                    <TableHead>Véhicule</TableHead>
                                    <TableHead>Note</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Mission en cours</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="d in filtered" :key="d.id">
                                    <TableCell>
                                        <div class="flex items-center gap-3">
                                            <div
                                                class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                                :class="d.avatarBg"
                                            >{{ d.initials }}</div>
                                            <span class="font-medium">{{ d.name }}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell class="text-muted-foreground">{{ d.hub }}</TableCell>
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.vehicle }}</TableCell>
                                    <TableCell class="text-yellow-500 font-semibold text-xs">★ {{ d.rating }}</TableCell>
                                    <TableCell>
                                        <Badge :class="statusClass(d.status)">{{ d.statusLabel }}</Badge>
                                    </TableCell>
                                    <TableCell class="font-mono text-xs text-primary">{{ d.current || '—' }}</TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="6" class="text-center text-muted-foreground py-6">
                                        Aucun chauffeur trouvé
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </template>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search, Truck, UserCheck, UserX } from '@lucide/vue';
import { useApi, type ApiDelivery, type ApiUser } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Chauffeurs — Dispatcher' });

const { get } = useApi();

const loading = ref(true);
const search = ref('');
const drivers = ref<ApiUser[]>([]);
const activeDeliveries = ref<ApiDelivery[]>([]);

const statusLabels: Record<string, string> = {
    active: 'Disponible',
    inactive: 'Indisponible',
    unavailable: 'Indisponible',
};

const driverDeliveringIds = computed(() =>
    new Set(activeDeliveries.value.filter((d) => d.driver_id).map((d) => d.driver_id!))
);

const stats = computed(() => {
    const total = drivers.value.length;
    const delivering = driverDeliveringIds.value.size;
    const available = total - delivering;
    const unavailable = drivers.value.filter((d) => d.status !== 'active').length;
    return [
        {
            label: 'Disponibles',
            value: Math.max(0, available - unavailable),
            bg: 'bg-green-100',
            color: 'text-green-600',
            icon: UserCheck,
        },
        {
            label: 'En livraison',
            value: delivering,
            bg: 'bg-blue-100',
            color: 'text-blue-600',
            icon: Truck,
        },
        {
            label: 'Indisponibles',
            value: unavailable,
            bg: 'bg-gray-100',
            color: 'text-gray-500',
            icon: UserX,
        },
    ];
});

const mappedDrivers = computed(() => {
    const delivering = driverDeliveringIds.value;
    return drivers.value.map((d) => {
        const isDelivering = delivering.has(d.id);
        const status = isDelivering ? 'delivering' : d.status;
        const delivery = activeDeliveries.value.find((del) => del.driver_id === d.id);
        return {
            id: d.id,
            name: `${d.firstname ?? ''} ${d.lastname ?? ''}`.trim() || d.email || '—',
            initials: ((d.firstname?.[0] ?? '') + (d.lastname?.[0] ?? '')).toUpperCase() || '?',
            hub: '—',
            vehicle: d.reference,
            rating: '—',
            status,
            statusLabel: isDelivering ? 'En livraison' : (statusLabels[d.status] ?? d.status),
            current: delivery?.reference ?? null,
            avatarBg: isDelivering
                ? 'bg-blue-500'
                : d.status === 'active'
                    ? 'bg-green-500'
                    : 'bg-gray-400',
        };
    });
});

const filtered = computed(() =>
    mappedDrivers.value.filter(
        (d) =>
            !search.value ||
            [d.name, d.hub, d.vehicle].some((v) =>
                String(v || '').toLowerCase().includes(search.value.toLowerCase())
            )
    )
);

function statusClass(s: string) {
    return ({
        active: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
        delivering: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
        inactive: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
        unavailable: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
    } as Record<string, string>)[s] ?? ''
}

async function fetchData() {
    loading.value = true;
    try {
        const [userRes, delRes] = await Promise.all([
            get<{ data: ApiUser[]; total: number }>('/users', { role: 'driver', limit: 100 }),
            get<{ data: ApiDelivery[]; total: number }>('/deliveries', { status: 'delivering', limit: 100 }),
        ]);
        drivers.value = userRes.data;
        activeDeliveries.value = delRes.data;
    } catch (e) {
        console.error('Failed to load drivers', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>
