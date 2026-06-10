<script setup lang="ts">
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from '@lucide/vue';
import { storeToRefs } from 'pinia';

useHead({ title: 'Santé des Services — Transvirex' });

const health = useHealthStore();
const { services, loading } = storeToRefs(health);
</script>

<template>
    <div class="max-w-5xl mx-auto space-y-6">
        <Card>
            <CardHeader>
                <CardTitle>État des services</CardTitle>
                <CardDescription>
                    Vérification en temps réel des endpoints
                    <code class="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/health</code>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="mb-6">
                    <Button @click="health.checkAll" :disabled="loading">
                        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                        {{ loading ? 'Vérification...' : 'Rafraîchir' }}
                    </Button>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Service</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Temps de réponse</TableHead>
                            <TableHead>Détails</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="service in services" :key="service.name">
                            <TableCell class="font-medium">
                                {{ service.name }}
                            </TableCell>
                            <TableCell class="text-xs text-gray-500">
                                {{ service.url }}
                            </TableCell>
                            <TableCell>
                                <Badge v-if="service.status === 'pending'" variant="secondary"> En attente... </Badge>
                                <Badge
                                    v-else-if="service.status === 'ok'"
                                    variant="default"
                                    class="bg-green-600 text-white"
                                >
                                    OK
                                </Badge>
                                <Badge v-else variant="destructive"> Erreur </Badge>
                            </TableCell>
                            <TableCell class="text-sm">
                                {{ service.responseTime != null ? `${service.responseTime} ms` : '—' }}
                            </TableCell>
                            <TableCell class="text-sm text-gray-500">
                                {{ service.detail ?? '—' }}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
</template>

