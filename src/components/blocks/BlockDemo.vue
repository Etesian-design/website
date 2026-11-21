<script setup lang="ts">
/** Device demos: the interactive phone, the lock screen, a Settings page with its live preview, Belle widgets, or the desktop sketch. */
import { ref, watch, defineAsyncComponent } from 'vue';
import { useHydration } from 'quasar';
import { useClock } from '../../lib/clock';
import SettingsDemo from './SettingsDemo.vue';
import HdLockScreenStack from '@etesian-design/vue/components/HdLockScreenStack.vue';
import BelleWidget from '@etesian-design/shell/widgets/BelleWidget.vue';
import XFit from '@etesian-design/shell/parts/XFit.vue';
import type { Block } from '../../content/schema';
import { useNav } from '../../lib/nav';
const PhoneUI = defineAsyncComponent(() => import('../phone/PhoneUI.vue'));
const DesktopV2 = defineAsyncComponent(() => import('@etesian-design/shell/desktop/DesktopV2.vue'));
const props = defineProps<{ block: Extract<Block, { type: 'demo' }> }>();
const nav = useNav();
/* the clocks show the viewer's time: drawn once the page runs in the browser, never baked into the generated page */
const { isHydrated } = useHydration();
/* the sketch's menu bar has a fixed mock time; write the live date and time into it (the design part takes no props for it) */
const desk = ref<HTMLElement | null>(null);
const { time, shortDate, longDate } = useClock();
function liveClock() {
  const c = desk.value?.querySelector<HTMLElement>('.x-mbar__clock');
  if (!c) return false;
  const [d, t] = [c.querySelector('span'), c.querySelector('b')];
  if (d) d.textContent = shortDate.value.replace(',', '');
  if (t) t.textContent = time.value;
  c.setAttribute('aria-label', `${longDate.value}, ${time.value}`);
  return true;
}
let mo: MutationObserver | null = null;
watch(desk, (el) => { mo?.disconnect(); if (!el) return; liveClock(); mo = new MutationObserver(() => { mo?.disconnect(); liveClock(); mo?.observe(el, { childList: true, subtree: true, characterData: true }); }); mo.observe(el, { childList: true, subtree: true, characterData: true }); });
watch(time, liveClock);
const lock = [
  { message: 'Are we still on for lunch?', source: 'Anna Virtanen', time: '12:02', accent: '#09A7CC' },
  { message: '2 missed calls', source: 'Phone', time: '11:40', icon: 'phone', accent: '#62B700' },
  { message: 'Design review moved to 14:30', source: 'Calendar', time: '11:15', icon: 'calendar', accent: '#EF5500' },
  { message: 'Your parcel is on its way', source: 'Mail', time: '10:52', icon: 'mail', accent: '#0067BC' },
];
</script>
<template>
  <section class="blk-demo" :class="`blk-demo--${block.device}`">
    <h2 v-if="block.heading" class="doc__h">{{ block.heading }}</h2>
    <div class="blk-demo__row">
      <p v-if="block.text" class="blk-demo__text">{{ block.text }}</p>

      <div v-if="block.device === 'lock'" class="ph-lock__demo hd-on-home" aria-label="Lock-screen notifications">
        <div class="ph-lock__clock">12:45<small>Saturday, 24 October</small></div>
        <HdLockScreenStack :items="lock" :visible="2" />
      </div>

      <SettingsDemo v-else-if="block.device === 'settings'" />

      <div v-else-if="block.device === 'phone' && nav.shell !== 'phone'" class="blk-demo__phone"><XFit :w="360" :h="720" fit="contain"><PhoneUI embedded /></XFit></div>
    </div>

    <!-- every widget packed in columns (no grid holes): the column count follows the width, the stage hugs the columns -->
    <div v-if="block.device === 'widgets'" class="wd-stage hd-on-home" aria-label="Home screen with widgets">
      <div class="wd-it wd-sw"><BelleWidget kind="switch" word="VPN" /><BelleWidget kind="switch" word="3G" /><BelleWidget kind="switch" glyph="bluetooth" on /><BelleWidget kind="data" /></div>
      <div class="wd-it"><BelleWidget kind="agenda" /></div>
      <div class="wd-it"><BelleWidget kind="music" on /></div>
      <template v-if="isHydrated">
        <div class="wd-it"><BelleWidget kind="weather" /></div>
        <div class="wd-it"><BelleWidget kind="flipclock" /></div>
        <div class="wd-it wd-pair"><BelleWidget kind="analog" /><BelleWidget kind="wifi" on /></div>
        <div class="wd-it"><BelleWidget kind="rss" /></div>
        <div class="wd-it"><BelleWidget kind="notes" /></div>
      </template>
    </div>

    <div v-if="block.device === 'desktop' && !isHydrated" class="blk-demo__desk" style="aspect-ratio: 1920 / 1120" aria-hidden="true"></div>
    <div v-else-if="block.device === 'desktop'" ref="desk" class="blk-demo__desk" inert aria-label="Desktop design sketch"><XFit :w="1920" :h="1120" :initial="0.3"><div class="blk-demo__deskin"><DesktopV2 state="desktop" /></div></XFit></div>
    <p v-if="block.caption && block.device !== 'settings'" class="blk-demo__cap">{{ block.caption }}</p>
  </section>
