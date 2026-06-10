<template>
    <AppLayout>
        <div class="max-w-2xl space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Mon profil</h1>
                <p class="text-muted-foreground text-sm mt-1">Informations personnelles et statistiques</p>
            </div>

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
                            <p class="text-sm text-muted-foreground">Chauffeur · Hub Paris Centre</p>
                            <div class="flex items-center gap-1 mt-1">
                                <span
                                    v-for="i in 5"
                                    :key="i"
                                    class="text-yellow-400 text-sm"
                                    :class="i <= 4 ? '' : 'opacity-30'"
                                    >★</span
                                >
                                <span class="text-sm text-muted-foreground ml-1">4.8 / 5</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-6">
                        <div class="bg-green-50 rounded-lg p-4 text-center">
                            <p class="text-2xl font-bold text-green-700">247</p>
                            <p class="text-xs text-muted-foreground mt-1">Livraisons totales</p>
                        </div>
                        <div class="bg-blue-50 rounded-lg p-4 text-center">
                            <p class="text-2xl font-bold text-blue-700">96.7%</p>
                            <p class="text-xs text-muted-foreground mt-1">Taux de succès</p>
                        </div>
                    </div>

                    <div class="space-y-4">
                        <h3 class="font-semibold text-sm">Informations personnelles</h3>
                        <div class="space-y-1.5">
                            <Label for="fullname">Nom complet</Label>
                            <Input id="fullname" :default-value="fullName" />
                        </div>
                        <div class="space-y-1.5">
                            <Label for="email">Email</Label>
                            <Input id="email" type="email" default-value="driver@transvirex.fr" />
                        </div>
                        <div class="space-y-1.5">
                            <Label for="phone">Téléphone</Label>
                            <Input id="phone" type="tel" default-value="06 12 34 56 78" />
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
                            <p class="font-semibold">Renault Master</p>
                            <p class="text-sm text-muted-foreground">AA-123-BB · Hub Paris Centre</p>
                        </div>
                        <Badge class="ml-auto bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                            >Actif</Badge
                        >
                    </div>
                </CardContent>
            </Card>

            <div class="flex justify-end">
                <Button class="bg-green-600 hover:bg-green-700">Enregistrer</Button>
            </div>
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
import { Truck } from '@lucide/vue';

definePageMeta({ layout: false });
useHead({ title: 'Mon profil — Livreur' });

/** Decode a JWT payload without validation. */
function parseJwt(token: string): Record<string, unknown> | null {
    try {
        const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(b64));
    } catch {
        return null;
    }
}
const token = useCookie('access_token');
/** Decoded JWT payload from the access token. */
const payload = computed(() => (token.value ? parseJwt(token.value) : null));
/** Full driver name extracted from the JWT. */
const fullName = computed(() => {
    const first = (payload.value?.firstname as string) ?? '';
    const last = (payload.value?.lastname as string) ?? '';
    return `${first} ${last}`.trim() || 'Chauffeur';
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
</script>

