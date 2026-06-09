<script setup lang="ts">
import { storeToRefs } from 'pinia';
definePageMeta({ layout: 'debug' });

useHead({ title: 'Debug Dashboard — Transvirex' });

const health = useHealthStore();
const { servicesOk, servicesError, lastChecked, services } =
    storeToRefs(health);
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
                        <div
                            class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-slate-900">
                                {{ servicesOk }}
                            </p>
                            <p class="text-sm text-gray-500">Services OK</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">
                        Vérification automatique
                    </p>
                </UiCardContent>
            </UiCard>

            <UiCard>
                <UiCardContent>
                    <div class="flex items-center gap-4 pt-6">
                        <div
                            class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-6 h-6 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="text-3xl font-bold text-slate-900">
                                {{ servicesError }}
                            </p>
                            <p class="text-sm text-gray-500">
                                Services en erreur
                            </p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mt-3">
                        Nécessite une attention
                    </p>
                </UiCardContent>
            </UiCard>

            <UiCard>
                <UiCardContent>
                    <div class="flex items-center gap-4 pt-6">
                        <div
                            class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-6 h-6 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
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
                                    <svg
                                        class="w-6 h-6 text-slate-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            stroke-linecap="round"
                                            stroke-linejoin="round"
                                            stroke-width="2"
                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <p
                                        class="font-medium text-slate-900 text-sm"
                                    >
                                        Voir les détails
                                    </p>
                                    <p class="text-xs text-gray-500">
                                        État complet des services
                                    </p>
                                </div>
                            </div>
                            <div
                                class="flex items-center gap-1 text-sm text-blue-600 font-medium"
                            >
                                Accéder au health check
                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </UiCardContent>
                </UiCard>
            </NuxtLink>
        </div>

        <UiCard>
            <UiCardHeader>
                <UiCardTitle>Outils de debug</UiCardTitle>
                <UiCardDescription
                    >Accédez aux différents outils de
                    diagnostic</UiCardDescription
                >
            </UiCardHeader>
            <UiCardContent>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                    <NuxtLink
                        to="/debug/health"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div
                            class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-5 h-5 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">
                                Health Check
                            </p>
                            <p class="text-xs text-gray-500">
                                Vérifier l'état des services
                            </p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/postgresql"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div
                            class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-5 h-5 text-purple-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">
                                Console PostgreSQL
                            </p>
                            <p class="text-xs text-gray-500">
                                Requêtes sur la base de données
                            </p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/redis"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div
                            class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-5 h-5 text-red-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">
                                Console Redis
                            </p>
                            <p class="text-xs text-gray-500">
                                Commandes sur le cache Redis
                            </p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/rabbitmq"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div
                            class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-5 h-5 text-amber-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">
                                RabbitMQ
                            </p>
                            <p class="text-xs text-gray-500">
                                Files d'attente et messages
                            </p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/mongodb"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div
                            class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-5 h-5 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">
                                Console MongoDB
                            </p>
                            <p class="text-xs text-gray-500">
                                Requêtes sur la base de données
                            </p>
                        </div>
                    </NuxtLink>
                    <NuxtLink
                        to="/debug/logs"
                        class="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-sm transition"
                    >
                        <div
                            class="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0"
                        >
                            <svg
                                class="w-5 h-5 text-indigo-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 text-sm">
                                Logs
                            </p>
                            <p class="text-xs text-gray-500">
                                Consultation des logs applicatifs
                            </p>
                        </div>
                    </NuxtLink>
                </div>
            </UiCardContent>
        </UiCard>
    </div>
</template>
