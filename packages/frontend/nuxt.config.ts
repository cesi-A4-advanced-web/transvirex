// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: process.env.NODE_ENV === 'development',

        timeline: {
            enabled: true,
        },
    },
    css: ['~/assets/css/main.css'],
    modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt'],
    postcss: {
        plugins: {
            tailwindcss: {},
            autoprefixer: {},
        },
    },
    devServer: {
        port: Number(process.env.FRONTEND_PORT) || 5173,
        host: process.env.FRONTEND_HOST || 'localhost',
    },
    nitro: {
        preset: 'node-server',
        output: {
            dir: 'dist',
        },
    },
    vite: {
        server: {
            allowedHosts: [
                'localhost',
                'transvirex.com',
                'www.transvirex.com',
                'transvirex.local',
                'www.transvirex.local',
            ],
        },
    },
});
