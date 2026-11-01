<script setup lang="ts">
/** Link list: squircle tiles; a page target takes that page's icon and colour unless the item sets its own. */
import HdSquircle from '@etesian/components/HdSquircle.vue';
import HdIcon from '@etesian/components/HdIcon.vue';
import type { Block } from '../../content/schema';
import { DOCS } from '../../content/site';
import { useRouter } from 'vue-router';
import { useNav, go } from '../../lib/nav';
defineProps<{ block: Extract<Block, { type: 'links' }> }>();
const nav = useNav();
const router = useRouter();
const pg = (t: string) => DOCS.find((d) => d.id === t);
</script>
<template>
  <section class="blk-links">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <ul class="doc-tiles">
      <li v-for="l in block.items" :key="l.label">
        <button type="button" class="doc-tiles__b hd-focusable" @click="go(nav, l.target, router)">
          <HdSquircle :size="44" :color="l.color ?? pg(l.target)?.color ?? '#2F6FD6'" lighting="lit"><HdIcon :name="l.icon ?? pg(l.target)?.icon ?? 'chevron-right'" :size="24" lit /></HdSquircle>
          <span><b>{{ l.label }}</b><small v-if="l.text">{{ l.text }}</small></span>
          <HdIcon name="chevron-right" :size="20" class="doc-tiles__chev" />
        </button>
      </li>
    </ul>
  </section>
</template>
<style>
.doc-tiles { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; grid-template-columns: 1fr; }
@container (min-width: 560px) { .doc-tiles { grid-template-columns: 1fr 1fr; } }
.doc-tiles__b { display: flex; align-items: center; gap: 14px; width: 100%; min-height: 68px; padding: 10px 12px; border: 0; border-radius: var(--hd-radius-card); background: color-mix(in srgb, var(--hd-c-fg) 5%, transparent); color: inherit; text-align: left; font: inherit; cursor: pointer; }
.doc-tiles__b:hover { background: var(--hd-c-pressed); }
.doc-tiles__b > span:nth-child(2) { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.doc-tiles__b b { font: 700 var(--hd-font-size-default)/1.2 var(--hd-font-family-base); }
.doc-tiles__b small { font-size: var(--hd-font-size-small); line-height: 1.35; color: var(--hd-c-fg-secondary); }
.doc-tiles__chev { flex: none; color: var(--hd-c-fg-secondary); }
</style>
