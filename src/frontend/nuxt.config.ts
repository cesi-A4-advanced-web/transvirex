// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: {
        enabled: true,

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
});
