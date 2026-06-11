<script setup lang="ts">
import { navigateTo, useCookie, useRoute } from '#app';
import { useNotifications } from '@/composables/useNotifications';
import {
    BarChart3,
    Bell,
    Bot,
    Building2,
    Car,
    ChevronLeft,
    ChevronRight,
    FileText,
    LayoutDashboard,
    LogOut,
    Menu,
    Package,
    Settings,
    ShoppingBag,
    Truck,
    UserCog,
    Users,
} from '@lucide/vue';

/** Possible user roles for navigation and display. */
type Role = 'admin' | 'dispatcher' | 'driver' | 'business_manager';

const route = useRoute();
/** Whether the sidebar is collapsed. */
const collapsed = ref(false);
/** Whether the notification panel is open. */
const notifOpen = ref(false);

// ── Notifications (dispatcher only) ──────────────────────────────────────────
const { notifications, unreadCount, markRead, markAllRead, startPolling } = useNotifications();
onMounted(() => {
    if (userRole.value === 'dispatcher') startPolling();
});

// ── Auth ──────────────────────────────────────────────────────────────────────
const accessToken = useCookie('access_token');

/**
 * Parse a JWT token and return its payload as a plain object.
 * Returns null if parsing fails.
 */
function parseJwt(token: string): Record<string, unknown> | null {
    try {
        const b64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
        if (!b64) return null;
        return JSON.parse(atob(b64));
    } catch {
        return null;
    }
}

/** Decoded JWT payload from the access token cookie. */
const jwtPayload = computed(() => (accessToken.value ? parseJwt(accessToken.value) : null));

/** Current user role extracted from JWT, defaults to 'dispatcher'. */
const userRole = computed<Role>(() => (jwtPayload.value?.role as Role) ?? 'dispatcher');

/** Computed full user name from JWT firstname and lastname. */
const userName = computed(() => {
    const p = jwtPayload.value;
    if (!p) return 'Utilisateur';
    const first = (p.firstname as string) ?? '';
    const last = (p.lastname as string) ?? '';
    return `${first} ${last}`.trim() || (p.email as string) || 'Utilisateur';
});
/** First character of the user name for avatar display. */
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

// ── Rôle display ──────────────────────────────────────────────────────────────
/** Human-readable labels for each role. */
const roleLabels: Record<Role, string> = {
    admin: 'Administrateur',
    dispatcher: 'Dispatcher',
    driver: 'Chauffeur',
    business_manager: 'Business Manager',
};
/** Localized label for the current user role. */
const roleLabel = computed(() => roleLabels[userRole.value] ?? userRole.value);

/** Tailwind classes for the role badge in the sidebar. */
const roleBadgeClass = computed(
    () =>
        ({
            admin: 'bg-red-500/20 text-red-300',
            dispatcher: 'bg-blue-400/20 text-blue-200',
            driver: 'bg-green-500/20 text-green-300',
            business_manager: 'bg-purple-500/20 text-purple-300',
        })[userRole.value] ?? 'bg-gray-500/20 text-gray-300',
);

/** Tailwind classes for the role avatar background. */
const roleColor = computed(
    () =>
        ({
            admin: 'bg-red-600 text-white',
            dispatcher: 'bg-blue-600 text-white',
            driver: 'bg-green-600 text-white',
            business_manager: 'bg-purple-600 text-white',
        })[userRole.value] ?? 'bg-gray-600 text-white',
);

