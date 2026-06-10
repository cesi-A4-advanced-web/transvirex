<template>
    <AppLayout>
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Colis</h1>
                <p class="text-muted-foreground text-sm mt-1">Suivi des colis en transit</p>
            </div>
            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence colis..." class="pl-9" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Facture</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Poids (kg)</TableHead>
                                <TableHead>Livraison</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="c in filtered" :key="c.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ c.ref }}</TableCell>
                                <TableCell class="font-mono text-xs text-primary">{{ c.invoice }}</TableCell>
                                <TableCell class="font-medium">{{ c.client }}</TableCell>
                                <TableCell>{{ c.weight }}</TableCell>
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ c.delivery }}</TableCell>
                                <TableCell
                                    ><Badge :class="statusClass(c.status)">{{ c.status }}</Badge></TableCell
                                >
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
import { Search } from '@lucide/vue';
definePageMeta({ layout: false });
useHead({ title: 'Colis — Dispatcher' });
/** Search/filter input value. */
const search = ref('');
/** Static list of parcels for the demo table. */
const parcels = [
    {
        ref: 'PCL-0001',
        invoice: 'FAC-2026-001',
        client: 'Société Durand',
        weight: '12.5',
        delivery: '#LIV-0091',
        status: 'Livré',
    },
    {
        ref: 'PCL-0002',
        invoice: 'FAC-2026-001',
        client: 'Société Durand',
        weight: '8.0',
        delivery: '#LIV-0091',
        status: 'Livré',
    },
    {
        ref: 'PCL-0003',
        invoice: 'FAC-2026-002',
        client: 'SARL Martin',
        weight: '25.0',
        delivery: '#LIV-0092',
        status: 'En cours',
    },
    {
        ref: 'PCL-0004',
        invoice: 'FAC-2026-003',
        client: 'Express Cargo',
        weight: '5.5',
        delivery: '#LIV-0093',
        status: 'En attente',
    },
    {
        ref: 'PCL-0005',
        invoice: 'FAC-2026-004',
        client: 'TGV Express',
        weight: '18.0',
        delivery: '#LIV-0094',
        status: 'En attente',
    },
    {
        ref: 'PCL-0006',
        invoice: 'FAC-2026-005',
        client: 'Logistics Plus',
        weight: '3.2',
        delivery: '#LIV-0095',
        status: 'En cours',
    },
];
/** Parcels filtered by the search query. */
const filtered = computed(() =>
    parcels.filter(
        (c) => !search.value || Object.values(c).some((v) => v.toLowerCase().includes(search.value.toLowerCase())),
    ),
);
/** Return Tailwind badge classes for a parcel status. */
function statusClass(s: string) {
    return (
        (
            {
                Livré: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
                'En cours': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                'En attente': 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
            } as Record<string, string>
        )[s] ?? ''
    );
}
</script>
