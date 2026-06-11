<template>
    <AppLayout>
        <div class="max-w-2xl space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Mon profil</h1>
                <p class="text-muted-foreground text-sm mt-1">Informations personnelles et statistiques</p>
            </div>

            <div v-if="loading" class="flex items-center justify-center py-12">
                <Loader2 class="w-6 h-6 animate-spin text-muted-foreground" />
            </div>

            <template v-else>
                <Card>
                    <CardContent class="p-6">
                        <div class="flex items-center gap-5 mb-6">
                            <div
                                class="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0"
                            >
                                {{ initials }}
                            </div>
                            <div>
                                <h2 class="text-lg font-bold">{{ user?.firstname ?? '' }} {{ user?.lastname ?? '' }}</h2>
                                <p class="text-sm text-muted-foreground">Chauffeur · {{ hubName }}</p>
                                <div class="flex items-center gap-1 mt-1">
                                    <span
                                        v-for="i in 5"
                                        :key="i"
                                        class="text-yellow-400 text-sm"
                                        :class="i <= Math.round(driverRating) ? '' : 'opacity-30'"
                                        >★</span
                                    >
                                    <span class="text-sm text-muted-foreground ml-1">{{ driverRatingDisplay }} / 5</span>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-green-50 rounded-lg p-4 text-center">
                                <p class="text-2xl font-bold text-green-700">{{ totalDeliveries }}</p>
                                <p class="text-xs text-muted-foreground mt-1">Livraisons totales</p>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 text-center">
                                <p class="text-2xl font-bold text-blue-700">{{ successRate }}</p>
                                <p class="text-xs text-muted-foreground mt-1">Taux de succès</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="font-semibold text-sm">Informations personnelles</h3>
                            <div class="space-y-1.5">
                                <Label for="fullname">Nom complet</Label>
                                <Input id="fullname" v-model="editName" />
                            </div>
                            <div class="space-y-1.5">
                                <Label for="email">Email</Label>
                                <Input id="email" type="email" v-model="editEmail" />
                            </div>
                            <div class="space-y-1.5">
                                <Label for="phone">Téléphone</Label>
                                <Input id="phone" type="tel" v-model="editPhone" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle class="text-base">Véhicule assigné</CardTitle></CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <Truck class="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="font-semibold">{{ vehicleName }}</p>
                                <p class="text-sm text-muted-foreground">{{ vehiclePlate }} · {{ hubName }}</p>
                            </div>
                            <Badge class="ml-auto bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                >Actif</Badge
                            >
                        </div>
                    </CardContent>
                </Card>

                <div class="flex items-center justify-end gap-3">
                    <span v-if="saveMessage" class="text-sm" :class="saveError ? 'text-red-600' : 'text-green-600'">
                        {{ saveMessage }}
                    </span>
                    <Button :disabled="saving" @click="saveProfile">
                        <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
                        Enregistrer
                    </Button>
                </div>
            </template>
        </div>
    </AppLayout>
</template>
<script setup lang="ts">
import { useCookie } from '#app';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Truck } from '@lucide/vue';
import { useApi, type ApiDelivery } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Mon profil — Livreur' });

const { get, patch } = useApi();

function parseJwt(token: string): Record<string, unknown> | null {
    try {
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(b64));
    } catch {
        return null;
    }
}
const token = useCookie('access_token');
const payload = computed(() => (token.value ? parseJwt(token.value) : null));
const userId = computed(() => (payload.value?.sub as string) || '');

const initials = computed(() => {
    const first = (payload.value?.firstname as string) ?? '';
    const last = (payload.value?.lastname as string) ?? '';
    return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase() || '?';
});

const loading = ref(true);
const saving = ref(false);
const user = ref<{ id: string; firstname: string | null; lastname: string | null; email: string | null; phone_number: string | null; hub: { name: string | null } | null } | null>(null);
const driverProfile = ref<{ reference: string; rating: number | null; vehicle: { type: string | null; license_plate: string | null } | null } | null>(null);
const deliveries = ref<ApiDelivery[]>([]);

const editName = ref('');
const editEmail = ref('');
const editPhone = ref('');
const saveMessage = ref('');
const saveError = ref(false);

const hubName = computed(() => user.value?.hub?.name ?? 'Hub principal');
const driverRating = computed(() => driverProfile.value?.rating ?? 0);
const driverRatingDisplay = computed(() => driverRating.value ? driverRating.value.toFixed(1) : '—');

const vehicleName = computed(() => driverProfile.value?.vehicle?.type ?? 'Véhicule non assigné');
const vehiclePlate = computed(() => driverProfile.value?.vehicle?.license_plate ?? '—');

const totalDeliveries = computed(() => deliveries.value.length);
const successRate = computed(() => {
    if (deliveries.value.length === 0) return '—';
    const delivered = deliveries.value.filter((d) => d.status === 'delivered').length;
    return `${((delivered / deliveries.value.length) * 100).toFixed(1)}%`;
});

async function fetchData() {
    loading.value = true;
    try {
        const [userRes, driverRes, delRes] = await Promise.all([
            get(`/users/${userId.value}`).catch(() => null),
            get(`/users/${userId.value}/driver`).catch(() => null),
            get<{ data: ApiDelivery[]; total: number }>('/deliveries', { limit: 200 }).catch(() => ({ data: [], total: 0 })),
        ]);
        user.value = userRes as typeof user.value;
        driverProfile.value = driverRes as typeof driverProfile.value;
        deliveries.value = delRes.data ?? [];
        editName.value = `${user.value?.firstname ?? ''} ${user.value?.lastname ?? ''}`.trim() || '';
        editEmail.value = user.value?.email ?? '';
        editPhone.value = user.value?.phone_number ?? '';
    } catch (e) {
        console.error('Failed to load profile', e);
    } finally {
        loading.value = false;
    }
}

async function saveProfile() {
    saving.value = true;
    saveMessage.value = '';
    saveError.value = false;
    try {
        const parts = editName.value.split(' ');
        const firstname = parts[0] || '';
        const lastname = parts.slice(1).join(' ') || '';
        await patch(`/users/${userId.value}`, {
            firstname,
            lastname,
            email: editEmail.value || undefined,
            phone_number: editPhone.value || undefined,
        });
        saveMessage.value = 'Profil mis à jour ✓';
        setTimeout(() => { saveMessage.value = ''; }, 3000);
    } catch (e) {
        console.error('Failed to save profile', e);
        saveMessage.value = 'Erreur lors de la sauvegarde';
        saveError.value = true;
    } finally {
        saving.value = false;
    }
}

onMounted(fetchData);
</script>
