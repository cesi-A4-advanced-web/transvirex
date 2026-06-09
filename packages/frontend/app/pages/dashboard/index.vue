<template>
    <div>
        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
            <div v-for="kpi in kpis" :key="kpi.label" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm font-medium text-gray-500">{{ kpi.label }}</span>
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center" :class="kpi.iconBg">
                        <component :is="kpi.icon" class="w-5 h-5" :class="kpi.iconColor" />
                    </div>
                </div>
                <p class="text-2xl font-bold text-gray-900">{{ kpi.value }}</p>
                <p
                    class="text-xs mt-1 flex items-center gap-0.5"
                    :class="kpi.trend >= 0 ? 'text-green-500' : 'text-red-500'"
                >
                    <TrendingUp v-if="kpi.trend >= 0" class="w-3 h-3" />
                    <TrendingDown v-else class="w-3 h-3" />
                    {{ Math.abs(kpi.trend) }}% vs hier
                </p>
            </div>
        </div>

        <!-- Bottom grid -->
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <!-- Recent deliveries -->
            <div class="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="font-semibold text-gray-800">Livraisons récentes</h2>
                    <NuxtLink to="/dashboard/livraisons" class="text-xs text-blue-600 hover:underline">
                        Voir tout →
                    </NuxtLink>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-gray-50 text-gray-500 text-xs uppercase">
                            <tr>
                                <th class="px-5 py-3 text-left font-medium">ID</th>
                                <th class="px-5 py-3 text-left font-medium">Destination</th>
                                <th class="px-5 py-3 text-left font-medium">Chauffeur</th>
                                <th class="px-5 py-3 text-left font-medium">Statut</th>
                                <th class="px-5 py-3 text-left font-medium">Heure</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr
                                v-for="d in recentDeliveries"
                                :key="d.id"
                                class="border-t border-gray-50 hover:bg-gray-50 transition"
                            >
                                <td class="px-5 py-3 font-mono text-xs text-gray-500">
                                    {{ d.id }}
                                </td>
                                <td class="px-5 py-3 text-gray-800">
                                    {{ d.destination }}
                                </td>
                                <td class="px-5 py-3 text-gray-600">
                                    {{ d.driver }}
                                </td>
                                <td class="px-5 py-3">
                                    <span
                                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                        :class="statusClass(d.status)"
                                    >
                                        {{ d.status }}
                                    </span>
                                </td>
                                <td class="px-5 py-3 text-gray-500 text-xs font-mono">
                                    {{ d.time }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Services health -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 class="font-semibold text-gray-800">Santé des services</h2>
                    <button
                        @click="checkHealth"
                        :disabled="healthLoading"
                        class="text-xs text-blue-600 hover:underline disabled:opacity-40 transition"
                    >
                        {{ healthLoading ? '...' : 'Actualiser' }}
                    </button>
                </div>
                <div class="p-4 space-y-2">
                    <div
                        v-for="svc in services"
                        :key="svc.name"
                        class="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50"
                    >
                        <div class="flex items-center gap-2.5">
                            <span
                                class="w-2 h-2 rounded-full flex-shrink-0"
                                :class="{
                                    'bg-green-500': svc.status === 'ok',
                                    'bg-red-500': svc.status === 'error',
                                    'bg-gray-300 animate-pulse': svc.status === 'pending',
                                }"
                            />
                            <span class="text-sm text-gray-700">{{ svc.name }}</span>
                        </div>
                        <span
                            class="text-xs font-medium tabular-nums"
                            :class="{
                                'text-green-600': svc.status === 'ok',
                                'text-red-500': svc.status === 'error',
                                'text-gray-400': svc.status === 'pending',
                            }"
                        >
                            {{ svc.status === 'pending' ? '—' : svc.status === 'ok' ? `${svc.ms}ms` : 'Erreur' }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Truck, Package, CreditCard, Users, TrendingUp, TrendingDown } from 'lucide-vue-next';

definePageMeta({ layout: 'dashboard' });
useHead({ title: 'Dashboard — Transvirex' });

