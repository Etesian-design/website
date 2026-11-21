<script setup lang="ts">
import { ref } from 'vue';
import { tokens } from '@etesian-design/tokens';
import HdSwitch from '@etesian-design/vue/components/HdSwitch.vue';
const op = Number(tokens.opacity.chrome);
const on = ref(true);
</script>
<template>
  <div class="live-col">
    <div class="lc"><div class="lc__bar" :style="{ background: on ? `rgba(0,0,0,${op})` : '#000', backdropFilter: on ? 'blur(12px)' : 'none' }">Etesian</div>
      <div class="lc__content"><i v-for="c in ['#EF5500','#62B700','#09A7CC','#821DDE','#FFC000','#0067BC']" :key="c" :style="{ background: c }" /></div></div>
    <HdSwitch v-model="on" label="See-through chrome" />
    <span class="live-lbl">Bars over content show {{ op * 100 }}% of their colour, with the content blurred behind.</span>
  </div>
</template>
<style>
.lc { position: relative; height: 150px; overflow: hidden; border-radius: var(--hd-radius-control); }
.lc__bar { position: absolute; inset: 0 0 auto; z-index: 1; height: 40px; display: flex; align-items: center; padding: 0 12px; color: #fff; font-weight: 700; }
.lc__content { display: grid; grid-template-columns: repeat(3, 1fr); height: 100%; padding-top: 18px; }
.lc__content i { display: block; }
</style>
