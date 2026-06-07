import type { QueryResult } from './sql';

export const useRedisStore = defineStore('redis', () => {
    const command = ref('KEYS *');
    const results = ref<QueryResult | null>(null);
    const error = ref<string | null>(null);
    const loading = ref(false);

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
