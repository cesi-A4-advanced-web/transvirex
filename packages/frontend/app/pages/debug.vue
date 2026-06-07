<script setup lang="ts">
// If production, redirect to home
if (process.env.NODE_ENV === 'production') {
    navigateTo('/');
}

const health = useHealthStore();
const route = useRoute();

onMounted(() => health.checkAll());
</script>

<template>
    <div class="flex h-screen bg-gray-50">
        <aside class="w-64 bg-slate-900 text-white flex flex-col shrink-0">
            <div
                class="flex items-center gap-3 px-6 py-5 border-b border-slate-700"
            >
                <div
                    class="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm"
                >
                    T
                </div>
                <div>
                    <p class="font-semibold text-sm leading-tight">
                        Transvirex
                    </p>
                    <p class="text-xs text-gray-400">Debug</p>
                </div>
            </div>

            <nav class="flex-1 px-3 py-4 space-y-1">
                <NuxtLink
                    to="/debug"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition"
                >
                    <svg
                        class="w-5 h-5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    Accueil
                </NuxtLink>

                <NuxtLink
                    to="/debug/health"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition"
                >
                    <svg
                        class="w-5 h-5 shrink-0"
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
                    Health
                </NuxtLink>

                <NuxtLink
                    to="/debug/postgresql"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition"
                >
                    <svg
                        class="w-5 h-5 shrink-0"
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
                    PostgreSQL
                </NuxtLink>
            </nav>

            <div class="px-6 py-4 border-t border-slate-700">
                <NuxtLink
                    to="/"
                    class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
                >
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
                            d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        />
                    </svg>
                    Retour au site
                </NuxtLink>
            </div>
        </aside>

        <main class="flex-1 overflow-auto p-8">
            <NuxtPage />
        </main>
    </div>
</template>
