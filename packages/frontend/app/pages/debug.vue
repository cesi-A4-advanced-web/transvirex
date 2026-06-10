<script setup lang="ts">
import {
    ArrowLeftIcon,
    BoxIcon,
    DatabaseIcon,
    FileTextIcon,
    GlobeIcon,
    HeartIcon,
    HomeIcon,
    MessageSquareMoreIcon,
    PackageIcon,
    RefreshCwIcon,
} from '@lucide/vue';
import SidebarLink from '~/components/debug/SidebarLink.vue';

const health = useHealthStore();
const route = useRoute();
/** Whether the database seeding operation is in progress. */
const seeding = ref(false);

onMounted(() => health.checkAll());

/**
 * Seed the database with demo data via the debug API.
 * Displays a confirmation dialog before proceeding.
 */
async function handleSeed() {
    const confirmed = window.confirm('This will seed the database with demo data. Continue?');
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
    <div class="flex h-screen overflow-hidden bg-gray-50">
        <aside class="w-64 bg-slate-900 text-white flex flex-col shrink-0">
            <div class="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
                <div class="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-sm">T</div>
                <div>
                    <p class="font-semibold text-sm leading-tight">Transvirex</p>
                    <p class="text-xs text-gray-400">Debug</p>
                </div>
            </div>

            <nav class="flex-1 px-3 py-4 space-y-1">
                <SidebarLink href="/debug" label="Accueil" :icon="HomeIcon" />
                <SidebarLink href="/debug/health" label="Health" :icon="HeartIcon" />
                <SidebarLink href="/debug/postgresql" label="PostgreSQL" :icon="DatabaseIcon" />
                <SidebarLink href="/debug/redis" label="Redis" :icon="BoxIcon" />
                <SidebarLink href="/debug/rabbitmq" label="RabbitMQ" :icon="MessageSquareMoreIcon" />
                <SidebarLink href="/debug/mongodb" label="MongoDB" :icon="PackageIcon" />
                <SidebarLink href="/debug/logs" label="Logs" :icon="FileTextIcon" />
                <SidebarLink href="/api/docs" label="API Docs" :icon="GlobeIcon" :external="true" />

                <button
                    class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition w-full text-left"
                    :disabled="seeding"
                    @click="handleSeed"
                >
                    <RefreshCwIcon class="w-5 h-5" />
                    {{ seeding ? 'Seeding...' : 'Seed DB' }}
                </button>
            </nav>

            <div class="px-6 py-4 border-t border-slate-700">
                <NuxtLink to="/" class="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition">
                    <ArrowLeftIcon class="w-4 h-4" />
                    Retour au site
                </NuxtLink>
            </div>
        </aside>

        <main class="flex-1 overflow-auto p-8">
            <NuxtPage />
        </main>
    </div>
</template>

