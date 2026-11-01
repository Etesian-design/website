<script setup lang="ts">
import type { Block } from '../../content/schema';
defineProps<{ block: Extract<Block, { type: 'text' }> }>();
</script>
<template>
  <section class="blk-text">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <div :class="{ doc__note: block.note }"><div><p v-for="(p, i) in block.paragraphs" :key="i">{{ p }}</p></div></div>
  </section>
</template>
<style>
.blk-text .doc__note p:last-child { margin-bottom: 0; }
</style>
