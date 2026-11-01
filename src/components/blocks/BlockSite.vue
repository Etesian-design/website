<script setup lang="ts">
/** "This website" card: in the desktop view it says the visitor is using it; anywhere else it links to the desktop view. */
import { useRouter } from 'vue-router';
import HdSquircle from '@etesian/components/HdSquircle.vue';
import HdIcon from '@etesian/components/HdIcon.vue';
import HdButton from '@etesian/components/HdButton.vue';
import type { Block } from '../../content/schema';
import { useInDesktop } from '../../lib/nav';
defineProps<{ block: Extract<Block, { type: 'site' }> }>();
const inDesktop = useInDesktop();
const router = useRouter();
</script>
<template>
  <section class="blk-site">
    <HdSquircle :size="44" color="#3B8C5A" lighting="lit"><HdIcon :name="block.icon ?? 'globe'" :size="24" lit /></HdSquircle>
    <span class="blk-site__t">
      <span class="blk-site__h"><b>{{ block.title }}</b><span v-if="inDesktop" class="doc__tag doc__tag--done">You're using it</span></span>
      <span>{{ block.text }}</span>
      <HdButton v-if="!inDesktop" variant="accent" class="blk-site__go" @click="router.push('/desktop')">Open the desktop view</HdButton>
    </span>
  </section>
</template>
<style>
.blk-site { display: flex; gap: 14px; align-items: flex-start; margin: 18px 0 0; padding: 14px 16px; border-radius: var(--hd-radius-card); border: 1px solid var(--hd-c-divider); }
.blk-site__t { display: flex; flex-direction: column; gap: 4px; min-width: 0; font-size: var(--hd-font-size-small); line-height: 1.45; color: var(--hd-c-fg-secondary); }
.blk-site__h { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 10px; }
.blk-site__h b { font: 700 var(--hd-font-size-default)/1.25 var(--hd-font-family-base); color: var(--hd-c-fg); }
.blk-site__go { align-self: flex-start; margin-top: 8px; }
</style>
