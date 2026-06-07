export interface QueueInfo {
    name: string;
    messages: number;
    consumers: number;
    state: string;
}

export interface MessageInfo {
    routingKey: string;
    exchange: string;
    properties: Record<string, any>;
    content: string;
}

export const useRabbitMQStore = defineStore('rabbitmq', () => {
    const queues = ref<QueueInfo[]>([]);
    const selectedQueue = ref<string | null>(null);
    const messages = ref<MessageInfo[]>([]);
    const loadingQueues = ref(false);
    const loadingMessages = ref(false);
    const error = ref<string | null>(null);

    async function fetchQueues() {
        loadingQueues.value = true;
        error.value = null;

        try {
            const res = await fetch('/api/debug/rabbitmq/queues');
            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }
            queues.value = await res.json();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de connexion';
        } finally {
            loadingQueues.value = false;
        }
    }

    async function fetchMessages(queue: string) {
        loadingMessages.value = true;
        error.value = null;
        selectedQueue.value = queue;

        try {
            const res = await fetch(`/api/debug/rabbitmq/queues/${encodeURIComponent(queue)}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ count: 20 }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }

            messages.value = await res.json();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de connexion';
        } finally {
            loadingMessages.value = false;
        }
    }

    return {
        queues,
        selectedQueue,
        messages,
        loadingQueues,
        loadingMessages,
        error,
        fetchQueues,
        fetchMessages,
    };
});
