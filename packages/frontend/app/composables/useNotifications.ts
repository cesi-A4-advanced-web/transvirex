import { $fetch } from 'ofetch';

export interface AiNotification {
    id: string;
    incident_id?: string;
    driver_id?: string;
    delivery_id: string;
    summary: string;
    severity: 'CRITICAL' | 'HIGH' | 'INFO';
    /** 'incident' (dispatcher) or 'assignment' | 'status' (driver). */
    type?: string;
    read: boolean;
    created_at: string;
}

export function useNotifications() {
    const notifications = ref<AiNotification[]>([]);
    const unreadCount = ref(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchNotifications() {
        try {
            const data = await $fetch<{ notifications: AiNotification[]; unread_count: number }>(
                '/api/ai/notifications',
                { credentials: 'include' },
            );
            notifications.value = data.notifications;
            unreadCount.value = data.unread_count;
        } catch {
            // fail silently — service may be down
        }
    }

    async function markRead(id: string) {
        await $fetch(`/api/ai/notifications/${id}/read`, { method: 'POST', credentials: 'include' });
        const n = notifications.value.find((n) => n.id === id);
        if (n) {
            n.read = true;
            unreadCount.value = Math.max(0, unreadCount.value - 1);
        }
    }

    async function markAllRead() {
        const unread = notifications.value.filter((n) => !n.read);
        await Promise.all(unread.map((n) => markRead(n.id)));
    }

    function startPolling(intervalMs = 15000) {
        fetchNotifications();
        intervalId = setInterval(fetchNotifications, intervalMs);
    }

    function stopPolling() {
        if (intervalId !== null) clearInterval(intervalId);
    }

    onUnmounted(stopPolling);

    return { notifications, unreadCount, fetchNotifications, markRead, markAllRead, startPolling, stopPolling };
}
