<script setup lang="ts">
definePageMeta({ layout: 'debug' });
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useSqlStore } from '@/stores/sql';
import { ChevronLeft, ChevronRight, Database, Pencil, PlayCircle, RefreshCw, Save, Trash2 } from '@lucide/vue';

useHead({ title: 'Console PostgreSQL — Transvirex' });

const sql = useSqlStore();
/** Whether the save-query dialog is visible. */
const showSaveDialog = ref(false);
/** Whether the rename-query dialog is visible. */
const showRenameDialog = ref(false);
/** Name input for saving a query. */
const saveName = ref('');
/** Name input for renaming a query. */
const renameName = ref('');
/** ID of the query currently being renamed. */
const renamingId = ref<string | null>(null);

onMounted(() => sql.fetchTables());

/** Save current query with the entered name. */
function handleSave() {
    if (!saveName.value.trim()) return;
    sql.saveQuery(saveName.value.trim());
    saveName.value = '';
    showSaveDialog.value = false;
}

/** Open rename dialog for a saved query. */
function rename(saved: { id: string; name: string }) {
    renamingId.value = saved.id;
    renameName.value = saved.name;
    showRenameDialog.value = true;
}

/** Execute the rename action. */
function handleRename() {
    if (!renameName.value.trim() || !renamingId.value) return;
    sql.renameQuery(renamingId.value, renameName.value.trim());
    renameName.value = '';
    renamingId.value = null;
    showRenameDialog.value = false;
}

