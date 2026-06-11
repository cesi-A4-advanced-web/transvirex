<template>
    <div class="flex h-screen bg-muted overflow-hidden">
        <!-- Sidebar -->
        <aside
            class="flex flex-col flex-shrink-0 bg-primary-dark shadow-xl transition-all duration-300"
            :class="collapsed ? 'w-16' : 'w-64'"
        >
            <div class="flex items-center justify-between px-4 py-5 border-b border-white/10">
                <!-- <div v-if="!collapsed">
                    <p class="text-xl font-bold text-white leading-none whitespace-nowrap">Transvirex</p>
                    <p class="text-xs text-primary-light mt-0.5 whitespace-nowrap">Moving Intelligence</p>
                </div> -->
                <NuxtImg
                    src="/logo-color.svg"
                    alt="Transvirex Logo"
                    width="150"
                    :class="[
                        {
                            'w-0': collapsed,
                        },
                        'block h-20',
                    ]"
                />
                <Button
                    variant="ghost"
                    size="icon-sm"
                    @click="collapsed = !collapsed"
                    class="text-primary-light hover:text-white hover:bg-white/10 flex-shrink-0"
                    :class="collapsed ? 'mx-auto' : ''"
                >
                    <ChevronLeft v-if="!collapsed" class="w-4 h-4" />
                    <Menu v-else class="w-4 h-4" />
                </Button>
            </div>

            <ScrollArea class="flex-1 py-3 px-2">
                <template v-for="group in visibleGroups" :key="group.label">
                    <p
                        v-if="!collapsed"
                        class="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-primary-light/70 select-none"
                    >
                        {{ group.label }}
                    </p>
                    <Separator v-else class="my-2 bg-white/10 border-0 h-px" />
                    <NuxtLink
                        v-for="item in group.items"
                        :key="item.href"
                        :to="item.href"
                        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
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
                            class="w-5 h-5 flex-shrink-0"
                            :class="isActive(item.href) ? 'text-white' : 'text-primary-light'"
                        />
                        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
                    </NuxtLink>
                </template>
            </ScrollArea>

            <div class="border-t border-white/10 p-3">
                <div v-if="!collapsed" class="flex items-center gap-3 px-2 py-2 mb-1 rounded-lg bg-white/5">
                    <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
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
                            >{{ roleLabel }}</span
                        >
                    </div>
                </div>
                <Button
                    variant="ghost"
                    @click="handleLogout"
                    class="w-full text-primary-light hover:text-white hover:bg-white/10"
                    :class="collapsed ? 'justify-center px-0' : 'justify-start'"
                >
                    <LogOut class="w-4 h-4" />
                    <span v-if="!collapsed">Se déconnecter</span>
                </Button>
            </div>
        </aside>

        <!-- Main -->
        <div class="flex-1 flex flex-col overflow-hidden">
            <header
                class="h-14 bg-background border-b border-border flex items-center justify-between px-6 flex-shrink-0 z-10"
            >
                <div class="flex items-center gap-2 text-sm">
                    <span class="text-muted-foreground font-medium">Transvirex</span>
                    <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span class="text-muted-foreground capitalize">{{ roleLabel }}</span>
                    <ChevronRight class="w-3.5 h-3.5 text-muted-foreground/50" />
                    <span class="font-semibold text-foreground">{{ pageTitle }}</span>
                </div>
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <Button variant="ghost" size="icon" class="relative" @click="notifOpen = !notifOpen">
                            <Bell class="w-5 h-5" />
                            <span
                                v-if="unreadCount > 0"
                                class="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background"
                                >{{ unreadCount > 9 ? '9+' : unreadCount }}</span
                            >
                            <span
                                v-else
                                class="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background"
                            />
                        </Button>
                        <div
                            v-if="notifOpen"
                            class="absolute right-0 top-10 w-80 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden"
                        >
                            <div class="flex items-center justify-between px-4 py-3 border-b border-border">
                                <span class="font-semibold text-sm">Notifications</span>
                                <button
                                    v-if="unreadCount > 0"
                                    @click="markAllRead"
                                    class="text-xs text-primary hover:underline"
                                >
                                    Tout marquer lu
                                </button>
                            </div>
                            <div class="max-h-72 overflow-y-auto divide-y divide-border">
                                <div
                                    v-if="notifications.length === 0"
                                    class="px-4 py-6 text-center text-sm text-muted-foreground"
                                >
                                    Aucune notification
                                </div>
                                <div
                                    v-for="n in notifications"
                                    :key="n.id"
                                    @click="markRead(n.id)"
                                    class="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                    :class="!n.read ? 'bg-orange-50/60' : ''"
                                >
                                    <div class="flex items-start gap-2">
                                        <span
                                            class="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase"
                                            :class="
                                                n.severity === 'CRITICAL'
                                                    ? 'bg-red-100 text-red-700'
                                                    : n.severity === 'INFO'
                                                      ? 'bg-blue-100 text-blue-700'
                                                      : 'bg-orange-100 text-orange-700'
                                            "
                                        >
                                            {{ n.severity }}
                                        </span>
                                        <div class="flex-1 min-w-0">
                                            <p class="text-xs text-foreground leading-snug">{{ n.summary }}</p>
                                            <p
                                                v-if="n.delivery_id"
                                                class="text-[10px] text-muted-foreground mt-0.5 font-mono"
                                            >
                                                Livraison {{ n.delivery_id.slice(0, 8) }}
                                            </p>
                                        </div>
                                        <span
                                            v-if="!n.read"
                                            class="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0 mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Separator orientation="vertical" class="h-6" />
                    <div class="flex items-center gap-2">
                        <div
                            class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                            :class="roleColor"
                        >
                            {{ userInitial }}
                        </div>
                        <div class="hidden sm:block">
                            <p class="text-sm font-medium leading-none">
                                {{ userName }}
                            </p>
                            <p class="text-xs text-muted-foreground mt-0.5">
                                {{ roleLabel }}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main class="flex-1 overflow-y-auto p-6">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { navigateTo, useCookie, useRoute } from '#app';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
