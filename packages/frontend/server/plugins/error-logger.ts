/**
 * Nitro server plugin that hooks into server error events.
 * Logs all Nitro-level errors to the backend logging service.
 */
export default defineNitroPlugin((nitroApp) => {
    /** Error hook that sends server error details to the logging API. */
    nitroApp.hooks.hook('error', async (error, { event }) => {
        try {
            await $fetch('/api/logs/frontend', {
                method: 'POST',
                body: {
                    level: 'error',
                    message: error?.message || 'Unknown Nitro error',
                    metadata: {
                        path: event?.path,
                        stack: error?.stack,
                    },
                },
            });
        } catch {
            // Fail silently
        }
    });
});
