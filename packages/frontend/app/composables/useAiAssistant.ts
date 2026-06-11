import { $fetch } from 'ofetch';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    type?: 'chat' | 'incident';
    incident?: {
        id: string;
        severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        summary: string;
        notified: boolean;
    };
    timestamp: Date;
}

export function useAiAssistant() {
    const messages = ref<ChatMessage[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);

    /** Generate a unique id, with a fallback for non-secure contexts where
     * `crypto.randomUUID` is unavailable (e.g. http://transvirex.local). */
    function makeId(): string {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }
        return `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
        const full: ChatMessage = { ...msg, id: makeId(), timestamp: new Date() };
        messages.value.push(full);
        return full;
    }

    async function sendMessage(text: string, driverId: string, deliveryId?: string) {
        if (!text.trim()) return;
        error.value = null;

        // Conversation context: snapshot the prior turns (before adding the new
        // user message) so the assistant keeps track of the discussion.
        const history = messages.value
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content }));

        addMessage({ role: 'user', content: text });
        loading.value = true;

        try {
            const result = await $fetch<{
                type: string;
                answer: string;
                incident?: ChatMessage['incident'];
            }>('/api/ai/process', {
                method: 'POST',
                credentials: 'include',
                body: { text, driver_id: driverId, delivery_id: deliveryId, history },
            });

            addMessage({
                role: 'assistant',
                content: result.answer,
                type: result.type as 'chat' | 'incident',
                incident: result.incident,
            });
        } catch {
            error.value = "Le service IA est momentanément indisponible.";
            addMessage({ role: 'assistant', content: error.value, type: 'chat' });
        } finally {
            loading.value = false;
        }
    }

    function clearMessages() {
        messages.value = [];
    }

    return { messages, loading, error, sendMessage, clearMessages };
}

/** Options for {@link useSpeechRecognition}. */
interface SpeechOptions {
    /** Silence (ms) tolerated before the recognition auto-stops. Higher = more
     * time to finish a sentence. */
    silenceMs?: number;
    /** Called once the voice session ends with a non-empty transcript (used to
     * auto-send the message). */
    onEnd?: (transcript: string) => void;
}

export function useSpeechRecognition(options: SpeechOptions = {}) {
    const transcript = ref('');
    const listening = ref(false);
    const supported = ref(false);
    const silenceMs = options.silenceMs ?? 2000;

    let recognition: InstanceType<typeof window.SpeechRecognition> | null = null;
    let silenceTimer: ReturnType<typeof setTimeout> | null = null;

    function clearSilenceTimer() {
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    }

    /** Restart the silence countdown; firing it stops recognition (→ onend). */
    function armSilenceTimer() {
        clearSilenceTimer();
        silenceTimer = setTimeout(() => {
            recognition?.stop();
        }, silenceMs);
    }

    onMounted(() => {
        const SpeechRecognition =
            window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        supported.value = true;
        recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        // Continuous mode keeps the session open across short pauses, so a brief
        // hesitation no longer cuts the user off. We end the session ourselves
        // via the silence timer instead.
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            // In continuous mode, rebuild the full transcript from every segment.
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
            }
            transcript.value = text;
            // Any speech resets the silence countdown.
            armSilenceTimer();
        };

        recognition.onend = () => {
            clearSilenceTimer();
            const wasListening = listening.value;
            listening.value = false;
            // Auto-send the captured message when the voice session ends.
            const finalText = transcript.value.trim();
            if (wasListening && finalText) {
                options.onEnd?.(finalText);
            }
        };

        recognition.onerror = () => {
            clearSilenceTimer();
            listening.value = false;
        };
    });

    function startListening() {
        if (!recognition) return;
        transcript.value = '';
        listening.value = true;
        armSilenceTimer();
        try {
            recognition.start();
        } catch {
            // start() throws if already running — ignore.
        }
    }

    function stopListening() {
        if (!recognition) return;
        clearSilenceTimer();
        // Let onend flip `listening` so the auto-send (onEnd) still fires.
        recognition.stop();
    }

    function resetTranscript() {
        transcript.value = '';
    }

    return { transcript, listening, supported, startListening, stopListening, resetTranscript };
}
