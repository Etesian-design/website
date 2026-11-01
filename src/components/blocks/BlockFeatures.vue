<script setup lang="ts">
/** Feature grid: lit squircle icons with a bold title and a line; style "apps" uses app icons. */
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import type { Block } from '../../content/schema';
defineProps<{ block: Extract<Block, { type: 'features' }> }>();
</script>
<template>
  <section class="blk-feat">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <p v-if="block.intro">{{ block.intro }}</p>
    <ul class="doc-feat" :class="{ 'doc-feat--apps': block.style === 'apps' }">
      <li v-for="f in block.items" :key="f.title" class="doc-feat__i">
        <HdSquircle :size="block.style === 'apps' ? 52 : 40" :color="f.color ?? block.color ?? '#2F6FD6'" lighting="lit"><HdIcon :name="f.icon" :size="block.style === 'apps' ? 28 : 22" lit /></HdSquircle>
        <span><b class="doc-feat__t">{{ f.title }}</b><span class="doc-feat__d">{{ f.text }}</span></span>
      </li>
    </ul>
  </section>
</template>
<style>
.doc-feat--apps .doc-feat__i { align-items: center; }
</style>
