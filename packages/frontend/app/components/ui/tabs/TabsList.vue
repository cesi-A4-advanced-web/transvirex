<script setup lang="ts">
import type { TabsListProps } from 'reka-ui';
import { TabsList, useForwardProps } from 'reka-ui';

const props = defineProps<TabsListProps>();
const forwarded = useForwardProps(props);
</script>

<template>
    <TabsList
        v-bind="forwarded"
        class="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground"
    >
        <slot />
    </TabsList>
</template>
