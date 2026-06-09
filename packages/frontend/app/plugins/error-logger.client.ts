/**
 * Client-side Nuxt plugin for global error handling.
 * Catches Vue errors and unhandled promise rejections,
 * then sends them to the backend logging service.
 */
export default defineNuxtPlugin((nuxtApp) => {
    const { logError } = useErrorLogger();

    /** Global Vue error handler that logs all uncaught Vue errors. */
    nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
        logError('error', error?.toString() || 'Unknown Vue error', {
            info,
            stack: error instanceof Error ? error.stack : undefined,
        });
    };

    if (typeof window !== 'undefined') {
        /** Listener for unhandled promise rejections. */
        window.addEventListener('unhandledrejection', (event) => {
            logError('error', event.reason?.toString() || 'Unhandled promise rejection', {
                stack: event.reason?.stack,
            });
        });
    }
});
