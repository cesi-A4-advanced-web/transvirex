<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
                <p class="text-muted-foreground text-sm mt-1">Vue d'ensemble des opérations</p>
            </div>

            <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card v-for="i in 4" :key="i">
                    <CardHeader class="pb-2">
                        <div class="h-3 w-20 bg-muted/50 animate-pulse rounded" />
                        <div class="h-8 w-24 bg-muted/50 animate-pulse rounded mt-2" />
                    </CardHeader>
                    <CardContent>
                        <div class="h-3 w-16 bg-muted/30 animate-pulse rounded" />
                    </CardContent>
                </Card>
            </div>

            <div v-else-if="error" class="text-center py-12 text-muted-foreground">
                <p>Erreur : {{ error }}</p>
                <Button variant="outline" class="mt-4" @click="fetchData">Réessayer</Button>
            </div>

            <template v-else>
                <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <Card v-for="kpi in kpis" :key="kpi.label">
                        <CardHeader class="pb-2">
                            <CardDescription>{{ kpi.label }}</CardDescription>
                            <CardTitle class="text-2xl md:text-3xl">{{ kpi.value }}</CardTitle>
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
                                <div class="h-48 md:h-64">
                                    <Bar :data="barData" :options="barOptions" />
                                </div>
                                <template #fallback>
                                    <div class="h-48 md:h-64 bg-muted/30 rounded-lg animate-pulse" />
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
                                <div class="h-40 w-40 md:h-52 md:w-52">
                                    <Doughnut :data="doughnutData" :options="doughnutOptions" />
                                </div>
                                <template #fallback>
                                    <div class="h-40 w-40 md:h-52 md:w-52 rounded-full bg-muted/30 animate-pulse" />
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
                                <div class="h-40 md:h-56">
                                    <Line :data="lineData" :options="lineOptions" />
                                </div>
                                <template #fallback>
                                    <div class="h-40 md:h-56 bg-muted/30 rounded-lg animate-pulse" />
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
                                <div class="h-40 md:h-56">
                                    <Line :data="projectionData" :options="projectionOptions" />
                                </div>
                                <template #fallback>
                                    <div class="h-40 md:h-56 bg-muted/30 rounded-lg animate-pulse" />
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
                    <CardContent class="p-0 overflow-x-auto">
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
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                    <TableCell>{{ d.destination }}</TableCell>
                                    <TableCell class="text-muted-foreground">{{ d.driver }}</TableCell>
                                    <TableCell class="text-muted-foreground">{{ d.client }}</TableCell>
                                    <TableCell><Badge :class="statusClass(d.status)">{{ d.status }}</Badge></TableCell>
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ d.time }}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </template>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import type { ApiDelivery, ApiHub, ApiInvoice, ApiUser, PaginatedResponse } from '@/composables/useApi';

ChartJS.register(
    Title, Tooltip, Legend,
    BarElement, CategoryScale, LinearScale,
    LineElement, PointElement, ArcElement, Filler,
);

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Admin — Transvirex' });

const { get } = useApi();
const loading = ref(true);
const error = ref<string | null>(null);

const kpis = ref<Array<{ label: string; value: string; trend: number }>>([]);
const recentDeliveries = ref<Array<{ id: string; ref: string; destination: string; driver: string; client: string; status: string; time: string }>>([]);
const barData = ref<any>({ labels: [], datasets: [] });
const doughnutData = ref<any>({ labels: [], datasets: [] });
const lineData = ref<any>({ labels: [], datasets: [] });
const projectionData = ref<any>({ labels: [], datasets: [] });

const tickFont = { size: 11 };
const gridColor = 'rgba(0,0,0,0.06)';

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 16, font: tickFont } }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: { x: { grid: { display: false }, ticks: { font: tickFont } }, y: { grid: { color: gridColor }, ticks: { font: tickFont } } },
};

const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: { label: string; parsed: number }) => ` ${ctx.label}: ${ctx.parsed}%` } } },
    cutout: '68%',
};

const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode: 'index' as const, intersect: false } },
    scales: { x: { grid: { display: false }, ticks: { font: tickFont } }, y: { grid: { color: gridColor }, ticks: { font: tickFont } } },
};

const projectionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 16, font: tickFont } },
        tooltip: { mode: 'index' as const, intersect: false, callbacks: { label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) => ctx.parsed.y != null ? ` ${ctx.dataset.label}: € ${ctx.parsed.y.toLocaleString('fr-FR')}` : '' } },
    },
    scales: {
        x: { grid: { display: false }, ticks: { font: tickFont } },
        y: { grid: { color: gridColor }, ticks: { font: tickFont, callback: (v: number | string) => `${Number(v) / 1000}k` } },
    },
};

const statusLabels: Record<string, string> = {
    delivered: 'Livré', planned: 'Planifié', delivering: 'En cours',
    cancelled: 'Annulé', blocked: 'Bloqué', delayed: 'Retardé',
};

const statusClassMap: Record<string, string> = {
    Livré: 'bg-green-100 text-green-700 border-green-100 hover:bg-green-100',
    'En cours': 'bg-blue-100 text-blue-700 border-blue-100 hover:bg-blue-100',
    Planifié: 'bg-orange-100 text-orange-700 border-orange-100 hover:bg-orange-100',
    Retardé: 'bg-red-100 text-red-700 border-red-100 hover:bg-red-100',
};

function statusClass(s: string) { return statusClassMap[s] ?? ''; }

function monthName(i: number) {
    return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'][i];
}

