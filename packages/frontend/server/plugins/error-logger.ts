export default defineNitroPlugin((nitroApp) => {
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
