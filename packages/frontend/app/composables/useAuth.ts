import { $fetch } from 'ofetch';

export interface AuthUser {
    sub: string;
    email: string;
    role: 'admin' | 'dispatcher' | 'driver' | 'business_manager';
}

export const useAuth = () => {
    const user = useState<AuthUser | null>('auth:user', () => null);

    async function fetchMe(): Promise<boolean> {
        try {
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

    async function login(email: string, password: string) {
        await $fetch('/api/auth/login', {
            method: 'POST',
            body: { email, password },
            credentials: 'include',
        });
        await fetchMe();
    }

    async function logout() {
        await $fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
        });
        user.value = null;
        await navigateTo('/');
    }

    const isAuthenticated = computed(() => !!user.value);
    const role = computed(() => user.value?.role ?? null);

    return { user, isAuthenticated, role, login, logout, fetchMe };
};
