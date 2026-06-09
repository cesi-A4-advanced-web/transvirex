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

            <Card>
                <CardContent class="p-0">
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
                            <TableRow v-for="d in filtered" :key="d.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                <TableCell>
                                    <div class="flex items-center gap-2.5">
                                        <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{{ d.name.charAt(0) }}</div>
                                        <span class="font-medium">{{ d.name }}</span>
                                    </div>
                                </TableCell>
                                <TableCell class="text-xs text-muted-foreground">{{ d.email }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ d.vehicle }}</TableCell>
                                <TableCell>{{ d.hub }}</TableCell>
                                <TableCell class="text-yellow-500 font-semibold text-xs">★ {{ d.rating }}</TableCell>
                                <TableCell>
                                    <Badge :class="d.status === 'Disponible' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' : d.status === 'En livraison' ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'">{{ d.status }}</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">{{ filtered.length }} chauffeur(s)</div>
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
useHead({ title: 'Chauffeurs — Transvirex' });

const search = ref('');
const drivers = [
    { ref: 'DRV-001', name: 'Pierre Martin', email: 'driver@transvirex.fr', vehicle: 'Fourgon FO-001', hub: 'Hub Paris Centre', rating: 4.8, status: 'En livraison' },
    { ref: 'DRV-002', name: 'Marc Dupont', email: 'm.dupont@transvirex.fr', vehicle: 'Fourgon FO-002', hub: 'Hub Paris Centre', rating: 4.9, status: 'Disponible' },
    { ref: 'DRV-003', name: 'Sophie Martin', email: 's.martin@transvirex.fr', vehicle: 'Camionnette CM-001', hub: 'Hub Lyon', rating: 4.7, status: 'En livraison' },
    { ref: 'DRV-004', name: 'Alain Bernard', email: 'a.bernard@transvirex.fr', vehicle: 'Fourgon FO-003', hub: 'Hub Bordeaux', rating: 4.6, status: 'Disponible' },
    { ref: 'DRV-005', name: 'Julie Thomas', email: 'j.thomas@transvirex.fr', vehicle: 'Vélo cargo VC-001', hub: 'Hub Paris Centre', rating: 4.5, status: 'Repos' },
    { ref: 'DRV-006', name: 'Robert Petit', email: 'r.petit@transvirex.fr', vehicle: 'Camionnette CM-002', hub: 'Hub Lille', rating: 4.7, status: 'En livraison' },
    { ref: 'DRV-007', name: 'Claire Leroy', email: 'c.leroy@transvirex.fr', vehicle: 'Fourgon FO-004', hub: 'Hub Nantes', rating: 4.8, status: 'Disponible' },
];
const filtered = computed(() => drivers.filter(d => !search.value || Object.values(d).some(v => String(v).toLowerCase().includes(search.value.toLowerCase()))));
</script>
