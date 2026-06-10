/**
 * Composable for client-side error logging.
 * Sends log entries to the backend API and silently dismisses failures.
 */
export function useErrorLogger() {
    /**
     * Send a log entry to the backend.
     * @param level - Severity level of the log entry.
     * @param message - Log message describing the event.
     * @param metadata - Optional structured data attached to the log.
     */
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
