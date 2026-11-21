<script setup lang="ts">
/** One image or a gallery. src is relative to public/ (e.g. "images/lock.png") or an absolute URL. */
import type { Block } from '../../content/schema';
import { href } from '../../lib/base';
/** a public/ path from the site's root (not from the current page's address), under whatever base the site is served from */
const url = (src: string) => (/^[a-z]+:|^\/\//i.test(src) ? src : href('/' + src.replace(/^\//, '')));
defineProps<{ block: Extract<Block, { type: 'image' }> }>();
</script>
<template>
  <section class="blk-img">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <p v-if="block.intro">{{ block.intro }}</p>
    <div class="blk-img__grid" :class="{ 'is-one': block.images.length === 1, 'blk-img__grid--phone': block.style === 'phone' }">
      <figure v-for="im in block.images" :key="im.src"><img :src="url(im.src)" :alt="im.alt" loading="lazy" decoding="async" v-bind="block.style === 'phone' ? { width: 540, height: 1200 } : {}" /><figcaption v-if="im.caption">{{ im.caption }}</figcaption></figure>
    </div>
  </section>
</template>
<style>
.blk-img__grid { display: grid; gap: 14px; grid-template-columns: 1fr 1fr; max-width: 920px; }
@media (max-width: 600px) { .blk-img__grid { grid-template-columns: 1fr; } }
/* a gallery leads with its first image at full width */
.blk-img__grid figure:first-child { grid-column: 1 / -1; }
.blk-img__grid.is-one { grid-template-columns: 1fr; }
/* phone screenshots: portrait columns in a dark phone bezel, side by side; two per row on a phone */
.blk-img__grid--phone { max-width: none; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 18px; }
.blk-img__grid--phone figure:first-child { grid-column: auto; }
@media (max-width: 600px) { .blk-img__grid--phone { grid-template-columns: 1fr 1fr; gap: 12px; } }
.blk-img__grid--phone img { max-width: 260px; border-radius: 16px; border: 5px solid #151517; box-shadow: 0 0 0 1px #2a2a2d, 0 8px 24px rgba(0,0,0,.25); }
.blk-img figure { margin: 0; }
.blk-img img { display: block; width: 100%; height: auto; border-radius: var(--hd-radius-card); }
.blk-img figcaption { margin-top: 6px; font-size: var(--hd-font-size-small); color: var(--hd-c-fg-secondary); }
</style>
