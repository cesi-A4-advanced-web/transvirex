<template>
    <div class="bg-white">
        <NuxtRouteAnnouncer />
        <!-- Navigation Bar -->
        <nav
            class="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg"
        >
            <div
                class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center"
            >
                <div class="flex items-center gap-2">
                    <div
                        class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg"
                    >
                        T
                    </div>
                    <span class="text-xl font-bold">Transvirex</span>
                </div>
                <div class="flex gap-6 items-center">
                    <a href="#features" class="hover:text-blue-400 transition"
                        >Fonctionnalités</a
                    >
                    <a href="#users" class="hover:text-blue-400 transition"
                        >Utilisateurs</a
                    >
                    <a href="#contact" class="hover:text-blue-400 transition"
                        >Contact</a
                    >
                    <NuxtLink
                        to="/auth/login"
                        class="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg text-sm font-semibold transition"
                    >
                        Se connecter
                    </NuxtLink>
                </div>
            </div>
        </nav>

        <!-- Hero Section -->
        <section
            class="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20"
        >
            <div class="max-w-7xl mx-auto px-4">
                <div
                    class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
                >
                    <div>
                        <h1
                            class="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                        >
                            <span class="text-blue-400">Moving</span>
                            Intelligence
                        </h1>
                        <p class="text-xl text-gray-300 mb-8 leading-relaxed">
                            Transformez votre logistique régionale en système
                            intelligent, centralisé et en temps réel. Passez du
                            pilotage humain au pilotage assisté par système.
                        </p>
                        <div class="flex gap-4">
                            <NuxtLink
                                to="/auth/login"
                                class="bg-blue-500 hover:bg-blue-600 px-8 py-3 rounded-lg font-semibold transition transform hover:scale-105"
                            >
                                Commencer
                            </NuxtLink>
                            <a
                                href="#features"
                                class="border-2 border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3 rounded-lg font-semibold transition"
                            >
                                En savoir plus
                            </a>
                        </div>
                    </div>
                    <div class="text-center">
                        <div
                            class="inline-block bg-white bg-opacity-10 p-12 rounded-lg border border-blue-400 border-opacity-30"
                        >
                            <svg
                                class="w-32 h-32 mx-auto text-blue-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <p class="text-gray-300 mt-4 text-sm">
                                15 000 livraisons/mois
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Context Section -->
        <section class="bg-gray-50 py-16">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-slate-900 mb-12">
                    Transvirex Logistics en Chiffres
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div
                        class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        <div class="text-4xl font-bold text-blue-500 mb-2">
                            160+
                        </div>
                        <p class="text-gray-600">Collaborateurs indépendants</p>
                        <p class="text-sm text-gray-500 mt-2">
                            De 12 à 160 en 5 ans
                        </p>
                    </div>
                    <div
                        class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        <div class="text-4xl font-bold text-blue-500 mb-2">
                            15K
                        </div>
                        <p class="text-gray-600">Livraisons/mois</p>
                        <p class="text-sm text-gray-500 mt-2">
                            Croissance en accélération
                        </p>
                    </div>
                    <div
                        class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        <div class="text-4xl font-bold text-orange-500 mb-2">
                            6j
                        </div>
                        <p class="text-gray-600">Retard facturation</p>
                        <p class="text-sm text-gray-500 mt-2">
                            À réduire urgemment
                        </p>
                    </div>
                    <div
                        class="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition"
                    >
                        <div class="text-4xl font-bold text-red-500 mb-2">
                            ↑
                        </div>
                        <p class="text-gray-600">Réclamations clients</p>
                        <p class="text-sm text-gray-500 mt-2">
                            Données décentralisées
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="py-16">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-slate-900 mb-12">
                    Nos Capacités
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div
                        class="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-lg border border-blue-200"
                    >
                        <div class="flex items-center gap-4 mb-4">
                            <div
                                class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900">Suivi Temps Réel</h3>
                        </div>
                        <p class="text-gray-700">Visualisez l'état de toutes vos livraisons en temps réel. Plus de doute, plus d'attente, juste la vérité.</p>
                    </div>
                    <div
                        class="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-lg border border-purple-200"
                    >
                        <div class="flex items-center gap-4 mb-4">
                            <div
                                class="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 00-5.519 1.946m7.08 0a3.42 3.42 0 001.946 1.946m0 0a3.42 3.42 0 00-1.946 5.519m0 0a3.42 3.42 0 005.519-1.946" />
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900">Automatisation IA</h3>
                        </div>
                        <p class="text-gray-700">Un agent intelligent pour automatiser tâches répétitives, optimiser les tournées et anticiper les problèmes.</p>
                    </div>
                    <div
                        class="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-lg border border-green-200"
                    >
                        <div class="flex items-center gap-4 mb-4">
                            <div
                                class="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900">Données Centralisées</h3>
                        </div>
                        <p class="text-gray-700">Un seul point de vérité. Finies les disparités entre dispatchers, chauffeurs et facturation.</p>
                    </div>
                    <div
                        class="bg-gradient-to-br from-amber-50 to-yellow-50 p-8 rounded-lg border border-amber-200"
                    >
                        <div class="flex items-center gap-4 mb-4">
                            <div
                                class="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-white"
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 class="text-2xl font-bold text-slate-900">Scalabilité</h3>
                        </div>
                        <p class="text-gray-700">Conçu pour croître. De 15 000 à 150 000 livraisons/mois sans ralentissement.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Users Section -->
        <section id="users" class="bg-gray-50 py-16">
            <div class="max-w-7xl mx-auto px-4">
                <h2 class="text-4xl font-bold text-center text-slate-900 mb-12">
                    Conçu pour Vos Équipes
                </h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white p-8 rounded-lg shadow-md border-l-4 border-blue-500">
                        <h3 class="text-2xl font-bold text-slate-900 mb-4">Chauffeur/Livreur</h3>
                        <ul class="space-y-3 text-gray-700">
                            <li class="flex items-start gap-3"><span class="text-blue-500 mt-1">✓</span><span>Consulter sa tournée quotidienne</span></li>
                            <li class="flex items-start gap-3"><span class="text-blue-500 mt-1">✓</span><span>Accepter ou refuser des missions</span></li>
                            <li class="flex items-start gap-3"><span class="text-blue-500 mt-1">✓</span><span>Signaler livraison ou incident en un clic</span></li>
                            <li class="flex items-start gap-3"><span class="text-blue-500 mt-1">✓</span><span>Historique complet de ses missions</span></li>
                        </ul>
                    </div>
                    <div class="bg-white p-8 rounded-lg shadow-md border-l-4 border-purple-500">
                        <h3 class="text-2xl font-bold text-slate-900 mb-4">Dispatcher</h3>
                        <ul class="space-y-3 text-gray-700">
                            <li class="flex items-start gap-3"><span class="text-purple-500 mt-1">✓</span><span>Créer et assigner les missions</span></li>
                            <li class="flex items-start gap-3"><span class="text-purple-500 mt-1">✓</span><span>Suivi temps réel des livraisons</span></li>
                            <li class="flex items-start gap-3"><span class="text-purple-500 mt-1">✓</span><span>Vue globale de la charge de travail</span></li>
                            <li class="flex items-start gap-3"><span class="text-purple-500 mt-1">✓</span><span>Alertes sur retards ou anomalies</span></li>
                        </ul>
                    </div>
                    <div class="bg-white p-8 rounded-lg shadow-md border-l-4 border-green-500">
                        <h3 class="text-2xl font-bold text-slate-900 mb-4">Service Facturation</h3>
                        <ul class="space-y-3 text-gray-700">
                            <li class="flex items-start gap-3"><span class="text-green-500 mt-1">✓</span><span>Suivi des livraisons facturées/non-facturées</span></li>
                            <li class="flex items-start gap-3"><span class="text-green-500 mt-1">✓</span><span>Génération automatique de factures</span></li>
                            <li class="flex items-start gap-3"><span class="text-green-500 mt-1">✓</span><span>Historique des paiements et relances</span></li>
                            <li class="flex items-start gap-3"><span class="text-green-500 mt-1">✓</span><span>Export facile et rapide</span></li>
                        </ul>
                    </div>
                    <div class="bg-white p-8 rounded-lg shadow-md border-l-4 border-amber-500">
                        <h3 class="text-2xl font-bold text-slate-900 mb-4">Direction/Logistique</h3>
                        <ul class="space-y-3 text-gray-700">
                            <li class="flex items-start gap-3"><span class="text-amber-500 mt-1">✓</span><span>Tableaux de bord efficacité et coûts</span></li>
                            <li class="flex items-start gap-3"><span class="text-amber-500 mt-1">✓</span><span>Analyse par chauffeur, hub ou région</span></li>
                            <li class="flex items-start gap-3"><span class="text-amber-500 mt-1">✓</span><span>Détection surcharge/sous-utilisation</span></li>
                            <li class="flex items-start gap-3"><span class="text-amber-500 mt-1">✓</span><span>Métriques satisfaction client</span></li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA Section -->
        <section
            id="contact"
            class="bg-gradient-to-r from-slate-900 to-blue-900 text-white py-16"
        >
            <div class="max-w-7xl mx-auto px-4 text-center">
                <h2 class="text-4xl font-bold mb-6">Passez à la Prochaine Étape</h2>
                <p class="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                    Transformez votre logistique régionale en système intelligent.
                    Centralisation, automatisation, scalabilité.
                </p>
                <div class="flex gap-4 justify-center">
                    <NuxtLink
                        to="/auth/login"
                        class="bg-blue-500 hover:bg-blue-600 px-10 py-4 rounded-lg font-semibold transition transform hover:scale-105 text-lg"
                    >
                        Démarrer Maintenant
                    </NuxtLink>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="bg-slate-950 text-gray-400 py-12">
            <div class="max-w-7xl mx-auto px-4">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white text-sm">T</div>
                            <span class="font-bold text-white">Transvirex</span>
                        </div>
                        <p class="text-sm">Moving Intelligence - Logistique Régionale</p>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Produit</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#features" class="hover:text-blue-400 transition">Fonctionnalités</a></li>
                            <li><a href="#" class="hover:text-blue-400 transition">Tarifs</a></li>
                            <li><a href="#" class="hover:text-blue-400 transition">Démo</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Entreprise</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-blue-400 transition">À propos</a></li>
                            <li><a href="#" class="hover:text-blue-400 transition">Blog</a></li>
                            <li><a href="#" class="hover:text-blue-400 transition">Carrières</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold text-white mb-4">Support</h4>
                        <ul class="space-y-2 text-sm">
                            <li><a href="#" class="hover:text-blue-400 transition">Documentation</a></li>
                            <li><a href="#" class="hover:text-blue-400 transition">Contact</a></li>
                            <li><a href="#" class="hover:text-blue-400 transition">Status</a></li>
                        </ul>
                    </div>
                </div>
                <div class="border-t border-gray-800 pt-8 text-center text-sm">
                    <p>
                        &copy; 2026 Transvirex Logistics. Tous droits réservés.
                        | <a href="#" class="hover:text-blue-400 transition">Conditions</a>
                        | <a href="#" class="hover:text-blue-400 transition">Confidentialité</a>
                    </p>
                </div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
useHead({ title: 'Transvirex — Moving Intelligence' })
</script>
