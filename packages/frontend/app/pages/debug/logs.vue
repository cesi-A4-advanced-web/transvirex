<script setup lang="ts">
definePageMeta({ layout: 'debug' });
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useErrorLogger } from '@/composables/useErrorLogger';
import type { LogEntry } from '@/stores/logs';
import { useLogsStore } from '@/stores/logs';
import { ChevronLeft, ChevronRight, FileText, RefreshCw, TestTube2Icon, Trash2 } from '@lucide/vue';

useHead({ title: 'Logs — Transvirex' });

const logs = useLogsStore();
/** Whether the clear confirmation dialog is visible. */
const showClearDialog = ref(false);
/** Target log source for the clear action. */
const clearTarget = ref<'backend' | 'frontend'>('backend');
/** Set of row IDs currently expanded to show metadata. */
const expandedRows = ref<Set<string>>(new Set());

/** Available log-level filter options. */
const levels = ['all', 'log', 'warn', 'error', 'debug', 'verbose'];

onMounted(() => {
    logs.fetchBackendLogs();
});

/** Return Tailwind classes for a log-level badge. */
function levelColor(level: string): string {
    switch (level) {
        case 'error':
            return 'bg-red-100 text-red-700 border-red-200';
        case 'warn':
            return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'log':
            return 'bg-green-100 text-green-700 border-green-200';
        case 'debug':
            return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'verbose':
            return 'bg-gray-100 text-gray-700 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-700 border-gray-200';
    }
}

