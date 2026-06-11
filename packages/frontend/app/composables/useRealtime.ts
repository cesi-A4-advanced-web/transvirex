import { useNotificationStore } from '@/stores/notification';

type SseEventType =
    | 'delivery:status'
    | 'delivery:assigned'
    | 'delivery:incident'
    | 'delivery:overdue'
    | 'position:update';

type SseCallback = (data: Record<string, unknown>) => void;

export function useRealtime() {
    const eventSource = ref<EventSource | null>(null);
    const connected = ref(false);
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    const listeners = new Map<string, Set<SseCallback>>();

    function on(event: SseEventType, cb: SseCallback) {
        if (!listeners.has(event)) {
            listeners.set(event, new Set());
        }
        listeners.get(event)!.add(cb);
    }

    function off(event: SseEventType, cb: SseCallback) {
        listeners.get(event)?.delete(cb);
    }

    function connect() {
        if (eventSource.value) return;
        const es = new EventSource('/api/events');
        eventSource.value = es;

        es.addEventListener('open', () => {
            connected.value = true;
        });

        es.addEventListener('message', (e) => {
            try {
                const data = JSON.parse(e.data) as Record<string, unknown>;
                if (data.type === 'connected') return;
                const type = e.type as string;
                if (listeners.has(type)) {
                    listeners.get(type)!.forEach((cb) => cb(data));
                }
            } catch {
                // ignore malformed messages
            }
        });

        const customEvents: SseEventType[] = [
            'delivery:status',
            'delivery:assigned',
            'delivery:incident',
            'delivery:overdue',
            'position:update',
        ];
        for (const evt of customEvents) {
            es.addEventListener(evt, (e: MessageEvent) => {
                try {
                    const data = JSON.parse(e.data) as Record<string, unknown>;
                    if (listeners.has(evt)) {
                        listeners.get(evt)!.forEach((cb) => cb(data));
                    }
                } catch {
                    // ignore malformed messages
                }
            });
        }

        es.addEventListener('error', () => {
            connected.value = false;
            es.close();
            eventSource.value = null;
            scheduleReconnect();
        });
    }

    function scheduleReconnect() {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => {
            connect();
        }, 3000);
    }

    function disconnect() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer);
            reconnectTimer = null;
        }
        if (eventSource.value) {
            eventSource.value.close();
            eventSource.value = null;
        }
        connected.value = false;
    }

    function checkOverdueDeliveries(deliveries: Array<{ id: string; scheduled_at: string | null; status: string }>) {
        const now = new Date();
        for (const d of deliveries) {
            if (d.scheduled_at && d.status !== 'delivered' && d.status !== 'cancelled') {
                const scheduled = new Date(d.scheduled_at);
                if (scheduled < now) {
                    const store = useNotificationStore();
                    store.pushNotification({
                        type: 'overdue',
                        deliveryId: d.id,
                        message: `Livraison ${d.id.slice(0, 8)} dépassée`,
                    });
                }
            }
        }
    }

    onUnmounted(() => {
        disconnect();
    });

    return {
        connected,
        connect,
        disconnect,
        on,
        off,
        checkOverdueDeliveries,
    };
}
