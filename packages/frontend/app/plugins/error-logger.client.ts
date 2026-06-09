export default defineNuxtPlugin((nuxtApp) => {
    const { logError } = useErrorLogger();

    nuxtApp.vueApp.config.errorHandler = (error, _instance, info) => {
        logError('error', error?.toString() || 'Unknown Vue error', {
            info,
            stack: error instanceof Error ? error.stack : undefined,
        });
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('unhandledrejection', (event) => {
            logError('error', event.reason?.toString() || 'Unhandled promise rejection', {
                stack: event.reason?.stack,
            });
        });
    }
});
