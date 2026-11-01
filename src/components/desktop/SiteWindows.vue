<script setup lang="ts">
/**
 * Windows overview, ported from the design repo's XWindows to the real browser size, with the
 * same classes: live cards that keep each window's shape, zoom levels 1 (carousel) to 4 per row, like the phone's Open
 * applications. Ctrl + wheel (or a touchpad pinch) zooms; the wheel moves through the carousel.
 */
import { computed } from 'vue';
import HdSquircle from '@etesian-design/vue/components/HdSquircle.vue';
import HdIcon from '@etesian-design/vue/components/HdIcon.vue';
import { ZOOM_LEVELS, zoomStep, fitInto, type ZoomLevel } from '@etesian-design/shell/desktop/geometry';

export interface OverviewWin { key: string; title: string; sub: string; icon: string; color: string; w: number; h: number }
/** bare: only the cards, no title and zoom buttons (the Overview's middle column) */
const props = defineProps<{ wins: OverviewWin[]; level: ZoomLevel; selected: number; left: number; width: number; height: number; bare?: boolean }>();
const emit = defineEmits<{ 'update:level': [l: ZoomLevel]; 'update:selected': [i: number]; open: [key: string]; close: [] }>();
const TITLE = 34, PAD = 40;
const cards = computed(() => {
  const TOP = props.bare ? 32 : 76, n = props.level, x0 = props.left + PAD, avail = props.width - x0 - PAD, H = props.height;
  if (n === 1) {
    const ch = H - TOP - TITLE - 60, cw = Math.max(200, Math.min(Math.round(ch * 1.5), avail - 240));
    const cx = x0 + avail / 2, G = 48;
    const fits = props.wins.map((o) => fitInto(o.w, o.h, cw, ch));
    const sel = Math.min(props.selected, fits.length - 1);
    const xs: number[] = []; xs[sel] = cx - fits[sel]!.w / 2;
    for (let i = sel + 1; i < fits.length; i++) xs[i] = xs[i - 1]! + fits[i - 1]!.w + G;
    for (let i = sel - 1; i >= 0; i--) xs[i] = xs[i + 1]! - G - fits[i]!.w;
    return props.wins.map((o, i) => ({ ...o, x: Math.round(xs[i]!), y: TOP + (ch - fits[i]!.h), cw: fits[i]!.w, ch: fits[i]!.h, s: fits[i]!.s, side: i - sel }));
  }
  const gap = n === 2 ? 36 : n === 3 ? 28 : 22;
  // rows as tall as the screen allows (up to 3:4 of the width), so tall windows aren't squeezed into thin strips
  const cw = (avail - gap * (n - 1)) / n, rows = Math.ceil(props.wins.length / n), ch = Math.round(Math.min(cw * 0.75, (H - TOP - 40) / Math.max(1, rows) - TITLE - gap));
  return props.wins.map((o, i) => {
    const c = i % n, r = Math.floor(i / n), f = fitInto(o.w, o.h, cw, ch);
    return { ...o, x: Math.round(x0 + c * (cw + gap) + (cw - f.w) / 2), y: TOP + r * (ch + TITLE + gap) + (ch - f.h), cw: f.w, ch: f.h, s: f.s, side: 0 };
  });
});
function onWheel(e: WheelEvent) {
  if (e.metaKey || e.ctrlKey) { e.preventDefault(); const l = zoomStep(props.level, e.deltaY); if (l !== props.level) emit('update:level', l); }
  else if (props.level === 1 && e.deltaY) emit('update:selected', Math.min(props.wins.length - 1, Math.max(0, props.selected + (e.deltaY > 0 ? 1 : -1))));
}
const LABEL: Record<ZoomLevel, string> = { 1: 'One at a time', 2: '2 per row', 3: '3 per row', 4: '4 per row' };
</script>
<template>
  <div class="x-wins hd-on-home site-wins" :class="`x-wins--${level}`" role="dialog" aria-label="Windows" @wheel="onWheel" @click.self="emit('close')">
    <header v-if="!bare" class="x-wins__head" :style="{ left: `${left + PAD}px`, right: `${PAD}px` }">
      <h2 class="x-wins__h">Windows</h2>
      <span class="x-wins__n">{{ wins.length }} open · {{ LABEL[level] }} · Ctrl + wheel or pinch to zoom</span>
      <span class="x-wins__zoom" role="radiogroup" aria-label="Zoom level">
        <button v-for="l in ZOOM_LEVELS" :key="l" type="button" role="radio" class="x-wins__z hd-sq hd-focusable" :class="{ 'is-on': l === level }" :aria-checked="l === level ? 'true' : 'false'" :aria-label="LABEL[l]" @click="emit('update:level', l)">
          <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true"><rect v-for="k in l" :key="k" :x="l === 1 ? 4 : (k - 1) * (20 / l) + 0.5" :y="l === 1 ? 1 : 3" :width="l === 1 ? 12 : 20 / l - 1.5" :height="l === 1 ? 12 : 8" rx="1.5" fill="currentColor" /></svg>
        </button>
      </span>
    </header>
    <p v-if="!wins.length" class="site-wins__none">No open windows</p>
    <button v-for="(c, i) in cards" :key="c.key" type="button" class="x-wins__card hd-focusable" :class="{ 'is-sel': i === selected, 'is-side': level === 1 && c.side !== 0 }"
      :style="{ left: `${c.x}px`, top: `${c.y}px`, width: `${c.cw}px` }" :aria-label="`${c.title}`" @click="emit('open', c.key)" @mouseenter="emit('update:selected', i)">
      <span class="x-wins__prev" :style="{ height: `${c.ch}px` }">
        <span class="x-wins__live" inert :style="{ width: `${c.w}px`, height: `${c.h}px`, transform: `scale(${c.s})` }"><slot name="preview" :win="c" /></span>
      </span>
      <span class="x-wins__t">
        <HdSquircle :size="20" :color="c.color" lighting="lit"><HdIcon :name="c.icon" :size="12" lit /></HdSquircle>
        <span>{{ c.title }}</span><small>{{ c.sub }}</small>
      </span>
    </button>
  </div>
</template>
<style>
.site-wins__none { position: absolute; left: 0; right: 0; top: 45%; text-align: center; font: var(--hd-font-weight-light) var(--hd-font-size-xlarge)/1 var(--hd-font-family-light); color: var(--hd-c-fg-secondary); }
.site-wins .x-wins__live { flex-direction: column; }
</style>
