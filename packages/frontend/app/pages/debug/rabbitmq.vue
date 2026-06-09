<script setup lang="ts">
definePageMeta({ layout: 'debug' });
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useRabbitMQStore } from '@/stores/rabbitmq';
import { storeToRefs } from 'pinia';

useHead({ title: 'RabbitMQ — Transvirex' });

const rabbitmq = useRabbitMQStore();
const {
    queues,
    selectedQueue,
    messages,
    loadingQueues,
    loadingMessages,
    error,
} = storeToRefs(rabbitmq);

onMounted(() => rabbitmq.fetchQueues());

function selectQueue(name: string) {
    rabbitmq.fetchMessages(name);
}

function formatContent(raw: string): string {
    try {
        return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
        return raw;
    }
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">RabbitMQ</h1>
            <p class="text-gray-500">
                Visualiser les files d'attente et les messages
            </p>
        </div>

        <div class="flex items-center gap-2">
            <Button
                @click="rabbitmq.fetchQueues()"
                :disabled="loadingQueues"
                size="sm"
            >
                <svg
                    class="w-4 h-4"
                    :class="{ 'animate-spin': loadingQueues }"
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
                {{ loadingQueues ? 'Chargement...' : 'Rafraîchir' }}
            </Button>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Files d'attente</CardTitle>
                <CardDescription>
                    {{ queues.length }} file{{ queues.length > 1 ? 's' : '' }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    v-if="loadingQueues"
                    class="text-center py-8 text-gray-400"
                >
                    Chargement des files d'attente...
                </div>
                <div
                    v-else-if="queues.length === 0 && !error"
                    class="text-center py-8 text-gray-400"
                >
                    Aucune file d'attente trouvée
                </div>
                <div
                    v-else-if="error"
                    class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                >
                    {{ error }}
                </div>
                <Table v-else>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead class="text-right">Messages</TableHead>
                            <TableHead class="text-right"
                                >Consommateurs</TableHead
                            >
                            <TableHead>État</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow
                            v-for="q in queues"
                            :key="q.name"
                            :class="{
                                'bg-blue-50': selectedQueue === q.name,
                            }"
                        >
                            <TableCell class="font-mono text-sm">
                                {{ q.name }}
                            </TableCell>
                            <TableCell class="text-right">
                                <Badge
                                    :variant="
                                        q.messages > 0 ? 'default' : 'secondary'
                                    "
                                >
                                    {{ q.messages }}
                                </Badge>
                            </TableCell>
                            <TableCell class="text-right">
                                {{ q.consumers }}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    :variant="
                                        q.state === 'running'
                                            ? 'outline'
                                            : 'secondary'
                                    "
                                >
                                    {{ q.state }}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    @click="selectQueue(q.name)"
                                    :disabled="loadingMessages"
                                >
                                    Messages
                                </Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card v-if="selectedQueue">
            <CardHeader>
                <CardTitle>
                    Messages —
                    <span class="font-mono text-sm">{{ selectedQueue }}</span>
                </CardTitle>
                <CardDescription>
                    {{ messages.length }} message{{
                        messages.length > 1 ? 's' : ''
                    }}
                    récupéré{{ messages.length > 1 ? 's' : '' }}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    v-if="loadingMessages"
                    class="text-center py-8 text-gray-400"
                >
                    Chargement des messages...
                </div>
                <div
                    v-else-if="messages.length === 0"
                    class="text-center py-8 text-gray-400"
                >
                    Aucun message dans cette file d'attente
                </div>
                <ScrollArea v-else class="max-h-96">
                    <div class="space-y-4">
                        <div
                            v-for="(msg, i) in messages"
                            :key="i"
                            class="border border-gray-200 rounded-lg p-4"
                        >
                            <div
                                class="flex items-center gap-2 text-xs text-gray-500 mb-2"
                            >
                                <Badge variant="outline" class="text-xs">
                                    #{{ i + 1 }}
                                </Badge>
                                <span
                                    >Routing:
                                    <code class="font-mono">{{
                                        msg.routingKey || '(vide)'
                                    }}</code></span
                                >
                                <span
                                    >Exchange:
                                    <code class="font-mono">{{
                                        msg.exchange || '(vide)'
                                    }}</code></span
                                >
                            </div>
                            <pre
                                class="text-sm bg-slate-50 rounded p-3 overflow-x-auto whitespace-pre-wrap font-mono"
                                >{{ formatContent(msg.content) }}</pre
                            >
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
</template>