</template>
<style>
.blk-demo__row { display: grid; gap: 18px; grid-template-columns: 1fr; align-items: start; }
.blk-demo__text { margin: 0 !important; }
@container (min-width: 640px) { .blk-demo--lock .blk-demo__row, .blk-demo--settings .blk-demo__row { grid-template-columns: 1fr 340px; } }
.blk-demo__cap { margin-top: 10px !important; font-size: var(--hd-font-size-small); color: var(--hd-c-fg-secondary); }
.ph-lock__demo { padding: 18px 14px 16px; border-radius: 12px; color: #fff; background: linear-gradient(160deg, #0e1418 10%, #2f6b6b 55%, #0d2a2c 90%); text-align: left; }
.ph-lock__clock { margin-bottom: 18px; text-align: right; font: 300 64px/1 var(--hd-font-family-light); font-variant-numeric: tabular-nums; }
.ph-lock__clock small { display: block; margin-top: 8px; font: 400 var(--hd-font-size-default)/1.2 var(--hd-font-family-base); }
.blk-demo__phone { width: 300px; aspect-ratio: 1 / 2; border-radius: 16px; overflow: hidden; }
.blk-demo__phone > .x-fit { height: 100%; }
.wd-stage { --wd-col: 352px; --wd-gap: 16px; --wd-n: 1; box-sizing: content-box; width: calc(var(--wd-n) * var(--wd-col) + (var(--wd-n) - 1) * var(--wd-gap)); max-width: calc(100% - 24px); margin-inline: auto; padding: 12px; columns: var(--wd-n); column-gap: var(--wd-gap); border-radius: 12px; background: linear-gradient(160deg, #4d5a63, #1b2226 60%, #0b0e10); }
.wd-it { break-inside: avoid; display: flex; justify-content: center; margin-bottom: var(--wd-gap); }
.wd-it:last-child { margin-bottom: 0; }
.wd-sw { display: grid; grid-template-columns: repeat(4, 1fr); justify-items: center; }
.wd-pair { justify-content: space-around; align-items: center; }
@container (min-width: 760px) { .wd-stage { --wd-n: 2; } }
@container (min-width: 1140px) { .wd-stage { --wd-n: 3; } }
.blk-demo__deskin { width: 1920px; height: 1120px; display: flex; background: #000; }
.blk-demo__deskin .x-hints { display: none; }
.blk-demo__desk { margin-top: 6px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 0 1px var(--hd-c-divider), 0 10px 30px rgba(0,0,0,.25); pointer-events: none; }
</style>
