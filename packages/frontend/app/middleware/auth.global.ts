import type { UserRole } from '~/composables/useAuth';

/** Maps each user role to their default dashboard route. */
const ROLE_DASHBOARD: Record<UserRole, string> = {
    admin: '/admin/dashboard',
    dispatcher: '/dispatcher/dashboard',
    driver: '/livreur/dashboard',
    business_manager: '/business/dashboard',
};

/** Maps each user role to the allowed URL prefix for their pages. */
const ROLE_ALLOWED_PREFIX: Record<UserRole, string> = {
    admin: '/admin',
    dispatcher: '/dispatcher',
    driver: '/livreur',
    business_manager: '/business',
};

/**
 * Global authentication middleware.
 * - Allows unauthenticated access to /debug pages.
 * - Redirects authenticated users from login to their dashboard.
 * - Redirects unauthenticated users from protected routes to login.
 * - Enforces role-based access control by URL prefix.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    // Pages toujours accessibles sans authentification
    if (to.path.startsWith('/debug')) return;

    // L'authentification repose sur des cookies (refresh_token httpOnly + access
    // token court rafraîchi côté client). Le refresh n'est fiable que dans le
    // navigateur : exécuter ces redirections pendant le SSR diverge du rendu client
    // (mismatch d'hydratation + boucles de redirection). On applique donc l'auth
    // uniquement côté client.
    if (import.meta.server) return;

    const { user, fetchMe } = useAuth();

    // Tenter une reconnexion silencieuse si pas de session en mémoire
    if (!user.value) await fetchMe();

    // Page de login : rediriger vers le dashboard si déjà connecté
    if (to.path === '/') {
        if (user.value) return navigateTo(ROLE_DASHBOARD[user.value.role]);
        return;
    }

    // Routes protégées : rediriger vers le login si pas connecté
    if (!user.value) return navigateTo('/');

    // Vérifier que l'utilisateur accède uniquement aux pages de son rôle
    const allowedPrefix = ROLE_ALLOWED_PREFIX[user.value.role];
    const isProtectedRoute = Object.values(ROLE_ALLOWED_PREFIX).some((prefix) => to.path.startsWith(prefix));

    if (isProtectedRoute && !to.path.startsWith(allowedPrefix)) {
        return navigateTo('/');
    }
});
