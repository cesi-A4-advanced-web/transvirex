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

            <Card>
                <CardContent class="p-0">
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
                            <TableRow v-for="f in filtered" :key="f.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ f.ref }}</TableCell>
                                <TableCell class="font-medium">{{ f.client }}</TableCell>
                                <TableCell>{{ f.service }}</TableCell>
                                <TableCell
                                    ><Badge :class="priorityClass(f.priority)">{{ f.priority }}</Badge></TableCell
                                >
                                <TableCell class="font-semibold">{{ f.amount }}</TableCell>
                                <TableCell class="text-muted-foreground text-xs">{{ f.due }}</TableCell>
                                <TableCell
                                    ><Badge :class="statusClass(f.status)">{{ f.status }}</Badge></TableCell
                                >
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

definePageMeta({ layout: false });
useHead({ title: 'Factures — Transvirex' });

/** Search/filter input value. */
const search = ref('');
/** Selected document-type filter. */
const filterStatus = ref('');
/** Ref of the invoice currently being exported (shows spinner). */
const exporting = ref<string | null>(null);

/** Static list of invoices for the demo table. */
const invoices: FactureData[] = [
    {
        ref: 'FAC-2026-001',
        client: 'Société Durand',
        service: 'Express',
        priority: 'Urgent',
        amount: '€ 1 250',
        due: '15/06/2026',
        status: 'Facture',
    },
    {
        ref: 'FAC-2026-002',
        client: 'SARL Martin',
        service: 'Standard',
        priority: 'Standard',
        amount: '€ 480',
        due: '20/06/2026',
        status: 'Bon de commande',
    },
    {
        ref: 'FAC-2026-003',
        client: 'Express Cargo',
        service: 'Fret',
        priority: 'High',
        amount: '€ 3 400',
        due: '30/06/2026',
        status: 'Devis',
    },
    {
        ref: 'FAC-2026-004',
        client: 'TGV Express',
        service: 'Express',
        priority: 'Urgent',
        amount: '€ 890',
        due: '10/06/2026',
        status: 'Facture',
    },
    {
        ref: 'FAC-2026-005',
        client: 'Logistics Plus',
        service: 'Standard',
        priority: 'Low',
        amount: '€ 210',
        due: '25/06/2026',
        status: 'Devis',
    },
    {
        ref: 'FAC-2026-006',
        client: 'Nord Fret',
        service: 'Fret',
        priority: 'Standard',
        amount: '€ 2 100',
        due: '18/06/2026',
        status: 'Bon de commande',
    },
];

/** Invoices filtered by search query and document type. */
const filtered = computed(() =>
    invoices.filter(
        (f) =>
            (filterStatus.value === '' || f.status === filterStatus.value) &&
            (!search.value || Object.values(f).some((v) => v.toLowerCase().includes(search.value.toLowerCase()))),
    ),
);

/** Export an invoice as PDF. */
async function download(f: FactureData) {
    exporting.value = f.ref;
    try {
        await exportFacturePdf(f);
    } finally {
        exporting.value = null;
    }
}

/** Return Tailwind badge classes for a document status. */
function statusClass(s: string) {
    return (
        (
            {
                Facture: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
                'Bon de commande': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                Devis: 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
            } as Record<string, string>
        )[s] ?? ''
    );
}
/** Return Tailwind badge classes for a priority level. */
function priorityClass(p: string) {
    return (
        (
            {
                Urgent: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
                High: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
                Standard: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
                Low: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            } as Record<string, string>
        )[p] ?? ''
    );
}
</script>
