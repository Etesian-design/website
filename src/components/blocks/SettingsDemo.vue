<script setup lang="ts">
/**
 * One page of the phone's Settings as it is on the device: a plain sub page (N9 list rows, N9 switches) with the live
 * preview of what the page changes at the top. Here the Lock screen page: every addition starts off, and flipping a
 * switch changes the lock screen above it, as the preview does on the phone.
 */
import { ref } from 'vue';
import HdPageHeader from '@etesian-design/vue/components/HdPageHeader.vue';
import HdSectionHeader from '@etesian-design/vue/components/HdSectionHeader.vue';
import HdListItem from '@etesian-design/vue/components/HdListItem.vue';
import HdSwitch from '@etesian-design/vue/components/HdSwitch.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
const glance = ref(false), weather = ref(false), emergency = ref(false);
</script>
<template>
  <div class="set-demo hd-on-page" role="group" aria-label="Settings: Lock screen">
    <HdPageHeader title="Lock screen" :level="2" />
    <div class="set-demo__prev hd-on-home" aria-label="Preview">
      <div class="set-demo__clock">12:45<small>Saturday, 24 October</small>
        <span v-if="glance" class="set-demo__line"><HdIcon name="clock" :size="14" /> 07:00 · Design review 14:30</span>
        <span v-if="weather" class="set-demo__line"><HdIcon name="globe" :size="14" /> 18° · Athens, cloudy</span>
      </div>
      <span v-if="emergency" class="set-demo__ice"><HdIcon name="warning" :size="14" /> Emergency information</span>
    </div>
    <HdSectionHeader title="Under the clock" />
    <HdListItem title="Glance line" subtitle="Next alarm and event under the date"><template #trailing><HdSwitch v-model="glance" aria-label="Glance line" /></template></HdListItem>
    <HdListItem title="Weather" subtitle="Current weather under the date"><template #trailing><HdSwitch v-model="weather" aria-label="Weather" /></template></HdListItem>
    <HdSectionHeader title="Emergency information" />
    <HdListItem title="Show on the lock screen" subtitle="Owner and essentials beside the clock"><template #trailing><HdSwitch v-model="emergency" aria-label="Show emergency information on the lock screen" /></template></HdListItem>
  </div>
</template>
<style>
.set-demo { border-radius: 12px; overflow: hidden; background: var(--hd-c-bg); color: var(--hd-c-fg); padding-bottom: 8px; }
.set-demo__prev { position: relative; margin: 0 12px 6px; height: 172px; padding: 16px 14px; border-radius: 10px; color: #fff; background: linear-gradient(160deg, #0e1418 10%, #2f6b6b 55%, #0d2a2c 90%); }
.set-demo__clock { text-align: right; font: 300 52px/1 var(--hd-font-family-light); font-variant-numeric: tabular-nums; }
.set-demo__clock small { display: block; margin-top: 6px; font: 400 var(--hd-font-size-small)/1.2 var(--hd-font-family-base); }
.set-demo__line { display: flex; justify-content: flex-end; align-items: center; gap: 5px; margin-top: 6px; font: 400 var(--hd-font-size-xsmall)/1.2 var(--hd-font-family-base); color: rgba(255,255,255,.85); }
.set-demo__ice { position: absolute; left: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; padding: 4px 8px; border-radius: 6px; background: rgba(0,0,0,.45); font: 600 var(--hd-font-size-xsmall)/1.2 var(--hd-font-family-base); }
</style>
