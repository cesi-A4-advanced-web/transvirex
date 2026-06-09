<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Véhicules</h1>
                    <p class="text-muted-foreground text-sm mt-1">Gestion de la flotte de véhicules</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouveau véhicule</Button>
            </div>

            <Card>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Immatriculation</TableHead>
                                <TableHead>Hub</TableHead>
                                <TableHead>Chauffeur assigné</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="v in vehicles" :key="v.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ v.ref }}</TableCell>
                                <TableCell class="font-medium">{{ v.type }}</TableCell>
                                <TableCell class="font-mono text-sm">{{ v.plate }}</TableCell>
                                <TableCell>{{ v.hub }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ v.driver || '—' }}</TableCell>
                                <TableCell>
                                    <Badge :class="v.status === 'En service' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' : v.status === 'En maintenance' ? 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'">{{ v.status }}</Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">{{ vehicles.length }} véhicule(s)</div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Plus } from 'lucide-vue-next';

definePageMeta({ layout: false });
useHead({ title: 'Véhicules — Transvirex' });

const vehicles = [
    { ref: 'FO-001', type: 'Fourgon', plate: 'AB-123-CD', hub: 'Hub Paris Centre', driver: 'Pierre Martin', status: 'En service' },
    { ref: 'FO-002', type: 'Fourgon', plate: 'EF-456-GH', hub: 'Hub Paris Centre', driver: 'Marc Dupont', status: 'En service' },
    { ref: 'FO-003', type: 'Fourgon', plate: 'IJ-789-KL', hub: 'Hub Bordeaux', driver: 'Alain Bernard', status: 'En service' },
    { ref: 'FO-004', type: 'Fourgon', plate: 'MN-012-OP', hub: 'Hub Nantes', driver: null, status: 'En maintenance' },
    { ref: 'CM-001', type: 'Camionnette', plate: 'QR-345-ST', hub: 'Hub Lyon', driver: 'Sophie Martin', status: 'En service' },
    { ref: 'CM-002', type: 'Camionnette', plate: 'UV-678-WX', hub: 'Hub Lille', driver: 'Robert Petit', status: 'En service' },
    { ref: 'VC-001', type: 'Vélo cargo', plate: '—', hub: 'Hub Paris Centre', driver: null, status: 'Disponible' },
    { ref: 'VC-002', type: 'Vélo cargo', plate: '—', hub: 'Hub Paris Centre', driver: null, status: 'En maintenance' },
];
</script>
