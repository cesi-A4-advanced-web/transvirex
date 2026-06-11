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
                                <h2 class="text-lg font-bold">{{ fullName }}</h2>
                                <p class="text-sm text-muted-foreground">
                                    Chauffeur{{ hubName ? ` · ${hubName}` : '' }}
                                </p>
                                <div v-if="rating != null" class="flex items-center gap-1 mt-1">
                                    <span
                                        v-for="i in 5"
                                        :key="i"
                                        class="text-yellow-400 text-sm"
                                        :class="i <= Math.round(rating) ? '' : 'opacity-30'"
                                        >★</span
                                    >
                                    <span class="text-sm text-muted-foreground ml-1">{{ rating.toFixed(1) }} / 5</span>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-4 mb-6">
                            <div class="bg-green-50 rounded-lg p-4 text-center">
                                <p class="text-2xl font-bold text-green-700">{{ stats.total }}</p>
                                <p class="text-xs text-muted-foreground mt-1">Livraisons totales</p>
                            </div>
                            <div class="bg-blue-50 rounded-lg p-4 text-center">
                                <p class="text-2xl font-bold text-blue-700">{{ stats.success_rate }}%</p>
                                <p class="text-xs text-muted-foreground mt-1">Taux de succès</p>
                            </div>
                        </div>

                        <div class="space-y-4">
                            <h3 class="font-semibold text-sm">Informations personnelles</h3>
                            <div class="space-y-1.5">
                                <Label for="fullname">Nom complet</Label>
                                <Input id="fullname" :model-value="fullName" disabled />
                            </div>
                            <div class="space-y-1.5">
                                <Label for="email">Email</Label>
                                <Input id="email" type="email" :model-value="email" disabled />
                            </div>
                            <div class="space-y-1.5">
                                <Label for="phone">Téléphone</Label>
                                <Input id="phone" type="tel" :model-value="phone" disabled />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle class="text-base">Véhicule assigné</CardTitle></CardHeader>
                    <CardContent>
                        <div v-if="vehicle" class="flex items-center gap-4">
                            <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                <Truck class="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p class="font-semibold">{{ vehicle.type || vehicle.reference }}</p>
                                <p class="text-sm text-muted-foreground">
                                    {{ [vehicle.license_plate, hubName].filter(Boolean).join(' · ') || '—' }}
                                </p>
                            </div>
                            <Badge class="ml-auto bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                >Assigné</Badge
                            >
                        </div>
                        <p v-else class="text-sm text-muted-foreground text-center py-4">Aucun véhicule assigné</p>
                    </CardContent>
                </Card>
            </template>
        </div>
    </AppLayout>
</template>
<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApi, type ApiDriverProfile } from '@/composables/useApi';
import { Loader2, Truck } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Mon profil — Livreur' });

const { get } = useApi();

const loading = ref(true);
const profile = ref<ApiDriverProfile | null>(null);

/** Full driver name from the loaded profile. */
const fullName = computed(() => {
    const u = profile.value?.user;
    return `${u?.firstname ?? ''} ${u?.lastname ?? ''}`.trim() || 'Chauffeur';
});
/** Driver initials derived from the full name. */
const initials = computed(() =>
    fullName.value
        .split(' ')
        .map((n) => n[0] ?? '')
        .join('')
        .toUpperCase()
        .slice(0, 2),
);
const email = computed(() => profile.value?.user.email ?? '');
const phone = computed(() => profile.value?.user.phone_number ?? '');
const hubName = computed(() => profile.value?.hub.name ?? '');
const rating = computed(() => profile.value?.driver?.rating ?? null);
const stats = computed(() => profile.value?.stats ?? { total: 0, delivered: 0, success_rate: 0 });
const vehicle = computed(() => profile.value?.vehicle ?? null);

async function fetchProfile() {
    loading.value = true;
    try {
        profile.value = await get<ApiDriverProfile>('/drivers/me/profile');
    } catch (e) {
        console.error('Failed to load profile', e);
    } finally {
        loading.value = false;
    }
}

onMounted(fetchProfile);
</script>
