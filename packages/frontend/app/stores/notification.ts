export interface Toast {
    id: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    dismissible: boolean;
    createdAt: Date;
}

export interface AppNotification {
    id: string;
    type: 'incident' | 'assignment' | 'status' | 'overdue';
    deliveryId?: string;
    driverId?: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

export const useNotificationStore = defineStore('notification', () => {
    const notifications = ref<AppNotification[]>([]);
    const toasts = ref<Toast[]>([]);

    const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

    function pushNotification(n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) {
        const notif: AppNotification = {
            ...n,
            id: crypto.randomUUID(),
            read: false,
            createdAt: new Date(),
        };
        notifications.value.unshift(notif);
        if (notifications.value.length > 50) {
            notifications.value = notifications.value.slice(0, 50);
        }
    }

    function pushToast(message: string, type: Toast['type'] = 'info', dismissible = true) {
        const toast: Toast = { id: crypto.randomUUID(), message, type, dismissible, createdAt: new Date() };
        toasts.value.push(toast);
        if (dismissible) {
            setTimeout(() => dismissToast(toast.id), 6000);
        }
    }

    function dismissToast(id: string) {
        toasts.value = toasts.value.filter((t) => t.id !== id);
    }

    function markAsRead(id: string) {
        const n = notifications.value.find((n) => n.id === id);
        if (n) n.read = true;
    }

    function markAllRead() {
        notifications.value.forEach((n) => (n.read = true));
    }

    function clearNotifications() {
        notifications.value = [];
    }

    return {
        notifications,
        toasts,
        unreadCount,
        pushNotification,
        pushToast,
        dismissToast,
        markAsRead,
        markAllRead,
        clearNotifications,
    };
});