/** Format an ISO timestamp to a French locale string. */
function formatTimestamp(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

/** Toggle expanded state for a log row. */
function toggleRow(id: string) {
    if (expandedRows.value.has(id)) {
        expandedRows.value.delete(id);
    } else {
        expandedRows.value.add(id);
    }
}

/** Fetch logs when switching between backend/frontend tabs. */
function onTabChange(tab: string | number) {
    if (tab === 'backend' && logs.backendLogs.length === 0) {
        logs.fetchBackendLogs();
    } else if (tab === 'frontend' && logs.frontendLogs.length === 0) {
        logs.fetchFrontendLogs();
    }
}

/** Show the clear confirmation dialog for the given target. */
function confirmClear(target: 'backend' | 'frontend') {
    clearTarget.value = target;
    showClearDialog.value = true;
}

/** Execute the clear action on the selected target. */
function handleClear() {
    if (clearTarget.value === 'backend') {
        logs.clearBackendLogs();
    } else {
        logs.clearFrontendLogs();
    }
    showClearDialog.value = false;
}

/** Check whether a log entry has rich metadata. */
function hasMetadata(log: LogEntry): boolean {
    return !!(log.metadata && Object.keys(log.metadata).length > 0);
}

/** Test error logging from the UI. */
function testError() {
    try {
        throw new Error('Test error from Logs page');
    } catch (err) {
        useErrorLogger().logError('error', (err as Error).message, {
            source: 'LogsPage',
            test: true,
        });
    }

    logs.fetchFrontendLogs();
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">Logs</h1>
            <p class="text-gray-500">Consultation des logs applicatifs</p>
        </div>

        <Tabs default-value="backend" class="w-full" @update:model-value="onTabChange">
            <div class="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="backend">Backend</TabsTrigger>
                    <TabsTrigger value="frontend">Frontend</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="backend">
                <div class="space-y-4">
                    <Card>
                        <CardContent class="pt-6">
                            <div class="flex flex-wrap items-center gap-3">
                                <div class="flex items-center gap-2">
                                    <label class="text-sm text-gray-500 whitespace-nowrap">Niveau</label>
                                    <select
                                        v-model="logs.backendFilters.level"
                                        @change="logs.fetchBackendLogs()"
                                        class="text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                    >
                                        <option v-for="l in levels" :key="l" :value="l">
                                            {{ l }}
                                        </option>
                                    </select>
                                </div>
                                <div class="flex items-center gap-2">
                                    <label class="text-sm text-gray-500 whitespace-nowrap">Service</label>
                                    <select
                                        v-model="logs.backendFilters.service"
                                        @change="logs.fetchBackendLogs()"
                                        class="text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                    >
                                        <option value="">Tous</option>
                                        <option v-for="s in logs.backendServices" :key="s" :value="s">
                                            {{ s }}
                                        </option>
                                    </select>
                                </div>
                                <div class="flex items-center gap-2 ml-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        @click="logs.fetchBackendLogs()"
                                        :disabled="logs.loading"
                                    >
                                        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': logs.loading }" />
                                        Actualiser
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="text-red-600 border-red-200 hover:bg-red-50"
                                        @click="confirmClear('backend')"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                        Vider
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Logs Backend</CardTitle>
                            <CardDescription v-if="logs.backendTotalCount > 0">
                                {{ logs.backendTotalCount }} entrée{{ logs.backendTotalCount > 1 ? 's' : '' }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                v-if="logs.loading && logs.backendLogs.length === 0"
                                class="text-center py-12 text-gray-400"
                            >
                                Chargement...
                            </div>
                            <div
                                v-else-if="logs.error"
                                class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                            >
                                {{ logs.error }}
                            </div>
                            <div v-else-if="logs.backendLogs.length === 0" class="text-center py-12 text-gray-400">
                                <FileText class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p>Aucun log disponible</p>
                            </div>
                            <div v-else>
                                <ScrollArea class="max-w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead class="w-8"></TableHead>
                                                <TableHead class="w-40 whitespace-nowrap">Date</TableHead>
                                                <TableHead class="w-20">Niveau</TableHead>
                                                <TableHead class="w-28">Service</TableHead>
                                                <TableHead class="w-28">Contexte</TableHead>
                                                <TableHead>Message</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <template v-for="log in logs.backendLogs" :key="log._id">
                                                <TableRow
                                                    class="cursor-pointer"
                                                    :class="{
                                                        'bg-gray-50': expandedRows.has(log._id),
                                                    }"
                                                    @click="toggleRow(log._id)"
                                                >
                                                    <TableCell class="text-gray-400">
                                                        <ChevronRight
                                                            class="w-4 h-4 transition-transform"
                                                            :class="{
                                                                'rotate-90': expandedRows.has(log._id),
                                                            }"
                                                        />
                                                    </TableCell>
                                                    <TableCell class="text-xs text-gray-500 whitespace-nowrap">
                                                        {{ formatTimestamp(log.timestamp) }}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold"
                                                            :class="levelColor(log.level)"
                                                        >
                                                            {{ log.level }}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell class="text-sm text-gray-700">
                                                        {{ log.service || '-' }}
                                                    </TableCell>
                                                    <TableCell class="text-sm text-gray-700 max-w-32 truncate">
                                                        {{ log.context || '-' }}
                                                    </TableCell>
                                                    <TableCell
                                                        class="text-sm text-gray-700 max-w-md truncate"
                                                        :title="log.message"
                                                    >
                                                        {{ log.message }}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow v-if="expandedRows.has(log._id)" class="bg-gray-50">
                                                    <TableCell></TableCell>
                                                    <TableCell colspan="5" class="p-4">
                                                        <div class="space-y-2">
                                                            <div v-if="log.metadata?.trace" class="space-y-1">
                                                                <p
                                                                    class="text-xs font-semibold text-gray-500 uppercase"
                                                                >
                                                                    Stack Trace
                                                                </p>
                                                                <pre
                                                                    class="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-3 overflow-auto max-h-40"
                                                                    >{{ log.metadata.trace }}</pre
                                                                >
                                                            </div>
                                                            <div v-if="hasMetadata(log)" class="space-y-1">
                                                                <p
                                                                    class="text-xs font-semibold text-gray-500 uppercase"
                                                                >
                                                                    Metadata
                                                                </p>
                                                                <pre
                                                                    class="text-xs text-gray-600 bg-white border border-gray-200 rounded p-3 overflow-auto max-h-60"
                                                                    >{{ JSON.stringify(log.metadata, null, 2) }}</pre
                                                                >
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </template>
                                        </TableBody>
                                    </Table>
                                </ScrollArea>

                                <div
                                    v-if="logs.backendTotalPages > 1"
                                    class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
                                >
                                    <div class="flex items-center gap-2 text-sm text-gray-500">
                                        <span>Page {{ logs.backendFilters.page }} / {{ logs.backendTotalPages }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            :disabled="logs.backendFilters.page <= 1"
                                            @click="
                                                logs.backendFilters.page--;
                                                logs.fetchBackendLogs();
                                            "
                                        >
                                            <ChevronLeft class="w-4 h-4" />
                                        </Button>
                                        <span class="text-sm text-gray-600 min-w-16 text-center">
                                            Page
                                            {{ logs.backendFilters.page }} /
                                            {{ logs.backendTotalPages }}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            :disabled="logs.backendFilters.page >= logs.backendTotalPages"
                                            @click="
                                                logs.backendFilters.page++;
                                                logs.fetchBackendLogs();
                                            "
                                        >
                                            <ChevronRight class="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm text-gray-500" for="backend-page-size">Par page</label>
                                        <select
                                            id="backend-page-size"
                                            v-model="logs.backendFilters.pageSize"
                                            @change="
                                                logs.backendFilters.page = 1;
                                                logs.fetchBackendLogs();
                                            "
                                            class="text-sm border border-gray-300 rounded-md px-2 py-1"
                                        >
                                            <option :value="20">20</option>
                                            <option :value="50">50</option>
                                            <option :value="100">100</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="frontend">
                <div class="space-y-4">
                    <Card>
                        <CardContent class="pt-6">
                            <div class="flex flex-wrap items-center gap-3">
                                <div class="flex items-center gap-2">
                                    <label class="text-sm text-gray-500 whitespace-nowrap">Niveau</label>
                                    <select
                                        v-model="logs.frontendFilters.level"
                                        @change="logs.fetchFrontendLogs()"
                                        class="text-sm border border-gray-300 rounded-md px-2 py-1.5"
                                    >
                                        <option v-for="l in levels" :key="l" :value="l">
                                            {{ l }}
                                        </option>
                                    </select>
                                </div>
                                <div class="flex items-center gap-2 ml-auto">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        @click="logs.fetchFrontendLogs()"
                                        :disabled="logs.loading"
                                    >
                                        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': logs.loading }" />
                                        Actualiser
                                    </Button>
                                    <Button variant="outline" size="sm" @click="testError()">
                                        <TestTube2Icon class="w-4 h-4" />
                                        Tester
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="text-red-600 border-red-200 hover:bg-red-50"
                                        @click="confirmClear('frontend')"
                                    >
                                        <Trash2 class="w-4 h-4" />
                                        Vider
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Logs Frontend</CardTitle>
                            <CardDescription v-if="logs.frontendTotalCount > 0">
                                {{ logs.frontendTotalCount }} entrée{{ logs.frontendTotalCount > 1 ? 's' : '' }}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div
                                v-if="logs.loading && logs.frontendLogs.length === 0"
                                class="text-center py-12 text-gray-400"
                            >
                                Chargement...
                            </div>
                            <div
                                v-else-if="logs.error"
                                class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                            >
                                {{ logs.error }}
                            </div>
                            <div v-else-if="logs.frontendLogs.length === 0" class="text-center py-12 text-gray-400">
                                <FileText class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p>Aucun log disponible</p>
                            </div>
                            <div v-else>
                                <ScrollArea class="max-w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead class="w-8"></TableHead>
                                                <TableHead class="w-40 whitespace-nowrap">Date</TableHead>
                                                <TableHead class="w-20">Niveau</TableHead>
                                                <TableHead>Message</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <template v-for="log in logs.frontendLogs" :key="log._id">
                                                <TableRow
                                                    class="cursor-pointer"
                                                    :class="{
                                                        'bg-gray-50': expandedRows.has(log._id),
                                                    }"
                                                    @click="toggleRow(log._id)"
                                                >
                                                    <TableCell class="text-gray-400">
                                                        <ChevronRight
                                                            class="w-4 h-4 transition-transform"
                                                            :class="{
                                                                'rotate-90': expandedRows.has(log._id),
                                                            }"
                                                        />
                                                    </TableCell>
                                                    <TableCell class="text-xs text-gray-500 whitespace-nowrap">
                                                        {{ formatTimestamp(log.timestamp) }}
                                                    </TableCell>
                                                    <TableCell>
                                                        <span
                                                            class="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold"
                                                            :class="levelColor(log.level)"
                                                        >
                                                            {{ log.level }}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell
                                                        class="text-sm text-gray-700 max-w-md truncate"
                                                        :title="log.message"
                                                    >
                                                        {{ log.message }}
                                                    </TableCell>
                                                </TableRow>
                                                <TableRow v-if="expandedRows.has(log._id)" class="bg-gray-50">
                                                    <TableCell></TableCell>
                                                    <TableCell colspan="3" class="p-4">
                                                        <div v-if="hasMetadata(log)" class="space-y-1">
                                                            <p class="text-xs font-semibold text-gray-500 uppercase">
                                                                Metadata
                                                            </p>
                                                            <pre
                                                                class="text-xs text-gray-600 bg-white border border-gray-200 rounded p-3 overflow-auto max-h-60"
                                                                >{{ JSON.stringify(log.metadata, null, 2) }}</pre
                                                            >
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            </template>
                                        </TableBody>
                                    </Table>
                                </ScrollArea>

                                <div
                                    v-if="logs.frontendTotalPages > 1"
                                    class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
                                >
                                    <div class="flex items-center gap-2 text-sm text-gray-500">
                                        <span
                                            >Page {{ logs.frontendFilters.page }} / {{ logs.frontendTotalPages }}</span
                                        >
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            :disabled="logs.frontendFilters.page <= 1"
                                            @click="
                                                logs.frontendFilters.page--;
                                                logs.fetchFrontendLogs();
                                            "
                                        >
                                            <ChevronLeft class="w-4 h-4" />
                                        </Button>
                                        <span class="text-sm text-gray-600 min-w-16 text-center">
                                            Page
                                            {{ logs.frontendFilters.page }} /
                                            {{ logs.frontendTotalPages }}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            :disabled="logs.frontendFilters.page >= logs.frontendTotalPages"
                                            @click="
                                                logs.frontendFilters.page++;
                                                logs.fetchFrontendLogs();
                                            "
                                        >
                                            <ChevronRight class="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <label class="text-sm text-gray-500" for="frontend-page-size">Par page</label>
                                        <select
                                            id="frontend-page-size"
                                            v-model="logs.frontendFilters.pageSize"
                                            @change="
                                                logs.frontendFilters.page = 1;
                                                logs.fetchFrontendLogs();
                                            "
                                            class="text-sm border border-gray-300 rounded-md px-2 py-1"
                                        >
                                            <option :value="20">20</option>
                                            <option :value="50">50</option>
                                            <option :value="100">100</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>

        <Dialog :open="showClearDialog" @update:open="showClearDialog = $event" modal>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Vider les logs</DialogTitle>
                    <DialogDescription>
                        Êtes-vous sûr de vouloir supprimer tous les logs
                        {{ clearTarget === 'backend' ? 'backend' : 'frontend' }}
                        ? Cette action est irréversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" @click="showClearDialog = false">Annuler</Button>
                    <Button variant="destructive" @click="handleClear">Vider</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

