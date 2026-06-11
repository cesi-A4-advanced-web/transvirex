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

    function addMessage(msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
        const full: ChatMessage = { ...msg, id: crypto.randomUUID(), timestamp: new Date() };
        messages.value.push(full);
        return full;
    }

    async function sendMessage(text: string, driverId: string, deliveryId?: string) {
        if (!text.trim()) return;
        error.value = null;

        addMessage({ role: 'user', content: text });
        loading.value = true;

        try {
            const result = await $fetch<{
                type: string;
                answer: string;
                incident?: ChatMessage['incident'];
            }>('/api/ai/process', {
                method: 'POST',
                body: { text, driver_id: driverId, delivery_id: deliveryId },
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
