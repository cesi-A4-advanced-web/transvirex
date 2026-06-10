<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold tracking-tight">Bonjour, {{ driverFirstName }} 👋</h2>
                <p class="text-muted-foreground text-sm mt-1">
                    {{ todayLabel }} — {{ totalAssigned }} livraisons assignées aujourd'hui
                </p>
            </div>

            <div class="grid grid-cols-2 xl:grid-cols-4 gap-4">
                <Card v-for="kpi in kpis" :key="kpi.label">
                    <CardHeader class="pb-2">
                        <CardDescription>{{ kpi.label }}</CardDescription>
                        <CardTitle class="text-2xl">{{ kpi.value }}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <Card class="xl:col-span-2">
                    <CardHeader class="flex-row items-center justify-between space-y-0 pb-3">
                        <CardTitle class="text-base">Ma tournée du jour</CardTitle>
                        <NuxtLink to="/livreur/livraisons" class="text-xs text-primary hover:underline"
                            >Voir détails →</NuxtLink
                        >
                    </CardHeader>
                    <CardContent>
                        <div class="relative">
                            <div class="absolute left-4 top-3 bottom-3 w-0.5 bg-border" />
                            <div
                                v-for="(delivery, i) in myDeliveries"
                                :key="delivery.ref"
                                class="relative flex gap-4 mb-5 last:mb-0"
                            >
                                <div
                                    class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 text-xs font-bold border-2"
                                    :class="dotClass(delivery.status)"
                                >
                                    {{ i + 1 }}
                                </div>
                                <div
                                    class="flex-1 rounded-lg p-3 border"
                                    :class="
                                        delivery.status === 'En cours'
                                            ? 'border-blue-200 bg-blue-50'
                                            : 'border-border bg-muted/30'
                                    "
                                >
                                    <div class="flex items-start justify-between gap-2">
                                        <div>
                                            <p class="text-sm font-semibold">
                                                {{ delivery.address }}
                                            </p>
                                            <p class="text-xs text-muted-foreground mt-0.5">
                                                {{ delivery.client }}
                                            </p>
                                        </div>
                                        <div class="flex flex-col items-end gap-1 flex-shrink-0">
                                            <Badge :class="statusClass(delivery.status)">{{ delivery.status }}</Badge>
                                            <span class="text-xs text-muted-foreground font-mono">{{
                                                delivery.time
                                            }}</span>
                                        </div>
                                    </div>
                                    <div
                                        v-if="delivery.note"
                                        class="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1"
                                    >
                                        ⚠ {{ delivery.note }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div class="space-y-4">
                    <Card>
                        <CardHeader class="flex-row items-center gap-2 space-y-0 pb-3">
                            <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <CardTitle class="text-base">En cours</CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-4">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                    <MapPin class="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p class="text-sm font-bold">
                                        {{ current.address }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">
                                        {{ current.city }}
                                    </p>
                                </div>
                            </div>
                            <div class="space-y-2 text-xs">
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">Client</span
                                    ><span class="font-medium">{{ current.client }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">Référence</span
                                    ><span class="font-mono text-muted-foreground">{{ current.ref }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">Heure prévue</span
                                    ><span class="font-semibold text-blue-600">{{ current.time }}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-muted-foreground">Colis</span
                                    ><span class="font-medium">{{ current.parcels }} colis</span>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <Button size="sm" class="bg-green-600 hover:bg-green-700 text-white">✓ Livré</Button>
                                <Button size="sm" variant="outline">Problème</Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent class="p-4">
                            <div class="flex items-center gap-3 mb-3">
                                <div
                                    class="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold"
                                >
                                    {{ driverFirstName.charAt(0) }}
                                </div>
                                <div>
                                    <p class="text-sm font-semibold">
                                        {{ driverFirstName }}
                                    </p>
                                    <p class="text-xs text-muted-foreground">Chauffeur · DRV-001</p>
                                </div>
                            </div>
                            <div class="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                                <span class="text-xs text-muted-foreground">Note moyenne</span>
                                <div class="flex items-center gap-1">
                                    <span class="text-yellow-500 text-sm">★★★★★</span>
                                    <span class="text-sm font-bold">4.8</span>
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
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Livreur — Transvirex' });

const accessToken = useCookie('access_token');
/** Decode a JWT payload without validation. */
function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}
/** Decoded JWT payload from the access token. */
const payload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));
/** Driver's first name extracted from the JWT. */
const driverFirstName = computed(() => (payload.value?.firstname as string) || 'Pierre');
/** Total deliveries assigned today. */
const totalAssigned = 8;
/** Formatted today's date in French locale. */
const todayLabel = computed(() =>
    new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }),
);

/** KPI metric cards for the driver dashboard. */
const kpis = [
    { label: 'Assignées', value: '8' },
    { label: 'Terminées', value: '3' },
    { label: 'En cours', value: '1' },
    { label: 'Ma note', value: '4.8 ★' },
];

/** Today's delivery stops for the driver. */
const myDeliveries = [
    {
        ref: '#LIV-0081',
        address: '12 Rue de Rivoli',
        city: 'Paris 1er',
        client: 'Mme. Lefebvre',
        status: 'Livré',
        time: '08:15',
    },
    {
        ref: '#LIV-0082',
        address: '45 Av. Daumesnil',
        city: 'Paris 12e',
        client: 'M. Fontaine',
        status: 'Livré',
        time: '09:30',
    },
    {
        ref: '#LIV-0083',
        address: '8 Bd Haussmann',
        city: 'Paris 9e',
        client: 'Cabinet Morin',
        status: 'Livré',
        time: '10:45',
    },
    {
        ref: '#LIV-0084',
        address: '23 Rue du Temple',
        city: 'Paris 3e',
        client: 'SARL Dubois',
        status: 'En cours',
        time: '12:00',
    },
    {
        ref: '#LIV-0085',
        address: '67 Av. Parmentier',
        city: 'Paris 11e',
        client: 'M. Renard',
        status: 'Planifié',
        time: '13:30',
    },
    {
        ref: '#LIV-0086',
        address: '102 Rue de la Paix',
        city: 'Paris 2e',
        client: 'Boutique Blanc',
        status: 'Planifié',
        time: '15:00',
        note: 'Appeler avant livraison',
    },
    {
        ref: '#LIV-0087',
        address: '5 Rue Oberkampf',
        city: 'Paris 11e',
        client: 'M. Gauthier',
        status: 'Planifié',
        time: '16:15',
    },
    {
        ref: '#LIV-0088',
        address: '33 Bd Voltaire',
        city: 'Paris 11e',
        client: 'Express Inc.',
        status: 'Planifié',
        time: '17:30',
    },
];

/** Currently active delivery being performed. */
const current = {
    ref: '#LIV-0084',
    address: '23 Rue du Temple',
    city: 'Paris 3e',
    client: 'SARL Dubois',
    time: '12:00',
    parcels: 2,
};

/** Return Tailwind classes for the timeline dot. */
function dotClass(status: string) {
    return (
        (
            {
                Livré: 'bg-green-500 border-green-300 text-white',
                'En cours': 'bg-blue-500 border-blue-300 text-white animate-pulse',
                Planifié: 'bg-background border-border text-muted-foreground',
            } as Record<string, string>
        )[status] ?? ''
    );
}
/** Return Tailwind badge classes for a delivery status. */
function statusClass(s: string) {
    return (
        (
            {
                Livré: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
                'En cours': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                Planifié: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[s] ?? ''
    );
}
</script>

