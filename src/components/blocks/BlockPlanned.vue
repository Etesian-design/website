<script setup lang="ts">
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import type { Block } from '../../content/schema';
defineProps<{ block: Extract<Block, { type: 'planned' }> }>();
</script>
<template>
  <section class="blk-planned" role="note">
    <HdSquircle :size="44" color="#6B6B70" lighting="lit"><HdIcon :name="block.icon ?? 'info'" :size="24" lit /></HdSquircle>
    <span class="blk-planned__t"><span class="blk-planned__h"><b>{{ block.title }}</b><span class="doc__tag hd-sqm doc__tag--planned">{{ block.tag ?? 'Planned' }}</span></span><span>{{ block.text }}</span></span>
  </section>
</template>
<style>
.blk-planned { display: flex; gap: 14px; align-items: flex-start; margin: 18px 0 0; padding: 14px 16px; border-radius: var(--hd-radius-card); border: 1px dashed var(--hd-c-divider); }
.blk-planned__t { display: flex; flex-direction: column; gap: 4px; min-width: 0; font-size: var(--hd-font-size-small); line-height: 1.45; color: var(--hd-c-fg-secondary); }
.blk-planned__h { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.blk-planned__h b { font: 700 var(--hd-font-size-default)/1.25 var(--hd-font-family-base); color: var(--hd-c-fg); }
</style>
