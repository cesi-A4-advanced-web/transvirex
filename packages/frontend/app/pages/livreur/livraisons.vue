<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between gap-4">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Mes livraisons</h1>
                    <p class="text-muted-foreground text-sm mt-1">Historique et suivi de vos missions</p>
                </div>
                <Button
                    class="bg-[#1a3f7a] hover:bg-[#15336a] text-white gap-2 shrink-0"
                    :disabled="generatingPdf"
                    @click="downloadMission"
                >
                    <Loader2 v-if="generatingPdf" class="w-4 h-4 animate-spin" />
                    <FileDown v-else class="w-4 h-4" />
                    Ordre de mission du jour
                </Button>
            </div>

            <div class="flex flex-wrap gap-2">
                <Button
                    v-for="tab in tabs"
                    :key="tab.value"
                    :variant="activeTab === tab.value ? 'default' : 'outline'"
                    size="sm"
                    @click="activeTab = tab.value"
                    :class="
                        activeTab === tab.value ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''
                    "
                >
                    {{ tab.label }}
                </Button>
            </div>

            <Card>
                <CardContent class="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Colis</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead>Heure</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="d in filtered" :key="d.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ d.ref }}</TableCell>
                                <TableCell class="font-medium">{{ d.client }}</TableCell>
                                <TableCell>{{ d.destination }}</TableCell>
                                <TableCell class="text-muted-foreground">{{ d.parcels }} colis</TableCell>
                                <TableCell>
                                    <Badge :class="statusClass(d.status)">
                                        <span
                                            v-if="d.status === 'En cours'"
                                            class="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse inline-block"
                                        ></span>
                                        {{ d.status }}
                                    </Badge>
                                </TableCell>
                                <TableCell class="text-muted-foreground font-mono text-xs">{{ d.time }}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                        {{ filtered.length }} livraison(s)
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportOrdreMissionPdf, type MissionData } from '@/composables/usePdfExport';
import { FileDown, Loader2 } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Mes livraisons — Livreur' });

/** Decode a JWT payload without validation. */
function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}
const accessToken = useCookie('access_token');
/** Decoded JWT payload from the access token. */
const payload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));
/** Full driver name extracted from the JWT. */
const driverName = computed(() => {
    const f = (payload.value?.firstname as string) ?? '';
    const l = (payload.value?.lastname as string) ?? '';
    return `${f} ${l}`.trim() || 'Pierre Martin';
});

/** Currently selected tab. */
const activeTab = ref('all');
/** Whether the PDF generation is in progress. */
const generatingPdf = ref(false);

/** Tab definitions for filtering deliveries. */
const tabs = [
    { label: 'Toutes', value: 'all' },
    { label: 'En cours', value: 'ongoing' },
    { label: 'Terminées', value: 'done' },
    { label: 'Planifiées', value: 'planned' },
];

/** Static list of deliveries for the demo table. */
const deliveries = [
    {
        ref: '#LIV-0088',
        client: 'Société Durand',
        destination: 'Paris 8e',
        parcels: 1,
        status: 'Livré',
        time: '09:15',
        address: '12 Rue de Rivoli',
        city: 'Paris 1er',
    },
    {
        ref: '#LIV-0082',
        client: 'SARL Martin',
        destination: 'Lyon Part-Dieu',
        parcels: 3,
        status: 'Livré',
        time: '08:00',
        address: '45 Av. Daumesnil',
        city: 'Paris 12e',
    },
    {
        ref: '#LIV-0095',
        client: 'Logistics Plus',
        destination: 'Lille Centre',
        parcels: 2,
        status: 'En cours',
        time: '10:30',
        address: '23 Rue du Temple',
        city: 'Paris 3e',
    },
    {
        ref: '#LIV-0100',
        client: 'Express Cargo',
        destination: 'Bordeaux Gare',
        parcels: 1,
        status: 'Planifié',
        time: '14:00',
        address: '67 Av. Parmentier',
        city: 'Paris 11e',
    },
    {
        ref: '#LIV-0101',
        client: 'Nord Fret',
        destination: 'Nantes Ouest',
        parcels: 2,
        status: 'Planifié',
        time: '15:30',
        address: '5 Rue Oberkampf',
        city: 'Paris 11e',
    },
    {
        ref: '#LIV-0079',
        client: 'TGV Express',
        destination: 'Marseille 13e',
        parcels: 4,
        status: 'Livré',
        time: '07:00',
        address: '33 Bd Voltaire',
        city: 'Paris 11e',
    },
];

/** Deliveries filtered by active tab. */
const filtered = computed(() =>
    deliveries.filter(
        (d) =>
            activeTab.value === 'all' ||
            (activeTab.value === 'ongoing' && d.status === 'En cours') ||
            (activeTab.value === 'done' && d.status === 'Livré') ||
            (activeTab.value === 'planned' && d.status === 'Planifié'),
    ),
);

/** Generate and download the daily mission order PDF. */
async function downloadMission() {
    generatingPdf.value = true;
    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const ref = `OM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
    const mission: MissionData = {
        ref,
        driverName: driverName.value,
        driverId: 'DRV-001',
        vehicle: 'Renault Master',
        plate: 'AA-123-BB',
        hub: 'Paris Centre',
        date: today,
        deliveries: deliveries.map((d, i) => ({
            stop: i + 1,
            ref: d.ref,
            address: d.address,
            city: d.city,
            client: d.client,
            time: d.time,
            parcels: d.parcels,
        })),
    };
    try {
        await exportOrdreMissionPdf(mission);
    } finally {
        generatingPdf.value = false;
    }
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

