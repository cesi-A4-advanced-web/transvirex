<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Livraisons</h1>
                    <p class="text-muted-foreground text-sm mt-1">Gestion de toutes les livraisons</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouvelle livraison</Button>
            </div>

            <Card>
                <CardContent class="p-4 flex flex-wrap items-center gap-3">
                    <div class="relative flex-1 min-w-48 max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence, client..." class="pl-9" />
                    </div>
                    <select
                        v-model="filterStatus"
                        class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="">Tous les statuts</option>
                        <option v-for="s in statuses" :key="s" :value="s">
                            {{ s }}
                        </option>
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Chauffeur</TableHead>
                                <TableHead>Priorité</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="d in filtered" :key="d.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                <TableCell class="font-medium">{{ d.client }}</TableCell>
                                <TableCell>{{ d.destination }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ d.driver }}</TableCell>
                                <TableCell
                                    ><Badge :class="priorityClass(d.priority)">{{ d.priority }}</Badge></TableCell
                                >
                                <TableCell
                                    ><Badge :class="statusClass(d.status)">{{ d.status }}</Badge></TableCell
                                >
                                <TableCell class="text-muted-foreground text-xs">{{ d.date }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                        {{ filtered.length }} livraison(s)
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

definePageMeta({ layout: false });
useHead({ title: 'Livraisons — Transvirex' });

/** Search/filter input value. */
const search = ref('');
/** Selected status filter. */
const filterStatus = ref('');
/** Available delivery status options. */
const statuses = ['Livré', 'En cours', 'En attente', 'Retardé', 'Annulé'];

/** Static list of deliveries for the demo table. */
const deliveries = [
    {
        ref: '#LIV-0091',
        client: 'Société Durand',
        destination: 'Paris 15e',
        driver: 'M. Dupont',
        priority: 'Standard',
        status: 'Livré',
        date: '09/06/2026',
    },
    {
        ref: '#LIV-0092',
        client: 'SARL Martin',
        destination: 'Lyon Part-Dieu',
        driver: 'S. Martin',
        priority: 'High',
        status: 'En cours',
        date: '09/06/2026',
    },
    {
        ref: '#LIV-0093',
        client: 'Express Cargo',
        destination: 'Bordeaux Centre',
        driver: 'A. Bernard',
        priority: 'Standard',
        status: 'En attente',
        date: '09/06/2026',
    },
    {
        ref: '#LIV-0094',
        client: 'TGV Express',
        destination: 'Marseille 13e',
        driver: 'J. Thomas',
        priority: 'Urgent',
        status: 'Livré',
        date: '09/06/2026',
    },
    {
        ref: '#LIV-0095',
        client: 'Logistics Plus',
        destination: 'Lille Centre',
        driver: 'R. Petit',
        priority: 'High',
        status: 'En cours',
        date: '09/06/2026',
    },
    {
        ref: '#LIV-0096',
        client: 'Nord Fret',
        destination: 'Nantes Ouest',
        driver: 'C. Leroy',
        priority: 'Standard',
        status: 'Retardé',
        date: '09/06/2026',
    },
    {
        ref: '#LIV-0097',
        client: 'Alsace Trans',
        destination: 'Strasbourg',
        driver: 'M. Dupont',
        priority: 'Low',
        status: 'Livré',
        date: '08/06/2026',
    },
    {
        ref: '#LIV-0099',
        client: 'Sud Logistics',
        destination: 'Toulouse',
        driver: 'A. Bernard',
        priority: 'Urgent',
        status: 'Annulé',
        date: '08/06/2026',
    },
];

/** Deliveries filtered by search and status. */
const filtered = computed(() =>
    deliveries.filter(
        (d) =>
            (filterStatus.value === '' || d.status === filterStatus.value) &&
            (search.value === '' || Object.values(d).some((v) => v.toLowerCase().includes(search.value.toLowerCase()))),
    ),
);

/** Return Tailwind badge classes for a delivery status. */
function statusClass(s: string) {
    return (
        (
            {
                Livré: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
                'En cours': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                'En attente': 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
                Retardé: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
                Annulé: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[s] ?? ''
    );
}
/** Return Tailwind badge classes for a priority level. */
function priorityClass(p: string) {
    return (
        (
            {
                Urgent: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
                High: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
                Standard: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                Low: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[p] ?? ''
    );
}
</script>

