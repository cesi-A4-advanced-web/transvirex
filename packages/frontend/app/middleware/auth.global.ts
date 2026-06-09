export default defineNuxtRouteMiddleware(async (to) => {
    if (to.path === '/') return;

    const { user, fetchMe } = useAuth();

    if (!user.value) {
        const ok = await fetchMe();
        if (!ok) return navigateTo('/');
    }
});
