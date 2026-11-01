<script setup lang="ts">
/** One image or a gallery. src is relative to public/ (e.g. "images/lock.png") or an absolute URL. */
import type { Block } from '../../content/schema';
defineProps<{ block: Extract<Block, { type: 'image' }> }>();
</script>
<template>
  <section class="blk-img">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <div class="blk-img__grid" :class="{ 'is-one': block.images.length === 1 }">
      <figure v-for="im in block.images" :key="im.src"><img :src="im.src" :alt="im.alt" loading="lazy" /><figcaption v-if="im.caption">{{ im.caption }}</figcaption></figure>
    </div>
  </section>
</template>
<style>
.blk-img__grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; max-width: 920px; }
@media (max-width: 600px) { .blk-img__grid { grid-template-columns: 1fr; } }
/* a gallery leads with its first image at full width */
.blk-img__grid figure:first-child { grid-column: 1 / -1; }
.blk-img__grid.is-one { grid-template-columns: 1fr; }
.blk-img figure { margin: 0; }
.blk-img img { display: block; width: 100%; height: auto; border-radius: var(--hd-radius-card); }
.blk-img figcaption { margin-top: 6px; font-size: var(--hd-font-size-small); color: var(--hd-c-fg-secondary); }
</style>
