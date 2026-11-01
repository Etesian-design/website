<script setup lang="ts">
/** Renders one page's blocks. The same renderer runs in a desktop window, a phone app page and a classic-site section. */
import type { Component } from 'vue';
import BlockHero from './BlockHero.vue';
import BlockText from './BlockText.vue';
import BlockFeatures from './BlockFeatures.vue';
import BlockStatus from './BlockStatus.vue';
import BlockDemo from './BlockDemo.vue';
import BlockImage from './BlockImage.vue';
import BlockPlanned from './BlockPlanned.vue';
import BlockLinks from './BlockLinks.vue';
import BlockSite from './BlockSite.vue';
import type { Page, BlockType } from '../../content/schema';
defineProps<{ page: Page }>();
const MAP: Record<BlockType, Component> = { hero: BlockHero, text: BlockText, features: BlockFeatures, status: BlockStatus, demo: BlockDemo, image: BlockImage, planned: BlockPlanned, links: BlockLinks, site: BlockSite };
</script>
<template>
  <article class="doc" :aria-label="page.title">
    <div class="doc__in">
      <component :is="MAP[b.type]" v-for="(b, i) in page.blocks" :key="i" :block="b" :first="i === 0" class="doc__blk" />
    </div>
  </article>
</template>
<style>
.doc__blk + .doc__blk { margin-top: 22px; }
</style>
