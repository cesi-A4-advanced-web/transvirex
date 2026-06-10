<template>
    <div class="min-h-screen flex flex-col md:flex-row">
        <!-- Branding panel -->
        <div
            class="relative flex flex-col justify-between bg-[#1a3f7a] text-white md:w-[42%] md:min-h-screen px-8 py-8 md:px-12 md:py-12"
        >
            <div>
                <p class="text-xl font-bold leading-none">Transvirex</p>
                <p class="text-sm text-blue-200 mt-0.5">Moving Intelligence</p>
            </div>
            <div class="hidden md:block">
                <h1 class="text-5xl font-extrabold leading-tight mb-4">La logistique,<br />repensée.</h1>
                <p class="text-blue-200 text-base leading-relaxed max-w-xs">
                    Centralisez vos opérations, suivez vos livraisons en temps réel, pilotez votre flotte.
                </p>
            </div>
            <div class="md:hidden mt-6 mb-4">
                <h1 class="text-3xl font-extrabold leading-tight">Bienvenue sur<br />votre espace.</h1>
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

        <!-- Form panel -->
        <div class="flex-1 flex flex-col bg-muted px-6 py-8 md:px-0 md:py-0 md:items-center md:justify-center">
            <Card class="w-full max-w-md shadow-sm">
                <CardHeader class="pb-4">
                    <CardTitle class="text-2xl">Connexion</CardTitle>
                    <CardDescription>Accédez à votre espace Transvirex</CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="flex gap-2 mb-6">
                        <Button
                            v-for="role in roles"
                            :key="role.value"
                            type="button"
                            :variant="selectedRole === role.value ? 'default' : 'outline'"
                            size="sm"
                            class="rounded-full"
                            @click="selectedRole = role.value"
                        >
                            {{ role.label }}
                        </Button>
                    </div>

                    <form @submit.prevent="handleSubmit" class="space-y-4">
                        <div class="space-y-1.5">
                            <Label for="email">Email</Label>
                            <Input
                                id="email"
                                v-model="email"
                                type="email"
                                required
                                :placeholder="`${selectedRole}@transvirex.fr`"
                            />
                        </div>
                        <div class="space-y-1.5">
                            <div class="flex justify-between items-center">
                                <Label for="password">Mot de passe</Label>
                                <a href="#" class="text-xs text-primary hover:underline">Mot de passe oublié ?</a>
                            </div>
                            <Input
                                id="password"
                                v-model="password"
                                type="password"
                                required
                                placeholder="••••••••••••"
                            />
                        </div>

                        <p v-if="error" class="text-sm text-destructive">
                            {{ error }}
                        </p>

                        <Button type="submit" class="w-full" :disabled="loading" size="lg">
                            {{ loading ? 'Connexion...' : 'Se connecter' }}
                        </Button>
                    </form>

                    <div class="md:hidden mt-6">
                        <div class="flex items-center gap-3 my-4">
                            <Separator />
                            <span class="text-xs text-muted-foreground whitespace-nowrap">Ou continuer avec</span>
                            <Separator />
                        </div>
                        <Button variant="outline" class="w-full">Face ID</Button>
                    </div>
                </CardContent>
            </Card>

            <p class="mt-6 text-xs text-muted-foreground text-center">
                © 2026 Transvirex Logistics — Tous droits réservés
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { navigateTo, useCookie } from '#app';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

definePageMeta({ layout: false });

const { login } = useAuth();

/** Available role options for the login form. */
const roles = [
    { label: 'Dispatcher', value: 'dispatcher' },
    { label: 'Chauffeur', value: 'driver' },
    { label: 'Admin', value: 'admin' },
];
/** Currently selected role in the login form. */
const selectedRole = ref('dispatcher');
/** Email input value. */
const email = ref('');
/** Password input value. */
const password = ref('');
/** Login error message displayed to the user. */
const error = ref('');
/** Whether the login request is in progress. */
const loading = ref(false);

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

/**
 * Determine the dashboard URL to redirect to based on user role.
 */
function redirectByRole(token: string) {
    const payload = parseJwt(token);
    const role = payload?.role as string;
    if (role === 'admin' || role === 'business_manager') return '/admin/dashboard';
    if (role === 'dispatcher') return '/dispatcher/dashboard';
    if (role === 'driver') return '/livreur/dashboard';
    return '/admin/dashboard';
}

/**
 * Handle login form submission.
 * Calls the auth login API, then redirects to the role-appropriate dashboard.
 */
async function handleSubmit() {
    loading.value = true;
    error.value = '';
    try {
        await login(email.value, password.value);
        const tokenCookie = useCookie('access_token');
        await navigateTo(redirectByRole(tokenCookie.value ?? ''));
    } catch (e: unknown) {
        const err = e as { data?: { message?: string } };
        error.value = err?.data?.message || 'Identifiants invalides';
    } finally {
        loading.value = false;
    }
}
</script>
