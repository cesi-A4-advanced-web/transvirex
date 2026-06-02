<template>
    <div class="max-w-4xl mx-auto px-4 py-10">
        <h1 class="text-3xl font-bold text-slate-900 mb-2">État des services</h1>
        <p class="text-gray-500 mb-6">Vérification en temps réel des endpoints <code>/health</code></p>

        <button
            @click="checkAll"
            :disabled="loading"
            class="mb-6 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
            {{ loading ? 'Vérification...' : 'Rafraîchir' }}
        </button>

        <div class="overflow-x-auto rounded-lg shadow">
            <table class="w-full text-sm">
                <thead class="bg-slate-800 text-white">
                    <tr>
                        <th class="px-4 py-3 text-left">Service</th>
                        <th class="px-4 py-3 text-left">URL</th>
                        <th class="px-4 py-3 text-left">Statut</th>
                        <th class="px-4 py-3 text-left">Temps de réponse</th>
                        <th class="px-4 py-3 text-left">Détails</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="service in services"
                        :key="service.name"
                        class="border-b border-gray-100 hover:bg-gray-50 transition"
                    >
                        <td class="px-4 py-3 font-medium text-slate-800">{{ service.name }}</td>
                        <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ service.url }}</td>
                        <td class="px-4 py-3">
                            <span
                                v-if="service.status === 'pending'"
                                class="text-gray-400 italic"
                            >En attente...</span>
                            <span
                                v-else-if="service.status === 'ok'"
                                class="inline-flex items-center gap-1 text-green-600 font-semibold"
                            >
                                <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span> OK
                            </span>
                            <span
                                v-else
                                class="inline-flex items-center gap-1 text-red-600 font-semibold"
                            >
                                <span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span> Erreur
                            </span>
                        </td>
                        <td class="px-4 py-3 text-gray-600">
                            {{ service.responseTime != null ? `${service.responseTime} ms` : '—' }}
                        </td>
                        <td class="px-4 py-3 text-gray-500 text-xs font-mono">
                            {{ service.detail ?? '—' }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Health Services — Transvirex' })

interface ServiceHealth {
    name: string
    url: string
    status: 'pending' | 'ok' | 'error'
    responseTime: number | null
    detail: string | null
}

// Ajoute tes services ici
const services = ref<ServiceHealth[]>([
    { name: 'API Gateway',  url: '/api/gateway/health', status: 'pending', responseTime: null, detail: null },
    { name: 'Auth Service', url: '/api/auth/health',   status: 'pending', responseTime: null, detail: null },
    { name: 'Billing Service', url: '/api/billing/health',   status: 'pending', responseTime: null, detail: null },
])

const loading = ref(false)

async function checkService(service: ServiceHealth) {
    service.status = 'pending'
    service.responseTime = null
    service.detail = null

    const start = Date.now()
    try {
        const res = await fetch(service.url)
        service.responseTime = Date.now() - start
        const body = await res.json().catch(() => null)
        service.status = res.ok ? 'ok' : 'error'
        service.detail = body ? JSON.stringify(body) : String(res.status)
    } catch (e: any) {
        service.responseTime = Date.now() - start
        service.status = 'error'
        service.detail = e?.message ?? 'Unreachable'
    }
}

async function checkAll() {
    loading.value = true
    await Promise.all(services.value.map(checkService))
    loading.value = false
}

// Vérifie au chargement de la page
onMounted(checkAll)
</script>
