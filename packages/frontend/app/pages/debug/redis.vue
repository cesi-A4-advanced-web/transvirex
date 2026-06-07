<script setup lang="ts">
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useRedisStore } from '@/stores/redis';

useHead({ title: 'Console Redis — Transvirex' });

const redis = useRedisStore();

const commonCommands = [
    { cmd: 'KEYS *', desc: 'Lister toutes les clés' },
    { cmd: 'TYPE {clé}', desc: 'Type d\'une clé' },
    { cmd: 'GET {clé}', desc: 'Lire la valeur d\'une clé' },
    { cmd: 'TTL {clé}', desc: 'Temps restant avant expiration' },
    { cmd: 'INFO', desc: 'Informations du serveur' },
    { cmd: 'DBSIZE', desc: 'Nombre total de clés' },
    { cmd: 'CLIENT LIST', desc: 'Clients connectés' },
    { cmd: 'PING', desc: 'Tester la connexion' },
];

function insertCommand(cmd: string) {
    redis.command = cmd;
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">
                Console Redis
            </h1>
            <p class="text-gray-500">
                Exécuter des commandes Redis sur le serveur de cache
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Commande</CardTitle>
                        <CardDescription
                            >Saisissez votre commande Redis
                            ci-dessous</CardDescription
                        >
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            v-model="redis.command"
                            placeholder="KEYS *"
                            :rows="4"
                        />
                        <div class="flex gap-2 mt-4">
                            <Button
                                @click="redis.execute()"
                                :disabled="redis.loading"
                            >
                                <svg
                                    class="w-4 h-4"
                                    v-if="!redis.loading"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <svg
                                    class="w-4 h-4 animate-spin"
                                    v-else
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                {{ redis.loading ? 'Exécution...' : 'Exécuter' }}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card v-if="redis.results || redis.error">
                    <CardHeader>
                        <CardTitle>Résultat</CardTitle>
                        <CardDescription v-if="redis.results">
                            {{ redis.results.rowCount }} résultat{{
                                redis.results.rowCount > 1 ? 's' : ''
                            }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            v-if="redis.error"
                            class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                            {{ redis.error }}
                        </div>
                        <div v-else-if="redis.results">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            v-for="col in redis.results.columns"
                                            :key="col"
                                        >
                                            {{ col }}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow
                                        v-for="(row, i) in redis.results.rows"
                                        :key="i"
                                    >
                                        <TableCell
                                            v-for="col in redis.results.columns"
                                            :key="col"
                                        >
                                            {{
                                                row[col] != null
                                                    ? String(row[col])
                                                    : 'nil'
                                            }}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card v-if="!redis.results && !redis.error && !redis.loading">
                    <CardContent>
                        <div class="py-12 text-center">
                            <svg
                                class="w-16 h-16 mx-auto text-gray-300 mb-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="1.5"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                />
                            </svg>
                            <p class="text-gray-500">
                                Exécutez une commande Redis pour voir le résultat
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Commandes rapides</CardTitle>
                        <CardDescription
                            >Cliquez pour insérer une commande</CardDescription
                        >
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-2">
                            <button
                                v-for="item in commonCommands"
                                :key="item.cmd"
                                @click="insertCommand(item.cmd)"
                                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-sm"
                            >
                                <code class="text-blue-600 font-mono text-xs"
                                    >{{ item.cmd }}
                                </code>
                                <p class="text-gray-500 text-xs mt-0.5">
                                    {{ item.desc }}
                                </p>
                            </button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>
