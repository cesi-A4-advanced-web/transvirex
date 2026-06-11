<template>
    <AppLayout>
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-2xl font-bold tracking-tight">Utilisateurs</h1>
                    <p class="text-muted-foreground text-sm mt-1">Gestion des comptes et accès</p>
                </div>
                <Button><Plus class="w-4 h-4 mr-2" />Nouvel utilisateur</Button>
            </div>

            <Card>
                <CardContent class="p-4 flex flex-wrap gap-3">
                    <div class="relative flex-1 min-w-48 max-w-sm">
                        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input v-model="search" placeholder="Nom, email..." class="pl-9" />
                    </div>
                    <select
                        v-model="filterRole"
                        class="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                        <option value="">Tous les rôles</option>
                        <option>admin</option>
                        <option>dispatcher</option>
                        <option>driver</option>
                        <option>business_manager</option>
                    </select>
                </CardContent>
            </Card>

            <div v-if="loading" class="text-center py-12 text-muted-foreground">
                <p>Chargement...</p>
            </div>

            <div v-else-if="error" class="text-center py-12 text-muted-foreground">
                <p>Erreur : {{ error }}</p>
                <Button variant="outline" class="mt-4" @click="fetchUsers">Réessayer</Button>
            </div>

            <Card v-else>
                <CardContent class="p-0 overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Référence</TableHead>
                                <TableHead>Nom</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rôle</TableHead>
                                <TableHead>Hub</TableHead>
                                <TableHead>Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow v-for="u in filtered" :key="u.id">
                                <TableCell class="font-mono text-xs text-muted-foreground">{{ u.reference }}</TableCell>
                                <TableCell>
                                    <div class="flex items-center gap-2.5">
                                        <div
                                            class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                            :class="roleColor(u.role)"
                                        >
                                            {{ (u.name || '?').charAt(0) }}
                                        </div>
                                        <span class="font-medium">{{ u.name }}</span>
                                    </div>
                                </TableCell>
                                <TableCell class="text-xs text-muted-foreground">{{ u.email }}</TableCell>
                                <TableCell><Badge :class="roleBadge(u.role)">{{ u.role }}</Badge></TableCell>
                                <TableCell>{{ u.hub }}</TableCell>
                                <TableCell>
                                    <Badge
                                        :class="
                                            u.status === 'active'
                                                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100'
                                                : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100'
                                        "
                                    >
                                        {{ u.status === 'active' ? 'Actif' : 'Inactif' }}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    <div class="px-4 py-3 border-t text-xs text-muted-foreground">
                        {{ filtered.length }} utilisateur(s)
                    </div>
                </CardContent>
            </Card>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search } from '@lucide/vue';
import type { ApiUser, PaginatedResponse } from '@/composables/useApi';

definePageMeta({ layout: false });
useHead({ title: 'Utilisateurs — Transvirex' });

const { get } = useApi();
const search = ref('');
const filterRole = ref('');
const loading = ref(true);
const error = ref<string | null>(null);
const users = ref<Array<{
    id: string;
    reference: string;
    name: string;
    email: string;
    role: string;
    hub: string;
    status: string;
}>>([]);

async function fetchUsers() {
    loading.value = true;
    error.value = null;
    try {
        const res = await get<PaginatedResponse<ApiUser>>('/users?limit=100');
        users.value = res.data.map((u) => ({
            id: u.id,
            reference: u.reference,
            name: [u.firstname, u.lastname].filter(Boolean).join(' ') || u.email || '—',
            email: u.email ?? '—',
            role: u.role,
            hub: u.hub?.name ?? u.hub_id ?? '—',
            status: u.status,
        }));
    } catch (e: any) {
        error.value = e?.message ?? 'Impossible de charger les utilisateurs';
    } finally {
        loading.value = false;
    }
}

const filtered = computed(() =>
    users.value.filter(
        (u) =>
            (filterRole.value === '' || u.role === filterRole.value) &&
            (!search.value || Object.values(u).some((v) => String(v).toLowerCase().includes(search.value.toLowerCase()))),
    ),
);

function roleColor(r: string) {
    return (
        {
            admin: 'bg-red-600',
            dispatcher: 'bg-blue-600',
            driver: 'bg-green-600',
            business_manager: 'bg-purple-600',
        } as Record<string, string>
    )[r] ?? 'bg-gray-600';
}

function roleBadge(r: string) {
    return (
        {
            admin: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
            dispatcher: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
            driver: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
            business_manager: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
        } as Record<string, string>
    )[r] ?? '';
}

onMounted(fetchUsers);
</script>