async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
        const [deliveriesRes, invoicesRes, hubsRes, usersRes] = await Promise.all([
            get<PaginatedResponse<ApiDelivery>>('/deliveries?limit=1000'),
            get<PaginatedResponse<ApiInvoice>>('/invoices?limit=1000'),
            get<ApiHub[]>('/hubs'),
            get<PaginatedResponse<ApiUser>>('/users?role=driver&limit=100'),
        ]);

        const deliveries = deliveriesRes.data;
        const invoices = invoicesRes.data;
        const hubs = hubsRes;
        const drivers = usersRes.data;

        // ── KPIs ──────────────────────────────────────────────────────────
        const today = new Date();
        const todayStr = today.toDateString();
        const deliveriesToday = deliveries.filter((d) => {
            const dueDate = d.invoice?.due_date ? new Date(d.invoice.due_date) : null;
            return dueDate && dueDate.toDateString() === todayStr && d.status === 'delivered';
        }).length;
        const availableCapacity = hubs.reduce((sum, h) => sum + (h.capacity_parcels_day ?? 0), 0);
        const activeDrivers = drivers.filter((u) => u.status === 'active').length;
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const monthlyRevenue = invoices
            .filter((inv) => {
                const d = new Date(inv.due_date);
                return d.getMonth() === currentMonth && d.getFullYear() === currentYear && inv.status === 'invoice';
            })
            .reduce((sum, inv) => sum + inv.amount, 0);
        const prevMonthRevenue = invoices
            .filter((inv) => {
                const d = new Date(inv.due_date);
                return d.getMonth() === (currentMonth === 0 ? 11 : currentMonth - 1) && d.getFullYear() === (currentMonth === 0 ? currentYear - 1 : currentYear) && inv.status === 'invoice';
            })
            .reduce((sum, inv) => sum + inv.amount, 0);
        const revenueTrend = prevMonthRevenue > 0 ? Math.round((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue * 100) : 0;

        kpis.value = [
            { label: "Livraisons aujourd'hui", value: String(deliveriesToday), trend: 0 },
            { label: 'Stock disponible', value: availableCapacity.toLocaleString('fr-FR'), trend: 0 },
            { label: 'Chauffeurs actifs', value: String(activeDrivers), trend: 0 },
            { label: 'Revenu mensuel', value: `€ ${monthlyRevenue.toLocaleString('fr-FR')}`, trend: revenueTrend },
        ];

        // ── Recent deliveries ─────────────────────────────────────────────
        recentDeliveries.value = deliveries.slice(0, 6).map((d) => ({
            id: d.id,
            ref: d.reference,
            destination: d.invoice?.delivery_address
                ? [d.invoice.delivery_address.address, d.invoice.delivery_address.city].filter(Boolean).join(', ')
                : '—',
            driver: d.driver ? [d.driver.user.firstname, d.driver.user.lastname].filter(Boolean).join(' ') : '—',
            client: d.invoice?.customer?.customer_name ?? '—',
            status: statusLabels[d.status] ?? d.status,
            time: d.invoice?.due_date ? new Date(d.invoice.due_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—',
        }));

        // ── Bar chart: monthly document counts ───────────────────────────
        const months = Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            return { month: d.getMonth(), year: d.getFullYear(), label: monthName(d.getMonth()) };
        });
        barData.value = {
            labels: months.map((m) => m.label),
            datasets: [
                {
                    label: 'Devis',
                    data: months.map((m) => invoices.filter((inv) => { const d = new Date(inv.due_date); return d.getMonth() === m.month && d.getFullYear() === m.year && inv.status === 'quotation'; }).length),
                    backgroundColor: '#fbbf24', borderRadius: 4, borderSkipped: false,
                },
                {
                    label: 'Bons de commande',
                    data: months.map((m) => invoices.filter((inv) => { const d = new Date(inv.due_date); return d.getMonth() === m.month && d.getFullYear() === m.year && inv.status === 'purchase_order'; }).length),
                    backgroundColor: '#60a5fa', borderRadius: 4, borderSkipped: false,
                },
                {
                    label: 'Factures',
                    data: months.map((m) => invoices.filter((inv) => { const d = new Date(inv.due_date); return d.getMonth() === m.month && d.getFullYear() === m.year && inv.status === 'invoice'; }).length),
                    backgroundColor: '#34d399', borderRadius: 4, borderSkipped: false,
                },
            ],
        };

        // ── Doughnut: delivery status distribution ────────────────────────
        const totalDeliveries = deliveries.length || 1;
        const statusCounts: Record<string, number> = {};
        for (const d of deliveries) {
            const label = statusLabels[d.status] ?? d.status;
            statusCounts[label] = (statusCounts[label] ?? 0) + 1;
        }
        const doughnutLabels = Object.keys(statusCounts);
        const doughnutValues = Object.values(statusCounts);
        const doughnutColors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#6b7280', '#a855f7'];
        doughnutData.value = {
            labels: doughnutLabels,
            datasets: [{
                data: doughnutValues.map((v) => Math.round(v / totalDeliveries * 100)),
                backgroundColor: doughnutColors.slice(0, doughnutLabels.length),
                borderWidth: 0,
                hoverOffset: 6,
            }],
        };

        // ── Line chart: 30-day delivery volume ────────────────────────────
        const last30Days = Array.from({ length: 30 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (29 - i));
            return d;
        });
        lineData.value = {
            labels: last30Days.map((d, i) => i % 5 === 0 ? d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''),
            datasets: [{
                label: 'Livraisons',
                data: last30Days.map((day) => deliveries.filter((del) => { const dd = del.invoice?.due_date ? new Date(del.invoice.due_date) : null; return dd && dd.toDateString() === day.toDateString(); }).length),
                borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 0, borderWidth: 2,
            }],
        };

        // ── Projection: monthly revenue ──────────────────────────────────
        const allMonths = Array.from({ length: 12 }, (_, i) => ({ index: i, label: monthName(i) }));
        const realRevenue = allMonths.map((m) => {
            const total = invoices.filter((inv) => { const d = new Date(inv.due_date); return d.getMonth() === m.index && d.getFullYear() === currentYear && inv.status === 'invoice'; }).reduce((sum, inv) => sum + inv.amount, 0);
            return total > 0 ? total : null;
        });
        const lastReal = realRevenue.findLast((v) => v !== null) ?? 0;
        projectionData.value = {
            labels: allMonths.map((m) => m.label),
            datasets: [
                {
                    label: 'Réalisé',
                    data: realRevenue,
                    borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', fill: true, tension: 0.4, pointRadius: 3, borderWidth: 2,
                },
                {
                    label: 'Prévisionnel',
                    data: allMonths.map((m) => {
                        if (m.index <= currentMonth) return null;
                        const growth = 1 + (m.index - currentMonth) * 0.05;
                        return Math.round((lastReal as number) * growth);
                    }),
                    borderColor: '#94a3b8', borderDash: [6, 3], backgroundColor: 'transparent', tension: 0.4, pointRadius: 3, borderWidth: 2,
                },
            ],
        };
    } catch (e: any) {
        error.value = e?.message ?? 'Erreur lors du chargement des données';
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>
