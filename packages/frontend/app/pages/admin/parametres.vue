<template>
    <AppLayout>
        <div class="max-w-2xl space-y-4">
            <div>
                <h1 class="text-2xl font-bold tracking-tight">Paramètres</h1>
                <p class="text-muted-foreground text-sm mt-1">Configuration de la plateforme</p>
            </div>

            <Card>
                <CardHeader><CardTitle class="text-base">Informations de la société</CardTitle></CardHeader>
                <CardContent class="space-y-4">
                    <div class="space-y-1.5">
                        <Label for="company-name">Nom de la société</Label>
                        <Input id="company-name" default-value="Transvirex Logistics" />
                    </div>
                    <div class="space-y-1.5">
                        <Label for="company-email">Email de contact</Label>
                        <Input id="company-email" type="email" default-value="contact@transvirex.fr" />
                    </div>
                    <div class="space-y-1.5">
                        <Label for="company-phone">Téléphone</Label>
                        <Input id="company-phone" type="tel" default-value="01 23 45 67 89" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle class="text-base">Notifications</CardTitle></CardHeader>
                <CardContent class="space-y-4">
                    <div v-for="notif in notifications" :key="notif.label" class="flex items-center justify-between">
                        <div>
                            <p class="text-sm font-medium">{{ notif.label }}</p>
                            <p class="text-xs text-muted-foreground">
                                {{ notif.desc }}
                            </p>
                        </div>
                        <button
                            @click="notif.enabled = !notif.enabled"
                            class="relative w-10 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            :class="notif.enabled ? 'bg-primary' : 'bg-muted-foreground/30'"
                        >
                            <div
                                class="w-4 h-4 bg-white rounded-full shadow absolute top-0.5 transition-transform"
                                :class="notif.enabled ? 'translate-x-5' : 'translate-x-0.5'"
                            />
                        </button>
                    </div>
                </CardContent>
            </Card>

            <div class="flex justify-end">
                <Button>Enregistrer</Button>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

definePageMeta({ layout: false });
useHead({ title: 'Paramètres — Transvirex' });

/** Platform notification toggles. */
const notifications = reactive([
    {
        label: 'Livraisons retardées',
        desc: 'Alerte quand une livraison dépasse le délai prévu',
        enabled: true,
    },
    {
        label: 'Nouveaux clients',
        desc: 'Notification à chaque nouveau client créé',
        enabled: false,
    },
    {
        label: 'Rapport journalier',
        desc: 'Résumé automatique chaque matin à 8h',
        enabled: true,
    },
    {
        label: 'Alertes critiques',
        desc: 'Colis endommagés, chauffeur non joignable',
        enabled: true,
    },
]);
</script>
