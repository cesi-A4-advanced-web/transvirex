# 1

Lors de la création d'une livraison à partir d'une facture, la livraison n'a pas de status sur l'interface même après assignation d'un livreur

<!-- # 2

Statistiques non fonctionnelles sur la page administrateur Dashboard, aucun graphique ne s'affiche -->

<!-- # 3

{
  "info": "render function",
  "stack": "TypeError: Cannot destructure property 'size' of 'useLucideProps(...)' as it is undefined.\n    at Icon (https://transvirex.local/_nuxt/@fs/app/node_modules/.cache/vite/client/deps/@lucide_vue.js?v=42bc6fb1:1788:11)\n    at renderComponentRoot (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:4588:30)\n    at ReactiveEffect.componentUpdateFn [as fn] (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:6144:46)\n    at ReactiveEffect.run (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+reactivity@3.5.35/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js?v=11967b19:230:19)\n    at setupRenderEffect (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:6279:5)\n    at mountComponent (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:6051:7)\n    at processComponent (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:6003:9)\n    at patch (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:5500:11)\n    at ReactiveEffect.componentUpdateFn [as fn] (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+runtime-core@3.5.35/node_modules/@vue/runtime-core/dist/runtime-core.esm-bundler.js?v=11967b19:6151:11)\n    at ReactiveEffect.run (https://transvirex.local/_nuxt/@fs/app/node_modules/.pnpm/@vue+reactivity@3.5.35/node_modules/@vue/reactivity/dist/reactivity.esm-bundler.js?v=11967b19:230:19)",
  "url": "https://transvirex.local/admin/livraisons"
}

error aussi présente sur les pages :
- https://transvirex.local/admin/colis
- https://transvirex.local/admin/rapports
- https://transvirex.local/admin/hubs
- ... -->

# 4

Redirection vers le dashboard dispatcher après déconnexion ou après 2 min envrion (sans doute le temps d'expiration de l'access token)

# 5

Données du seeder pas assez complète et pas forcément adaptées à une entreprise de logistique française (nommé Transvirex, nom de domaine transvirex.com, etc.), les adresses sont génériques et ne correspondent pas à des villes françaises, les numéros de téléphone ne sont pas au format français, etc.

# 6

Impossible de créer une livraison depuis les pages administrateurs

# 7

Impossible de modifier/supprimer une livraison depuis les pages administrateurs

# 8

Impossible de créer un colis depuis les pages administrateurs

# 9

Impossible de modifier/supprimer un colis depuis les pages administrateurs

# 10

Impossible de créer un client depuis les pages administrateurs

# 11

Impossible de modifier/supprimer un client depuis les pages administrateurs

# 12

Impossible de créer une facture depuis les pages administrateurs

# 13

Impossible de modifier/supprimer une facture depuis les pages administrateurs
Impossible de créer une livraison à partir d'une facture depuis les pages administrateurs

# 14

Impossible de créer un chauffeur depuis les pages administrateurs

# 15

Impossible de modifier/supprimer un chauffeur depuis les pages administrateurs

# 16

Impossible de créer un véhicule depuis les pages administrateurs

# 17

Impossible de modifier/supprimer un véhicule depuis les pages administrateurs

# 18

Impossible de créer un utilisateur depuis les pages administrateurs

# 19

Impossible de modifier/supprimer un utilisateur depuis les pages administrateurs

# 20

Impossible de créer un hub depuis les pages administrateurs

# 21

Impossible de modifier/supprimer un hub depuis les pages administrateurs

# 22

Page de paramétrage dans l'interface administrateur non fonctionnelle, à retirer ou laisser en consultation uniquement

# 23

Le bouton "Profil & Véhicule" d'un chauffeur redirige vers le dashboard dispatcher au lieu d'afficher les informations du chauffeur

# 24

Dans la page /livreur/livraison, il n'y a pas de détails sur la livraison, ni de bouton pour signaler un incident ou une livraison effectuée, il manque par exemple le contenu de la livraison, potentiellement, faire une popup de détails

# 25

Pas la possibilité pour un livreur d'accepter ou de refuser une mission, ni de recevoir une notification en cas d'assignation d'une nouvelle mission ou de changement de statut d'une mission

# 26

Pas de filtre de date dans la page des missions d'un livreur, ni de détails sur les missions

# 27

Lors de la création d'une livraison par un dispatcher, le champs "Référence livraison" devrait être auto-généré et non modifiable, il est actuellement obligatoire et doit être rempli manuellement

# 28

Lors de la création d'une livraison par un dispatcher, il n'est pas possible de sélectionner un livreur (optionnel).

# 29

Lors de la création d'une livraison par un dispatcher, il n'est pas possible de sélectionner une date de livraison.

# 30

Pas d'actualisation en temps réel des données sur les dashboards, il faudrait implémenter du polling ou du WebSocket pour avoir des données à jour sans rafraîchir la page et faire un système de notification (potentiellement push) pour les événements importants (assignation de mission, changement de statut, etc.) Normalement le système de notification devrait passer par RabbitMQ

# 31

Le bouton exporter dans la page Rapports des administrateurs ne fonctionne pas.

# 32

Pas de filtre par chauffeur, par hub dans la page Rapports des administrateurs, ni de possibilité d'exporter les rapports filtrés.

# 33

Pas de cache dans Redis

# 34

Pas de suivi temps réel des livreurs dans Redis (ex. position GPS), il faudrait que le site en version mobile puisse
