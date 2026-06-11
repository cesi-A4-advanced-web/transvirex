<template>
    <AppLayout>
        <div class="space-y-6">
            <div>
                <h2 class="text-2xl font-bold tracking-tight">Bonjour, {{ driverFirstName }} 👋</h2>
                <p class="text-muted-foreground text-sm mt-1">
                    {{ todayLabel }} — {{ totalAssigned }} livraisons assignées
                </p>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
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
                            <div v-if="activeDeliveries.length === 0" class="text-center text-muted-foreground py-8 text-sm">
                                Aucune livraison active pour aujourd'hui
                            </div>
                            <div v-else class="relative">
                                <div class="absolute left-4 top-3 bottom-3 w-0.5 bg-border" />
                                <div
                                    v-for="(delivery, i) in activeDeliveries"
                                    :key="delivery.id"
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
                                            delivery.status === 'delivering'
                                                ? 'border-blue-200 bg-blue-50'
                                                : 'border-border bg-muted/30'
                                        "
                                    >
                                        <div class="flex items-start justify-between gap-2">
                                            <div>
                                                <p class="text-sm font-semibold">
                                                    {{ delivery.address || 'Adresse non renseignée' }}
                                                </p>
                                                <p class="text-xs text-muted-foreground mt-0.5">
                                                    {{ delivery.customer || 'Client non renseigné' }}
                                                </p>
                                            </div>
                                            <div class="flex flex-col items-end gap-1 flex-shrink-0">
                                                <Badge :class="statusBadgeClass(delivery.status)">{{ statusLabel(delivery.status) }}</Badge>
                                            </div>
                                        </div>
                                        <div
                                            v-if="delivery.notes"
                                            class="mt-2 text-xs text-orange-600 bg-orange-50 rounded px-2 py-1"
                                        >
                                            ⚠ {{ delivery.notes }}
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
                                <div v-if="!currentDelivery" class="text-center text-muted-foreground py-4 text-sm">
                                    Aucune livraison en cours
                                </div>
                                <template v-else>
                                    <div class="flex items-center gap-3">
                                        <div class="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <MapPin class="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p class="text-sm font-bold">
                                                {{ currentDelivery.address || 'Adresse non renseignée' }}
                                            </p>
                                            <p class="text-xs text-muted-foreground">
                                                {{ currentDelivery.customer || 'Client non renseigné' }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="space-y-2 text-xs">
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">Référence</span
                                            ><span class="font-mono text-muted-foreground">{{ currentDelivery.reference }}</span>
                                        </div>
                                        <div class="flex justify-between">
                                            <span class="text-muted-foreground">Statut</span
                                            ><span class="font-semibold text-blue-600">{{ statusLabel(currentDelivery.status) }}</span>
                                        </div>
                                        <div v-if="currentDelivery.notes" class="flex justify-between">
                                            <span class="text-muted-foreground">Note</span
                                            ><span class="font-medium text-orange-600">{{ currentDelivery.notes }}</span>
                                        </div>
                                    </div>
                                    <div class="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            class="bg-green-600 hover:bg-green-700 text-white"
                                            :disabled="statusLoading"
                                            @click="markDelivered(currentDelivery.id)"
                                        >✓ Livré</Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            :disabled="statusLoading"
                                            @click="openProblemDialog(currentDelivery.id)"
                                        >Problème</Button>
                                    </div>
                                </template>
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
                                        <p class="text-xs text-muted-foreground">Chauffeur · {{ driverRef || '—' }}</p>
                                    </div>
                                </div>
                                <div class="flex items-center justify-between bg-yellow-50 rounded-lg px-3 py-2">
                                    <span class="text-xs text-muted-foreground">Note moyenne</span>
                                    <div class="flex items-center gap-1">
                                        <span class="text-yellow-500 text-sm">★★★★★</span>
                                        <span class="text-sm font-bold">{{ driverRating }}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </template>
        </div>

        <Dialog :open="!!problemDeliveryId" @update:open="problemDeliveryId = null">
            <DialogContent class="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>Signaler un problème</DialogTitle>
                    <DialogDescription>Décrivez le problème rencontré</DialogDescription>
                </DialogHeader>
                <div class="py-2">
                    <Textarea v-model="problemNote" placeholder="Ex: Client absent, colis endommagé..." rows="3" />
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="problemDeliveryId = null">Annuler</Button>
                    <Button :disabled="!problemNote.trim() || statusLoading" @click="reportProblem">
                        <Loader2 v-if="statusLoading" class="w-4 h-4 mr-2 animate-spin" />
                        Signaler
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </AppLayout>
</template>

<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MapPin } from '@lucide/vue';
import { useApi, type ApiDelivery } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Dashboard Livreur — Transvirex' });

const { get, patch } = useApi();

const accessToken = useCookie('access_token');
function parseJwt(token: string) {
    try {
        return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
        return null;
    }
}

