import tailwindcss from '@tailwindcss/vite';

/**
 * Nuxt application configuration for the Transvirex frontend.
 *
 * - Enables devtools in development mode
 * - Configures API proxy to the gateway service
 * - Sets up Tailwind CSS v4, shadcn-vue, and Pinia modules
 * - Pre-optimizes frequently used dependencies
 */
export default defineNuxtConfig({
    /** Compatibility date for Nuxt 4 features. */
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: process.env.NODE_ENV === 'development',
        host: '0.0.0.0',
        timeline: {
            enabled: true,
        },
    },
    /** Nuxt modules: shadcn-vue UI components and Pinia state management. */
    modules: ['shadcn-nuxt', '@pinia/nuxt'],
    /** Global CSS entry point (Tailwind). */
    css: ['~/assets/css/main.css'],
    devServer: {
        port: Number(process.env.FRONTEND_PORT) || 5173,
        host: process.env.FRONTEND_HOST || 'localhost',
    },
    /** Proxy all /api/** requests to the backend gateway service. */
    routeRules: {
        '/api/**': {
            proxy: 'http://gateway-service:3000/api/**',
        },
    },
    nitro: {
        output: {
            dir: 'dist',
        },
    },
    vite: {
        plugins: [tailwindcss()],
        server: {
            allowedHosts: [
                'localhost',
                'transvirex.com',
                'www.transvirex.com',
                'transvirex.local',
                'www.transvirex.local',
                'redis.transvirex.local',
                'rabbitmq.transvirex.local',
                'pgadmin.transvirex.local',
            ],
        },
        optimizeDeps: {
            include: ['@vueuse/core', 'class-variance-authority', 'clsx', 'reka-ui', '@lucide/vue', 'tailwind-merge'],
        },
    },
});
