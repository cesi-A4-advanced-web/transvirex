<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Factures</h1>
                    <p class="text-muted-foreground text-sm mt-1">Devis, bons de commande et factures</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouvelle facture</Button>
            </div>

            <Card>
                <CardContent class="p-4 flex flex-wrap gap-3">
                    <div class="relative flex-1 min-w-48 max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence, client..." class="pl-9" />
                    </div>
                    <select
                        v-model="filterStatus"
                        class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="">Tous</option>
                        <option>Devis</option>
                        <option>Bon de commande</option>
                        <option>Facture</option>
                    </select>
                </CardContent>
            </Card>

            <div v-if="loading" class="text-center py-12 text-muted-foreground">
                <p>Chargement...</p>
            </div>

            <div v-else-if="error" class="text-center py-12 text-muted-foreground">
                <p>Erreur : {{ error }}</p>
                <Button variant="outline" class="mt-4" @click="fetchInvoices">Réessayer</Button>
            </div>

            <Card v-else>
                <CardContent class="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Service</TableHead>
                                <TableHead>Priorité</TableHead>
                                <TableHead>Montant</TableHead>
                                <TableHead>Échéance</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead class="w-12 text-right">PDF</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="f in filtered" :key="f.id">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ f.ref }}</TableCell>
                                <TableCell class="font-medium">{{ f.client }}</TableCell>
                                <TableCell>{{ f.service }}</TableCell>
                                <TableCell><Badge :class="priorityClass(f.priority)">{{ f.priority }}</Badge></TableCell>
                                <TableCell class="font-semibold">{{ f.amount }}</TableCell>
                                <TableCell class="text-muted-foreground text-xs">{{ f.due }}</TableCell>
                                <TableCell><Badge :class="statusClass(f.status)">{{ f.status }}</Badge></TableCell>
                                <TableCell class="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        class="h-7 w-7 text-muted-foreground hover:text-primary"
                                        :disabled="exporting === f.ref"
                                        @click="download(f)"
                                        :title="`Télécharger ${f.status} — ${f.ref}`"
                                    >
                                        <Loader2 v-if="exporting === f.ref" class="w-3.5 h-3.5 animate-spin" />
                                        <FileDown v-else class="w-3.5 h-3.5" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                        {{ filtered.length }} document(s)
                    </div>
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
import { exportFacturePdf, type FactureData } from '@/composables/usePdfExport';
import { FileDown, Loader2, Plus, Search } from '@lucide/vue';
import type { ApiInvoice, PaginatedResponse } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Factures — Transvirex' });

const { get } = useApi();
const search = ref('');
const filterStatus = ref('');
const exporting = ref<string | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const invoices = ref<Array<FactureData & { id: string }>>([]);

const statusMap: Record<string, string> = {
    quotation: 'Devis',
    purchase_order: 'Bon de commande',
    invoice: 'Facture',
};

const serviceLabels: Record<string, string> = {
    express: 'Express',
    standard: 'Standard',
    freight: 'Fret',
};

async function fetchInvoices() {
    loading.value = true;
    error.value = null;
    try {
        const res = await get<PaginatedResponse<ApiInvoice>>('/invoices?limit=100');
        invoices.value = res.data.map((inv) => ({
            id: inv.id,
            ref: inv.reference,
            client: inv.customer?.customer_name ?? '—',
            service: serviceLabels[inv.service_type ?? ''] ?? inv.service_type ?? '—',
            priority: inv.priority.charAt(0).toUpperCase() + inv.priority.slice(1),
            amount: `€ ${inv.amount.toLocaleString('fr-FR')}`,
            due: new Date(inv.due_date).toLocaleDateString('fr-FR'),
            status: statusMap[inv.status] ?? inv.status,
        }));
    } catch (e: any) {
        error.value = e?.message ?? 'Impossible de charger les factures';
    } finally {
        loading.value = false;
    }
}

const filtered = computed(() =>
    invoices.value.filter(
        (f) =>
            (filterStatus.value === '' || f.status === filterStatus.value) &&
            (!search.value || Object.values(f).some((v) => String(v).toLowerCase().includes(search.value.toLowerCase()))),
    ),
);

async function download(f: FactureData) {
    exporting.value = f.ref;
    try {
        await exportFacturePdf(f);
    } finally {
        exporting.value = null;
    }
}

function statusClass(s: string) {
    return (
        {
            Facture: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
            'Bon de commande': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
            Devis: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
        } as Record<string, string>
    )[s] ?? '';
}

function priorityClass(p: string) {
    return (
        {
            Urgent: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
            High: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
            Standard: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
            Low: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
        } as Record<string, string>
    )[p] ?? '';
}

onMounted(fetchInvoices);
</script>