const payload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));
const userId = computed(() => (payload.value?.sub as string) || '');
const driverFirstName = computed(() => (payload.value?.firstname as string) || 'Pierre');
const todayLabel = computed(() =>
    new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    }),
);

const loading = ref(true);
const statusLoading = ref(false);
const deliveries = ref<ApiDelivery[]>([]);
const activeDeliveriesData = ref<{ id: string; reference: string; status: string; notes: string | null; customer: string | null; address: string | null }[]>([]);
const driverProfile = ref<{ reference: string; rating: number | null; vehicle: { type: string | null; license_plate: string | null } | null } | null>(null);

const problemDeliveryId = ref<string | null>(null);
const problemNote = ref('');

async function fetchData() {
    loading.value = true;
    try {
        const [delRes, activeRes, driverRes] = await Promise.all([
            get<{ data: ApiDelivery[]; total: number }>('/deliveries', { limit: 200 }),
            userId.value ? get<{ deliveries: typeof activeDeliveriesData.value }>(`/drivers/${userId.value}/deliveries`).catch(() => ({ deliveries: [] })) : Promise.resolve({ deliveries: [] }),
            userId.value ? get<typeof driverProfile.value>(`/users/${userId.value}/driver`).catch(() => null) : Promise.resolve(null),
        ]);
        deliveries.value = delRes.data;
        activeDeliveriesData.value = activeRes.deliveries ?? [];
        driverProfile.value = driverRes;
    } catch (e) {
        console.error('Failed to load dashboard data', e);
    } finally {
        loading.value = false;
    }
}

const totalAssigned = computed(() => deliveries.value.length);

const kpis = computed(() => [
    { label: 'Assignées', value: String(deliveries.value.length) },
    { label: 'En cours', value: String(deliveries.value.filter((d) => d.status === 'delivering').length) },
    { label: 'Terminées', value: String(deliveries.value.filter((d) => d.status === 'delivered').length) },
    { label: 'Ma note', value: driverRating.value ? `${driverRating.value} ★` : '—' },
]);

const driverRating = computed(() => {
    if (driverProfile.value?.rating != null) return driverProfile.value.rating.toFixed(1);
    return '—';
});

const driverRef = computed(() => driverProfile.value?.reference ?? '—');

const activeDeliveries = computed(() =>
    activeDeliveriesData.value.map((d) => ({
        id: d.id,
        ref: d.reference,
        address: d.address || '',
        customer: d.customer || '',
        status: d.status,
        notes: d.notes,
    }))
);

const currentDelivery = computed(() => {
    const found = activeDeliveriesData.value.find((d) => d.status === 'delivering');
    if (!found) return null;
    return {
        id: found.id,
        reference: found.reference,
        status: found.status,
        address: found.address || null,
        customer: found.customer || null,
        notes: found.notes,
    };
});

function statusLabel(status: string) {
    const labels: Record<string, string> = {
        planned: 'Planifié',
        delivering: 'En cours',
        delivered: 'Livré',
        cancelled: 'Annulé',
        blocked: 'Bloqué',
        delayed: 'Retardé',
    };
    return labels[status] ?? status;
}

function dotClass(status: string) {
    return (
        {
            delivered: 'bg-green-500 border-green-300 text-white',
            delivering: 'bg-blue-500 border-blue-300 text-white animate-pulse',
            planned: 'bg-background border-border text-muted-foreground',
            cancelled: 'bg-gray-300 border-gray-300 text-white',
            blocked: 'bg-red-500 border-red-300 text-white',
            delayed: 'bg-orange-500 border-orange-300 text-white',
        } as Record<string, string>
    )[status] ?? 'bg-background border-border text-muted-foreground';
}

function statusBadgeClass(s: string) {
    return (
        {
            delivered: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
            delivering: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
            planned: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            cancelled: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100',
            blocked: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
            delayed: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100',
        } as Record<string, string>
    )[s] ?? '';
}

async function markDelivered(id: string) {
    statusLoading.value = true;
    try {
        await patch(`/deliveries/${id}/status`, { status: 'delivered' });
        await fetchData();
    } catch (e) {
        console.error('Failed to update status', e);
    } finally {
        statusLoading.value = false;
    }
}

function openProblemDialog(id: string) {
    problemDeliveryId.value = id;
    problemNote.value = '';
}

async function reportProblem() {
    if (!problemDeliveryId.value || !problemNote.value.trim()) return;
    statusLoading.value = true;
    try {
        await patch(`/deliveries/${problemDeliveryId.value}/status`, {
            status: 'blocked',
            note: problemNote.value.trim(),
        });
        problemDeliveryId.value = null;
        problemNote.value = '';
        await fetchData();
    } catch (e) {
        console.error('Failed to report problem', e);
    } finally {
        statusLoading.value = false;
    }
}

onMounted(fetchData);
</script>
