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
                            <TableRow v-for="f in filtered" :key="f.ref">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ f.ref }}</TableCell>
                                <TableCell class="font-medium">{{ f.client }}</TableCell>
                                <TableCell>{{ f.service }}</TableCell>
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
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Search, FileDown, Loader2 } from 'lucide-vue-next';
import { exportBonCommandePdf, type BonCommandeData } from '@/composables/usePdfExport';

definePageMeta({ layout: false });
useHead({ title: 'Factures — Dispatcher' });

const search = ref('');
const exporting = ref<string | null>(null);

const invoices: BonCommandeData[] = [
    { ref: 'FAC-2026-001', client: 'Société Durand', service: 'Livraison express', amount: '€ 1 250', due: '2026-06-15', status: 'Facture' },
    { ref: 'FAC-2026-002', client: 'SARL Martin', service: 'Transport standard', amount: '€ 780', due: '2026-06-20', status: 'Bon de commande' },
    { ref: 'FAC-2026-003', client: 'Express Cargo', service: 'Livraison urgente', amount: '€ 2 100', due: '2026-06-12', status: 'Facture' },
    { ref: 'FAC-2026-004', client: 'TGV Express', service: 'Colis volumineux', amount: '€ 540', due: '2026-06-30', status: 'Devis' },
    { ref: 'FAC-2026-005', client: 'Logistics Plus', service: 'Transport standard', amount: '€ 920', due: '2026-06-25', status: 'Bon de commande' },
];

const filtered = computed(() => invoices.filter(f =>
    !search.value || Object.values(f).some(v => v.toLowerCase().includes(search.value.toLowerCase()))
));

async function download(f: BonCommandeData) {
    exporting.value = f.ref;
    try {
        await exportBonCommandePdf(f);
    } finally {
        exporting.value = null;
    }
}

function statusClass(s: string) { return ({ 'Facture': 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100', 'Bon de commande': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100', 'Devis': 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100' } as Record<string, string>)[s] ?? ''; }
</script>
