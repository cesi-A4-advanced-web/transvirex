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

export interface MissionAlert {
    id: string;
    type: 'assigned' | 'unassigned' | 'status_changed';
    deliveryRef: string;
    message: string;
    timestamp: string;
}

export function useNotifications() {
    const notifications = ref<AiNotification[]>([]);
    const unreadCount = ref(0);
    const missionAlerts = ref<MissionAlert[]>([]);
    const missionUnreadCount = ref(0);
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let driverDeliveryCache = new Set<string>();
    let missionPollingId: ReturnType<typeof setInterval> | null = null;
    const sseConnected = ref(false);

    // ── AI Incident Notifications ────────────────────────────────────────────

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
        if (missionPollingId !== null) clearInterval(missionPollingId);
    }

    function onSseEvent(event: string, data: Record<string, unknown>) {
        if (event === 'delivery:status') {
            fetchNotifications();
        }
        if (event === 'delivery:assigned' || event === 'delivery:incident') {
            fetchNotifications();
        }
    }

    function setSseConnected(v: boolean) {
        sseConnected.value = v;
    }

    // ── Driver Mission Notifications ─────────────────────────────────────────

    async function fetchMissionNotifications(userId: string) {
        try {
            const data = await $fetch<{ deliveries: Array<{ id: string; reference: string; status: string }> }>(
                `/api/drivers/${userId}/deliveries`,
            );
            const currentSet = new Set(data.deliveries.map((d) => d.id));
            if (driverDeliveryCache.size > 0) {
                const newDeliveries = data.deliveries.filter((d) => !driverDeliveryCache.has(d.id));
                for (const d of newDeliveries) {
                    missionAlerts.value.unshift({
                        id: d.id,
                        type: 'assigned',
                        deliveryRef: d.reference,
                        message: `Nouvelle mission assignée : ${d.reference}`,
                        timestamp: new Date().toISOString(),
                    });
                }
                const removedIds = [...driverDeliveryCache].filter((id) => !currentSet.has(id));
                for (const id of removedIds) {
                    const ref = data.deliveries.find((d) => d.id === id)?.reference || id;
                    missionAlerts.value.unshift({
                        id,
                        type: 'unassigned',
                        deliveryRef: ref,
                        message: `Mission ${ref} retirée`,
                        timestamp: new Date().toISOString(),
                    });
                }
                if (newDeliveries.length > 0 || removedIds.length > 0) {
                    missionUnreadCount.value = missionAlerts.value.filter((a) => !a.id.startsWith('read_')).length;
                }
            }
            driverDeliveryCache = currentSet;
            missionAlerts.value = missionAlerts.value.slice(0, 20);
        } catch {
            // fail silently
        }
    }

    function startDriverPolling(userId: string, intervalMs = 30000) {
        if (!userId) return;
        fetchMissionNotifications(userId);
        missionPollingId = setInterval(() => fetchMissionNotifications(userId), intervalMs);
    }

    function clearMissionAlerts() {
        missionAlerts.value = [];
        missionUnreadCount.value = 0;
    }

    onUnmounted(stopPolling);

    return {
        notifications,
        unreadCount,
        missionAlerts,
        missionUnreadCount,
        fetchNotifications,
        markRead,
        markAllRead,
        startPolling,
        stopPolling,
        fetchMissionNotifications,
        startDriverPolling,
        clearMissionAlerts,
        onSseEvent,
        sseConnected,
        setSseConnected,
    };
}
