<script setup lang="ts">
import { RefreshCw } from '@lucide/vue';
import { storeToRefs } from 'pinia';
definePageMeta({ layout: 'debug' });

useHead({ title: 'Santé des Services — Transvirex' });

const health = useHealthStore();
const { services, loading } = storeToRefs(health);
</script>

<template>
    <div class="max-w-5xl mx-auto space-y-6">
        <UiCard>
            <UiCardHeader>
                <UiCardTitle>État des services</UiCardTitle>
                <UiCardDescription>
                    Vérification en temps réel des endpoints
                    <code class="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/health</code>
                </UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
                <div class="mb-6">
                    <UiButton @click="health.checkAll" :disabled="loading">
                        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                        {{ loading ? 'Vérification...' : 'Rafraîchir' }}
                    </UiButton>
                </div>

                <UiTable>
                    <UiTableHeader>
                        <UiTableRow>
                            <UiTableHead>Service</UiTableHead>
                            <UiTableHead>URL</UiTableHead>
                            <UiTableHead>Statut</UiTableHead>
                            <UiTableHead>Temps de réponse</UiTableHead>
                            <UiTableHead>Détails</UiTableHead>
                        </UiTableRow>
                    </UiTableHeader>
                    <UiTableBody>
                        <UiTableRow v-for="service in services" :key="service.name">
                            <UiTableCell class="font-medium">
                                {{ service.name }}
                            </UiTableCell>
                            <UiTableCell class="text-xs text-gray-500">
                                {{ service.url }}
                            </UiTableCell>
                            <UiTableCell>
                                <UiBadge v-if="service.status === 'pending'" variant="secondary">
                                    En attente...
                                </UiBadge>
                                <UiBadge
                                    v-else-if="service.status === 'ok'"
                                    variant="default"
                                    class="bg-green-600 text-white"
                                >
                                    OK
                                </UiBadge>
                                <UiBadge v-else variant="destructive"> Erreur </UiBadge>
                            </UiTableCell>
                            <UiTableCell class="text-sm">
                                {{ service.responseTime != null ? `${service.responseTime} ms` : '—' }}
                            </UiTableCell>
                            <UiTableCell class="text-sm text-gray-500">
                                {{ service.detail ?? '—' }}
                            </UiTableCell>
                        </UiTableRow>
                    </UiTableBody>
                </UiTable>
            </UiCardContent>
        </UiCard>
    </div>
</template>