const notifOpen = ref(false);
const accessToken = useCookie('access_token');
const refreshToken = useCookie('refresh_token');

const { notifications, unreadCount, markRead, markAllRead, startPolling } = useNotifications();
onMounted(() => {
    // L'auth et la redirection sont gérées par le middleware global (qui peut
    // rafraîchir silencieusement un access token expiré). On ne redirige pas ici
    // sur l'absence du cookie access_token : le refresh_token httpOnly peut encore
    // être valide, et rediriger ici provoquait des boucles déco/reco.
    if (userRole.value === 'dispatcher' || userRole.value === 'driver') startPolling();
});

/**
 * Parse a JWT token and return its decoded payload.
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
/** Current user role, defaults to 'dispatcher'. */
const userRole = computed<Role>(() => (jwtPayload.value?.role as Role) ?? 'dispatcher');
/** Computed full user name from JWT firstname and lastname. */
const userName = computed(() => {
    const p = jwtPayload.value;
    if (!p) return 'Utilisateur';
    return `${p.firstname ?? ''} ${p.lastname ?? ''}`.trim() || (p.email as string) || 'Utilisateur';
});
/** First character of the user name for avatar display. */
const userInitial = computed(() => userName.value.charAt(0).toUpperCase());

/** Human-readable labels for each role. */
const roleLabels: Record<Role, string> = {
    admin: 'Administrateur',
    dispatcher: 'Dispatcher',
    driver: 'Chauffeur',
    business_manager: 'Business Manager',
};
/** Localized label for the current user role. */
const roleLabel = computed(() => roleLabels[userRole.value] ?? userRole.value);

/** Tailwind classes for the role badge. */
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

/** Navigation groups and items for the current user role. */
const visibleGroups = computed(() => {
    const role = userRole.value;
    const base =
        (
            {
                admin: '/admin',
                business_manager: '/admin',
                dispatcher: '/dispatcher',
                driver: '/livreur',
            } as Record<string, string>
        )[role] ?? '/admin';
    const allGroups: Record<
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
    return allGroups[role] ?? allGroups.dispatcher;
});

/**
 * Check if a navigation item is currently active.
 * Dashboard links match exactly; other links match by prefix.
 */
function isActive(href: string) {
    if (href.endsWith('/dashboard')) return route.path === href;
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

/**
 * Log the user out, clear auth cookies, and redirect to the home page.
 */
const { logout } = useAuth();

async function handleLogout() {
    await logout();
    await navigateTo('/');
}
</script>

