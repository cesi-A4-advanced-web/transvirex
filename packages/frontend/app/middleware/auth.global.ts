const PUBLIC_PATHS = ['/', '/debug'];

export default defineNuxtRouteMiddleware(async (to) => {
    if (PUBLIC_PATHS.some((p) => to.path === p || to.path.startsWith(p + '/')))
        return;

    const { user, fetchMe } = useAuth();

    if (!user.value) {
        const ok = await fetchMe();
        if (!ok) return navigateTo('/');
    }
});
