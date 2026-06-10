<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p class="text-muted-foreground text-sm mt-1">Vue d'ensemble des opérations</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card v-for="kpi in kpis" :key="kpi.label">
                    <CardHeader class="pb-2">
                        <CardDescription>{{ kpi.label }}</CardDescription>
                        <CardTitle class="text-3xl">{{ kpi.value }}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div
                            class="flex items-center gap-1 text-xs"
                            :class="kpi.trend >= 0 ? 'text-green-600' : 'text-red-500'"
                        >
                            <TrendingUp v-if="kpi.trend >= 0" class="w-3.5 h-3.5" />
                            <TrendingDown v-else class="w-3.5 h-3.5" />
                            {{ Math.abs(kpi.trend) }}% vs hier
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card class="xl:col-span-2">
                    <CardHeader>
                        <CardTitle class="text-base">Devis / Bons de commande / Factures</CardTitle>
                        <CardDescription>Comparaison mensuelle — 6 derniers mois</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClientOnly>
                            <div class="h-64">
                                <Bar :data="barData" :options="barOptions" />
                            </div>
                            <template #fallback>
                                <div class="h-64 bg-muted/30 rounded-lg animate-pulse" />
                            </template>
                        </ClientOnly>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle class="text-base">Statuts de livraisons</CardTitle>
                        <CardDescription>Répartition du mois en cours</CardDescription>
                    </CardHeader>
                    <CardContent class="flex flex-col items-center">
                        <ClientOnly>
                            <div class="h-52 w-52">
                                <Doughnut :data="doughnutData" :options="doughnutOptions" />
                            </div>
                            <template #fallback>
                                <div class="h-52 w-52 rounded-full bg-muted/30 animate-pulse" />
                            </template>
                        </ClientOnly>
                        <div class="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs w-full">
                            <div
                                v-for="(label, i) in doughnutData.labels"
                                :key="String(label)"
                                class="flex items-center gap-1.5"
                            >
                                <span
                                    class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                    :style="{
                                        background: String((doughnutData.datasets[0].backgroundColor as string[])[i]),
                                    }"
                                />
                                <span>{{ label }}</span>
                                <span class="text-muted-foreground ml-auto"
                                    >{{ doughnutData.datasets[0].data[i] }}%</span
                                >
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle class="text-base">Livraisons — 30 derniers jours</CardTitle>
                        <CardDescription>Évolution quotidienne</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClientOnly>
                            <div class="h-56">
                                <Line :data="lineData" :options="lineOptions" />
                            </div>
                            <template #fallback>
                                <div class="h-56 bg-muted/30 rounded-lg animate-pulse" />
                            </template>
                        </ClientOnly>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle class="text-base">Projection CA mensuel</CardTitle>
                        <CardDescription>Réalisé vs prévisionnel (€)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ClientOnly>
                            <div class="h-56">
                                <Line :data="projectionData" :options="projectionOptions" />
                            </div>
                            <template #fallback>
                                <div class="h-56 bg-muted/30 rounded-lg animate-pulse" />
                            </template>
                        </ClientOnly>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle class="text-base">Livraisons récentes</CardTitle>
                    <NuxtLink to="/admin/livraisons" class="text-xs text-primary hover:underline">Voir tout →</NuxtLink>
                </CardHeader>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Chauffeur</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Heure</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="d in recentDeliveries" :key="d.id">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.id }}</TableCell>
                                <TableCell>{{ d.destination }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ d.driver }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ d.client }}</TableCell>
                                <TableCell
                                    ><Badge :class="statusClass(d.status)">{{ d.status }}</Badge></TableCell
                                >
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.time }}</TableCell>
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingDown, TrendingUp } from '@lucide/vue';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'vue-chartjs';

/** Register Chart.js components used across dashboard charts. */
ChartJS.register(
    Title,
    Tooltip,
    Legend,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement,
    ArcElement,
    Filler,
);

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Admin — Transvirex' });

/** KPI metric cards for the admin dashboard. */
const kpis = [
    { label: "Livraisons aujourd'hui", value: '247', trend: 12 },
    { label: 'Stock disponible', value: '1 284', trend: -3 },
    { label: 'Chauffeurs actifs', value: '38', trend: 5 },
    { label: 'Revenu mensuel', value: '€ 124 500', trend: 8 },
];

