<script setup lang="ts">
const props = defineProps<{
    href: string;
    label: string;
    icon: Component;
    external?: boolean;
}>();
</script>

<template>
    <NuxtLink
        :to="props.href"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-slate-800 hover:text-white transition"
        :external="props.external"
    >
        <props.icon class="w-5 h-5" />
        {{ props.label }}
    </NuxtLink>
</template>
