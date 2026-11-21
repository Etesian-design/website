<script setup lang="ts">
import { ref } from 'vue';
import HdButton from '@etesian-design/vue/components/HdButton.vue';
import HdNotificationBanner from '@etesian-design/vue/components/HdNotificationBanner.vue';
import HdToast from '@etesian-design/vue/components/HdToast.vue';
import HdInfoBanner from '@etesian-design/vue/components/HdInfoBanner.vue';
const style = ref<'banner' | 'toast' | 'info'>('banner');
const open = ref(true);
const pick = (s: typeof style.value) => { style.value = s; open.value = false; requestAnimationFrame(() => { open.value = true; }); };
</script>
<template>
  <div class="live-col">
    <div class="live-row" role="radiogroup" aria-label="Notification style">
      <HdButton v-for="[k, l] in ([['banner', 'Banner'], ['toast', 'Toast'], ['info', 'Info banner']] as const)" :key="k" size="small" role="radio" :aria-checked="style === k" :pressed="style === k" @click="pick(k)">{{ l }}</HdButton>
    </div>
    <div class="ln">
      <HdNotificationBanner v-if="style === 'banner'" v-model:open="open" inline title="Anna Virtanen" body="Are we still on for lunch?" accent="#09A7CC" />
      <HdToast v-if="style === 'toast'" v-model:open="open" inline text="Conversation archived" action="Undo" />
      <HdInfoBanner v-if="style === 'info'" v-model:open="open" inline text="Copied" icon="check" />
    </div>
    <HdButton size="small" icon="refresh" @click="pick(style)">Show again</HdButton>
  </div>
</template>
<style>.ln { min-height: 96px; }</style>
