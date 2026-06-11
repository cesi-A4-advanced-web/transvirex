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

export function useSpeechRecognition() {
    const transcript = ref('');
    const listening = ref(false);
    const supported = ref(false);

    let recognition: InstanceType<typeof window.SpeechRecognition> | null = null;

    onMounted(() => {
        const SpeechRecognition =
            window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        supported.value = true;
        recognition = new SpeechRecognition();
        recognition.lang = 'fr-FR';
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const t = event.results[i][0].transcript;
                if (event.results[i].isFinal) final += t;
                else interim += t;
            }
            transcript.value = final || interim;
        };

        recognition.onend = () => {
            listening.value = false;
        };

        recognition.onerror = () => {
            listening.value = false;
        };
    });

    function startListening() {
        if (!recognition) return;
        transcript.value = '';
        listening.value = true;
        recognition.start();
    }

    function stopListening() {
        if (!recognition) return;
        recognition.stop();
        listening.value = false;
    }

    function resetTranscript() {
        transcript.value = '';
    }

    return { transcript, listening, supported, startListening, stopListening, resetTranscript };
}
