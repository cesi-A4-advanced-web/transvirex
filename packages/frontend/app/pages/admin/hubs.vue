<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Hubs</h1>
                    <p class="text-muted-foreground text-sm mt-1">Centres de distribution</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouveau hub</Button>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                <Card v-for="hub in hubs" :key="hub.ref">
                    <CardHeader class="pb-3">
                        <div class="flex items-start justify-between">
                            <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Building2 class="w-5 h-5 text-primary" />
                            </div>
                            <Badge :class="hub.status === 'active' ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'">
                                {{ hub.status === 'active' ? 'Actif' : 'Inactif' }}
                            </Badge>
                        </div>
                        <CardTitle class="text-sm mt-3">{{ hub.name }}</CardTitle>
                        <CardDescription class="font-mono text-xs">{{ hub.ref }}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-1.5 text-xs">
                            <div class="flex justify-between"><span class="text-muted-foreground">Adresse</span><span>{{ hub.address }}</span></div>
                            <div class="flex justify-between"><span class="text-muted-foreground">Capacité/jour</span><span class="font-semibold">{{ hub.capacity }} colis</span></div>
                            <div class="flex justify-between"><span class="text-muted-foreground">Chauffeurs</span><span>{{ hub.drivers }}</span></div>
                            <div class="flex justify-between"><span class="text-muted-foreground">Téléphone</span><span>{{ hub.phone }}</span></div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Building2 } from 'lucide-vue-next';

definePageMeta({ layout: false });
useHead({ title: 'Hubs — Transvirex' });

const hubs = [
    { ref: 'HUB-001', name: 'Hub Paris Centre', address: '1 Rue de la Logistique, Paris', capacity: 500, drivers: 12, phone: '01 23 45 67 89', status: 'active' },
    { ref: 'HUB-002', name: 'Hub Lyon', address: '15 Av. de la République, Lyon', capacity: 350, drivers: 8, phone: '04 56 78 90 12', status: 'active' },
    { ref: 'HUB-003', name: 'Hub Bordeaux', address: '8 Rue du Commerce, Bordeaux', capacity: 280, drivers: 6, phone: '05 67 89 01 23', status: 'active' },
    { ref: 'HUB-004', name: 'Hub Lille', address: '22 Bd de la Paix, Lille', capacity: 200, drivers: 5, phone: '03 78 90 12 34', status: 'active' },
    { ref: 'HUB-005', name: 'Hub Nantes', address: '5 Quai de la Loire, Nantes', capacity: 180, drivers: 4, phone: '02 89 01 23 45', status: 'active' },
    { ref: 'HUB-006', name: 'Hub Strasbourg', address: '10 Rue du Rhin, Strasbourg', capacity: 150, drivers: 3, phone: '03 90 12 34 56', status: 'inactive' },
];
</script>