// ── Navigation par rôle ───────────────────────────────────────────────────────
/** Navigation groups and items visible for the current user role. */
const visibleGroups = computed(() => {
    const role = userRole.value;
    const base =
        {
            admin: '/admin',
            business_manager: '/admin',
            dispatcher: '/dispatcher',
            driver: '/livreur',
        }[role] ?? '/admin';

    const groups: Record<
        Role,
        {
            label: string;
            items: { label: string; href: string; icon: unknown }[];
        }[]
    > = {
        admin: [
            {
                label: 'Vue générale',
                items: [
                    {
                        label: 'Dashboard',
                        href: `${base}/dashboard`,
                        icon: LayoutDashboard,
                    },
                ],
            },
            {
                label: 'Opérations',
                items: [
                    {
                        label: 'Livraisons',
                        href: `${base}/livraisons`,
                        icon: Truck,
                    },
                    { label: 'Colis', href: `${base}/colis`, icon: Package },
                ],
            },
            {
                label: 'Commerce',
                items: [
                    {
                        label: 'Clients',
                        href: `${base}/clients`,
                        icon: ShoppingBag,
                    },
                    {
                        label: 'Factures',
                        href: `${base}/factures`,
                        icon: FileText,
                    },
                ],
            },
            {
                label: 'Flotte',
                items: [
                    {
                        label: 'Chauffeurs',
                        href: `${base}/chauffeurs`,
                        icon: UserCog,
                    },
                    {
                        label: 'Véhicules',
                        href: `${base}/vehicules`,
                        icon: Car,
                    },
                ],
            },
            {
                label: 'Administration',
                items: [
                    {
                        label: 'Utilisateurs',
                        href: `${base}/utilisateurs`,
                        icon: Users,
                    },
                    { label: 'Hubs', href: `${base}/hubs`, icon: Building2 },
                    {
                        label: 'Rapports',
                        href: `${base}/rapports`,
                        icon: BarChart3,
                    },
                    {
                        label: 'Paramètres',
                        href: `${base}/parametres`,
                        icon: Settings,
                    },
                ],
            },
        ],
        business_manager: [
            {
                label: 'Vue générale',
                items: [
                    {
                        label: 'Dashboard',
                        href: `${base}/dashboard`,
                        icon: LayoutDashboard,
                    },
                ],
            },
            {
                label: 'Commerce',
                items: [
                    {
                        label: 'Clients',
                        href: `${base}/clients`,
                        icon: ShoppingBag,
                    },
                    {
                        label: 'Factures',
                        href: `${base}/factures`,
                        icon: FileText,
                    },
                ],
            },
        ],
        dispatcher: [
            {
                label: 'Vue générale',
                items: [
                    {
                        label: 'Dashboard',
                        href: `${base}/dashboard`,
                        icon: LayoutDashboard,
                    },
                ],
            },
            {
                label: 'Opérations',
                items: [
                    {
                        label: 'Livraisons',
                        href: `${base}/livraisons`,
                        icon: Truck,
                    },
                    { label: 'Colis', href: `${base}/colis`, icon: Package },
                ],
            },
            {
                label: 'Commerce',
                items: [
                    {
                        label: 'Clients',
                        href: `${base}/clients`,
                        icon: ShoppingBag,
                    },
                    {
                        label: 'Factures',
                        href: `${base}/factures`,
                        icon: FileText,
                    },
                ],
            },
            {
                label: 'Flotte',
                items: [
                    {
                        label: 'Chauffeurs',
                        href: `${base}/chauffeurs`,
                        icon: UserCog,
                    },
                ],
            },
        ],
        driver: [
            {
                label: 'Ma journée',
                items: [
                    {
                        label: 'Dashboard',
                        href: `${base}/dashboard`,
                        icon: LayoutDashboard,
                    },
                    {
                        label: 'Mes livraisons',
                        href: `${base}/livraisons`,
                        icon: Truck,
                    },
                ],
            },
            {
                label: 'Assistant',
                items: [
                    {
                        label: 'Assistant IA',
                        href: `${base}/assistant`,
                        icon: Bot,
                    },
                ],
            },
            {
                label: 'Mon profil',
                items: [
                    {
                        label: 'Profil & Véhicule',
                        href: `${base}/profil`,
                        icon: UserCog,
                    },
                ],
            },
        ],
    };

    return groups[role] ?? groups.dispatcher;
});

/**
 * Check if a navigation item is currently active.
 * Dashboard links match exactly; other links match by prefix.
 */
function isActive(href: string) {
    const isDashboard = href.endsWith('/dashboard');
    if (isDashboard) return route.path === href;
    return route.path.startsWith(href);
}

/** Computed title of the current page based on active navigation item. */
const pageTitle = computed(() => {
    for (const group of visibleGroups.value) {
        const match = group.items.find((i) => isActive(i.href));
        if (match) return match.label;
    }
    return 'Dashboard';
});

// ── Guard + logout ────────────────────────────────────────────────────────────
const { logout } = useAuth();

async function handleLogout() {
    await logout();
    await navigateTo('/');
}

onMounted(() => {
    if (!accessToken.value) navigateTo('/');
});
</script>

