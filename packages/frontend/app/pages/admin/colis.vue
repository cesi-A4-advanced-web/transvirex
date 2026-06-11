<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Colis</h1>
                    <p class="text-muted-foreground text-sm mt-1">Suivi de tous les colis</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouveau colis</Button>
            </div>

            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence colis ou facture..." class="pl-9" />
                    </div>
                </CardContent>
            </Card>

            <div v-if="loading" class="text-center py-12 text-muted-foreground">
                <p>Chargement...</p>
            </div>

            <div v-else-if="error" class="text-center py-12 text-muted-foreground">
                <p>Erreur : {{ error }}</p>
                <Button variant="outline" class="mt-4" @click="fetchParcels">Réessayer</Button>
            </div>

            <Card v-else>
                <CardContent class="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Facture</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Poids (kg)</TableHead>
                                <TableHead>Livraison</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="c in filtered" :key="c.id">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ c.ref }}</TableCell>
                                <TableCell class="font-mono text-xs text-primary">{{ c.invoice_ref }}</TableCell>
                                <TableCell class="font-medium">{{ c.client }}</TableCell>
                                <TableCell>{{ c.weight }}</TableCell>
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ c.delivery_ref }}</TableCell>
                                <TableCell><Badge :class="statusClass(c.status)">{{ c.status }}</Badge></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">{{ filtered.length }} colis</div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search } from '@lucide/vue';
import type { ApiParcel, PaginatedResponse } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Colis — Transvirex' });

const { get } = useApi();
const search = ref('');
const loading = ref(true);
const error = ref<string | null>(null);
const parcels = ref<Array<{
    id: string;
    ref: string;
    invoice_ref: string;
    client: string;
    weight: string;
    delivery_ref: string;
    status: string;
}>>([]);

const statusLabels: Record<string, string> = {
    delivered: 'Livré',
    planned: 'En attente',
    delivering: 'En cours',
    cancelled: 'Annulé',
    blocked: 'Bloqué',
    delayed: 'Retardé',
};

async function fetchParcels() {
    loading.value = true;
    error.value = null;
    try {
        const res = await get<PaginatedResponse<ApiParcel>>('/parcels?limit=200');
        parcels.value = res.data.map((p) => {
            const delivery = p.invoice?.deliveries?.[0];
            return {
                id: p.id,
                ref: p.reference,
                invoice_ref: p.invoice?.reference ?? '—',
                client: p.invoice?.customer?.customer_name ?? '—',
                weight: String(p.weight),
                delivery_ref: delivery?.reference ?? '—',
                status: delivery ? (statusLabels[delivery.status ?? ''] ?? delivery.status ?? '—') : '—',
            };
        });
    } catch (e: any) {
        error.value = e?.message ?? 'Impossible de charger les colis';
    } finally {
        loading.value = false;
    }
}

const filtered = computed(() =>
    parcels.value.filter(
        (c) => !search.value || Object.values(c).some((v) => String(v).toLowerCase().includes(search.value.toLowerCase())),
    ),
);

function statusClass(s: string) {
    return (
        {
            Livré: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
            'En cours': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
            'En attente': 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
            Retardé: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
        } as Record<string, string>
    )[s] ?? '';
}

onMounted(fetchParcels);
</script>
