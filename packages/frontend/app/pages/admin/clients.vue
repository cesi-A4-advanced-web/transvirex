<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Clients</h1>
                    <p class="text-muted-foreground text-sm mt-1">Gestion du portefeuille clients</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouveau client</Button>
            </div>

            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Nom, email, hub..." class="pl-9" />
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
                                <TableHead>Type</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Hub</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="c in filtered" :key="c.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ c.ref }}</TableCell>
                                <TableCell class="font-medium">{{ c.name }}</TableCell>
                                <TableCell
                                    ><Badge variant="outline">{{ c.type }}</Badge></TableCell
                                >
                                <TableCell class="text-muted-foreground">{{ c.contact }}</TableCell>
                                <TableCell class="text-xs text-muted-foreground">{{ c.email }}</TableCell>
                                <TableCell>{{ c.hub }}</TableCell>
                                <TableCell>
                                    <Badge
                                        :class="
                                            c.status === 'active'
                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
                                        "
                                    >
                                        {{ c.status === 'active' ? 'Actif' : 'Inactif' }}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">{{ filtered.length }} client(s)</div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus, Search } from 'lucide-vue-next';

definePageMeta({ layout: false });
useHead({ title: 'Clients — Transvirex' });

/** Search/filter input value. */
const search = ref('');
/** Static list of clients for the demo table. */
const clients = [
    {
        ref: 'CLI-001',
        name: 'Société Durand',
        type: 'Entreprise',
        contact: 'Jean Durand',
        email: 'j.durand@durand.fr',
        hub: 'Hub Paris Centre',
        status: 'active',
    },
    {
        ref: 'CLI-002',
        name: 'SARL Martin',
        type: 'PME',
        contact: 'Sophie Martin',
        email: 's.martin@martin.fr',
        hub: 'Hub Lyon',
        status: 'active',
    },
    {
        ref: 'CLI-003',
        name: 'Express Cargo',
        type: 'Entreprise',
        contact: 'Paul Bernard',
        email: 'p.bernard@cargo.fr',
        hub: 'Hub Bordeaux',
        status: 'active',
    },
    {
        ref: 'CLI-004',
        name: 'TGV Express',
        type: 'Grand compte',
        contact: 'Marie Thomas',
        email: 'm.thomas@tgv.fr',
        hub: 'Hub Paris Centre',
        status: 'active',
    },
    {
        ref: 'CLI-005',
        name: 'Logistics Plus',
        type: 'Entreprise',
        contact: 'Robert Petit',
        email: 'r.petit@logistics.fr',
        hub: 'Hub Lille',
        status: 'inactive',
    },
    {
        ref: 'CLI-006',
        name: 'Nord Fret',
        type: 'PME',
        contact: 'Claire Leroy',
        email: 'c.leroy@nordfret.fr',
        hub: 'Hub Lille',
        status: 'active',
    },
    {
        ref: 'CLI-007',
        name: 'Alsace Trans',
        type: 'Entreprise',
        contact: 'Marc Dupont',
        email: 'm.dupont@alsace.fr',
        hub: 'Hub Strasbourg',
        status: 'active',
    },
];
/** Clients filtered by the search query. */
const filtered = computed(() =>
    clients.filter(
        (c) => !search.value || Object.values(c).some((v) => v.toLowerCase().includes(search.value.toLowerCase())),
    ),
);
</script>