<template>
    <div class="flex h-screen bg-background overflow-hidden">
        <!-- ───── Sidebar ───── -->
        <aside
            class="flex flex-col shrink-0 bg-primary-dark shadow-xl transition-all duration-300 fixed top-0 left-0 h-full z-20"
            :class="collapsed ? 'w-16' : 'w-64'"
        >
            <!-- Logo + toggle -->
            <div class="flex items-center justify-between px-4 py-5 border-b border-white/10">
                <div v-if="!collapsed" class="overflow-hidden">
                    <p class="text-xl font-bold text-white leading-none whitespace-nowrap">Transvirex</p>
                    <p class="text-xs text-primary-light mt-0.5 whitespace-nowrap">Moving Intelligence</p>
                </div>
                <button
                    @click="collapsed = !collapsed"
                    class="p-1.5 rounded-lg text-primary-light hover:text-white hover:bg-white/10 transition-colors shrink-0"
                    :class="collapsed ? 'mx-auto' : ''"
                >
                    <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
                    <Menu v-else class="w-4 h-4" />
                </button>
            </div>

            <!-- Navigation groupée -->
            <nav class="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
                <template v-for="group in visibleGroups" :key="group.label">
                    <p
                        v-if="!collapsed"
                        class="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-primary-light/70 select-none"
                    >
                        {{ group.label }}
                    </p>
                    <div v-else class="border-t border-white/10 my-2" />

                    <NuxtLink
                        v-for="item in group.items"
                        :key="item.href"
                        :to="item.href"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group/item"
                        :class="[
                            isActive(item.href)
                                ? 'bg-white/15 text-white'
                                : 'text-primary-light hover:bg-white/10 hover:text-white',
                            collapsed ? 'justify-center' : '',
                        ]"
                        :title="collapsed ? item.label : undefined"
                    >
                        <component
                            :is="item.icon"
                            class="w-5 h-5 shrink-0"
                            :class="
                                isActive(item.href) ? 'text-white' : 'text-primary-light group-hover/item:text-white'
                            "
                        />
                        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
                    </NuxtLink>
                </template>
            </nav>

            <!-- Profil + déconnexion -->
            <div class="border-t border-white/10 p-3">
                <div v-if="!collapsed" class="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg bg-white/5">
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                        :class="roleColor"
                    >
                        {{ userInitial }}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold text-white truncate">
                            {{ userName }}
                        </p>
                        <span
                            class="inline-block text-[10px] font-medium px-1.5 py-0.5 rounded-full mt-0.5"
                            :class="roleBadgeClass"
                        >
                            {{ roleLabel }}
                        </span>
                    </div>
                </div>
                <button
                    @click="handleLogout"
                    class="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-primary-light hover:text-white hover:bg-white/10 transition-colors"
                    :class="collapsed ? 'justify-center' : ''"
                    :title="collapsed ? 'Se déconnecter' : undefined"
                >
                    <LogOut class="w-4 h-4 shrink-0" />
                    <span v-if="!collapsed">Se déconnecter</span>
                </button>
            </div>
        </aside>

        <!-- ───── Zone principale ───── -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Header / Topbar -->
            <header class="h-14 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 z-10">
                <!-- Breadcrumb -->
                <div class="flex items-center gap-2 text-sm">
                    <span class="text-muted-foreground font-medium">Transvirex</span>
                    <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span class="text-muted-foreground capitalize">{{ roleLabel }}</span>
                    <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span class="font-semibold text-foreground">{{ pageTitle }}</span>
                </div>

                <!-- Actions droite -->
                <div class="flex items-center gap-2">
                    <div class="relative">
                        <button
                            @click="notifOpen = !notifOpen"
                            class="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                        >
                            <Bell class="w-5 h-5" />
                            <span
                                v-if="unreadCount > 0"
                                class="absolute top-1 right-1 min-w-4 h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white"
                            >
                                {{ unreadCount > 9 ? '9+' : unreadCount }}
                            </span>
                            <span
                                v-else
                                class="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background"
                            />
                        </button>
                        <!-- Notification panel -->
                        <div
                            v-if="notifOpen"
                            class="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden"
                        >
                            <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                <span class="font-semibold text-sm text-gray-800">Incidents signalés</span>
                                <button
                                    v-if="unreadCount > 0"
                                    @click="markAllRead"
                                    class="text-xs text-blue-600 hover:underline"
                                >
                                    Tout marquer lu
                                </button>
                            </div>
                            <div class="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                <div
                                    v-if="notifications.length === 0"
                                    class="px-4 py-6 text-center text-sm text-muted-foreground"
                                >
                                    Aucun incident signalé
                                </div>
                                <div
                                    v-for="n in notifications"
                                    :key="n.id"
                                    @click="markRead(n.id)"
                                    class="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                    :class="!n.read ? 'bg-orange-50/60' : ''"
                                >
                                    <div class="flex items-start gap-2">
                                        <span
                                            class="shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                                            :class="
                                                n.severity === 'CRITICAL'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-orange-100 text-orange-700'
                                            "
                                        >
                                            {{ n.severity }}
                                        </span>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs text-gray-800 leading-snug">{{ n.summary }}</p>
                                            <p class="text-[10px] text-gray-400 mt-0.5 font-mono">
                                                Livraison {{ n.delivery_id.slice(0, 8) }}
                                            </p>
                                        </div>
                                        <span v-if="!n.read" class="w-2 h-2 rounded-full bg-orange-400 shrink-0 mt-1" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 pl-3 border-l border-border ml-1">
                        <div
                            class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            :class="roleColor"
                        >
                            {{ userInitial }}
                        </div>
                        <div class="hidden sm:block">
                            <p class="text-sm font-medium text-foreground leading-none">
                                {{ userName }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-0.5 capitalize">
                                {{ roleLabel }}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Contenu de la page -->
            <main class="flex-1 overflow-y-auto p-6">
                <slot />
            </main>
        </div>
    </div>
</template>

