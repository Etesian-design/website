<script setup lang="ts">
import { ref } from 'vue';
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdSlider from '@etesian-design/vue/components/HdSlider.vue';
const size = ref(72);
</script>
<template>
  <div class="live-col">
    <div class="live-row ls">
      <span><HdSquircle :size="size" color="#4591FF" lighting="flat" /><small class="live-lbl">squircle</small></span>
      <span><i :style="{ width: size + 'px', height: size + 'px', borderRadius: '50%' }" /><small class="live-lbl">circle</small></span>
      <span><i :style="{ width: size + 'px', height: size + 'px', borderRadius: size * 0.22 + 'px' }" /><small class="live-lbl">rounded square</small></span>
    </div>
    <HdSlider v-model="size" :min="32" :max="120" label="Size" show-value />
  </div>
</template>
<style>
.ls span { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.ls i { display: block; background: color-mix(in srgb, var(--hd-c-fg) 25%, transparent); }
</style>
