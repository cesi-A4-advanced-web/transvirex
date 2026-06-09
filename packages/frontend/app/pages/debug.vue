<script setup lang="ts">
const health = useHealthStore();
const route = useRoute();
const seeding = ref(false);

onMounted(() => health.checkAll());

async function handleSeed() {
    const confirmed = window.confirm(
        'This will seed the database with demo data. Continue?',
    );
    if (!confirmed) return;

    seeding.value = true;
    try {
        const res = await fetch('/api/debug/seed', { method: 'POST' });
        if (!res.ok) {
            const body = await res.json().catch(() => null);
            throw new Error(body?.message ?? `Error ${res.status}`);
        }
        const data = await res.json();
        const counts = [
            `Addresses: ${data.addresses}`,
            `Hubs: ${data.hubs}`,
            `Users: ${data.users}`,
            `Drivers: ${data.drivers}`,
            `Customers: ${data.customers}`,
            `Invoices: ${data.invoices}`,
            `Deliveries: ${data.deliveries}`,
        ];
        alert(`Database seeded successfully!\n\n${counts.join('\n')}`);
        window.location.reload();
    } catch (e: any) {
        alert(`Seed failed: ${e?.message ?? 'Unknown error'}`);
    } finally {
        seeding.value = false;
    }
}
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

                <NuxtLink
                    to="/debug/redis"
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
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                    Redis
                </NuxtLink>

                <NuxtLink
                    to="/debug/rabbitmq"
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
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                    RabbitMQ
                </NuxtLink>

                <NuxtLink
                    to="/debug/mongodb"
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
                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                        />
                    </svg>
                    MongoDB
                </NuxtLink>

                <NuxtLink
                    to="/debug/logs"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    Logs
                </NuxtLink>

                <button
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition w-full text-left"
                    :disabled="seeding"
                    @click="handleSeed"
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                    </svg>
                    {{ seeding ? 'Seeding...' : 'Seed DB' }}
                </button>
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
