export function useErrorLogger() {
    async function logError(
        level: 'log' | 'warn' | 'error' | 'debug' = 'error',
        message: string,
        metadata?: Record<string, unknown>,
    ) {
        try {
            await $fetch('/api/logs/frontend', {
                method: 'POST',
                body: { level, message, metadata },
            });
        } catch {
            // Fail silently — logging should never crash the app
        }
    }

    return { logError };
}
