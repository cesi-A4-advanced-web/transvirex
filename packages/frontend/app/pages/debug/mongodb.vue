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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMongoDBStore } from '@/stores/mongodb';

useHead({ title: 'Console MongoDB — Transvirex' });

const mongodb = useMongoDBStore();
const showSaveDialog = ref(false);
const showRenameDialog = ref(false);
const saveName = ref('');
const renameName = ref('');
const renamingId = ref<string | null>(null);

const STORAGE_KEY = 'transvirex:saved-mongo-queries';

interface SavedQuery {
    id: string;
    name: string;
    command: string;
    createdAt: string;
}

const savedQueries = ref<SavedQuery[]>([]);

function loadSaved() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        savedQueries.value = raw ? JSON.parse(raw) : [];
    } catch {
        savedQueries.value = [];
    }
}

function persistSaved() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedQueries.value));
}

loadSaved();

onMounted(() => mongodb.fetchCollections());

function handleSave() {
    if (!saveName.value.trim()) return;
    const existing = savedQueries.value.find(
        (q) => q.name === saveName.value.trim(),
    );
    if (existing) {
        existing.command = mongodb.command;
        existing.createdAt = new Date().toISOString();
    } else {
        savedQueries.value.push({
            id: crypto.randomUUID(),
            name: saveName.value.trim(),
            command: mongodb.command,
            createdAt: new Date().toISOString(),
        });
    }
    persistSaved();
    saveName.value = '';
    showSaveDialog.value = false;
}

function loadQuery(id: string) {
    const saved = savedQueries.value.find((q) => q.id === id);
    if (saved) {
        mongodb.command = saved.command;
    }
}

function deleteQuery(id: string) {
    savedQueries.value = savedQueries.value.filter((q) => q.id !== id);
    persistSaved();
}

function rename(saved: SavedQuery) {
    renamingId.value = saved.id;
    renameName.value = saved.name;
    showRenameDialog.value = true;
}

function handleRename() {
    if (!renameName.value.trim() || !renamingId.value) return;
    const saved = savedQueries.value.find((q) => q.id === renamingId.value);
    if (saved) {
        saved.name = renameName.value.trim();
        persistSaved();
    }
    renameName.value = '';
    renamingId.value = null;
    showRenameDialog.value = false;
}

function selectCollection(name: string) {
    mongodb.collectionPage = 1;
    mongodb.fetchCollectionData(name);
}
</script>

