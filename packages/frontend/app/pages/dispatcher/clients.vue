<template>
    <AppLayout>
        <div class="space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Clients</h1>
                <p class="text-muted-foreground text-sm mt-1">Liste des clients actifs</p>
            </div>
            <Card>
                <CardContent class="p-4">
                    <div class="relative max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Rechercher un client..." class="pl-9" />
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
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Hub</TableHead>
                                    <TableHead>Factures actives</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow v-for="c in filtered" :key="c.ref">
                                    <TableCell class="font-mono text-xs text-muted-foreground">{{ c.ref }}</TableCell>
                                    <TableCell class="font-medium">{{ c.name }}</TableCell>
                                    <TableCell class="text-muted-foreground">{{ c.contact }}</TableCell>
                                    <TableCell class="text-xs text-muted-foreground">{{ c.email }}</TableCell>
                                    <TableCell>{{ c.hub }}</TableCell>
                                    <TableCell>
                                        <span
                                            class="font-semibold"
                                            :class="c.active > 0 ? 'text-primary' : 'text-muted-foreground'"
                                        >{{ c.active }}</span>
                                    </TableCell>
                                </TableRow>
                                <TableRow v-if="filtered.length === 0">
                                    <TableCell colspan="6" class="text-center text-muted-foreground py-6">
                                        Aucun client trouvé
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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Search } from '@lucide/vue';
import { useApi, type ApiCustomer } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Clients — Dispatcher' });

const { get } = useApi();

const loading = ref(true);
const search = ref('');
const customers = ref<ApiCustomer[]>([]);

const mappedClients = computed(() =>
    customers.value.map((c) => ({
        ref: c.reference,
        name: c.customer_name ?? '—',
        contact: `${c.contact_firstname ?? ''} ${c.contact_lastname ?? ''}`.trim() || '—',
        email: c.email ?? '—',
        hub: c.hub?.name ?? c.hub?.reference ?? '—',
        active: c.active_invoices,
    }))
);

const filtered = computed(() =>
    mappedClients.value.filter(
        (c) =>
            !search.value ||
            [c.ref, c.name, c.contact, c.email, c.hub].some((v) =>
                String(v).toLowerCase().includes(search.value.toLowerCase())
            )
    )
);

async function fetchData() {
    loading.value = true;
    try {
        const res = await get<ApiCustomer[]>('/customers');
        customers.value = res;
    } catch (e) {
        console.error('Failed to load customers', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchData);
</script>
