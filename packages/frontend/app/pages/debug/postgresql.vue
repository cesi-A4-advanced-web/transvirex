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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useSqlStore } from '@/stores/sql';

useHead({ title: 'Console SQL — Transvirex' });

const sql = useSqlStore();
const showSaveDialog = ref(false);
const showRenameDialog = ref(false);
const saveName = ref('');
const renameName = ref('');
const renamingId = ref<string | null>(null);

function handleSave() {
    if (!saveName.value.trim()) return;
    sql.saveQuery(saveName.value.trim());
    saveName.value = '';
    showSaveDialog.value = false;
}

function rename(saved: { id: string; name: string }) {
    renamingId.value = saved.id;
    renameName.value = saved.name;
    showRenameDialog.value = true;
}

function handleRename() {
    if (!renameName.value.trim() || !renamingId.value) return;
    sql.renameQuery(renamingId.value, renameName.value.trim());
    renameName.value = '';
    renamingId.value = null;
    showRenameDialog.value = false;
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">
                Console PostgreSQL
            </h1>
            <p class="text-gray-500">
                Exécuter des requêtes SQL sur la base de données PostgreSQL
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Requête</CardTitle>
                        <CardDescription
                            >Saisissez votre requête SQL
                            ci-dessous</CardDescription
                        >
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            v-model="sql.query"
                            placeholder='SELECT * FROM "User" LIMIT 10'
                            :rows="6"
                        />
                        <div class="flex flex-wrap gap-2 mt-4">
                            <Button
                                @click="sql.execute()"
                                :disabled="sql.loading"
                            >
                                <svg
                                    class="w-4 h-4"
                                    v-if="!sql.loading"
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
                                    class="w-4 h-4"
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
                                {{ sql.loading ? 'Exécution...' : 'Exécuter' }}
                            </Button>
                            <Button
                                variant="outline"
                                @click="showSaveDialog = true"
                            >
                                <svg
                                    class="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                                    />
                                </svg>
                                Sauvegarder
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card v-if="sql.results || sql.error">
                    <CardHeader>
                        <CardTitle>Résultat</CardTitle>
                        <CardDescription v-if="sql.results">
                            {{ sql.results.rowCount }} ligne{{
                                sql.results.rowCount > 1 ? 's' : ''
                            }}
                            retournée{{ sql.results.rowCount > 1 ? 's' : '' }}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div
                            v-if="sql.error"
                            class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                        >
                            {{ sql.error }}
                        </div>
                        <div v-else-if="sql.results">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead
                                            v-for="col in sql.results.columns"
                                            :key="col"
                                        >
                                            {{ col }}
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableRow
                                        v-for="(row, i) in sql.results.rows"
                                        :key="i"
                                    >
                                        <TableCell
                                            v-for="col in sql.results.columns"
                                            :key="col"
                                        >
                                            {{
                                                row[col] != null
                                                    ? String(row[col])
                                                    : 'NULL'
                                            }}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card v-if="!sql.results && !sql.error && !sql.loading">
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
                                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                                />
                            </svg>
                            <p class="text-gray-500">
                                Exécutez une requête pour voir les résultats
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Requêtes sauvegardées</CardTitle>
                        <CardDescription
                            >Chargez une requête précédente</CardDescription
                        >
                    </CardHeader>
                    <CardContent>
                        <ScrollArea>
                            <div
                                v-if="sql.savedQueries.length === 0"
                                class="text-sm text-gray-400 text-center py-8"
                            >
                                Aucune requête sauvegardée
                            </div>
                            <div v-else class="space-y-3">
                                <div
                                    v-for="saved in sql.savedQueries"
                                    :key="saved.id"
                                    class="flex items-start justify-between p-4 rounded-lg border border-gray-200"
                                >
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="text-sm font-medium text-gray-900 truncate"
                                        >
                                            {{ saved.name }}
                                        </p>
                                        <p
                                            class="text-xs text-gray-500 truncate max-w-45"
                                        >
                                            {{ saved.query }}
                                        </p>
                                        <p class="text-xs text-gray-400 mt-1">
                                            {{
                                                new Date(
                                                    saved.createdAt,
                                                ).toLocaleDateString('fr-FR')
                                            }}
                                        </p>
                                    </div>
                                    <div class="flex gap-1 shrink-0 ml-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            @click="sql.loadQuery(saved.id)"
                                            title="Charger"
                                        >
                                            <svg
                                                class="w-4 h-4"
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
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            @click="rename(saved)"
                                            title="Renommer"
                                        >
                                            <svg
                                                class="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                />
                                            </svg>
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            @click="sql.deleteQuery(saved.id)"
                                            title="Supprimer"
                                        >
                                            <svg
                                                class="w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>

        <Dialog
            :open="showSaveDialog"
            @update:open="showSaveDialog = $event"
            modal
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sauvegarder la requête</DialogTitle>
                    <DialogDescription
                        >Donnez un nom à cette requête pour la retrouver plus
                        tard.</DialogDescription
                    >
                </DialogHeader>
                <div class="space-y-2 px-6 pb-4">
                    <Label for="query-name">Nom</Label>
                    <Input
                        id="query-name"
                        v-model="saveName"
                        placeholder="Ma requête"
                        @keyup.enter="handleSave"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showSaveDialog = false"
                        >Annuler</Button
                    >
                    <Button @click="handleSave" :disabled="!saveName.trim()"
                        >Sauvegarder</Button
                    >
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog
            :open="showRenameDialog"
            @update:open="showRenameDialog = $event"
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Renommer la requête</DialogTitle>
                </DialogHeader>
                <div class="space-y-2 px-6 pb-4">
                    <Label for="rename-name">Nouveau nom</Label>
                    <Input
                        id="rename-name"
                        v-model="renameName"
                        placeholder="Nouveau nom"
                        @keyup.enter="handleRename"
                    />
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showRenameDialog = false"
                        >Annuler</Button
                    >
                    <Button @click="handleRename" :disabled="!renameName.trim()"
                        >Renommer</Button
                    >
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>
