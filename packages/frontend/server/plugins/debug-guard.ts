/**
 * Nitro server plugin that blocks access to /debug routes in production.
 * Returns a 404 error to hide debug endpoints from production users.
 */
export default defineNitroPlugin((nitroApp) => {
    nitroApp.h3App.use((event) => {
        if (event.path.startsWith('/debug') && process.env.NODE_ENV === 'production') {
            throw createError({
                statusCode: 404,
                statusMessage: 'Page Not Found',
            });
        }
    });
});
