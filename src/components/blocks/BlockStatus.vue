<script setup lang="ts">
import type { Block } from '../../content/schema';
defineProps<{ block: Extract<Block, { type: 'status' }> }>();
</script>
<template>
  <section class="blk-status">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <ul class="pg-list">
      <li v-for="s in block.items" :key="s.part" class="pg-list__i">
        <span class="pg-list__h"><b>{{ s.part }}</b><span class="doc__tag hd-sqm" :class="`doc__tag--${s.tone}`">{{ s.state }}</span></span>
        <span v-if="s.detail" class="pg-list__d">{{ s.detail }}</span>
      </li>
    </ul>
  </section>
</template>
<style>
.pg-list { list-style: none; margin: 0; padding: 0; }
.pg-list__i { display: flex; flex-direction: column; gap: 4px; padding: 11px 0; border-bottom: 1px solid var(--hd-c-divider); }
.pg-list__h { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.pg-list__d { font-size: var(--hd-font-size-small); color: var(--hd-c-fg-secondary); line-height: 1.45; }
</style>
