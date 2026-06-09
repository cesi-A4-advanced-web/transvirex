<script setup lang="ts">
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
                    <code class="text-xs bg-gray-100 px-1.5 py-0.5 rounded"
                        >/health</code
                    >
                </UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
                <div class="mb-6">
                    <UiButton @click="health.checkAll" :disabled="loading">
                        <svg
                            class="w-4 h-4"
                            v-if="!loading"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        <svg
                            class="w-4 h-4"
                            v-else
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
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
                        <UiTableRow
                            v-for="service in services"
                            :key="service.name"
                        >
                            <UiTableCell class="font-medium">
                                {{ service.name }}
                            </UiTableCell>
                            <UiTableCell class="text-xs text-gray-500">
                                {{ service.url }}
                            </UiTableCell>
                            <UiTableCell>
                                <UiBadge
                                    v-if="service.status === 'pending'"
                                    variant="secondary"
                                >
                                    En attente...
                                </UiBadge>
                                <UiBadge
                                    v-else-if="service.status === 'ok'"
                                    variant="default"
                                    class="bg-green-600 text-white"
                                >
                                    OK
                                </UiBadge>
                                <UiBadge v-else variant="destructive">
                                    Erreur
                                </UiBadge>
                            </UiTableCell>
                            <UiTableCell class="text-sm">
                                {{
                                    service.responseTime != null
                                        ? `${service.responseTime} ms`
                                        : '—'
                                }}
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
