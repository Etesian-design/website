<script setup lang="ts">
import { tokens } from '@etesian-design/tokens';
const sizes = Object.entries(tokens.font.size as Record<string, string>).filter(([k]) => k !== 'xxlarge');
</script>
<template>
  <div class="live-col lt">
    <p class="lt__big">Calm, light, large.</p>
    <p v-for="[k, v] in sizes" :key="k" :style="{ fontSize: v }"><span class="live-lbl">{{ k }} {{ v }}</span> The quick brown fox</p>
  </div>
</template>
<style>
.lt p { margin: 0; display: flex; align-items: baseline; gap: 10px; }
.lt .live-lbl { width: 92px; flex: none; }
.lt__big { font: var(--hd-font-weight-light) 2.25rem/1.1 var(--hd-font-family-light); }
</style>
