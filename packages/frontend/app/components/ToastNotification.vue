<template>
    <Teleport to="body">
        <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
            <TransitionGroup name="toast">
                <div
                    v-for="toast in store.toasts"
                    :key="toast.id"
                    class="flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm transition-all"
                    :class="toastClass(toast.type)"
                >
                    <component :is="toastIcon(toast.type)" class="w-4 h-4 mt-0.5 shrink-0" />
                    <p class="flex-1">{{ toast.message }}</p>
                    <button
                        v-if="toast.dismissible"
                        @click="store.dismissToast(toast.id)"
                        class="shrink-0 text-current/60 hover:text-current transition-colors"
                    >
                        <X class="w-3.5 h-3.5" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from '@lucide/vue';
import { useNotificationStore } from '@/stores/notification';

const store = useNotificationStore();

function toastClass(type: string) {
    return (
        {
            success: 'bg-green-50 border-green-200 text-green-800',
            warning: 'bg-orange-50 border-orange-200 text-orange-800',
            error: 'bg-red-50 border-red-200 text-red-800',
            info: 'bg-blue-50 border-blue-200 text-blue-800',
        } as Record<string, string>
    )[type] ?? 'bg-gray-50 border-gray-200 text-gray-800';
}

function toastIcon(type: string) {
    return (
        {
            success: CheckCircle,
            warning: AlertTriangle,
            error: AlertCircle,
            info: Info,
        } as Record<string, unknown>
    )[type] ?? Info;
}
</script>

<style scoped>
.toast-enter-active {
    transition: all 0.3s ease-out;
}
.toast-leave-active {
    transition: all 0.2s ease-in;
}
.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}
.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>