<template>
    <div class="max-w-6xl mx-auto space-y-8">
        <div class="space-y-1">
            <h1 class="text-3xl font-bold text-slate-900">Console MongoDB</h1>
            <p class="text-gray-500">
                Exécuter des requêtes sur la base de données MongoDB
            </p>
        </div>

        <Tabs default-value="query" class="w-full">
            <TabsList>
                <TabsTrigger value="query">Requête</TabsTrigger>
                <TabsTrigger value="browse">Parcourir les données</TabsTrigger>
            </TabsList>

            <TabsContent value="query">
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Requête</CardTitle>
                                <CardDescription
                                    >Saisissez votre requête MongoDB
                                    ci-dessous</CardDescription
                                >
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    v-model="mongodb.command"
                                    placeholder="db.users.find({}).limit(10)"
                                    :rows="6"
                                />
                                <div class="flex flex-wrap gap-2 mt-4">
                                    <Button
                                        @click="mongodb.execute()"
                                        :disabled="mongodb.loading"
                                    >
                                        <svg
                                            class="w-4 h-4"
                                            v-if="!mongodb.loading"
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
                                        {{
                                            mongodb.loading
                                                ? 'Exécution...'
                                                : 'Exécuter'
                                        }}
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

                        <Card v-if="mongodb.results || mongodb.error">
                            <CardHeader>
                                <CardTitle>Résultat</CardTitle>
                                <CardDescription v-if="mongodb.results">
                                    {{ mongodb.results.rowCount }} document{{
                                        mongodb.results.rowCount > 1 ? 's' : ''
                                    }}
                                    retourné{{
                                        mongodb.results.rowCount > 1 ? 's' : ''
                                    }}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    v-if="mongodb.error"
                                    class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                                >
                                    {{ mongodb.error }}
                                </div>
                                <div v-else-if="mongodb.results">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead
                                                    v-for="col in mongodb
                                                        .results.columns"
                                                    :key="col"
                                                >
                                                    {{ col }}
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <TableRow
                                                v-for="(row, i) in mongodb
                                                    .results.rows"
                                                :key="i"
                                            >
                                                <TableCell
                                                    v-for="col in mongodb
                                                        .results.columns"
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

                        <Card
                            v-if="
                                !mongodb.results &&
                                !mongodb.error &&
                                !mongodb.loading
                            "
                        >
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
                                            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                        />
                                    </svg>
                                    <p class="text-gray-500">
                                        Exécutez une requête pour voir les
                                        résultats
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
                                    >Chargez une requête
                                    précédente</CardDescription
                                >
                            </CardHeader>
                            <CardContent>
                                <ScrollArea>
                                    <div
                                        v-if="savedQueries.length === 0"
                                        class="text-sm text-gray-400 text-center py-8"
                                    >
                                        Aucune requête sauvegardée
                                    </div>
                                    <div v-else class="space-y-3">
                                        <div
                                            v-for="saved in savedQueries"
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
                                                    {{ saved.command }}
                                                </p>
                                                <p
                                                    class="text-xs text-gray-400 mt-1"
                                                >
                                                    {{
                                                        new Date(
                                                            saved.createdAt,
                                                        ).toLocaleDateString(
                                                            'fr-FR',
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                            <div
                                                class="flex gap-1 shrink-0 ml-3"
                                            >
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    @click="loadQuery(saved.id)"
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
                                                    @click="
                                                        deleteQuery(saved.id)
                                                    "
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
            </TabsContent>

            <TabsContent value="browse">
                <Card>
                    <CardContent class="p-0">
                        <div class="grid grid-cols-1 lg:grid-cols-4">
                            <div
                                class="lg:col-span-1 border-b lg:border-b-0 lg:border-r border-gray-200"
                            >
                                <div class="p-4">
                                    <div
                                        class="flex items-center justify-between mb-3"
                                    >
                                        <h3
                                            class="text-sm font-semibold text-gray-900"
                                        >
                                            Collections
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            @click="mongodb.fetchCollections()"
                                            :disabled="
                                                mongodb.collectionsLoading
                                            "
                                        >
                                            <svg
                                                class="w-4 h-4"
                                                :class="{
                                                    'animate-spin':
                                                        mongodb.collectionsLoading,
                                                }"
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
                                    </div>
                                    <ScrollArea class="h-[500px]">
                                        <div
                                            v-if="mongodb.collectionsLoading"
                                            class="text-sm text-gray-400 text-center py-8"
                                        >
                                            Chargement...
                                        </div>
                                        <div
                                            v-else-if="
                                                mongodb.collections.length === 0
                                            "
                                            class="text-sm text-gray-400 text-center py-8"
                                        >
                                            Aucune collection trouvée
                                        </div>
                                        <div v-else class="space-y-1">
                                            <button
                                                v-for="c in mongodb.collections"
                                                :key="c"
                                                @click="selectCollection(c)"
                                                class="w-full text-left px-3 py-2 rounded-md text-sm transition"
                                                :class="{
                                                    'bg-blue-50 text-blue-700 font-medium':
                                                        mongodb.selectedCollection ===
                                                        c,
                                                    'text-gray-700 hover:bg-gray-100':
                                                        mongodb.selectedCollection !==
                                                        c,
                                                }"
                                            >
                                                <span
                                                    class="text-xs text-gray-400 mr-1"
                                                    >📦</span
                                                >
                                                {{ c }}
                                            </button>
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div class="lg:col-span-3">
                                <div class="p-4">
                                    <div
                                        v-if="!mongodb.selectedCollection"
                                        class="text-center py-16 text-gray-400"
                                    >
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
                                                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                            />
                                        </svg>
                                        <p>
                                            Sélectionnez une collection dans la
                                            liste
                                        </p>
                                    </div>

                                    <div
                                        v-else-if="
                                            mongodb.collectionDataLoading
                                        "
                                        class="text-center py-16 text-gray-400"
                                    >
                                        Chargement des données...
                                    </div>

                                    <div
                                        v-else-if="mongodb.collectionError"
                                        class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-4"
                                    >
                                        {{ mongodb.collectionError }}
                                    </div>

                                    <div v-else-if="mongodb.collectionData">
                                        <div
                                            class="flex items-center justify-between mb-4"
                                        >
                                            <div>
                                                <h3
                                                    class="text-lg font-semibold text-gray-900"
                                                >
                                                    {{
                                                        mongodb.selectedCollection
                                                    }}
                                                </h3>
                                                <p
                                                    class="text-sm text-gray-500"
                                                >
                                                    {{
                                                        mongodb.collectionData
                                                            .totalCount
                                                    }}
                                                    document{{
                                                        mongodb.collectionData
                                                            .totalCount > 1
                                                            ? 's'
                                                            : ''
                                                    }}
                                                </p>
                                            </div>
                                        </div>

                                        <ScrollArea class="max-w-full">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead
                                                            v-for="col in mongodb
                                                                .collectionData
                                                                .columns"
                                                            :key="col"
                                                            class="whitespace-nowrap"
                                                        >
                                                            {{ col }}
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    <TableRow
                                                        v-for="(
                                                            row, i
                                                        ) in mongodb
                                                            .collectionData
                                                            .rows"
                                                        :key="i"
                                                    >
                                                        <TableCell
                                                            v-for="col in mongodb
                                                                .collectionData
                                                                .columns"
                                                            :key="col"
                                                            class="max-w-60 truncate"
                                                            :title="
                                                                row[col] != null
                                                                    ? String(
                                                                          row[
                                                                              col
                                                                          ],
                                                                      )
                                                                    : 'NULL'
                                                            "
                                                        >
                                                            {{
                                                                row[col] != null
                                                                    ? String(
                                                                          row[
                                                                              col
                                                                          ],
                                                                      )
                                                                    : 'NULL'
                                                            }}
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>

                                        <div
                                            class="flex items-center justify-between mt-4 pt-4 border-t border-gray-200"
                                        >
                                            <div
                                                class="flex items-center gap-2 text-sm text-gray-500"
                                            >
                                                <span
                                                    >Documents
                                                    {{
                                                        (mongodb.collectionPage -
                                                            1) *
                                                            mongodb.collectionPageSize +
                                                        1
                                                    }}
                                                    –
                                                    {{
                                                        Math.min(
                                                            mongodb.collectionPage *
                                                                mongodb.collectionPageSize,
                                                            mongodb
                                                                .collectionData
                                                                .totalCount,
                                                        )
                                                    }}
                                                    sur
                                                    {{
                                                        mongodb.collectionData
                                                            .totalCount
                                                    }}</span
                                                >
                                            </div>
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    :disabled="
                                                        mongodb.collectionPage <=
                                                        1
                                                    "
                                                    @click="
                                                        mongodb.goToCollectionPage(
                                                            mongodb.collectionPage -
                                                                1,
                                                        )
                                                    "
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
                                                            d="M15 19l-7-7 7-7"
                                                        />
                                                    </svg>
                                                </Button>
                                                <span
                                                    class="text-sm text-gray-600 min-w-16 text-center"
                                                >
                                                    Page
                                                    {{ mongodb.collectionPage }}
                                                    /
                                                    {{
                                                        mongodb.collectionData
                                                            .totalPages
                                                    }}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    :disabled="
                                                        mongodb.collectionPage >=
                                                        mongodb.collectionData
                                                            .totalPages
                                                    "
                                                    @click="
                                                        mongodb.goToCollectionPage(
                                                            mongodb.collectionPage +
                                                                1,
                                                        )
                                                    "
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
                                                            d="M9 5l7 7-7 7"
                                                        />
                                                    </svg>
                                                </Button>
                                            </div>
                                            <div
                                                class="flex items-center gap-2"
                                            >
                                                <label
                                                    class="text-sm text-gray-500"
                                                    for="page-size"
                                                    >Par page</label
                                                >
                                                <select
                                                    id="page-size"
                                                    v-model="
                                                        mongodb.collectionPageSize
                                                    "
                                                    @change="
                                                        mongodb.fetchCollectionData(
                                                            mongodb.selectedCollection!,
                                                            1,
                                                        )
                                                    "
                                                    class="text-sm border border-gray-300 rounded-md px-2 py-1"
                                                >
                                                    <option :value="10">
                                                        10
                                                    </option>
                                                    <option :value="25">
                                                        25
                                                    </option>
                                                    <option :value="50">
                                                        50
                                                    </option>
                                                    <option :value="100">
                                                        100
                                                    </option>
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
