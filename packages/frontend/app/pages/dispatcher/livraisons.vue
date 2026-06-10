<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Livraisons</h1>
                    <p class="text-muted-foreground text-sm mt-1">Suivi et assignation</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Planifier</Button>
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
                        :class="
                            activeTab === tab.value
                                ? 'bg-white/20 text-white border-transparent'
                                : 'bg-muted text-muted-foreground border-transparent'
                        "
                        >{{ tab.count }}</Badge
                    >
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

            <Card>
                <CardContent class="p-0">
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
                            <TableRow v-for="d in filtered" :key="d.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                <TableCell class="font-medium">{{ d.client }}</TableCell>
                                <TableCell>{{ d.destination }}</TableCell>
                                <TableCell
                                    ><Badge :class="priorityClass(d.priority)">{{ d.priority }}</Badge></TableCell
                                >
                                <TableCell class="text-muted-foreground">{{ d.driver || '—' }}</TableCell>
                                <TableCell
                                    ><Badge :class="statusClass(d.status)">{{ d.status }}</Badge></TableCell
                                >
                                <TableCell>
                                    <Button
                                        v-if="!d.driver"
                                        variant="link"
                                        size="sm"
                                        class="p-0 h-auto font-semibold text-primary"
                                        >Assigner</Button
                                    >
                                    <Button v-else variant="ghost" size="sm" class="p-0 h-auto text-muted-foreground"
                                        >Détails</Button
                                    >
                                </TableCell>
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
useHead({ title: 'Livraisons — Dispatcher' });

/** Search/filter input value. */
const search = ref('');
/** Currently selected tab. */
const activeTab = ref('all');
/** Tab definitions with labels and counts. */
const tabs = [
    { label: 'Toutes', value: 'all', count: 0 },
    { label: 'À assigner', value: 'unassigned', count: 12 },
    { label: 'En cours', value: 'ongoing', count: 47 },
    { label: 'Terminées', value: 'done', count: 0 },
];
/** Static list of deliveries for the demo table. */
const deliveries = [
    {
        ref: '#LIV-0091',
        client: 'Société Durand',
        destination: 'Paris 15e',
        priority: 'Standard',
        driver: 'M. Dupont',
        status: 'Livré',
    },
    {
        ref: '#LIV-0092',
        client: 'SARL Martin',
        destination: 'Lyon Part-Dieu',
        priority: 'High',
        driver: 'S. Martin',
        status: 'En cours',
    },
    {
        ref: '#LIV-0093',
        client: 'Express Cargo',
        destination: 'Bordeaux Centre',
        priority: 'Standard',
        driver: null,
        status: 'En attente',
    },
    {
        ref: '#LIV-0094',
        client: 'TGV Express',
        destination: 'Marseille 13e',
        priority: 'Urgent',
        driver: null,
        status: 'En attente',
    },
    {
        ref: '#LIV-0095',
        client: 'Logistics Plus',
        destination: 'Lille Centre',
        priority: 'High',
        driver: 'R. Petit',
        status: 'En cours',
    },
    {
        ref: '#LIV-0096',
        client: 'Nord Fret',
        destination: 'Nantes Ouest',
        priority: 'Standard',
        driver: 'C. Leroy',
        status: 'Retardé',
    },
    {
        ref: '#LIV-0097',
        client: 'Alsace Trans',
        destination: 'Strasbourg',
        priority: 'Low',
        driver: null,
        status: 'En attente',
    },
];
/** Deliveries filtered by tab and search query. */
const filtered = computed(() =>
    deliveries.filter((d) => {
        const tabOk =
            activeTab.value === 'all' ||
            (activeTab.value === 'unassigned' && !d.driver) ||
            (activeTab.value === 'ongoing' && d.status === 'En cours') ||
            (activeTab.value === 'done' && d.status === 'Livré');
        const searchOk =
            !search.value ||
            Object.values(d).some((v) =>
                String(v || '')
                    .toLowerCase()
                    .includes(search.value.toLowerCase()),
            );
        return tabOk && searchOk;
    }),
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
