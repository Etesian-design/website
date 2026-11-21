<script setup lang="ts">
/** Numbered steps; `backticks` mark commands and file names. */
import type { Block } from '../../content/schema';
import Disclosure from '../common/Disclosure.vue';
import StepList from './StepList.vue';
defineProps<{ block: Extract<Block, { type: 'steps' }> }>();
</script>
<template>
  <section class="blk-steps">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <Disclosure v-if="block.collapsed" :label="block.button ?? 'Show the steps'"><p v-if="block.intro">{{ block.intro }}</p><StepList :items="block.items" /></Disclosure>
    <template v-else><p v-if="block.intro">{{ block.intro }}</p><StepList :items="block.items" /></template>
  </section>
</template>
<style>
.blk-steps__l { margin: 0; padding: 0 0 0 1.4em; max-width: 46em; display: flex; flex-direction: column; gap: 8px; }
.blk-steps__l li { padding-left: 4px; }
.blk-steps__l code { padding: 1px 5px; background: color-mix(in srgb, var(--hd-c-fg) 8%, transparent); font: 400 .9em/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; overflow-wrap: anywhere; }
</style>
