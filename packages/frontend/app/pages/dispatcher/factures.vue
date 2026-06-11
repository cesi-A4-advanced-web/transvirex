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
                    <CardContent class="p-0 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Référence</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Service</TableHead>
                                    <TableHead>Montant</TableHead>
                                    <TableHead>Échéance</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead class="w-24 text-right">Actions</TableHead>
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
                    class="h-7 w-7 text-blue-600 hover:text-blue-700"
                    @click="openPlanifier(f)"
                    :title="`Planifier une livraison — ${f.ref}`"
                >
                    <Truck class="w-3.5 h-3.5" />
                </Button>
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
        <Dialog :open="showPlanifier" @update:open="showPlanifier = false">
            <DialogContent class="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Planifier une livraison</DialogTitle>
                    <DialogDescription v-if="selectedInvoice">
                        Facture {{ selectedInvoice.ref }} — {{ selectedInvoice.client }}
                    </DialogDescription>
                </DialogHeader>
                <div class="space-y-4 py-4">
                    <div class="space-y-2">
                        <Label>Facture</Label>
                        <Input :value="selectedInvoice?.ref ?? ''" disabled class="bg-muted" />
                    </div>
                    <div class="space-y-2">
                        <Label>Référence livraison</Label>
                        <Input v-model="planForm.reference" readonly placeholder="Généré automatiquement" />
                    </div>
                    <div class="space-y-2">
                        <Label>Chauffeur (optionnel)</Label>
                        <div v-if="driverOptions.length > 0" class="border rounded-lg max-h-36 overflow-y-auto divide-y">
                            <div
                                v-for="driver in driverOptions"
                                :key="driver.id"
                                class="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                                :class="planForm.driver_id === driver.id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'"
                                @click="planForm.driver_id = planForm.driver_id === driver.id ? '' : driver.id"
                            >
                                <div>
                                    <p class="text-xs font-medium">{{ driver.name }}</p>
                                    <p class="text-xs text-muted-foreground">{{ driver.email }}</p>
                                </div>
                                <Badge v-if="planForm.driver_id === driver.id" variant="outline" class="text-[10px]">Sélectionné</Badge>
                            </div>
                            <div
                                class="flex items-center px-3 py-2 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
                                :class="!planForm.driver_id ? 'bg-primary/5 border-l-2 border-l-primary' : 'border-l-2 border-l-transparent'"
                                @click="planForm.driver_id = ''"
                            >
                                <span class="text-xs text-muted-foreground">Non assigné</span>
                                <Badge v-if="!planForm.driver_id" variant="outline" class="text-[10px] ml-auto">Sélectionné</Badge>
                            </div>
                        </div>
                        <div v-else class="text-center text-xs text-muted-foreground py-2">Aucun chauffeur disponible</div>
                    </div>
                    <div class="space-y-2">
                        <Label>Date planifiée (optionnel)</Label>
                        <Input v-model="planForm.scheduled_at" type="datetime-local" />
                    </div>
                    <div class="space-y-2">
                        <Label>Notes (optionnel)</Label>
                        <Textarea v-model="planForm.notes" placeholder="Instructions particulières..." />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showPlanifier = false">Annuler</Button>
                    <Button :disabled="creating" @click="confirmPlanifier">
                        <Loader2 v-if="creating" class="w-4 h-4 mr-2 animate-spin" />
                        Créer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { exportBonCommandePdf, exportFacturePdf } from '@/composables/usePdfExport';
import { useApi, type ApiInvoice } from '@/composables/useApi';
import { FileDown, Loader2, Search, Truck } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Factures — Dispatcher' });

const { get, post } = useApi();

const loading = ref(true);
const invoices = ref<ApiInvoice[]>([]);
const search = ref('');
const exporting = ref<string | null>(null);

const showPlanifier = ref(false);
const creating = ref(false);
const selectedInvoice = ref<{ id: string; ref: string; client: string } | null>(null);
const planForm = ref({ reference: '', notes: '', driver_id: '', scheduled_at: '' });
const drivers = ref<ApiUser[]>([]);

function generateRef(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LIV-${date}-${rand}`;
}

const driverOptions = computed(() =>
    drivers.value
        .filter((d) => d.status === 'active')
        .map((d) => ({
            id: d.driver?.id ?? d.id,
            name: `${d.firstname ?? ''} ${d.lastname ?? ''}`.trim() || d.email || '',
            initials: ((d.firstname?.[0] ?? '') + (d.lastname?.[0] ?? '')).toUpperCase() || '?',
            email: d.email ?? '',
        }))
);

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

function openPlanifier(f: { id: string; ref: string; client: string }) {
    selectedInvoice.value = f;
    planForm.value = { reference: generateRef(), notes: '', driver_id: '', scheduled_at: '' };
    showPlanifier.value = true;
}

async function confirmPlanifier() {
    if (!selectedInvoice.value) return;
    creating.value = true;
    try {
        const payload: Record<string, unknown> = {
            invoices_id: selectedInvoice.value.id,
            notes: planForm.value.notes || undefined,
        };
        if (planForm.value.driver_id) payload.driver_id = planForm.value.driver_id;
        if (planForm.value.scheduled_at) payload.scheduled_at = new Date(planForm.value.scheduled_at).toISOString();
        await post('/deliveries', payload);
        showPlanifier.value = false;
    } catch (e) {
        console.error('Failed to create delivery', e);
    } finally {
        creating.value = false;
    }
}

async function fetchData() {
    loading.value = true;
    try {
        const [invRes, driverRes] = await Promise.all([
            get<{ data: ApiInvoice[]; total: number }>('/invoices', { limit: 100 }),
            get<{ data: ApiUser[]; total: number }>('/users', { role: 'driver', limit: 50 }),
        ]);
        invoices.value = invRes.data;
        drivers.value = driverRes.data;
    } catch (e) {
        console.error('Failed to load invoices', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>
