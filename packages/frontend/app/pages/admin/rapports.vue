<template>
    <AppLayout>
        <div class="space-y-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Rapports</h1>
                    <p class="text-muted-foreground text-sm mt-1">Indicateurs de performance</p>
                </div>
                <Button variant="outline"><Download class="w-4 h-4 mr-2" />Exporter</Button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card v-for="kpi in kpis" :key="kpi.label">
                    <CardHeader class="pb-2">
                        <CardDescription>{{ kpi.label }}</CardDescription>
                        <CardTitle class="text-2xl">{{ kpi.value }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p class="text-xs" :class="kpi.trend >= 0 ? 'text-green-600' : 'text-red-500'">
                            {{ kpi.trend >= 0 ? '▲' : '▼' }}
                            {{ Math.abs(kpi.trend) }}% ce mois
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card>
                    <CardHeader><CardTitle class="text-base">Livraisons par statut</CardTitle></CardHeader>
                    <CardContent>
                        <div class="space-y-3">
                            <div v-for="stat in deliveryStats" :key="stat.label" class="flex items-center gap-3">
                                <span class="text-sm text-muted-foreground w-24 flex-shrink-0">{{ stat.label }}</span>
                                <div class="flex-1 bg-muted rounded-full h-2">
                                    <div
                                        class="h-2 rounded-full transition-all"
                                        :class="stat.color"
                                        :style="{ width: stat.pct + '%' }"
                                    />
                                </div>
                                <span class="text-sm font-semibold w-10 text-right">{{ stat.count }}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle class="text-base">Performance par hub</CardTitle></CardHeader>
                    <CardContent class="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Hub</TableHead>
                                    <TableHead class="text-right">Livraisons</TableHead>
                                    <TableHead class="text-right">Taux succès</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="h in hubPerf" :key="h.name">
                                    <TableCell>{{ h.name }}</TableCell>
                                    <TableCell class="text-right text-muted-foreground">{{ h.deliveries }}</TableCell>
                                    <TableCell
                                        class="text-right font-semibold"
                                        :class="
                                            h.rate >= 95
                                                ? 'text-green-600'
                                                : h.rate >= 85
                                                  ? 'text-orange-500'
                                                  : 'text-red-500'
                                        "
                                        >{{ h.rate }}%</TableCell
                                    >
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Rapports — Transvirex' });

/** Top-level KPI metric cards. */
const kpis = [
    { label: 'Livraisons ce mois', value: '3 247', trend: 8 },
    { label: 'Taux de succès', value: '94.2%', trend: 2 },
    { label: 'Délai moyen', value: '2.4h', trend: -5 },
    { label: 'CA mensuel', value: '€ 124 500', trend: 12 },
];
/** Delivery status distribution for the progress bars. */
const deliveryStats = [
    { label: 'Livrés', count: 2841, pct: 87.5, color: 'bg-green-500' },
    { label: 'En cours', count: 247, pct: 7.6, color: 'bg-blue-500' },
    { label: 'Retardés', count: 98, pct: 3.0, color: 'bg-orange-400' },
    { label: 'Annulés', count: 61, pct: 1.9, color: 'bg-red-400' },
];
/** Per-hub delivery performance data. */
const hubPerf = [
    { name: 'Paris Centre', deliveries: 1240, rate: 96.2 },
    { name: 'Lyon', deliveries: 720, rate: 94.8 },
    { name: 'Bordeaux', deliveries: 580, rate: 93.1 },
    { name: 'Lille', deliveries: 410, rate: 89.5 },
    { name: 'Nantes', deliveries: 297, rate: 97.0 },
];
</script>
