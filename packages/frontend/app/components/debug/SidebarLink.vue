<script setup lang="ts">
const props = defineProps<{
    href: string;
    label: string;
    icon: Component;
    external?: boolean;
}>();

const route = useRoute();
const isActive = computed(() => route.path === props.href);
</script>

<template>
    <NuxtLink
        :to="props.href"
        class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition"
        :class="isActive ? 'bg-slate-700 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'"
        :external="props.external"
    >
        <component :is="props.icon" class="w-5 h-5 shrink-0" />
        {{ props.label }}
    </NuxtLink>
</template>
