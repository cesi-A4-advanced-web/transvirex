export default defineNitroPlugin((nitroApp) => {
    nitroApp.h3App.use((event) => {
        // Check if the request is for a debug page and if we are in production
        if (
            event.path.startsWith('/debug') &&
            process.env.NODE_ENV === 'production'
        ) {
            throw createError({
                statusCode: 404,
                statusMessage: 'Page Not Found',
            });
        }
    });
});
