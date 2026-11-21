<script setup lang="ts">
import { ref } from 'vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import HdMenu from '@etesian-design/vue/components/HdMenu.vue';
import HdQueryDialog from '@etesian-design/vue/components/HdQueryDialog.vue';
import HdSheet from '@etesian-design/vue/components/HdSheet.vue';
const which = ref<'menu' | 'dialog' | 'sheet' | ''>('');
const items = [{ label: 'Select' }, { label: 'Sort by name' }, { label: 'Settings' }] as never;
const close = () => { which.value = ''; };
</script>
<template>
  <div class="live-col">
    <div class="live-row"><HdButton v-for="w in (['menu', 'dialog', 'sheet'] as const)" :key="w" size="small" :pressed="which === w" @click="which = which === w ? '' : w">{{ w.charAt(0).toUpperCase() + w.slice(1) }}</HdButton></div>
    <div class="lo">
      <HdMenu :open="which === 'menu'" inline :items="items" label="App menu" @update:open="close" @select="close" />
      <HdQueryDialog :open="which === 'dialog'" inline title="Delete conversation?" message="The messages are removed from this device." accept-label="Delete" reject-label="Cancel" destructive @update:open="close" @accept="close" @reject="close" />
      <HdSheet :open="which === 'sheet'" inline title="New event" accept-label="Save" reject-label="Cancel" @update:open="close" @accept="close" @reject="close"><p style="margin:12px 16px">A sheet slides up over the app, with its own title bar.</p></HdSheet>
      <span v-if="!which" class="live-lbl">Pick one above.</span>
    </div>
  </div>
</template>
<style>
.lo { position: relative; transform: translateZ(0); overflow: hidden; border-radius: var(--hd-radius-control); background: color-mix(in srgb, var(--hd-c-fg) 6%, transparent); min-height: 260px; padding: 8px; display: flex; flex-direction: column; justify-content: flex-end; }
</style>
