import { provideSSRWidth } from '@vueuse/core';

/**
 * Nuxt plugin that provides a default viewport width (1024px) for SSR.
 * Ensures responsive utilities like `useWindowSize` work consistently
 * during server-side rendering.
 */
export default defineNuxtPlugin((nuxtApp) => {
    provideSSRWidth(1024, nuxtApp.vueApp);
});
