<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Chauffeurs</h1>
                    <p class="text-muted-foreground text-sm mt-1">Gestion de la flotte de chauffeurs</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouveau chauffeur</Button>
            </div>

            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Nom, référence..." class="pl-9" />
                    </div>
                </CardContent>
            </Card>

            <div v-if="loading" class="text-center py-12 text-muted-foreground">
                <p>Chargement...</p>
            </div>

            <div v-else-if="error" class="text-center py-12 text-muted-foreground">
                <p>Erreur : {{ error }}</p>
                <Button variant="outline" class="mt-4" @click="fetchDrivers">Réessayer</Button>
            </div>

            <Card v-else>
                <CardContent class="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Véhicule</TableHead>
                                <TableHead>Hub</TableHead>
                                <TableHead>Note</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="d in filtered" :key="d.id">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                <TableCell>
                                    <div class="flex items-center gap-2.5">
                                        <div
                                            class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                        >
                                            {{ (d.name || '?').charAt(0) }}
                                        </div>
                                        <span class="font-medium">{{ d.name }}</span>
                                    </div>
                                </TableCell>
                                <TableCell class="text-xs text-muted-foreground">{{ d.email }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ d.vehicle }}</TableCell>
                                <TableCell>{{ d.hub }}</TableCell>
                                <TableCell class="text-yellow-500 font-semibold text-xs">★ {{ d.rating }}</TableCell>
                                <TableCell>
                                    <Badge
                                        :class="
                                            d.status === 'Disponible'
                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                                                : d.status === 'En livraison'
                                                  ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100'
                                                  : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
                                        "
                                    >{{ d.status }}</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                        {{ filtered.length }} chauffeur(s)
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search } from '@lucide/vue';
import type { ApiUser, PaginatedResponse } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Chauffeurs — Transvirex' });

const { get } = useApi();
const search = ref('');
const loading = ref(true);
const error = ref<string | null>(null);
const drivers = ref<Array<{
    id: string;
    ref: string;
    name: string;
    email: string;
    vehicle: string;
    hub: string;
    rating: string;
    status: string;
}>>([]);

async function fetchDrivers() {
    loading.value = true;
    error.value = null;
    try {
        const res = await get<PaginatedResponse<ApiUser>>('/users?role=driver&limit=100');
        drivers.value = res.data.map((u) => ({
            id: u.id,
            ref: u.driver?.reference ?? u.reference,
            name: [u.firstname, u.lastname].filter(Boolean).join(' ') || u.email || '—',
            email: u.email ?? '—',
            vehicle: u.driver?.vehicle
                ? `${u.driver.vehicle.type ?? ''} ${u.driver.vehicle.reference ?? ''}`.trim()
                : '—',
            hub: u.hub?.name ?? '—',
            rating: u.driver?.rating != null ? u.driver.rating.toFixed(1) : '—',
            status: u.status === 'active' ? 'Disponible' : u.status === 'inactive' ? 'Repos' : 'Indisponible',
        }));
    } catch (e: any) {
        error.value = e?.message ?? 'Impossible de charger les chauffeurs';
    } finally {
        loading.value = false;
    }
}

const filtered = computed(() =>
    drivers.value.filter(
        (d) =>
            !search.value || Object.values(d).some((v) => String(v).toLowerCase().includes(search.value.toLowerCase())),
    ),
);

onMounted(fetchDrivers);
</script>
