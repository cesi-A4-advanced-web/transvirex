<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p class="text-muted-foreground text-sm mt-1">Opérations en temps réel</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card v-for="kpi in kpis" :key="kpi.label">
                    <CardHeader class="pb-2">
                        <CardDescription>{{ kpi.label }}</CardDescription>
                        <CardTitle class="text-3xl">{{ kpi.value }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p class="text-xs" :class="kpi.urgentColor ?? 'text-muted-foreground'">{{ kpi.sub }}</p>
                    </CardContent>
                </Card>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card class="xl:col-span-2">
                    <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                        <div class="flex items-center gap-2">
                            <CardTitle class="text-base">À assigner</CardTitle>
                            <Badge class="bg-red-100 text-red-600 border-red-200 hover:bg-red-100">{{ pendingDeliveries.length }}</Badge>
                        </div>
                        <NuxtLink to="/dispatcher/livraisons" class="text-xs text-primary hover:underline">Voir tout →</NuxtLink>
                    </CardHeader>
                    <CardContent class="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Destination</TableHead>
                                    <TableHead>Priorité</TableHead>
                                    <TableHead>Échéance</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="d in pendingDeliveries" :key="d.ref">
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                    <TableCell class="font-medium">{{ d.client }}</TableCell>
                                    <TableCell>{{ d.destination }}</TableCell>
                                    <TableCell><Badge :class="priorityClass(d.priority)">{{ d.priority }}</Badge></TableCell>
                                    <TableCell class="text-muted-foreground text-xs">{{ d.due }}</TableCell>
                                    <TableCell>
                                        <Button variant="link" size="sm" class="p-0 h-auto text-primary">Assigner</Button>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <div class="space-y-4">
                    <Card>
                        <CardHeader class="pb-3"><CardTitle class="text-base">Chauffeurs disponibles</CardTitle></CardHeader>
                        <CardContent class="space-y-2">
                            <div v-for="driver in availableDrivers" :key="driver.name" class="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/50">
                                <div class="flex items-center gap-2.5">
                                    <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{{ driver.name.charAt(0) }}</div>
                                    <div>
                                        <p class="text-sm font-medium">{{ driver.name }}</p>
                                        <p class="text-xs text-muted-foreground">{{ driver.vehicle }}</p>
                                    </div>
                                </div>
                                <span class="text-yellow-500 text-xs font-semibold">★ {{ driver.rating }}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                            <CardTitle class="text-base">Alertes</CardTitle>
                            <Badge class="bg-orange-100 text-orange-600 border-orange-200 hover:bg-orange-100">{{ alerts.length }}</Badge>
                        </CardHeader>
                        <CardContent class="space-y-2">
                            <div v-for="alert in alerts" :key="alert.ref" class="flex items-start gap-2.5 py-2 px-3 rounded-lg" :class="alert.bg">
                                <component :is="alert.icon" class="w-4 h-4 flex-shrink-0 mt-0.5" :class="alert.color" />
                                <div>
                                    <p class="text-xs font-semibold" :class="alert.color">{{ alert.ref }}</p>
                                    <p class="text-xs text-muted-foreground mt-0.5">{{ alert.message }}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Truck, Clock, CheckCircle, AlertTriangle, XCircle, Package } from 'lucide-vue-next';

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Dispatcher — Transvirex' });

const kpis = [
    { label: 'À assigner', value: '12', sub: '3 urgents', urgentColor: 'text-red-500' },
    { label: 'En cours', value: '47', sub: 'En livraison', urgentColor: 'text-blue-500' },
    { label: 'Retardées', value: '5', sub: 'Nécessitent attention', urgentColor: 'text-orange-500' },
    { label: 'Terminées', value: '83', sub: "Aujourd'hui", urgentColor: 'text-green-500' },
];

const pendingDeliveries = [
    { ref: '#LIV-0097', client: 'Société Durand', destination: 'Paris 8e', priority: 'Urgent', due: 'Auj. 14h' },
    { ref: '#LIV-0098', client: 'SARL Martin', destination: 'Lyon 3e', priority: 'High', due: 'Auj. 17h' },
    { ref: '#LIV-0099', client: 'Express Cargo', destination: 'Bordeaux', priority: 'Standard', due: 'Demain 9h' },
    { ref: '#LIV-0100', client: 'Logistics Plus', destination: 'Nantes', priority: 'Urgent', due: 'Auj. 15h' },
    { ref: '#LIV-0101', client: 'TGV Express', destination: 'Lille', priority: 'Low', due: 'Demain 12h' },
];

const availableDrivers = [
    { name: 'M. Dupont', vehicle: 'Fourgon — FO-001', rating: 4.9 },
    { name: 'A. Bernard', vehicle: 'Camionnette — CM-003', rating: 4.7 },
    { name: 'R. Petit', vehicle: 'Fourgon — FO-005', rating: 4.6 },
    { name: 'C. Leroy', vehicle: 'Vélo cargo — VC-002', rating: 4.8 },
];

const alerts = [
    { ref: '#LIV-0086', message: 'Adresse introuvable — client non joignable', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { ref: '#LIV-0088', message: 'Retard estimé +45 min (trafic A6)', icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50' },
    { ref: '#LIV-0090', message: 'Colis endommagé signalé par chauffeur', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50' },
];

function priorityClass(p: string) { return ({ 'Urgent': 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100', 'High': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100', 'Standard': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100', 'Low': 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100' } as Record<string, string>)[p] ?? ''; }
</script>
