<template>
    <AppLayout>
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Chauffeurs</h1>
                <p class="text-muted-foreground text-sm mt-1">Disponibilité et assignation</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card v-for="stat in stats" :key="stat.label">
                    <CardContent class="p-4 flex items-center gap-4">
                        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="stat.bg">
                            <component :is="stat.icon" class="w-5 h-5" :class="stat.color" />
                        </div>
                        <div>
                            <p class="text-2xl font-bold">{{ stat.value }}</p>
                            <p class="text-xs text-muted-foreground">
                                {{ stat.label }}
                            </p>
                        </div>
                        <div>
                            <p class="text-2xl font-bold">{{ stat.value }}</p>
                            <p class="text-xs text-muted-foreground">
                                {{ stat.label }}
                            </p>
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
                <CardContent class="p-0">
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
                            <TableRow v-for="d in filtered" :key="d.name">
                                <TableCell>
                                    <div class="flex items-center gap-3">
                                        <div
                                            class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                            :class="d.avatarBg"
                                        >
                                            {{ initials(d.name) }}
                                        </div>
                                        <span class="font-medium">{{ d.name }}</span>
                                    </div>
                                </TableCell>
                                <TableCell class="text-muted-foreground">{{ d.hub }}</TableCell>
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.vehicle }}</TableCell>
                                <TableCell class="text-yellow-500 font-semibold text-xs">★ {{ d.rating }}</TableCell>
                                <TableCell
                                    ><Badge :class="statusClass(d.status)">{{ d.status }}</Badge></TableCell
                                >
                                <TableCell class="font-mono text-xs text-primary">{{ d.current || '—' }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>
<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Truck, UserCheck, UserX } from '@lucide/vue';
definePageMeta({ layout: false });
useHead({ title: 'Chauffeurs — Dispatcher' });
/** Search/filter input value. */
const search = ref('');
/** Summary stat cards displayed at the top. */
const stats = [
    {
        label: 'Disponibles',
        value: 24,
        bg: 'bg-green-100',
        color: 'text-green-600',
        icon: UserCheck,
    },
    {
        label: 'En livraison',
        value: 11,
        bg: 'bg-blue-100',
        color: 'text-blue-600',
        icon: Truck,
    },
    {
        label: 'Indisponibles',
        value: 3,
        bg: 'bg-gray-100',
        color: 'text-gray-500',
        icon: UserX,
    },
];
/** Static list of drivers for the demo table. */
const drivers = [
    {
        name: 'Marc Dupont',
        hub: 'Paris Centre',
        vehicle: 'VEH-001',
        rating: '4.8',
        status: 'Disponible',
        current: null,
        avatarBg: 'bg-green-500',
    },
    {
        name: 'Sophie Martin',
        hub: 'Lyon',
        vehicle: 'VEH-007',
        rating: '4.5',
        status: 'En livraison',
        current: '#LIV-0092',
        avatarBg: 'bg-blue-500',
    },
    {
        name: 'Romain Petit',
        hub: 'Lille',
        vehicle: 'VEH-014',
        rating: '4.9',
        status: 'En livraison',
        current: '#LIV-0095',
        avatarBg: 'bg-blue-500',
    },
    {
        name: 'Claire Leroy',
        hub: 'Nantes',
        vehicle: 'VEH-022',
        rating: '4.2',
        status: 'En livraison',
        current: '#LIV-0096',
        avatarBg: 'bg-orange-500',
    },
    {
        name: 'David Moreau',
        hub: 'Bordeaux',
        vehicle: 'VEH-005',
        rating: '4.7',
        status: 'Disponible',
        current: null,
        avatarBg: 'bg-green-500',
    },
    {
        name: 'Isabelle Simon',
        hub: 'Paris Centre',
        vehicle: 'VEH-011',
        rating: '4.1',
        status: 'Indisponible',
        current: null,
        avatarBg: 'bg-gray-400',
    },
];
/** Drivers filtered by the search query. */
const filtered = computed(() =>
    drivers.filter(
        (d) =>
            !search.value ||
            Object.values(d).some((v) =>
                String(v || '')
                    .toLowerCase()
                    .includes(search.value.toLowerCase()),
            ),
    ),
);
/** Extract initials from a full name. */
function initials(name: string) {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('');
}
/** Return Tailwind badge classes for a driver status. */
function statusClass(s: string) {
    return (
        (
            {
                Disponible: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
                'En livraison': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                Indisponible: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[s] ?? ''
    );
}
</script>

