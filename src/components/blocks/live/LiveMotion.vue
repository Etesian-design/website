<script setup lang="ts">
import { ref } from 'vue';
import { tokens } from '@etesian-design/tokens';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
const e = tokens.motion.easing as Record<string, string>;
const d = tokens.motion.duration as Record<string, string>;
const rows = [['out', 'slow', 'opening, arriving'], ['in', 'slow', 'dismissing'], ['in-out', 'slow', 'moving across']] as const;
const go = ref(false);
</script>
<template>
  <div class="live-col">
    <div v-for="[k, t, use] in rows" :key="k" class="lm"><span class="live-lbl">{{ k }}: {{ use }}</span>
      <div class="lm__track"><i :style="{ transition: `left ${d[t]} ${e[k]}`, left: go ? 'calc(100% - 20px)' : '0' }" /></div></div>
    <div class="live-row"><HdButton icon="play" @click="go = !go">Play</HdButton><span class="live-lbl">{{ d.fast }} · {{ d.default }} · {{ d.slow }}</span></div>
  </div>
</template>
<style>
.lm__track { position: relative; height: 20px; margin-top: 4px; border-bottom: 1px solid var(--hd-c-divider); }
.lm__track i { position: absolute; top: 0; width: 20px; height: 20px; background: var(--hd-accent); }
@media (prefers-reduced-motion: reduce) { .lm__track i { transition: none !important; } }
</style>
