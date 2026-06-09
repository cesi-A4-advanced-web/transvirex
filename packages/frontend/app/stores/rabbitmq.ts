/** Information about a RabbitMQ queue. */
export interface QueueInfo {
    /** Queue name. */
    name: string;
    /** Number of messages in the queue. */
    messages: number;
    /** Number of active consumers. */
    consumers: number;
    /** Queue state (e.g. running, idle). */
    state: string;
}

/** A message pulled from a RabbitMQ queue. */
export interface MessageInfo {
    /** Routing key used to publish the message. */
    routingKey: string;
    /** Exchange through which the message was routed. */
    exchange: string;
    /** Message properties (headers, content type, etc.). */
    properties: Record<string, any>;
    /** Message body content as a string. */
    content: string;
}

/**
 * Pinia store for the RabbitMQ debug console.
 * Provides queue listing and message inspection.
 */
export const useRabbitMQStore = defineStore('rabbitmq', () => {
    /** List of all RabbitMQ queues. */
    const queues = ref<QueueInfo[]>([]);
    /** Currently selected queue name. */
    const selectedQueue = ref<string | null>(null);
    /** Messages fetched from the selected queue. */
    const messages = ref<MessageInfo[]>([]);
    /** Whether queues are currently loading. */
    const loadingQueues = ref(false);
    /** Whether messages are currently loading. */
    const loadingMessages = ref(false);
    /** Error message from the last failed operation. */
    const error = ref<string | null>(null);

    /**
     * Fetch the list of all RabbitMQ queues.
     */
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

    /**
     * Fetch messages from a specific queue.
     * @param queue - The name of the queue to fetch messages from.
     */
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
