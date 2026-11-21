<script setup lang="ts">
import { ref } from 'vue';
import { tokens } from '@etesian-design/tokens';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
const pal = tokens.color.palette as Record<string, string>;
const acc = tokens.color.accent as Record<string, string>;
const base = ['background', 'foreground', 'secondary-foreground', 'inverted-background', 'inverted-foreground', 'inverted-secondary-foreground'].filter((k) => pal[k]);
const dark = ref(false);
const shown = () => (dark.value ? base.filter((k) => k.startsWith('inverted')) : base.filter((k) => !k.startsWith('inverted')));
</script>
<template>
  <div class="live-col">
    <div class="live-row"><HdButton size="small" :pressed="!dark" @click="dark = false">Light</HdButton><HdButton size="small" :pressed="dark" @click="dark = true">Dark</HdButton></div>
    <div class="lp" :style="{ background: dark ? pal['inverted-background'] : pal.background }">
      <span v-for="k in shown()" :key="k" class="lp__s" :style="{ color: dark ? pal['inverted-foreground'] : pal.foreground }"><i :style="{ background: pal[k] }" />{{ k.replace('inverted-', '') }}<small>{{ pal[k] }}</small></span>
    </div>
    <span class="live-lbl">Accents, one per app</span>
    <div class="lp__acc"><span v-for="(v, k) in acc" :key="k" :title="`${k} ${v}`" :style="{ background: v }"><small>{{ k }}</small></span></div>
  </div>
</template>
<style>
.lp { display: flex; flex-wrap: wrap; gap: 10px; padding: 12px; border-radius: var(--hd-radius-control); }
.lp__s { display: flex; align-items: center; gap: 6px; font-size: var(--hd-font-size-xsmall); }
.lp__s i { width: 22px; height: 22px; border: 1px solid rgba(128,128,128,.4); }
.lp__s small { opacity: .7; }
.lp__acc { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 4px; }
.lp__acc span { height: 40px; display: flex; align-items: flex-end; padding: 3px; }
.lp__acc small { color: #fff; font-size: 10px; line-height: 1; text-shadow: 0 1px 2px rgba(0,0,0,.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
