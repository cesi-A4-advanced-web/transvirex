import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: process.env.NODE_ENV === 'development',
        host: '0.0.0.0',
        timeline: {
            enabled: true,
        },
    },
    modules: ['shadcn-nuxt', '@pinia/nuxt'],
    css: ['~/assets/css/main.css'],
    devServer: {
        port: Number(process.env.FRONTEND_PORT) || 5173,
        host: process.env.FRONTEND_HOST || 'localhost',
    },
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
    },
    dir: {
        public: 'app/public',
    },
});
