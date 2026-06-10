import type { QueryResult } from './sql';

/**
 * Pinia store for the Redis debug console.
 * Provides Redis command execution via the debug API.
 */
export const useRedisStore = defineStore('redis', () => {
    /** The Redis command string to execute. */
    const command = ref('KEYS *');
    /** Results from the last command execution. */
    const results = ref<QueryResult | null>(null);
    /** Error message from the last failed operation. */
    const error = ref<string | null>(null);
    /** Whether a command is currently being executed. */
    const loading = ref(false);

    /**
     * Execute the current Redis command against the debug API.
     * Updates results or sets error on failure.
     */
    async function execute() {
        loading.value = true;
        error.value = null;
        results.value = null;

        try {
            const res = await fetch('/api/debug/redis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command.value }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                throw new Error(body?.message ?? `Erreur ${res.status}`);
            }

            results.value = await res.json();
        } catch (e: any) {
            error.value = e?.message ?? 'Erreur de connexion';
        } finally {
            loading.value = false;
        }
    }

    return {
        command,
        results,
        error,
        loading,
        execute,
    };
});