/** Select a table and fetch its first page of data. */
function selectTable(name: string) {
    sql.tablePage = 1;
    sql.fetchTableData(name);
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">Console PostgreSQL</h1>
            <p class="text-gray-500">Exécuter des requêtes SQL sur la base de données PostgreSQL</p>
        </div>

        <Tabs default-value="query" class="w-full">
            <TabsList>
                <TabsTrigger value="query">Requête SQL</TabsTrigger>
                <TabsTrigger value="browse">Parcourir les données</TabsTrigger>
            </TabsList>

            <TabsContent value="query">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requête</CardTitle>
                                <CardDescription>Saisissez votre requête SQL ci-dessous</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea v-model="sql.query" placeholder='SELECT * FROM "User" LIMIT 10' :rows="6" />
                                <div class="flex flex-wrap gap-2 mt-4">
                                    <Button @click="sql.execute()" :disabled="sql.loading">
                                        <PlayCircle v-if="!sql.loading" class="w-4 h-4" />
                                        <RefreshCw v-else class="w-4 h-4 animate-spin" />
                                        {{ sql.loading ? 'Exécution...' : 'Exécuter' }}
                                    </Button>
                                    <Button variant="outline" @click="showSaveDialog = true">
                                        <Save class="w-4 h-4" />
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
                                                <TableHead v-for="col in sql.results.columns" :key="col">
                                                    {{ col }}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow v-for="(row, i) in sql.results.rows" :key="i">
                                                <TableCell v-for="col in sql.results.columns" :key="col">
                                                    {{ row[col] != null ? String(row[col]) : 'NULL' }}
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
                                    <Database class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                    <p class="text-gray-500">Exécutez une requête pour voir les résultats</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div class="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requêtes sauvegardées</CardTitle>
                                <CardDescription>Chargez une requête précédente</CardDescription>
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
                                                <p class="text-sm font-medium text-gray-900 truncate">
                                                    {{ saved.name }}
                                                </p>
                                                <p class="text-xs text-gray-500 truncate max-w-45">
                                                    {{ saved.query }}
                                                </p>
                                                <p class="text-xs text-gray-400 mt-1">
                                                    {{ new Date(saved.createdAt).toLocaleDateString('fr-FR') }}
                                                </p>
                                            </div>
                                            <div class="flex gap-1 shrink-0 ml-3">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="sql.loadQuery(saved.id)"
                                                    title="Charger"
                                                >
                                                    <RefreshCw class="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="rename(saved)"
                                                    title="Renommer"
                                                >
                                                    <Pencil class="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="sql.deleteQuery(saved.id)"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 class="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="browse">
                <Card>
                    <CardContent class="p-0">
                        <div class="grid grid-cols-1 lg:grid-cols-4">
                            <div class="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200">
                                <div class="p-4">
                                    <div class="flex items-center justify-between mb-3">
                                        <h3 class="text-sm font-semibold text-gray-900">Tables</h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            @click="sql.fetchTables()"
                                            :disabled="sql.tablesLoading"
                                        >
                                            <RefreshCw
                                                class="w-4 h-4"
                                                :class="{
                                                    'animate-spin': sql.tablesLoading,
                                                }"
                                            />
                                        </Button>
                                    </div>
                                    <ScrollArea class="h-125">
                                        <div v-if="sql.tablesLoading" class="text-sm text-gray-400 text-center py-8">
                                            Chargement...
                                        </div>
                                        <div
                                            v-else-if="sql.tables.length === 0"
                                            class="text-sm text-gray-400 text-center py-8"
                                        >
                                            Aucune table trouvée
                                        </div>
                                        <div v-else class="space-y-1">
                                            <button
                                                v-for="t in sql.tables"
                                                :key="t.table_name"
                                                @click="selectTable(t.table_name)"
                                                class="w-full text-left px-3 py-2 rounded-md text-sm transition"
                                                :class="{
                                                    'bg-blue-50 text-blue-700 font-medium':
                                                        sql.selectedTable === t.table_name,
                                                    'text-gray-700 hover:bg-gray-100':
                                                        sql.selectedTable !== t.table_name,
                                                }"
                                            >
                                                <span class="text-xs text-gray-400 mr-1">📦</span>
                                                {{ t.table_name }}
                                            </button>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div class="lg:col-span-3">
                                <div class="p-4">
                                    <div v-if="!sql.selectedTable" class="text-center py-16 text-gray-400">
                                        <Database class="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                        <p>Sélectionnez une table dans la liste</p>
                                    </div>

                                    <div v-else-if="sql.tableDataLoading" class="text-center py-16 text-gray-400">
                                        Chargement des données...
                                    </div>

                                    <div
                                        v-else-if="sql.tableError"
                                        class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                                    >
                                        {{ sql.tableError }}
                                    </div>

                                    <div v-else-if="sql.tableData">
                                        <div class="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 class="text-lg font-semibold text-gray-900">
                                                    {{ sql.selectedTable }}
                                                </h3>
                                                <p class="text-sm text-gray-500">
                                                    {{ sql.tableData.totalCount }}
                                                    ligne{{ sql.tableData.totalCount > 1 ? 's' : '' }}
                                                </p>
                                            </div>
                                        </div>

                                        <ScrollArea class="max-w-full">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead
                                                            v-for="col in sql.tableData.columns"
                                                            :key="col"
                                                            class="whitespace-nowrap"
                                                        >
                                                            {{ col }}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow v-for="(row, i) in sql.tableData.rows" :key="i">
                                                        <TableCell
                                                            v-for="col in sql.tableData.columns"
                                                            :key="col"
                                                            class="max-w-60 truncate"
                                                            :title="row[col] != null ? String(row[col]) : 'NULL'"
                                                        >
                                                            {{ row[col] != null ? String(row[col]) : 'NULL' }}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>

                                        <div
                                            class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
                                        >
                                            <div class="flex items-center gap-2 text-sm text-gray-500">
                                                <span
                                                    >Lignes
                                                    {{ (sql.tablePage - 1) * sql.tablePageSize + 1 }}
                                                    –
                                                    {{
                                                        Math.min(
                                                            sql.tablePage * sql.tablePageSize,
                                                            sql.tableData.totalCount,
                                                        )
                                                    }}
                                                    sur
                                                    {{ sql.tableData.totalCount }}</span
                                                >
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    :disabled="sql.tablePage <= 1"
                                                    @click="sql.goToTablePage(sql.tablePage - 1)"
                                                >
                                                    <ChevronLeft class="w-4 h-4" />
                                                </Button>
                                                <span class="text-sm text-gray-600 min-w-16 text-center">
                                                    Page {{ sql.tablePage }} /
                                                    {{ sql.tableData.totalPages }}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    :disabled="sql.tablePage >= sql.tableData.totalPages"
                                                    @click="sql.goToTablePage(sql.tablePage + 1)"
                                                >
                                                    <ChevronRight class="w-4 h-4" />
                                                </Button>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <label class="text-sm text-gray-500" for="page-size">Par page</label>
                                                <select
                                                    id="page-size"
                                                    v-model="sql.tablePageSize"
                                                    @change="sql.fetchTableData(sql.selectedTable!, 1)"
                                                    class="text-sm border border-gray-300 rounded-md px-2 py-1"
                                                >
                                                    <option :value="10">10</option>
                                                    <option :value="25">25</option>
                                                    <option :value="50">50</option>
                                                    <option :value="100">100</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        <Dialog :open="showSaveDialog" @update:open="showSaveDialog = $event" modal>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Sauvegarder la requête</DialogTitle>
                    <DialogDescription>Donnez un nom à cette requête pour la retrouver plus tard.</DialogDescription>
                </DialogHeader>
                <div class="space-y-2 px-6 pb-4">
                    <Label for="query-name">Nom</Label>
                    <Input id="query-name" v-model="saveName" placeholder="Ma requête" @keyup.enter="handleSave" />
                </div>
                <DialogFooter>
                    <Button variant="outline" @click="showSaveDialog = false">Annuler</Button>
                    <Button @click="handleSave" :disabled="!saveName.trim()">Sauvegarder</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <Dialog :open="showRenameDialog" @update:open="showRenameDialog = $event">
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
                    <Button variant="outline" @click="showRenameDialog = false">Annuler</Button>
                    <Button @click="handleRename" :disabled="!renameName.trim()">Renommer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
</template>

