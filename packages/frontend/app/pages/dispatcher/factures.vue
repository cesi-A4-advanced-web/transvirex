<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Factures</h1>
                    <p class="text-muted-foreground text-sm mt-1">Factures liées aux livraisons</p>
                </div>
            </div>

            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Référence, client..." class="pl-9" />
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
                                    <TableHead>Client</TableHead>
                                    <TableHead>Service</TableHead>
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
                                    <TableCell class="font-semibold">{{ f.amount }}</TableCell>
                                    <TableCell class="text-muted-foreground text-xs">{{ f.due }}</TableCell>
                                    <TableCell>
                                        <Badge :class="statusClass(f.status)">{{ f.statusLabel }}</Badge>
                                    </TableCell>
                                    <TableCell class="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            class="h-7 w-7 text-muted-foreground hover:text-primary"
                                            :disabled="exporting === f.ref"
                                            @click="download(f)"
                                            :title="`Télécharger ${f.statusLabel} — ${f.ref}`"
                                        >
                                            <Loader2 v-if="exporting === f.ref" class="w-3.5 h-3.5 animate-spin" />
                                            <FileDown v-else class="w-3.5 h-3.5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="7" class="text-center text-muted-foreground py-6">
                                        Aucune facture trouvée
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportBonCommandePdf, exportFacturePdf } from '@/composables/usePdfExport';
import { useApi, type ApiInvoice } from '@/composables/useApi';
import { FileDown, Loader2, Search } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Factures — Dispatcher' });

const { get } = useApi();

const loading = ref(true);
const invoices = ref<ApiInvoice[]>([]);
const search = ref('');
const exporting = ref<string | null>(null);

const statusLabels: Record<string, string> = {
    quotation: 'Devis',
    purchase_order: 'Bon de commande',
    invoice: 'Facture',
};

const serviceLabels: Record<string, string> = {
    express: 'Livraison express',
    standard: 'Transport standard',
    freight: 'Fret',
};

const mappedInvoices = computed(() =>
    invoices.value.map((inv) => ({
        id: inv.id,
        ref: inv.reference,
        client: inv.customer?.customer_name ?? '—',
        service: serviceLabels[inv.service_type ?? ''] ?? inv.service_type ?? '—',
        amount: `€ ${(inv.amount ?? 0).toLocaleString('fr-FR')}`,
        due: new Date(inv.due_date).toLocaleDateString('fr-FR'),
        status: inv.status,
        statusLabel: statusLabels[inv.status] ?? inv.status,
        priority: inv.priority,
    }))
);

const filtered = computed(() =>
    mappedInvoices.value.filter(
        (f) => !search.value || [f.ref, f.client].some((v) => v.toLowerCase().includes(search.value.toLowerCase()))
    )
);

function statusClass(s: string) {
    return ({
        invoice: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
        purchase_order: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
        quotation: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
    } as Record<string, string>)[s] ?? ''
}

async function download(f: ReturnType<typeof computed>['value'][number]) {
    exporting.value = f.ref;
    try {
        const data = {
            ref: f.ref,
            client: f.client,
            service: f.service,
            amount: f.amount,
            due: f.due,
            status: f.statusLabel,
        };
        if (f.status === 'invoice') {
            await exportFacturePdf({ ...data, priority: f.priority });
        } else {
            await exportBonCommandePdf(data);
        }
    } finally {
        exporting.value = null;
    }
}

async function fetchData() {
    loading.value = true;
    try {
        const res = await get<{ data: ApiInvoice[]; total: number }>('/invoices', { limit: 100 });
        invoices.value = res.data;
    } catch (e) {
        console.error('Failed to load invoices', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>
