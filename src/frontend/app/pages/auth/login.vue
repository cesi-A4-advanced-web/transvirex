<template>
    <div class="min-h-screen flex flex-col md:flex-row">
        <!-- Panneau gauche — branding -->
        <div
            class="relative flex flex-col justify-between bg-[#1a3f7a] text-white
                   md:w-[42%] md:min-h-screen
                   px-8 py-8 md:px-12 md:py-12"
        >
            <div>
                <p class="text-xl font-bold leading-none">Transvirex</p>
                <p class="text-sm text-blue-200 mt-0.5">Moving Intelligence</p>
            </div>

            <div class="hidden md:block">
                <h1 class="text-5xl font-extrabold leading-tight mb-4">
                    La logistique,<br />repensée.
                </h1>
                <p class="text-blue-200 text-base leading-relaxed max-w-xs">
                    Centralisez vos opérations, suivez vos livraisons en temps
                    réel, pilotez votre flotte.
                </p>
            </div>

            <div class="md:hidden mt-6 mb-4">
                <h1 class="text-3xl font-extrabold leading-tight">
                    Bienvenue sur<br />votre espace.
                </h1>
            </div>

            <div class="hidden md:flex items-center gap-6 text-sm">
                <div>
                    <p class="text-2xl font-bold">15 000</p>
                    <p class="text-blue-300">Livraisons/mois</p>
                </div>
                <div class="w-px h-10 bg-blue-600" />
                <div>
                    <p class="text-2xl font-bold">160+</p>
                    <p class="text-blue-300">Chauffeurs actifs</p>
                </div>
                <div class="w-px h-10 bg-blue-600" />
                <div>
                    <p class="text-2xl font-bold">12</p>
                    <p class="text-blue-300">Hubs</p>
                </div>
            </div>
        </div>

        <!-- Panneau droit — formulaire -->
        <div
            class="flex-1 flex flex-col bg-[#f0f2f5]
                   px-6 py-8 md:px-0 md:py-0
                   md:items-center md:justify-center"
        >
            <div class="w-full max-w-md bg-white rounded-2xl shadow-sm p-8 md:p-10">
                <h2 class="text-2xl font-bold text-gray-900">Connexion</h2>
                <p class="text-sm text-gray-500 mt-1 mb-6">
                    Accédez à votre espace Transvirex
                </p>

                <!-- Sélecteur de rôle -->
                <div class="flex gap-2 mb-6">
                    <button
                        v-for="role in roles"
                        :key="role.value"
                        type="button"
                        :class="[
                            'px-4 py-1.5 rounded-full text-sm font-medium border transition-colors',
                            selectedRole === role.value
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400',
                        ]"
                        @click="selectedRole = role.value"
                    >
                        {{ role.label }}
                    </button>
                </div>

                <form @submit.prevent="handleSubmit" class="space-y-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            v-model="email"
                            type="email"
                            required
                            :placeholder="`${selectedRole}@transvirex.fr`"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                                   placeholder-gray-400 focus:outline-none focus:ring-2
                                   focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <label class="block text-sm font-medium text-gray-700">
                                Mot de passe
                            </label>
                            <a href="#" class="text-xs text-blue-600 hover:underline">
                                Mot de passe oublié ?
                            </a>
                        </div>
                        <input
                            v-model="password"
                            type="password"
                            required
                            placeholder="••••••••••••"
                            class="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                                   placeholder-gray-400 focus:outline-none focus:ring-2
                                   focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <button
                        type="submit"
                        class="w-full py-3 bg-blue-600 hover:bg-blue-700
                               text-white font-semibold rounded-lg text-sm transition"
                    >
                        Se connecter
                    </button>
                </form>

                <!-- Face ID mobile uniquement -->
                <div class="md:hidden mt-6">
                    <div class="flex items-center gap-3 my-4">
                        <div class="flex-1 h-px bg-gray-200" />
                        <span class="text-xs text-gray-400">Ou continuer avec</span>
                        <div class="flex-1 h-px bg-gray-200" />
                    </div>
                    <button
                        type="button"
                        class="w-full py-2.5 border border-gray-300 rounded-lg text-sm
                               text-gray-700 font-medium hover:bg-gray-50 transition"
                    >
                        Face ID
                    </button>
                </div>
            </div>

            <p class="mt-6 text-xs text-gray-400 text-center">
                © 2026 Transvirex Logistics — Tous droits réservés
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const roles = [
    { label: 'Dispatcher', value: 'dispatcher' },
    { label: 'Chauffeur', value: 'driver' },
    { label: 'Admin', value: 'admin' },
]

const selectedRole = ref('dispatcher')
const email = ref('')
const password = ref('')

function handleSubmit() {
    // TODO: connecter au service-authentication
}
</script>
