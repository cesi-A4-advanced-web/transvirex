<template>
    <AppLayout>
        <div class="flex flex-col h-[calc(100vh-3.5rem-3rem)] max-w-2xl mx-auto">
            <!-- Header -->
            <div class="mb-4 flex-shrink-0">
                <h2 class="text-2xl font-bold tracking-tight">Assistant IA</h2>
                <p class="text-muted-foreground text-sm mt-1">
                    Posez une question ou déclarez un incident à l'oral ou par écrit.
                </p>
            </div>

            <!-- Delivery selector -->
            <div class="flex-shrink-0 mb-3">
                <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <span class="text-xs text-blue-600 font-medium">Livraison en cours :</span>
                    <input
                        v-model="currentDeliveryId"
                        placeholder="ID de livraison (ex: abc-123)"
                        class="flex-1 bg-transparent text-xs font-mono text-blue-800 outline-none placeholder:text-blue-400"
                    />
                </div>
            </div>

            <!-- Messages -->
            <div ref="chatContainer" class="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
                <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground">
                    <div class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                        <Mic class="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                        <p class="font-medium text-gray-700">Prêt à vous aider</p>
                        <p class="text-sm mt-1">Parlez ou écrivez votre message ci-dessous.</p>
                    </div>
                    <div class="flex flex-wrap justify-center gap-2 mt-2">
                        <button
                            v-for="suggestion in suggestions"
                            :key="suggestion"
                            @click="inputText = suggestion"
                            class="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full transition-colors"
                        >
                            {{ suggestion }}
                        </button>
                    </div>
                </div>

                <template v-for="msg in messages" :key="msg.id">
                    <!-- User message -->
                    <div v-if="msg.role === 'user'" class="flex justify-end">
                        <div class="max-w-[80%] bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                            {{ msg.content }}
                        </div>
                    </div>

                    <!-- Assistant message -->
                    <div v-else class="flex justify-start gap-2">
                        <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot class="w-4 h-4 text-blue-600" />
                        </div>
                        <div class="max-w-[80%] space-y-2">
                            <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-gray-800 shadow-sm">
                                {{ msg.content }}
                            </div>
                            <!-- Incident card -->
                            <div
                                v-if="msg.incident"
                                class="border rounded-xl px-3 py-2.5 text-xs space-y-1"
                                :class="severityCardClass(msg.incident.severity)"
                            >
                                <div class="flex items-center justify-between">
                                    <span class="font-semibold uppercase tracking-wide">
                                        Incident {{ severityLabel(msg.incident.severity) }}
                                    </span>
                                    <span
                                        v-if="msg.incident.notified"
                                        class="flex items-center gap-1 text-orange-600 font-medium"
                                    >
                                        <Bell class="w-3 h-3" /> Dispatcher notifié
                                    </span>
                                </div>
                                <p class="text-gray-600">{{ msg.incident.summary }}</p>
                            </div>
                        </div>
                    </div>
                </template>

                <!-- Typing indicator -->
                <div v-if="loading" class="flex justify-start gap-2">
                    <div class="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Bot class="w-4 h-4 text-blue-600" />
                    </div>
                    <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                        <div class="flex gap-1">
                            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms" />
                            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms" />
                            <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Input zone -->
            <div class="flex-shrink-0 pt-3 border-t border-gray-200">
                <!-- Transcript preview -->
                <div v-if="listening || transcript" class="mb-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                    <span class="text-sm text-red-700 italic flex-1">
                        {{ transcript || 'En écoute...' }}
                    </span>
                </div>

                <div class="flex items-end gap-2">
                    <!-- Mic button -->
                    <button
                        v-if="speechSupported"
                        @click="toggleVoice"
                        :disabled="loading"
                        class="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all"
                        :class="listening
                            ? 'bg-red-500 text-white shadow-lg shadow-red-200 scale-110'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    >
                        <MicOff v-if="listening" class="w-5 h-5" />
                        <Mic v-else class="w-5 h-5" />
                    </button>

                    <!-- Text input -->
                    <div class="flex-1 flex items-end gap-2">
                        <textarea
                            v-model="inputText"
                            @keydown.enter.exact.prevent="submit"
                            placeholder="Écrivez ou parlez..."
                            rows="1"
                            class="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors max-h-32 overflow-y-auto"
                            style="field-sizing: content"
                        />
                        <button
                            @click="submit"
                            :disabled="!inputText.trim() || loading"
                            class="flex-shrink-0 w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <Send class="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <p v-if="!speechSupported" class="text-xs text-muted-foreground mt-2 text-center">
                    La reconnaissance vocale nécessite Chrome ou Edge.
                </p>
            </div>
        </div>
    </AppLayout>
</template>

<script setup lang="ts">
import { nextTick } from 'vue';
import { useCookie } from '#app';
import { Bell, Bot, Mic, MicOff, Send } from '@lucide/vue';
import { AppLayout } from '#components';
import { useAiAssistant, useSpeechRecognition } from '@/composables/useAiAssistant';

definePageMeta({ layout: false });
useHead({ title: 'Assistant IA — Transvirex' });

// ── Auth ──────────────────────────────────────────────────────────────────────
const accessToken = useCookie('access_token');
function parseJwt(token: string) {
    try { return JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))); }
    catch { return null; }
}
const payload = computed(() => accessToken.value ? parseJwt(accessToken.value) : null);
const driverId = computed<string>(() => payload.value?.sub ?? '');

// ── State ─────────────────────────────────────────────────────────────────────
const currentDeliveryId = ref('');
const inputText = ref('');
const chatContainer = ref<HTMLElement | null>(null);

const { messages, loading, sendMessage } = useAiAssistant();
const { transcript, listening, supported: speechSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

const suggestions = [
    'Comment gérer un client absent ?',
    'J\'ai un problème avec mon véhicule',
    'Colis endommagé lors de la livraison',
    'Retard important sur ma tournée',
];

// ── Sync transcript → input ───────────────────────────────────────────────────
watch(transcript, (val) => { if (val) inputText.value = val; });

// ── Auto-scroll ───────────────────────────────────────────────────────────────
watch(messages, async () => {
    await nextTick();
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
}, { deep: true });

// ── Actions ───────────────────────────────────────────────────────────────────
function toggleVoice() {
    if (listening.value) {
        stopListening();
    } else {
        resetTranscript();
        inputText.value = '';
        startListening();
    }
}

async function submit() {
    const text = inputText.value.trim();
    if (!text || loading.value) return;
    inputText.value = '';
    resetTranscript();
    if (listening.value) stopListening();
    await sendMessage(text, driverId.value, currentDeliveryId.value || undefined);
}

// ── Severity helpers ──────────────────────────────────────────────────────────
function severityLabel(s: string) {
    return ({ CRITICAL: 'critique', HIGH: 'élevé', MEDIUM: 'modéré', LOW: 'faible' } as Record<string, string>)[s] ?? s;
}
function severityCardClass(s: string) {
    return ({
        CRITICAL: 'bg-red-50 border-red-200 text-red-800',
        HIGH: 'bg-orange-50 border-orange-200 text-orange-800',
        MEDIUM: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        LOW: 'bg-gray-50 border-gray-200 text-gray-700',
    } as Record<string, string>)[s] ?? 'bg-gray-50 border-gray-200';
}
</script>
