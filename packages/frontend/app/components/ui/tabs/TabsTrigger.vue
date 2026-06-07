<script setup lang="ts">
import type { TabsTriggerProps } from 'reka-ui';
import { TabsTrigger, useForwardProps } from 'reka-ui';

const props = defineProps<TabsTriggerProps>();
const forwarded = useForwardProps(props);
</script>

<template>
    <TabsTrigger
        v-bind="forwarded"
        class="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
    >
        <slot />
    </TabsTrigger>
</template>