/** Recent deliveries data for the activity table. */
const recentDeliveries = [
    {
        id: '#LIV-0091',
        destination: 'Paris 15e',
        driver: 'M. Dupont',
        client: 'Société Durand',
        status: 'Livré',
        time: '08:32',
    },
    {
        id: '#LIV-0092',
        destination: 'Lyon Part-Dieu',
        driver: 'S. Martin',
        client: 'SARL Martin',
        status: 'En cours',
        time: '09:14',
    },
    {
        id: '#LIV-0093',
        destination: 'Bordeaux Centre',
        driver: 'A. Bernard',
        client: 'Express Cargo',
        status: 'En attente',
        time: '10:05',
    },
    {
        id: '#LIV-0094',
        destination: 'Marseille 13e',
        driver: 'J. Thomas',
        client: 'TGV Express',
        status: 'Livré',
        time: '10:22',
    },
    {
        id: '#LIV-0095',
        destination: 'Lille Centre',
        driver: 'R. Petit',
        client: 'Logistics Plus',
        status: 'En cours',
        time: '11:00',
    },
    {
        id: '#LIV-0096',
        destination: 'Nantes Ouest',
        driver: 'C. Leroy',
        client: 'Nord Fret',
        status: 'Retardé',
        time: '11:45',
    },
];

/**
 * Return Tailwind CSS classes for a delivery status badge.
 */
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

/** Chart axis tick font configuration. */
const tickFont = { size: 11 };
/** Chart grid line color. */
const gridColor = 'rgba(0,0,0,0.06)';

/** Stacked bar chart data: monthly document counts (devis, bons de commande, factures). */
const barData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
        {
            label: 'Devis',
            data: [45, 52, 38, 61, 49, 57],
            backgroundColor: '#fbbf24',
            borderRadius: 4,
            borderSkipped: false,
        },
        {
            label: 'Bons de commande',
            data: [38, 44, 31, 55, 42, 48],
            backgroundColor: '#60a5fa',
            borderRadius: 4,
            borderSkipped: false,
        },
        {
            label: 'Factures',
            data: [32, 39, 28, 47, 36, 43],
            backgroundColor: '#34d399',
            borderRadius: 4,
            borderSkipped: false,
        },
    ],
};

/** Stacked bar chart options configuration. */
const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: { boxWidth: 10, padding: 16, font: tickFont },
        },
        tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: tickFont } },
        y: { grid: { color: gridColor }, ticks: { font: tickFont } },
    },
};

/** Doughnut chart data: delivery status distribution. */
const doughnutData = {
    labels: ['Livré', 'En cours', 'En attente', 'Retardé', 'Annulé'],
    datasets: [
        {
            data: [58, 18, 12, 7, 5],
            backgroundColor: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280'],
            borderWidth: 0,
            hoverOffset: 6,
        },
    ],
};

/** Doughnut chart options configuration. */
const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx: { label: string; parsed: number }) => ` ${ctx.label}: ${ctx.parsed}%`,
            },
        },
    },
    cutout: '68%',
};

/** Line chart data: daily delivery volume over 30 days. */
const lineData = {
    labels: Array.from({ length: 30 }, (_, i) => (i % 5 === 0 ? `J-${29 - i}` : '')),
    datasets: [
        {
            label: 'Livraisons',
            data: [
                210, 225, 198, 240, 255, 230, 218, 262, 244, 258, 235, 270, 248, 232, 265, 278, 255, 242, 268, 283, 260,
                247, 271, 289, 265, 253, 278, 294, 272, 247,
            ],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            borderWidth: 2,
        },
    ],
};

/** Line chart options configuration. */
const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: tickFont } },
        y: { grid: { color: gridColor }, ticks: { font: tickFont } },
    },
};

/** Projection chart data: actual vs forecasted monthly revenue. */
const projectionData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
    datasets: [
        {
            label: 'Réalisé',
            data: [98000, 105000, 112000, 108000, 124500, null, null, null, null, null, null, null],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.08)',
            fill: true,
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 2,
        },
        {
            label: 'Prévisionnel',
            data: [null, null, null, null, 124500, 131000, 138000, 142000, 135000, 148000, 155000, 162000],
            borderColor: '#94a3b8',
            borderDash: [6, 3],
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 2,
        },
    ],
};

/** Projection chart options configuration. */
const projectionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: { boxWidth: 10, padding: 16, font: tickFont },
        },
        tooltip: {
            mode: 'index' as const,
            intersect: false,
            callbacks: {
                label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
                    ctx.parsed.y != null ? ` ${ctx.dataset.label}: € ${ctx.parsed.y.toLocaleString('fr-FR')}` : '',
            },
        },
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: tickFont } },
        y: {
            grid: { color: gridColor },
            ticks: {
                font: tickFont,
                callback: (v: number | string) => `${Number(v) / 1000}k`,
            },
        },
    },
};
</script>
