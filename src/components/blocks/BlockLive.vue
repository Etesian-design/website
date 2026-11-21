<script setup lang="ts">
/** Small working demos built from the @etesian-design packages, each loaded only when its block is on the page. */
import { defineAsyncComponent, type Component } from 'vue';
import type { Block } from '../../content/schema';
defineProps<{ block: Extract<Block, { type: 'live' }> }>();
const L = (f: () => Promise<{ default: Component }>) => defineAsyncComponent(f);
const DEMOS: Record<string, Component> = {
  palette: L(() => import('./live/LivePalette.vue')), type: L(() => import('./live/LiveType.vue')),
  shapes: L(() => import('./live/LiveShapes.vue')), motion: L(() => import('./live/LiveMotion.vue')),
  chrome: L(() => import('./live/LiveChrome.vue')), controls: L(() => import('./live/LiveControls.vue')),
  fastscroll: L(() => import('./live/LiveFastScroll.vue')), overlays: L(() => import('./live/LiveOverlays.vue')),
  toolbar: L(() => import('./live/LiveToolbar.vue')), notifications: L(() => import('./live/LiveNotifications.vue')),
  icons: L(() => import('./live/LiveIcons.vue')), widgets: L(() => import('./live/LiveWidgets.vue')), quasar: L(() => import('./live/LiveQuasar.vue')),
};
</script>
<template>
  <section class="blk-live">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <p v-if="block.intro" class="blk-live__intro">{{ block.intro }}</p>
    <div class="blk-live__grid" :class="{ 'blk-live__grid--wide': block.wide }">
      <figure v-for="d in block.items" :key="d.demo" class="blk-live__card">
        <div class="blk-live__stage"><component :is="DEMOS[d.demo]" /></div>
        <figcaption><b>{{ d.title }}</b> {{ d.caption }}</figcaption>
      </figure>
    </div>
  </section>
</template>
<style>
.blk-live__intro { margin: 0 0 14px; max-width: 46em; color: var(--hd-c-fg-secondary); }
.blk-live__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 16px; }
.blk-live__grid--wide { grid-template-columns: 1fr; }
.blk-live__card { margin: 0; display: flex; flex-direction: column; border: 1px solid var(--hd-c-divider); border-radius: var(--hd-radius-card); overflow: hidden; min-width: 0; }
.blk-live__stage { padding: 16px; background: var(--hd-c-bg); flex: 1; min-width: 0; overflow-x: auto; }
.blk-live__card figcaption { padding: 10px 14px; font-size: var(--hd-font-size-small); line-height: 1.45; color: var(--hd-c-fg-secondary); border-top: 1px solid var(--hd-c-divider); }
.blk-live__card figcaption b { color: var(--hd-c-fg); }
.live-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
.live-col { display: flex; flex-direction: column; gap: 12px; }
.live-lbl { font-size: var(--hd-font-size-xsmall); color: var(--hd-c-fg-secondary); }
</style>
