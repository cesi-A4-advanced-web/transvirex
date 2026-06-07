<script setup lang="ts">
import type { TabsContentProps } from 'reka-ui';
import { TabsContent, useForwardProps } from 'reka-ui';

const props = defineProps<TabsContentProps>();
const forwarded = useForwardProps(props);
</script>

<template>
    <TabsContent
        v-bind="forwarded"
        class="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
        <slot />
    </TabsContent>
</template>
