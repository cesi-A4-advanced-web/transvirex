import { $fetch } from 'ofetch';

/** Authenticated user information returned by the auth API. */
export interface AuthUser {
    /** Unique user identifier (subject claim). */
    sub: string;
    /** User email address. */
    email: string;
    /** User role determining access permissions. */
    role: 'admin' | 'dispatcher' | 'driver' | 'business_manager';
}

/** Type for the user role. */
export type UserRole = AuthUser['role'];

/**
 * Composable for authentication state and operations.
 * Manages the current user session and provides login/logout/refresh actions.
 */
export const useAuth = () => {
    /** Reactive current user state, or null if not authenticated. */
    const user = useState<AuthUser | null>('auth:user', () => null);

    /**
     * Fetch the current authenticated user from the API.
     * Attempts a token refresh if the initial request returns 401.
     * @returns true if the user is authenticated, false otherwise.
     */
    async function fetchMe(): Promise<boolean> {
        try {
            const data = await $fetch<AuthUser>('/api/auth/me', {
                credentials: 'include',
            });
            user.value = data;
            return true;
        } catch (err: any) {
            if (err?.status === 401 || err?.statusCode === 401) {
                try {
                    await $fetch('/api/auth/refresh', {
                        method: 'POST',
                        credentials: 'include',
                    });
                    const data = await $fetch<AuthUser>('/api/auth/me', {
                        credentials: 'include',
                    });
                    user.value = data;
                    return true;
                } catch {
                    user.value = null;
                    return false;
                }
            }
            user.value = null;
            return false;
        }
    }

    /**
     * Authenticate the user with email and password.
     * On success, fetches the user profile to update state.
     */
    async function login(email: string, password: string) {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { email, password },
            credentials: 'include',
        });
        await fetchMe();
    }

    /**
     * Log the user out and clear the session.
     * Redirects to the home page after logout.
     */
    async function logout() {
        await $fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        user.value = null;
        await navigateTo('/');
    }

    /** Whether a user is currently authenticated. */
    const isAuthenticated = computed(() => !!user.value);
    /** Current user role, or null if not authenticated. */
    const role = computed(() => user.value?.role ?? null);

    return { user, isAuthenticated, role, login, logout, fetchMe };
};