/** KPI metric cards displayed at the top of the dashboard. */
const kpis = [
    {
        label: "Livraisons aujourd'hui",
        value: '247',
        trend: 12,
        icon: Truck,
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
    },
    {
        label: 'Stock disponible',
        value: '1 284',
        trend: -3,
        icon: Package,
        iconBg: 'bg-orange-50',
        iconColor: 'text-orange-500',
    },
    {
        label: 'Chauffeurs actifs',
        value: '38',
        trend: 5,
        icon: Users,
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
    },
    {
        label: 'Revenu mensuel',
        value: '€ 124 500',
        trend: 8,
        icon: CreditCard,
        iconBg: 'bg-purple-50',
        iconColor: 'text-purple-600',
    },
];

/** Recent deliveries data displayed in the activity table. */
const recentDeliveries = [
    {
        id: '#LIV-0091',
        destination: 'Paris 15e',
        driver: 'M. Dupont',
        status: 'Livré',
        time: '08:32',
    },
    {
        id: '#LIV-0092',
        destination: 'Lyon Part-Dieu',
        driver: 'S. Martin',
        status: 'En cours',
        time: '09:14',
    },
    {
        id: '#LIV-0093',
        destination: 'Bordeaux Centre',
        driver: 'A. Bernard',
        status: 'En attente',
        time: '10:05',
    },
    {
        id: '#LIV-0094',
        destination: 'Marseille 13e',
        driver: 'J. Thomas',
        status: 'Livré',
        time: '10:22',
    },
    {
        id: '#LIV-0095',
        destination: 'Lille Centre',
        driver: 'R. Petit',
        status: 'En cours',
        time: '11:00',
    },
    {
        id: '#LIV-0096',
        destination: 'Nantes Ouest',
        driver: 'C. Leroy',
        status: 'Retardé',
        time: '11:45',
    },
];

/**
 * Return Tailwind CSS classes for a delivery status badge.
 */
function statusClass(status: string) {
    const map: Record<string, string> = {
        Livré: 'bg-green-100 text-green-700',
        'En cours': 'bg-blue-100 text-blue-700',
        'En attente': 'bg-yellow-100 text-yellow-700',
        Retardé: 'bg-red-100 text-red-700',
    };
    return map[status] ?? 'bg-gray-100 text-gray-600';
}

/** Health status of a backend service. */
interface ServiceHealth {
    /** Service display name. */
    name: string;
    /** Health check URL. */
    url: string;
    /** Current health status. */
    status: 'pending' | 'ok' | 'error';
    /** Response time in ms, or null. */
    ms: number | null;
}

/** List of backend services to monitor. */
const services = ref<ServiceHealth[]>([
    {
        name: 'API Gateway',
        url: '/api/gateway/health',
        status: 'pending',
        ms: null,
    },
    {
        name: 'Auth',
        url: '/api/auth/health',
        status: 'pending',
        ms: null,
    },
    {
        name: 'Livraisons',
        url: '/api/delivery/health',
        status: 'pending',
        ms: null,
    },
    {
        name: 'Stock',
        url: '/api/stock/health',
        status: 'pending',
        ms: null,
    },
    {
        name: 'Facturation',
        url: '/api/billing/health',
        status: 'pending',
        ms: null,
    },
    {
        name: 'Utilisateurs',
        url: '/api/users/health',
        status: 'pending',
        ms: null,
    },
]);

/** Whether the health check is currently running. */
const healthLoading = ref(false);

/**
 * Check the health of all backend services concurrently.
 */
async function checkHealth() {
    healthLoading.value = true;
    await Promise.all(
        services.value.map(async (svc) => {
            svc.status = 'pending';
            svc.ms = null;
            const start = Date.now();
            try {
                const res = await fetch(svc.url);
                svc.ms = Date.now() - start;
                svc.status = res.ok ? 'ok' : 'error';
            } catch {
                svc.ms = Date.now() - start;
                svc.status = 'error';
            }
        }),
    );
    healthLoading.value = false;
}

onMounted(checkHealth);
</script>
