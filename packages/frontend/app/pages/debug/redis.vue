<script setup lang="ts">
definePageMeta({ layout: 'debug' });
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useRedisStore } from '@/stores/redis';
import { Box, PlayCircle, RefreshCw } from '@lucide/vue';

useHead({ title: 'Console Redis — Transvirex' });

const redis = useRedisStore();

/** Quick-access Redis command presets with descriptions. */
const commonCommands = [
    { cmd: 'KEYS *', desc: 'Lister toutes les clés' },
    { cmd: 'TYPE {clé}', desc: "Type d'une clé" },
    { cmd: 'GET {clé}', desc: "Lire la valeur d'une clé" },
    { cmd: 'TTL {clé}', desc: 'Temps restant avant expiration' },
    { cmd: 'INFO', desc: 'Informations du serveur' },
    { cmd: 'DBSIZE', desc: 'Nombre total de clés' },
    { cmd: 'CLIENT LIST', desc: 'Clients connectés' },
    { cmd: 'PING', desc: 'Tester la connexion' },
];

/** Insert a quick-command into the Redis command input. */
function insertCommand(cmd: string) {
    redis.command = cmd;
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">Console Redis</h1>
            <p class="text-gray-500">Exécuter des commandes Redis sur le serveur de cache</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Commande</CardTitle>
                        <CardDescription>Saisissez votre commande Redis ci-dessous</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea v-model="redis.command" placeholder="KEYS *" :rows="4" />
                        <div class="flex gap-2 mt-4">
                            <Button @click="redis.execute()" :disabled="redis.loading">
                                <PlayCircle v-if="!redis.loading" class="w-4 h-4" />
                                <RefreshCw v-else class="w-4 h-4 animate-spin" />
                                {{ redis.loading ? 'Exécution...' : 'Exécuter' }}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card v-if="redis.results || redis.error">
                    <CardHeader>
                        <CardTitle>Résultat</CardTitle>
                        <CardDescription v-if="redis.results">
                            {{ redis.results.rowCount }} résultat{{ redis.results.rowCount > 1 ? 's' : '' }}
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
                                        <TableHead v-for="col in redis.results.columns" :key="col">
                                            {{ col }}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow v-for="(row, i) in redis.results.rows" :key="i">
                                        <TableCell v-for="col in redis.results.columns" :key="col">
                                            {{ row[col] != null ? String(row[col]) : 'nil' }}
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
                            <Box class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                            <p class="text-gray-500">Exécutez une commande Redis pour voir le résultat</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Commandes rapides</CardTitle>
                        <CardDescription>Cliquez pour insérer une commande</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-2">
                            <button
                                v-for="item in commonCommands"
                                :key="item.cmd"
                                @click="insertCommand(item.cmd)"
                                class="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition text-sm"
                            >
                                <code class="text-blue-600 font-mono text-xs">{{ item.cmd }} </code>
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
