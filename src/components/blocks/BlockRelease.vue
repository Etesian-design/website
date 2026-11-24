<script setup lang="ts">
/** A project's latest published release: version, date and the files matching its patterns (src/lib/releases.ts). */
import { computed } from 'vue';
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import type { Block } from '../../content/schema';
import Disclosure from '../common/Disclosure.vue';
import StepList from './StepList.vue';
import { releases, assetsOf, PROJECTS, formatDate } from '../../lib/releases';
const props = defineProps<{ block: Extract<Block, { type: 'release' }> }>();
const r = computed(() => releases[props.block.key]);
const files = computed(() => assetsOf(props.block.key));
const size = (n: number) => (n >= 1e9 ? `${(n / 1e9).toFixed(2)} GB` : n >= 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1e3))} kB`);
const open = (u: string) => window.open(u, '_blank', 'noopener');
const all = computed(() => `https://github.com/${PROJECTS[props.block.key]?.repo}/releases`);
</script>
<template>
  <section class="blk-rel">
    <HdSquircle :size="44" :color="block.color ?? '#2F6FD6'" lighting="lit"><HdIcon :name="block.icon ?? 'data'" :size="24" lit /></HdSquircle>
    <div class="blk-rel__t">
      <span class="blk-rel__h"><b>{{ block.title }}</b><span v-if="r" class="doc__tag hd-sqm doc__tag--done">{{ r.tag }}</span></span>
      <span>{{ block.text }}</span>
      <span v-if="r" class="blk-rel__d">Published {{ formatDate(r.date) }}</span>
      <ul v-if="files.length" class="blk-rel__files">
        <li v-for="a in files" :key="a.name"><a :href="a.url" rel="noopener">{{ a.name }}</a> <small>{{ size(a.size) }}</small></li>
      </ul>
      <span v-if="block.note" class="blk-rel__note">{{ block.note }}</span>
      <span class="blk-rel__go">
        <HdButton v-if="r" variant="accent" icon="data" @click="open(r.url)">Release {{ r.tag }}</HdButton>
        <HdButton @click="open(all)">All releases</HdButton>
      </span>
      <Disclosure v-if="block.steps?.length" class="blk-rel__how" :label="block.button ?? 'How to install'"><p v-if="block.intro" class="blk-rel__intro">{{ block.intro }}</p><StepList :items="block.steps" /></Disclosure>
    </div>
  </section>
</template>
<style>
.blk-rel { display: flex; gap: 14px; align-items: flex-start; padding: 14px 16px; border-radius: var(--hd-radius-card); border: 1px solid var(--hd-c-divider); }
.blk-rel__t { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; font-size: var(--hd-font-size-small); line-height: 1.45; color: var(--hd-c-fg-secondary); }
.blk-rel__h { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.blk-rel__h b { font: 700 var(--hd-font-size-default)/1.25 var(--hd-font-family-base); color: var(--hd-c-fg); }
.blk-rel__d { font-size: var(--hd-font-size-xsmall); }
.blk-rel__files { list-style: none; margin: 4px 0 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.blk-rel__files a { color: var(--hd-c-fg); overflow-wrap: anywhere; }
.blk-rel__note { color: var(--hd-c-fg); }
.blk-rel__how { margin-top: 8px; }
.blk-rel__how .blk-steps__l, .blk-rel__intro { color: var(--hd-c-fg); font-size: var(--hd-font-size-default); }
.blk-rel__go { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
</style>
