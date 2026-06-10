<template>
    <AppLayout>
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Clients</h1>
                <p class="text-muted-foreground text-sm mt-1">Liste des clients actifs</p>
            </div>
            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Rechercher un client..." class="pl-9" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Hub</TableHead>
                                <TableHead>Livraisons actives</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="c in filtered" :key="c.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ c.ref }}</TableCell>
                                <TableCell class="font-medium">{{ c.name }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ c.contact }}</TableCell>
                                <TableCell class="text-xs text-muted-foreground">{{ c.email }}</TableCell>
                                <TableCell>{{ c.hub }}</TableCell>
                                <TableCell>
                                    <span
                                        class="font-semibold"
                                        :class="c.active > 0 ? 'text-primary' : 'text-muted-foreground'"
                                        >{{ c.active }}</span
                                    >
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>
<script setup lang="ts">
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from '@lucide/vue';
definePageMeta({ layout: false });
useHead({ title: 'Clients — Dispatcher' });
/** Search/filter input value. */
const search = ref('');
/** Static list of clients for the demo table. */
const clients = [
    {
        ref: 'CLI-001',
        name: 'Société Durand',
        contact: 'Jean Durand',
        email: 'j.durand@durand.fr',
        hub: 'Hub Paris Centre',
        active: 3,
    },
    {
        ref: 'CLI-002',
        name: 'SARL Martin',
        contact: 'Sophie Martin',
        email: 's.martin@martin.fr',
        hub: 'Hub Lyon',
        active: 1,
    },
    {
        ref: 'CLI-003',
        name: 'Express Cargo',
        contact: 'Paul Bernard',
        email: 'p.bernard@cargo.fr',
        hub: 'Hub Bordeaux',
        active: 2,
    },
    {
        ref: 'CLI-004',
        name: 'TGV Express',
        contact: 'Marie Thomas',
        email: 'm.thomas@tgv.fr',
        hub: 'Hub Paris Centre',
        active: 0,
    },
    {
        ref: 'CLI-005',
        name: 'Nord Fret',
        contact: 'Claire Leroy',
        email: 'c.leroy@nordfret.fr',
        hub: 'Hub Lille',
        active: 1,
    },
];
/** Clients filtered by the search query. */
const filtered = computed(() =>
    clients.filter(
        (c) =>
            !search.value || Object.values(c).some((v) => String(v).toLowerCase().includes(search.value.toLowerCase())),
    ),
);
</script>

