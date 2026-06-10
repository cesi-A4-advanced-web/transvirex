<template>
    <AppLayout>
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Colis</h1>
                <p class="text-muted-foreground text-sm mt-1">Suivi des colis en transit</p>
            </div>
            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence colis..." class="pl-9" />
                    </div>
                </CardContent>
            </Card>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <Card>
                    <CardContent class="p-0">
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
                                <TableRow v-for="c in filtered" :key="c.ref">
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ c.ref }}</TableCell>
                                    <TableCell class="font-mono text-xs text-primary">{{ c.invoice }}</TableCell>
                                    <TableCell class="font-medium">{{ c.client }}</TableCell>
                                    <TableCell>{{ c.weight }}</TableCell>
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ c.delivery }}</TableCell>
                                    <TableCell>
                                        <Badge :class="statusClass(c.status)">{{ c.status }}</Badge>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="6" class="text-center text-muted-foreground py-6">
                                        Aucun colis trouvé
                                    </TableCell>
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from '@lucide/vue';
import { useApi, type ApiParcel } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Colis — Dispatcher' });

const { get } = useApi();

const loading = ref(true);
const search = ref('');
const parcelsData = ref<{
    ref: string;
    invoice: string;
    client: string;
    weight: string;
    delivery: string;
    status: string;
}[]>([]);

const statusLabels: Record<string, string> = {
    planned: 'Planifié',
    delivering: 'En cours',
    delivered: 'Livré',
    cancelled: 'Annulé',
    blocked: 'Bloqué',
    delayed: 'Retardé',
};

const filtered = computed(() =>
    parcelsData.value.filter(
        (c) => !search.value || [c.ref, c.invoice, c.client].some((v) => v.toLowerCase().includes(search.value.toLowerCase()))
    )
);

function statusClass(s: string) {
    return ({
        delivered: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
        delivering: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
        planned: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    } as Record<string, string>)[s] ?? ''
}

async function fetchData() {
    loading.value = true;
    try {
        const invRes = await get<{ data: any[]; total: number }>('/invoices', { limit: 50, status: 'purchase_order' });
        const invoiceIds = invRes.data.map((inv) => inv.id);

        const results: {
            ref: string;
            invoice: string;
            client: string;
            weight: string;
            delivery: string;
            status: string;
        }[] = [];

        const details = await Promise.all(
            invoiceIds.map((id) =>
                get<any>(`/invoices/${id}`).catch(() => null)
            )
        );

        for (const detail of details) {
            if (!detail) continue;
            const invoiceRef = detail.reference;
            const clientName = detail.customer?.customer_name ?? '—';
            const deliveries = detail.deliveries ?? [];

            for (const parcel of detail.parcels ?? []) {
                const delivery = deliveries[0];
                results.push({
                    ref: parcel.reference,
                    invoice: invoiceRef,
                    client: clientName,
                    weight: parcel.weight.toFixed(1),
                    delivery: delivery?.reference ?? '—',
                    status: delivery ? (statusLabels[delivery.status] ?? delivery.status) : '—',
                });
            }
        }

        parcelsData.value = results;
    } catch (e) {
        console.error('Failed to load parcels', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>
