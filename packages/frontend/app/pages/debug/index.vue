<script setup lang="ts">
import {
    AlertTriangle,
    Box,
    CheckCircle,
    ChevronRight,
    Database,
    FileText,
    Heart,
    MessageSquareMore,
    Zap,
} from '@lucide/vue';
import { storeToRefs } from 'pinia';

useHead({ title: 'Debug Dashboard — Transvirex' });

const health = useHealthStore();
/** Destructured reactive references to health store state. */
const { servicesOk, servicesError, lastChecked, services } = storeToRefs(health);
</script>

<template>
    <div class="max-w-5xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">Dashboard Debug</h1>
            <p class="text-gray-500">Vue d'ensemble des outils de diagnostic</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <UiCard>
                <UiCardContent>
                    <div class="flex items-center gap-4 pt-6">
                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle class="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-slate-900">
                                {{ servicesOk }}
                            </p>
                            <p class="text-sm text-gray-500">Services OK</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">Vérification automatique</p>
                </UiCardContent>
            </UiCard>

            <UiCard>
                <UiCardContent>
                    <div class="flex items-center gap-4 pt-6">
                        <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle class="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-slate-900">
                                {{ servicesError }}
                            </p>
                            <p class="text-sm text-gray-500">Services en erreur</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">Nécessite une attention</p>
                </UiCardContent>
            </UiCard>

            <UiCard>
                <UiCardContent>
                    <div class="flex items-center gap-4 pt-6">
                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                            <Zap class="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-slate-900">
                                {{ services.length }}
                            </p>
                            <p class="text-sm text-gray-500">Services</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">
                        {{ lastChecked ?? 'Aucune' }}
                    </p>
                </UiCardContent>
            </UiCard>

            <NuxtLink to="/debug/health" class="col-span-1 sm:col-span-3 block">
                <UiCard>
                    <UiCardContent>
                        <div class="flex items-center justify-between pt-6">
                            <div class="flex items-center gap-4">
                                <div
                                    class="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center shrink-0"
                                >
                                    <Heart class="w-6 h-6 text-slate-600" />
                                </div>
                                <div>
                                    <p class="font-medium text-slate-900 text-sm">Voir les détails</p>
                                    <p class="text-xs text-gray-500">État complet des services</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-1 text-sm text-blue-600 font-medium">
                                Accéder au health check
                                <ChevronRight class="w-4 h-4" />
                            </div>
                        </div>
                    </UiCardContent>
                </UiCard>
            </NuxtLink>
        </div>

        <UiCard>
            <UiCardHeader>
                <UiCardTitle>Outils de debug</UiCardTitle>
                <UiCardDescription>Accédez aux différents outils de diagnostic</UiCardDescription>
            </UiCardHeader>
            <UiCardContent>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                    <NuxtLink
                        to="/debug/health"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                            <Heart class="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">Health Check</p>
                            <p class="text-xs text-gray-500">Vérifier l'état des services</p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/postgresql"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                            <Database class="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">Console PostgreSQL</p>
                            <p class="text-xs text-gray-500">Requêtes sur la base de données</p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/redis"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                            <Box class="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">Console Redis</p>
                            <p class="text-xs text-gray-500">Commandes sur le cache Redis</p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/rabbitmq"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                            <MessageSquareMore class="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">RabbitMQ</p>
                            <p class="text-xs text-gray-500">Files d'attente et messages</p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/mongodb"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                            <Database class="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">Console MongoDB</p>
                            <p class="text-xs text-gray-500">Requêtes sur la base de données</p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/logs"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                            <FileText class="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">Logs</p>
                            <p class="text-xs text-gray-500">Consultation des logs applicatifs</p>
                        </div>
                    </NuxtLink>
                </div>
            </UiCardContent>
        </UiCard>
    </div>
</template>

